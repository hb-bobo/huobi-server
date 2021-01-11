"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const utils_1 = require("../../../utils");
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
        this.amountMA20 = new indicators_1.MA(20);
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
        this.amountMA20.push(lodash_1.toNumber(data.amount));
        this.MA5.push(data.close);
        this.MA10.push(data.close);
        this.MA30.push(data.close);
        this.MA60.push(data.close);
        const newData = lodash_1.omit(data, 'id');
        const row = {
            ...newData,
            time: new Date(Number(data.id + '000')),
            MA5: utils_1.autoToFixed(this.MA5.last()) || null,
            MA10: utils_1.autoToFixed(this.MA10.last()) || null,
            MA30: utils_1.autoToFixed(this.MA30.last()) || null,
            MA60: utils_1.autoToFixed(this.MA60.last()) || null,
            amountMA20: utils_1.autoToFixed(this.amountMA20.last()) || null,
        };
        /**
         * 超跌 < 0
         * 超买 > 0
         */
        row['close/MA60'] = this.getGain(row.close, row.MA60);
        row['amount/amountMA20'] = this.getGain(row.amount, row.amountMA20);
        /**
         * 买盘力量大
         */
        row['low-close'] = (row.low - row.close) / row.close;
        /**
         * 卖盘力量大
         */
        row['high-close'] = (row.high - row.close) / row.close;
        this.middlewares.forEach((callback) => {
            callback(row);
        });
        this.result.push(row);
    }
    /**
     * 获取涨跌幅
     */
    getGain(close, ma) {
        if (!lodash_1.isNumber(close) || !lodash_1.isNumber(ma)) {
            return 0;
        }
        return (close - ma) / ma;
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
