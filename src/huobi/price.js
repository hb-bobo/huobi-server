"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolPrice = void 0;
/**
 * 设置/获取btc eth ht对usdt的价格
 */
class SymbolPrice {
    constructor(exchange) {
        this.prices = {
            btc: 10000,
            eth: 300,
            ht: 4,
        };
        this.exchange = exchange;
    }
    set(symbol, value) {
        if (this.prices[symbol]) {
            this.prices[symbol] = value;
        }
    }
    get(symbol) {
        if (this.prices[symbol]) {
            return this.prices[symbol];
        }
        return 0;
    }
}
exports.SymbolPrice = SymbolPrice;
const symbolPrice = new SymbolPrice('huobi');
exports.default = symbolPrice;
