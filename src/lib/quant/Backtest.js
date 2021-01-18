"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
/**
 * 回测工具
 */
class Backtest {
    /**
     * 回测工具
     */
    constructor(option) {
        /**
         * 交易费率
         */
        this.transactFeeRate = {
            "makerFeeRate": 0.002,
            "takerFeeRate": 0.002,
        };
        this._lastPrice = 0;
        Object.assign(this, option);
        this.initOption = { ...option };
    }
    buy(price, amount = this.buyAmount) {
        const sum = amount * price;
        if (this.quoteCurrencyBalance > sum) {
            this.quoteCurrencyBalance -= (sum + this.transactFeeRate['makerFeeRate'] * sum);
            this.baseCurrencyBalance += amount;
        }
        this._lastPrice = price;
        if (this._startPrice === undefined) {
            this._startPrice = price;
        }
    }
    sell(price, amount = this.buyAmount) {
        if (this.baseCurrencyBalance > amount) {
            this.quoteCurrencyBalance += (amount - this.transactFeeRate['makerFeeRate'] * amount) * price;
            this.baseCurrencyBalance -= amount;
        }
        this._lastPrice = price;
        if (this._startPrice === undefined) {
            this._startPrice = price;
        }
    }
    getReturn() {
        if (!this._startPrice) {
            return 0;
        }
        const currentBalance = this.quoteCurrencyBalance + this.baseCurrencyBalance * this._lastPrice;
        const startBalance = this.initOption.quoteCurrencyBalance + this.initOption.baseCurrencyBalance * this._startPrice;
        return util_1.keepDecimalFixed((currentBalance - startBalance) / startBalance, 2);
    }
}
exports.default = Backtest;
