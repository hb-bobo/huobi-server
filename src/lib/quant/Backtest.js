"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 回测工具
 */
class Backtest {
    /**
     * 回测工具
     */
    constructor(option) {
        this._lastPrice = 0;
        Object.assign(this, option);
        this.initOption = { ...option };
    }
    buy(price, amount = this.buyAmount) {
        if (this.quoteCurrencyBalance > amount * price) {
            this.quoteCurrencyBalance -= amount * price;
            this.baseCurrencyBalance += amount;
        }
        this._lastPrice = price;
    }
    sell(price, amount = this.buyAmount) {
        if (this.baseCurrencyBalance > amount) {
            this.quoteCurrencyBalance += amount * price;
            this.baseCurrencyBalance -= amount;
        }
        this._lastPrice = price;
    }
    getReturn() {
        return (this.quoteCurrencyBalance + this.baseCurrencyBalance * this._lastPrice - this.initOption.quoteCurrencyBalance)
            / this.initOption.quoteCurrencyBalance;
    }
}
exports.default = Backtest;
