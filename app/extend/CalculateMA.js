
/**
 * 
 * @param {number} dayCount 
 * @param {*} data 
 */
function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}


exports.calculateMA = calculateMA;

/**
 * 与上面的功能一样，区别是此方法用于for遍历中，上面的已经把循环给做了
 */
class CalculateMA {
    constructor(dayCount, {key, length = 600} = {}) {
        this.dayCount = dayCount;
        this.result = [];
        this.key = key || 'close';
        // this.tempSum = 0;
        this.tempCount = 0;
        this.length = length;
        // 缓存最新的${this.dayCount}个数据
        this._datas = [];
    }
    push(data, index) {
        if (Array.isArray(data) && index !== undefined) {
            if (index < this.dayCount) {
                this.result.push('-');
                return;
            }
            var sum = 0;
            for (var j = 0; j < this.dayCount; j++) {
                sum += data[index - j][this.key];
            }
            this.result.push(sum / this.dayCount);
            this.checkFull();
        } else {
            // ws的数据/ 单个数据
            if (this.result.length < this.dayCount) {
                this.result.push('-');
                this._datas.push(data);
                return;
            }
            
            this._datas.push(data);
            //  最新的${this.dayCount}个数据求和
            let sum = this._datas.reduce(function (previousValue, currentValue) {
                return previousValue + Number(currentValue);
            });
            this.result.push(sum / this._datas.length);
            // 没有达到${this.dayCount}个只更新局部的avg
            // if (this.tempCount < this.dayCount) {
            //     this.tempCount++;
            //     this.result[this.result.length - 1] = (sum) / (this._datas.length)
            // } else {
                
            //     // this.result.push(this.tempSum / this.dayCount);
            //     this.tempCount = 0;
            // }
            // 只缓存最新的${this.dayCount}个数据，多了就删除
            if (this._datas.length > this.dayCount) {
                this._datas.shift();
            }
            // console.log(this)
            this.checkFull();
        }
        
    }
    checkFull() {
        if (this.result.length > this.length) {
            this.result.shift();
        }
    }   
    last() {
        return this.result[this.result.length - 1];
    }
}
exports.CalculateMA = CalculateMA;