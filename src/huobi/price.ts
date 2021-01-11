
/**
 * 设置/获取btc eth ht对usdt的价格
 */
export class SymbolPrice {
    exchange: string;
    prices = {
        btc: 10000,
        eth: 300,
        ht: 4,
    }
    constructor(exchange: string) {
        this.exchange = exchange;
    }
    set(symbol: string, value: number) {
        if (this.prices[symbol]) {
            this.prices[symbol] = value;
        }
    }
    get(symbol: string): number {
        if (this.prices[symbol]) {
            return this.prices[symbol];
        }
        return 0;
    }
}
const symbolPrice = new SymbolPrice('huobi');

export default symbolPrice;
