"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trader = void 0;
// import { outLogger } from "../common/logger";
const lodash_1 = require("lodash");
const logger_1 = require("../common/logger");
const quant_1 = require("../lib/quant");
const utils_1 = require("../utils");
const node_huobi_sdk_1 = require("node-huobi-sdk");
const util_1 = require("./util");
const Trainer_1 = require("./Trainer");
const AutoOrderHistoryService = __importStar(require("../module/auto-order-history/AutoOrderHistory.service"));
let Trader = /** @class */ (() => {
    class Trader {
        constructor(sdk) {
            this._balanceMap = {};
            this.orderConfigMap = {};
            /**
             * 交易费率
             */
            this.transactFeeRate = {
                "makerFeeRate": 0.002,
                "takerFeeRate": 0.002,
            };
            /**
             * 获取余额
             * @param symbol usdt btc ht
             */
            this.getBalance = (symbol) => {
                if (this._balanceMap && symbol) {
                    return this._balanceMap[symbol];
                }
                this.sdk.getAccountBalance().then((data) => {
                    if (!data) {
                        return;
                    }
                    data.list.forEach((item) => {
                        this._balanceMap[item.currency] = lodash_1.toNumber(item.balance);
                    });
                });
            };
            this.sdk = sdk;
            if (this.sdk.options.url) {
                this.init();
            }
        }
        init() {
            this.sdk.getAccountId().then(() => {
                this.getBalance();
            });
            this.sdk.subAuth((data) => {
                logger_1.outLogger.info('subAuth', data);
                this.sdk.subAccountsUpdate({}, (data) => {
                    if (Array.isArray(data)) {
                        data.forEach((item) => {
                            this._balanceMap[item.currency] = lodash_1.toNumber(item.available);
                        });
                    }
                    if (data.currency) {
                        if (!this._balanceMap) {
                            this._balanceMap = {};
                        }
                        this._balanceMap[data.currency] = lodash_1.toNumber(data.available);
                    }
                });
            });
        }
        async getSymbolInfo(symbol) {
            const symbolInfo = await util_1.getSymbolInfo(symbol);
            if (Trader.symbolInfoMap[symbol] === undefined && symbolInfo) {
                Trader.symbolInfoMap[symbol] = symbolInfo;
            }
            return symbolInfo;
        }
        async autoTrader({ symbol, buy_usdt, sell_usdt, period = 5, }, userId) {
            await this.getSymbolInfo(symbol);
            await this.getBalance(symbol);
            const quant = new quant_1.Quant({
                symbol: symbol,
                quoteCurrencyBalance: this._balanceMap[Trader.symbolInfoMap[symbol]['quote-currency']],
                baseCurrencyBalance: this._balanceMap[Trader.symbolInfoMap[symbol]['base-currency']],
                mins: [],
                maxs: [],
                minVolume: Trader.symbolInfoMap[symbol]['limit-order-min-order-amt'],
            });
            this.orderConfigMap[symbol] = {
                buy_usdt,
                sell_usdt,
                period,
                quant: quant,
                oversoldRatio: 0.02,
                overboughtRatio: -0.034,
                sellAmountRatio: 2.4,
                buyAmountRatio: 2.1,
                price: 0,
                depth: {
                    bidsList: [],
                    asksList: [],
                },
                trainer: new Trainer_1.Trainer(quant, this.sdk)
            };
            const orderConfig = this.orderConfigMap[symbol];
            this.sdk.subMarketDepth({ symbol }, lodash_1.throttle((data) => {
                // 处理数据
                const bidsList = util_1.getSameAmount(data.data.bids, {
                    type: 'bids',
                    symbol: symbol,
                });
                const asksList = util_1.getSameAmount(data.data.asks, {
                    type: 'asks',
                    symbol: symbol,
                });
                orderConfig.depth = {
                    bidsList: bidsList,
                    asksList: asksList,
                };
            }, 10000, { leading: true }));
            const data = await this.sdk.getMarketHistoryKline(symbol, node_huobi_sdk_1.CandlestickIntervalEnum.MIN5, 480);
            const rData = data.reverse();
            quant.analysis(rData);
            orderConfig.trainer.run(rData).then((config) => {
                Object.assign(orderConfig, config);
            });
            quant.use((row) => {
                orderConfig.price = row.close;
                if (!row.MA5 || !row.MA60 || !row.MA30 || !row.MA10) {
                    return;
                }
                let action;
                let amount = 0;
                let price = 0;
                if (row["close/MA60"] > orderConfig.oversoldRatio
                // || row['amount/amountMA20'] > config.sellAmountRatio
                ) {
                    action = 'sell';
                    const pricePoolFormDepth = util_1.getTracePrice(orderConfig.depth);
                    amount = sell_usdt / row.close;
                    price = pricePoolFormDepth.sell[0] || row.close * 1.02;
                }
                // 买
                if (row["close/MA60"] < orderConfig.overboughtRatio
                // || row['amount/amountMA20'] > config.buyAmountRatio
                ) {
                    action = 'buy';
                    const pricePoolFormDepth = util_1.getTracePrice(orderConfig.depth);
                    amount = buy_usdt / row.close;
                    price = pricePoolFormDepth.buy[0] || row.close * 0.98;
                }
                if (!action) {
                    const tradingAdvice = quant.safeTrade(row.close);
                    if (tradingAdvice) {
                        action = tradingAdvice.action;
                        amount = tradingAdvice.volume;
                        price = tradingAdvice.price;
                        logger_1.outLogger.info('tradingAdvice', JSON.stringify(tradingAdvice));
                    }
                }
                if (!action) {
                    return;
                }
                this.order(symbol, action, price, amount);
                AutoOrderHistoryService.create({
                    datetime: new Date(),
                    symbol,
                    price: price || 0,
                    amount: amount || 0,
                    userId: userId || 1,
                    type: action || 'buy',
                    row: JSON.stringify(lodash_1.omit(row, ['close', 'vol', 'time']))
                }).catch((err) => {
                    logger_1.outLogger.error(err);
                });
                orderConfig.trainer.run().then((config) => {
                    Object.assign(orderConfig, config);
                });
            });
            this.sdk.subMarketKline({ symbol, period: node_huobi_sdk_1.CandlestickIntervalEnum.MIN5 }, (data) => {
                orderConfig.price = data.data.close;
                const kline = this.orderConfigMap[symbol].kline;
                if (kline && kline.id !== data.data.id && data.symbol === symbol) {
                    // outLogger.info('subMarketKline', data.symbol, kline.id)
                    orderConfig.quant.analysis(kline);
                }
                this.orderConfigMap[symbol].kline = data.data;
            });
        }
        async order(symbol, type, amount, price) {
            logger_1.outLogger.info(`order:  ${type} ${symbol} -> (${price}, ${amount})`);
            const priceIndex = util_1.getPriceIndex(symbol);
            const symbolInfo = await this.getSymbolInfo(symbol);
            if (!symbolInfo) {
                return await this.order(symbol, type, amount, price);
            }
            const quoteCurrencyBalance = this._balanceMap[symbolInfo['quote-currency']];
            const baseCurrencyBalance = this._balanceMap[symbolInfo['base-currency']];
            const hasEnoughBalance = quoteCurrencyBalance > (amount * this.orderConfigMap[symbol].price * priceIndex * 1.002);
            const hasEnoughAmount = baseCurrencyBalance > (amount * 1.002);
            if (!hasEnoughBalance && type === 'buy') {
                const msg = `quote-currency( ${symbolInfo['quote-currency']} ) not enough`;
                logger_1.outLogger.info(msg);
                return Promise.reject(msg);
            }
            else if (!hasEnoughAmount && type === 'sell') {
                const msg = `base-currency( ${symbolInfo['base-currency']} ) not enough`;
                logger_1.outLogger.info(msg);
                return Promise.reject(msg);
            }
            const openOrderRes = await this.sdk.getOpenOrders(symbol, null, 10);
            for (let i = 0; i < openOrderRes.length; i++) {
                const oriderInfo = openOrderRes[i];
                if (oriderInfo.source === 'api') {
                    // 挂单价与下单是否过于相近
                    const gain = Math.abs((oriderInfo.price - price) / price);
                    if (gain < 0.01) {
                        const msg = `order:  ${type} ${symbol} 历史订单价格太相近(price)`;
                        logger_1.outLogger.info(msg);
                        return Promise.reject(msg);
                    }
                    // 挂单价与当前价是否失效
                    const gain2 = Math.abs((oriderInfo.price - this.orderConfigMap[symbol].price) / this.orderConfigMap[symbol].price);
                    if (gain2 > 0.4) {
                        logger_1.outLogger.info(`gain: symbol(${gain2})`);
                        this.cancelOrder(oriderInfo.id);
                    }
                }
            }
            await this.sdk.order(symbol, `${type}-limit`, this.amountToFixed(symbol, amount), this.priceToFixed(symbol, price));
        }
        cancelOrder(id) {
            return this.sdk.cancelOrder(id);
        }
        amountToFixed(symbol, amount) {
            const symbolInfo = util_1._SYMBOL_INFO_MAP[symbol];
            return utils_1.keepDecimalFixed(amount, symbolInfo['amount-precision']);
        }
        priceToFixed(symbol, amount) {
            const symbolInfo = util_1._SYMBOL_INFO_MAP[symbol];
            return utils_1.keepDecimalFixed(amount, symbolInfo['price-precision']);
        }
    }
    Trader.symbolInfoMap = {};
    return Trader;
})();
exports.Trader = Trader;
