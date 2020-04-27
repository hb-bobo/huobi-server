/**
 * @Author hubo
 * @Date 2018-02-06
 * @Last Modified by: hubo
 * @Last Modified time: 2018-06-15 17:32:24
 */


/**
 * 数组成员查找
 * @param {Array} array
 * @param {QueueItem | uuid} target
 * @return {number} index
 */
const arrayIndexOf = function (array, target) {
    let index = -1;
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (
            item === target ||
        (item.uuid && item.uuid === target)
        ) {
            index = i;
            break;
        }
    }
    return index;
};

/**
* 队列
* @interface Option {
*   limit: Number, // 最大处理的个数
*   autoStart: boolean, // 是否自动开始
*   autoPush: boolean, // 完成一个后是否自动添加后面的任务
* }
* @interface QueueItem {
*   uuid: number | string,
*   value: function,
* }
* @constructor constructor(Option)
* @example
    一(1)。
    const queue = new Queue({ limit: 5 });
    const queueItem = (done) => {
        'todo Something';
        // 过了很久后处理完了一个
        done();
    };
    // 会自动开始处理队列
    queue.push(queueItem);

    一(2)。
    const queue = new Queue({ limit: 5 });
    const queueItem = {
      uuid: 12132132,
      value: () => {'todo Something';}
    };
    // 会自动开始处理队列
    queue.push(queueItem);
    // 过了很久后处理完了一个
    queue.done(12132132)

    二。单个任务按顺序处理时 limit =  1
    const queue = new Queue({ limit: 1, autoStart: false });
    const queueItem = () => {'todo Something';};
    queue.push(queueItem);
    // 一段时间后，
    queue.next();
    // 又一段时间后
    queue.next();
*/

class Queue {
    constructor(option) {
        this.init(option);
    }
    init({
        limit = 1,
        autoStart = true,
        autoPush = true,
    } = {}) {
        this.limit = limit;
        this.autoStart = autoStart;
        this.autoPush = autoPush;
        // 队伍
        this.line = [];
        // 将要处理的队伍(还未处理过的)
        this.willProcessedLine = [];
        // 处理中的队伍
        this.processingLine = [];
        // 已处理的队伍
        this.processedLine = [];
        // 下一个(暂时无用)
        this.nextIndex = -1;

        // event
        this.onend = function () {};
    }
    /**
     * 获取下一个
     */
    getNext() {
        return this.willProcessedLine[0];
    }
    /**
     * 清空处理队列
     * @param {'processingLine' | 'processedLine'} default clear all
     */
    clear(type) {
        if (typeof type === 'string' && Array.isArray(this[type])) {
            this[type].splice(0, this[type].length - 1);
            return this[type];
        }
        this.line = [];
        this.processingLine = [];
        this.processedLine = [];
        this.nextIndex = -1;
        this.willProcessedLine = [];
    }

    /**
     * 完成某一个正在处理中的任务
     * @param {QueueItem | uuid} target
     * @param { ?boolean }
     * @return {QueueItem | null} 被删除的对象
     */
    done(target, autoPush) {
        return this.removeFromProcessingLine(target, autoPush);
    }

    /**
     * 处理完成，执行下一个
     * this.limit = 1才能用
     */
    next() {
        if (this.limit !== 1) {
            throw Error('use next() only limit = 1');
        }
        // 添加一个同时要删除一个；
        if (this.processingLine.length > 0) {
            this.removeFromProcessingLine(this.processingLine[0]);
        }
        if (this.getNext()) {
            this.pushToProcessingLine(this.getNext());
        }
    }
    /**
     * 添加排队成员，自动添加到处理中的队列
     * @param {QueueItem | function}
     * @return {Number} this.line.length
     */
    push(item) {
        if (
            typeof item !== 'function' &&
        (item.uuid && typeof item.value !== 'function')
        ) {
            throw TypeError('Queue.push(Function) || Queue.push({uuid: <id>, value: <Function>})');
        }
        const length = this.line.push(item);

        this.willProcessedLine.push(item);
        if (this.autoStart) {
            this.pushToProcessingLine(item);
        }
        return length;
    }

    /**
     * 添加到处理中队列
     * @param {QueueItem | function}
     * @return {Number | boolean} length | boolean
     */
    pushToProcessingLine(item) {
        const len = this.processingLine.length;

        if (
            (typeof item !== 'function' && (item.uuid && typeof item.value !== 'function'))
        || this.limit === 0
        || len >= this.limit
        || this.willProcessedLine.length === 0
        ) {
        // 处理中队列已满或者待处理队列为空
            return false;
        }
        // 更新游标
        this.nextIndex++;
        // 1.从待处理队伍中删除item，
        this.removeFromWillProcessedLine(item);
        // 2.添加item到正在处理队伍中，并执行
        this.processingLine.push(item);
        // 3.执行任务，接下来可能会立马push.
        let done = () => {
            this.done(item);
        };
        if (item.uuid) {
            item.value(done);
        } else {
            item(done);
        }
        return this.processingLine.length;
    }
    /**
     * target
     * 从队列中清除
     * @param { QueueItem | uuid }
     * @param { ?boolean } 是否继续push下一个任务, 当再循环中remove，且会关联一些异步请求或操作，最好设为false,
     */
    remove(target, autoPush) {
        const index = arrayIndexOf(this.line, target);
        this.removeFromProcessingLine(target, autoPush);
        this.removeFromWillProcessedLine(target);
        this.line.splice(index, 1);
    }
    /**
     * 根据引用地址删除处理中队列的某个成员
     * @param {QueueItem | uuid} 要删除的对象
     * @param { ?boolean } 是否继续push下一个任务，
     * @return {QueueItem | null} 被删除的对象
     */
    removeFromProcessingLine(target, autoPush = true) {
        let delTarget = null;
        const index = arrayIndexOf(this.processingLine, target);
        if (index !== -1) {
            delTarget = this.processingLine[index];
            // 删除并扔进已处理完的队伍中
            const delLen = this.processingLine.splice(index, 1);
            if (delLen > 0) {
                this.processedLine.push(delTarget);
            }
            const next = this.getNext();
            // 删除了一个自动添加
            if (next && this.autoPush && autoPush) {
                this.pushToProcessingLine(next);
            }
            // 没有队列了
            if (next === undefined) {
                this.onend();
            }
        }
        return delTarget;
    }

    /**
     * 根据引用地址删除待处理队伍的成员
     * @param {QueueItem | uuid} 要删除的对象
     * @return {QueueItem} 被删除的对象
     */
    removeFromWillProcessedLine(target) {
        let delTarget = null;
        const index = arrayIndexOf(this.willProcessedLine, target);
        if (index !== -1) {
            delTarget = this.willProcessedLine[index];
            // 删除
            this.willProcessedLine.splice(index, 1);
        }
        return delTarget;
    }
    /**
     * 手动开始处理队列
     */
    start() {
        if (this.autoStart === false) {
            while (this.pushToProcessingLine(this.getNext())) {
                // nothing
            }
        }
    }
}

module.exports = Queue;