


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
    _lastPrice = 0;
    /**
     * 回测工具
     */
    constructor(option: Options) {
        Object.assign(this, option)
        this.initOption = {...option};
    }
    buy(price: number, amount = this.buyAmount) {
        if (this.quoteCurrencyBalance > amount * price) {
            this.quoteCurrencyBalance -= amount * price;
            this.baseCurrencyBalance += amount;
        }
        this._lastPrice = price;
    }
    sell(price: number, amount = this.buyAmount) {
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
