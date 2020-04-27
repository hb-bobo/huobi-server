

/**
 * 当不断的执行某任务，把方法放在do里调用， {disTime} 后会自动停止执行
 * 如果disTime内又满足执行某任务的条件，用activate 激活，
 * @param {number} disTime 处理多长时间
 */

class LazyTask {
    constructor({disTime}) {
        this.disTime = disTime;
        this.init();
        
    }
    init() {
        this.taskStatus = 1;
        this.timer = null;
    }
    
    /**
     * 激活任务
     */
    activate() {
        this.taskStatus = 1;
        if (this.timer) {
            clearInterval(this.timer);
            this.setIntervalTime(this.disTime)
        }
    }
    /**
     * 执行
     * @param {Function} fn 
     */
    do(fn) {
        if (this.taskStatus === 0) {
            return;
        }
        if (this.timer === null) {
            this.setIntervalTime();
        }
        if (typeof fn === 'function') {
            fn();
        }
    }
    /**
     * 定时关闭任务
     * @param {number}
     */
    setIntervalTime(disTime = this.disTime) {
        this.timer = setInterval(() => {
            this.taskStatus = 0;
        }, disTime);
    }
    /**
     * 手动停止任务
     */
    stop() {
        this.taskStatus = 0;
    }
}

module.exports = IntervalTask;