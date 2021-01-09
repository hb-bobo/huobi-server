


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
    }
    sell(price: number, amount = this.buyAmount) {

        if (this.baseCurrencyBalance > amount) {
            this.quoteCurrencyBalance += (amount - this.transactFeeRate['makerFeeRate'] * amount) * price;
            this.baseCurrencyBalance -= amount;
        }
        this._lastPrice = price;

    }
    getReturn() {
        return (this.quoteCurrencyBalance + this.baseCurrencyBalance * this._lastPrice - this.initOption.quoteCurrencyBalance)
        / this.initOption.quoteCurrencyBalance;
    }
}
