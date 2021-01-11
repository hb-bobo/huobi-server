// import { outLogger } from "ROOT/common/logger";
import { toNumber } from "lodash";
import { errLogger, outLogger } from "ROOT/common/logger";
import StatisticalTrade from "./StatisticalTradeData";
import { Quant } from "ROOT/lib/quant";
import { keepDecimalFixed } from "ROOT/utils";
import HuobiSDK, { SymbolInfo } from "ROOT/lib/huobi";
import { Period } from "./interface";
import { getPriceIndex, getSymbolInfo, _SYMBOL_INFO_MAP } from "./util";


interface SymbolConfig{
    price: number;
    buy_usdt: number;
    sell_usdt: number;
    period: Period;
    forceTrade: boolean;
    tradeHandle: StatisticalTrade;
    quant: Quant;
    oversoldRatio: number;
    overboughtRatio: number;
    buyAmountRatio: number;
    sellAmountRatio: number;
}

export class Trader {
    static symbolInfoMap: Record<string, SymbolInfo> = {};
    sdk: HuobiSDK;
    _balanceMap: Record<string, number>;
    bidsList: any[];
    asksList: any[];
    orderConfigMap: Record<string, SymbolConfig>;
    /**
     * 交易费率
     */
    transactFeeRate = {
        "makerFeeRate": 0.002,
        "takerFeeRate": 0.002,
    };
    constructor(sdk) {
        this.sdk = sdk;
        this.sdk.getAccountId().then(() => {
            this.getBalance();
        })

        this.sdk.subAuth(() => {
            this.sdk.subAccountsUpdate({}, (data) => {
                if (Array.isArray(data)) {
                    data.forEach((item) => {
                        this._balanceMap[item.currency] = toNumber(item.available);
                    });
                }
                if( data.currency) {
                    if (!this._balanceMap) {
                        this._balanceMap = {}
                    }
                    this._balanceMap[data.currency] = toNumber(data.available);
                }
            });
        });
    }
    /**
     * 获取余额
     * @param symbol usdt btc ht
     */
    getBalance(symbol?: string) {
        if (this._balanceMap && symbol) {
            return this._balanceMap[symbol]
        }
        this.sdk.getAccountBalance().then((data) => {
            if (!data) {
                return;
            }
            data.list.forEach((item) => {
                this._balanceMap[item.currency] = toNumber(item.balance);
            });
        });
    }
    async getSymbolInfo(symbol: string) {
        const symbolInfo = await getSymbolInfo(symbol);
        if (Trader.symbolInfoMap[symbol] === undefined && symbolInfo) {
            Trader.symbolInfoMap[symbol] = symbolInfo;
        }
        return;
    }
    async autoTrader({
        symbol,
        buy_usdt,
        sell_usdt,
        period,
        forceTrade,
    }) {

        const quant = new Quant({
            symbol: 'btcusdt',
            quoteCurrencyBalance: this._balanceMap[Trader.symbolInfoMap[symbol]['quote-currency']],
            baseCurrencyBalance: this._balanceMap[Trader.symbolInfoMap[symbol]['base-currency']],
            minVolume: Trader.symbolInfoMap[symbol]['limit-order-min-order-amt'],
        })
        this.orderConfigMap[symbol] = {
            buy_usdt,
            sell_usdt,
            period,
            forceTrade,
            tradeHandle: new StatisticalTrade({
                symbol,
                disTime: period * 60 * 1000,
            }),
            quant: quant,
            oversoldRatio: 0.016,
            overboughtRatio: -0.016,
            sellAmountRatio: 2.4,
            buyAmountRatio: 2.1,
            price: 0,
        }
        const data = await this.sdk.getMarketHistoryKline(symbol, period);
        const rData = data.reverse();
        quant.analysis(rData as any[]);

        quant.use((row) => {
            this.orderConfigMap[symbol].price = row.close;
            if (!row.MA5 || !row.MA60 || !row.MA30) {
                return;
            }
            // 卖
            if (row.close > row.MA60) {
                const tradingAdvice = quant.safeTrade(row.close);
                if (
                    row["close/MA60"] > this.orderConfigMap[symbol].oversoldRatio
                    || row['amount/amountMA20'] > this.orderConfigMap[symbol].sellAmountRatio
                ) {
                    if (tradingAdvice) {
                        this.order(symbol, tradingAdvice.action, tradingAdvice.volume, tradingAdvice.price);
                    } else {
                        this.order(symbol, 'sell', sell_usdt / row.close, row.close * 1.02);
                    }
                }
            }
            // 买
            if (row.close < row.MA60) {
                const tradingAdvice = quant.safeTrade(row.close);
                if (
                    row["close/MA60"] < this.orderConfigMap[symbol].overboughtRatio
                    || row['amount/amountMA20'] > this.orderConfigMap[symbol].buyAmountRatio
                ) {
                    if (tradingAdvice) {
                        this.order(symbol, tradingAdvice.action, tradingAdvice.volume, tradingAdvice.price);
                    } else {
                        this.order(symbol, 'buy', buy_usdt / row.close, row.close * 0.98);
                    }
                }
            }
        });
    }
    async order(symbol: string, type: 'buy' | 'sell', amount: number, price: number) {
        outLogger.info(`order:  ${type} ${symbol} -> (${price}, ${amount})`);

        const priceIndex = getPriceIndex(symbol);
        const symbolInfo = await this.getSymbolInfo(symbol);

        const quoteCurrencyBalance = this._balanceMap[symbolInfo['quote-currency']];
        const baseCurrencyBalance = this._balanceMap[symbolInfo['base-currency']];

        const hasEnoughBalance = quoteCurrencyBalance > (amount * this.orderConfigMap[symbol].price * priceIndex * 1.002);
        const hasEnoughAmount = baseCurrencyBalance > (amount * 1.002);

        if (!hasEnoughBalance) {
            const msg = `${symbolInfo['quote-currency']}不足`
            outLogger.info(msg);
            return Promise.reject(msg);
        } else if (!hasEnoughAmount) {
            outLogger.info('当前币不足');
            return Promise.reject('当前币不足');
        }
        const openOrderRes = await this.sdk.getOpenOrders(symbol, null, 10);
        for (let i = 0; i < openOrderRes.length; i++) {
            const oriderInfo = openOrderRes[i];
            if (oriderInfo.source === 'api') {
                // 挂单价与下单是否过于相近
                const gain = Math.abs((oriderInfo.price - price) / price);
                if (gain < 0.01) {
                    const msg = `order:  ${type} ${symbol} 历史订单价格太相近(price)`;
                    outLogger.info(msg);
                    return Promise.reject(msg);
                }
                // 挂单价与当前价是否失效
                const gain2 = Math.abs((oriderInfo.price - this.orderConfigMap[symbol].price) / this.orderConfigMap[symbol].price);
                if (gain2 > 0.4) {
                    outLogger.info(`gain: symbol(${gain2})`);
                    this.cancelOrder(oriderInfo.id)
                }
            }
        }
        await this.sdk.order(symbol, `${type}-limit`, this.amountToFixed(symbol, amount), this.priceToFixed(symbol, price));
    }
    cancelOrder(id: string) {
        return this.sdk.cancelOrder(id);
    }
    amountToFixed(symbol, amount: number) {
        const symbolInfo = _SYMBOL_INFO_MAP[symbol];
        return keepDecimalFixed(amount, symbolInfo['amount-precision']);
    }
    priceToFixed(symbol, amount: number) {
        const symbolInfo = _SYMBOL_INFO_MAP[symbol];
        return keepDecimalFixed(amount, symbolInfo['price-precision']);
    }
}
