// import moment from 'moment';
const moment = require('moment');

/* {
    "id":        601595424,
    "price":     10195.64,
    "time":      1494495766,
    "amount":    0.2943,
    "direction": "buy",
    "tradeId":   601595424,
    "ts":        1494495766000
} */


/**
 * 根据字符串转成毫秒
 * @param {string} timeDes
 * @return {number}
 */
const toMillisecond = function (timeDes) {
    let s = 1000 * 60;
    let temp = {
        '5min': 5 * s,
        '1min': s,
    }
    return temp[timeDes];
}

// default config
const defaultConfig = {
    // 目标幅度， 超过即是波动 range = 与上一个值的差/上一个值的，未 * 100
    range: 0.1,
    // 最大记录长度，数组长度
    recordMaxLen: 10,
    // 间隔时间
    disTime: toMillisecond('1min'),
}
/**
 * 异常涨幅监控
 * status: 横盘 | 跌 | 涨
 * speed: number
 * res = [{status, speed}, {status, speed}]
 * @example 
 * let am = new AbnormalMonitor();
 * am.speed({value: 111, ts: Date.now()}, 1123421);
 */

class AbnormalMonitor {
    /**
     * 异常涨幅监控
     * @param {Object} data. 
     */
    constructor({
        data = {},
        config = {},
    } = {}) {
        this.config = Object.assign({}, defaultConfig, config);
        this.reset();
    }
    reset() {
        /**
         * {time: Date, status: '涨'}
         */
        this.historyStatus = [];
        this.disTime = this.config.disTime; // 5min
        // 最大记录长度，数组长度
        this.recordMaxLen = this.config.recordMaxLen;
        // 目标幅度， 超过即是波动
        this.range = this.config.range;
        // 上一个记录
        this._preTrade = {};
    }
    /**
     * 
     * @param {Object} data 
     * @param {number} disTime 
     */
    speed(data, disTime = this.disTime) {
        if (!data) {
            console.log(data)
            return;
        }
        
        // 时间戳
        let ts = data.ts;
       
        // 默认状态为 横盘
        if (this.historyStatus.length === 0 && data) {
            this._preTrade = {
                // 默认为price
                value: data.value,
                ts: data.ts
            }
            this.pushSatus({
                status: '横盘',
                strength: 0,
                ts: ts,
                timeUTC: moment(ts).format("YYYY/MM/DD H:mm:ss"),
                value: data.value,
            });
             // 根据时间差算出下一个时间的节点，默认为5min后
            this.nextTime = ts + disTime;
            return;
        }
        // "price":     10195.64,
        // "time":      1494495766,
        // "amount":    0.2943,
        // "direction": "buy",
        // "tradeId":   601595424,
        // "ts":        1494495766000
        if (ts > this.nextTime || disTime === 0) {
            const disValue = data.value - this._preTrade.value;
            let status = disValue > 0 ? '涨' : '跌';
            
            if ((Math.abs(disValue) / this._preTrade.value) < this.range) {
                status = '横盘';
            }
            
            this.pushSatus({
                status: status,
                // 强度
                strength: (disValue / this._preTrade.value * 100).toFixed(3) - 0,
                ts: ts,
                timeUTC: moment(ts).format("YYYY/MM/DD H:mm:ss"),
                value: data.value,
            });
             // 根据时间差算出下一个时间的节点，默认为5min后
            this.nextTime = ts + disTime;
            this._preTrade = {
                value: data.value,
                ts: data.ts
            }
        }
    }
    /**
     * 
     * @param {Object} status 
     */
    pushSatus(status) {
        if (this.historyStatus.length > (this.recordMaxLen - 1)) {
            this.historyStatus.shift();
        }
        this.historyStatus.push(status);
    }
}

module.exports = AbnormalMonitor;