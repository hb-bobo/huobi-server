"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const dayjs_1 = __importDefault(require("dayjs"));
const util_1 = require("../util");
const indicators_1 = require("../indicators");
/**
 * 量化
 */
class Analyser {
    /**
     * 量化指标分析
     */
    constructor() {
        this.result = [];
        this.middlewares = [];
        this.MA5 = new indicators_1.MA(5);
        this.MA10 = new indicators_1.MA(10);
        this.MA30 = new indicators_1.MA(30);
        this.MA60 = new indicators_1.MA(60);
        this.MA120 = new indicators_1.MA(120);
        this.amountMA20 = new indicators_1.MA(20);
        this.getLast = (n) => {
            return this.result.slice(this.result.length - n - 1, this.result.length - 1);
        };
        //
    }
    analysis(data) {
        this.MA5;
        if (Array.isArray(data)) {
            data.forEach(item => {
                this._analysis(item);
            });
            return;
        }
        this._analysis(data);
    }
    _analysis(data) {
        this.MA5.push(data.close);
        this.MA10.push(data.close);
        this.MA30.push(data.close);
        this.MA60.push(data.close);
        this.MA120.push(data.close);
        const newData = lodash_1.omit(data, 'id');
        const row = {
            ...newData,
            time: dayjs_1.default(Number(data.id + '000')).format("YYYY-MM-DD HH:mm:ss"),
            MA5: util_1.autoToFixed(this.MA5.last()) || null,
            MA10: util_1.autoToFixed(this.MA10.last()) || null,
            MA30: util_1.autoToFixed(this.MA30.last()) || null,
            MA60: util_1.autoToFixed(this.MA60.last()) || null,
            MA120: util_1.autoToFixed(this.MA120.last()) || null,
        };
        if (data.amount !== undefined) {
            this.amountMA20.push(lodash_1.toNumber(data.amount));
            row.amountMA20 = util_1.autoToFixed(this.amountMA20.last()) || null;
            row['amount/amountMA20'] = this.getGain(Number(row.amount), row.amountMA20);
        }
        /**
         * 超跌 < 0
         * 超买 > 0
         */
        row['close/MA60'] = this.getGain(row.close, row.MA60);
        /**
         * 买盘力量大
         */
        row['low-close/close'] = util_1.autoToFixed((row.low - row.close) / Math.abs(row.low - row.high));
        /**
         * 卖盘力量大
         */
        row['high-close/close'] = util_1.autoToFixed((row.high - row.close) / Math.abs(row.low - row.high));
        const preRow = this.result[this.result.length - 1];
        if (preRow) {
            row.amplitude = util_1.keepDecimalFixed((row.high - row.low) / preRow.close, 3) * 100;
            row.changepercent = util_1.keepDecimalFixed((row.close - preRow.close) / preRow.close, 3) * 100;
        }
        else {
            row.amplitude = 0;
        }
        this.middlewares.forEach((callback) => {
            callback(row);
        });
        this.result.push(row);
        this.checkMax();
    }
    checkMax() {
        if (this.result.length > 600) {
            this.result.shift();
        }
    }
    /**
     * 获取涨跌幅
     */
    getGain(close, ma) {
        if (!lodash_1.isNumber(close) || !lodash_1.isNumber(ma)) {
            return 0;
        }
        return util_1.autoToFixed((close - ma) / ma);
    }
    /**
     * 添加中间件
     * @param middleware
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw Error('use param muse be a function');
        }
        this.middlewares.push(middleware);
    }
}
exports.default = Analyser;
