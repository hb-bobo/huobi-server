import { keepDecimalFixed } from "./util";



interface Options {
    symbol: string;
    /**
     * 买入的量
     */
    buyAmount?: number;
    /**
     * 卖出的量
     */
    sellAmount?: number;
    /**
     * 对币余额(usdt)
     */
    quoteCurrencyBalance: number;
    /**
     * 当前币的余额
     */
    baseCurrencyBalance: number;
    /**
     * 交易费率
     */
    transactFeeRate?: {
        makerFeeRate: number;
        takerFeeRate: number;
    };
}
/**
 * 回测工具
 */
export default class Backtest{
    initOption: Options;
    symbol: string;
    /**
     * 买入的量
     */
    buyAmount: number;
    /**
     * 卖出的量
     */
    sellAmount: number;
    /**
     * 对币余额(usdt)
     */
    quoteCurrencyBalance: number;
    /**
     * 当前币的余额
     */
    baseCurrencyBalance: number;
    /**
     * 交易费率
     */
    transactFeeRate = {
        "makerFeeRate": 0.002,
        "takerFeeRate": 0.002,
    };
    _startPrice?: number;
    _lastPrice = 0;
    /**
     * 回测工具
     */
    constructor(option: Options) {
        Object.assign(this, option)
        this.initOption = {...option};
    }
    buy(price: number, amount = this.buyAmount) {
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
    sell(price: number, amount = this.buyAmount) {

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
        const startBalance  = this.initOption.quoteCurrencyBalance + this.initOption.baseCurrencyBalance * this._startPrice;
        return keepDecimalFixed((currentBalance - startBalance) / this.initOption.quoteCurrencyBalance, 2);
    }
}
