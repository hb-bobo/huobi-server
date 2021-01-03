"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
/* {
    "id":        601595424,
    "price":     10195.64,
    "time":      1494495766,
    "amount":    0.2943,
    "direction": "buy",
    "tradeId":   601595424,
    "ts":        1494495766000
} */
const M = 1000 * 60;
/**
 * 根据字符串转成毫秒
 * @param {string} timeDes
 * @return {number}
 */
const toMillisecond = function (timeDes) {
    const temp = {
        '5min': 5 * M,
        '1min': M,
    };
    return temp[timeDes];
};
// default config
const defaultConfig = {
    range: 0.1,
    recordMaxLen: 10,
    disTime: toMillisecond('1min'),
};
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
    constructor({ data = {}, config = {}, } = {}) {
        this.historyStatus = [];
        this._preTrade = {};
        this.config = Object.assign({}, defaultConfig, config);
        this.reset();
    }
    reset() {
        /**
         * {time: Date, status: '涨'}
         */
        this.historyStatus = [];
        // 上一个记录
        this._preTrade = {};
    }
    /**
     *
     * @param {Object} data
     * @param {number} disTime
     */
    speed(data, disTime = this.config.disTime) {
        if (!data) {
            throw Error('data不存在');
        }
        // 时间戳
        const ts = data.ts;
        // 默认状态为 横盘
        if (this.historyStatus.length === 0 && data) {
            this._preTrade = {
                // 默认为price
                value: data.value,
                ts: data.ts
            };
            this.pushSatus({
                status: '横盘',
                strength: 0,
                ts,
                timeUTC: dayjs_1.default(ts).format("YYYY/MM/DD H:mm:ss"),
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
            const disValue = Number(data.value) - Number(this._preTrade.value);
            let status = disValue > 0 ? '涨' : '跌';
            if ((Math.abs(disValue) / Number(this._preTrade.value)) < this.config.range) {
                status = '横盘';
            }
            this.pushSatus({
                status,
                // 强度
                strength: Number((disValue / Number(this._preTrade.value) * 100).toFixed(3)) - 0,
                ts,
                timeUTC: dayjs_1.default(ts).format("YYYY/MM/DD H:mm:ss"),
                value: data.value,
            });
            // 根据时间差算出下一个时间的节点，默认为5min后
            this.nextTime = ts + disTime;
            this._preTrade = {
                value: data.value,
                ts: data.ts
            };
        }
    }
    /**
     *
     * @param {Object} status
     */
    pushSatus(status) {
        if (this.historyStatus.length > (this.config.recordMaxLen - 1)) {
            this.historyStatus.shift();
        }
        this.historyStatus.push(status);
    }
}
exports.default = AbnormalMonitor;
