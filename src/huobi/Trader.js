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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trader = void 0;
// import { outLogger } from "ROOT/common/logger";
const lodash_1 = require("lodash");
const logger_1 = require("../common/logger");
const config_1 = __importDefault(require("config"));
const quant_1 = require("../lib/quant");
const utils_1 = require("../utils");
const src_1 = require("../lib/huobi-sdk/src");
const util_1 = require("./util");
const Trainer_1 = require("./Trainer");
const AutoOrderHistoryService = __importStar(require("../module/auto-order-history/AutoOrderHistory.service"));
const dayjs_1 = __importDefault(require("dayjs"));
const sentMail_1 = __importDefault(require("../common/sentMail"));
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
        this.getBalance = () => {
            return this.sdk.getAccountBalance().then((data) => {
                if (!Array.isArray(data.list)) {
                    return;
                }
                data.list.forEach((item) => {
                    if (item.type === 'trade') {
                        this._balanceMap[item.currency] = lodash_1.toNumber(item.balance);
                    }
                });
                return this._balanceMap;
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
        setInterval(async () => {
            const historys = await AutoOrderHistoryService.find({}, {
                pageSize: 20,
                current: 1,
            });
            historys.list.forEach(item => {
                if (!item.clientOrderId || item.state !== '') {
                    return;
                }
                this.sdk.getOrder(item.clientOrderId).then((data) => {
                    if (lodash_1.isObjectLike(data)) {
                        item.state = data.state;
                        AutoOrderHistoryService.updateOne({ id: item.id }, item);
                    }
                });
            });
        }, 1000 * 60 * 30);
    }
    async getSymbolInfo(symbol) {
        const symbolInfo = await util_1.getSymbolInfo(symbol);
        if (Trader.symbolInfoMap[symbol] === undefined && symbolInfo) {
            Trader.symbolInfoMap[symbol] = symbolInfo;
        }
        return symbolInfo;
    }
    async autoTrader({ symbol, buy_usdt, sell_usdt, period = src_1.CandlestickIntervalEnum.MIN5, oversoldRatio, overboughtRatio, sellAmountRatio, buyAmountRatio, contract, }, userId) {
        await this.getSymbolInfo(symbol);
        await this.sdk.getAccountId();
        await this.getBalance();
        if (!this._balanceMap) {
            return logger_1.errLogger.error('_balanceMap', this.sdk.spot_account_id);
        }
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
            oversoldRatio: oversoldRatio || 0.03,
            overboughtRatio: overboughtRatio || -0.034,
            sellAmountRatio: sellAmountRatio || 1.2,
            buyAmountRatio: buyAmountRatio || 1.2,
            price: 0,
            depth: {
                bidsList: [],
                asksList: [],
            },
            trainer: new Trainer_1.Trainer(quant, {
                buy_usdt,
                sell_usdt,
            }),
            min: 0,
            max: 0,
            contract: Boolean(contract),
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
        const data = await this.sdk.getMarketHistoryKline(symbol, orderConfig.period, 400);
        if (!data) {
            logger_1.errLogger.error('getMarketHistoryKline', data);
            return;
        }
        const rData = data.reverse();
        quant.analysis(rData);
        this.sdk.subMarketKline({ symbol, period: orderConfig.period }, (data) => {
            orderConfig.price = data.data.close;
            const kline = this.orderConfigMap[symbol].kline;
            if (!kline) {
                logger_1.outLogger.error('subMarketKline err', kline);
            }
            if (kline && kline.id !== data.data.id) {
                orderConfig.quant.analysis(kline);
                // outLogger.info('subMarketKline', data.data.id);
            }
            this.orderConfigMap[symbol].kline = data.data;
        });
        quant.use((row) => {
            orderConfig.price = row.close;
            if (!row.MA120 || !row.MA5 || !row.MA10 || !row.MA30 || !row.MA60) {
                return;
            }
            let action;
            let amount = 0;
            let price = 0;
            if (row.MA5 > row.MA10
                //  && row.MA10 > row.MA30 && row.MA30 > row.MA60 && row.MA60 > row.MA120
                && row["close/MA60"] > orderConfig.oversoldRatio
                && row['amount/amountMA20'] > orderConfig.sellAmountRatio) {
                action = 'sell';
                const pricePoolFormDepth = util_1.getTracePrice(orderConfig.depth);
                amount = sell_usdt / row.close;
                price = pricePoolFormDepth.sell[0] || row.close * 1.02;
            }
            // 买
            if (row.MA5 < row.MA10 &&
                row["close/MA60"] < orderConfig.overboughtRatio
                && row['amount/amountMA20'] > orderConfig.buyAmountRatio) {
                action = 'buy';
                const pricePoolFormDepth = util_1.getTracePrice(orderConfig.depth);
                logger_1.outLogger.info(pricePoolFormDepth);
                amount = buy_usdt / row.close;
                price = pricePoolFormDepth.buy[0] || row.close * 0.98;
            }
            if (!action && (row['amount/amountMA20'] > 2 || row.amplitude > 2)) {
                // if (quant.dc.maxs && quant.dc.maxs.length === 0) {
                //     quant.updateConfig({
                //         mins: [row.close * 0.9],
                //         maxs: [row.close * 1.1],
                //     });
                // }
                // const tradingAdvice = quant.safeTrade(row.close);
                // if (tradingAdvice) {
                //     action = tradingAdvice.action;
                //     amount = tradingAdvice.volume;
                //     price = tradingAdvice.price || row.close *  0.9;
                //     outLogger.info('tradingAdvice', JSON.stringify(tradingAdvice), `, row.amplitude: ${row.amplitude},`, ` amount/amountMA20: ${row['amount/amountMA20']}`);
                // }
            }
            if (!action) {
                return;
            }
            logger_1.outLogger.info(`context: ${symbol}, row.close/MA60: ${row["close/MA60"]},`, ` amount/amountMA20: ${row['amount/amountMA20']}`);
            if (amount < Number.MIN_SAFE_INTEGER) {
                amount = buy_usdt / row.close;
            }
            if (!lodash_1.isNumber(price) || price < Number.MIN_SAFE_INTEGER) {
                const pricePoolFormDepth = util_1.getTracePrice(orderConfig.depth);
                price = action === 'sell' ? pricePoolFormDepth.sell[0] : pricePoolFormDepth.buy[0];
            }
            this.order(symbol, action, amount, price, userId).then(async (orderId) => {
                AutoOrderHistoryService.create({
                    datetime: new Date(),
                    symbol,
                    price: this.priceToFixed(symbol, price),
                    amount: this.amountToFixed(symbol, amount),
                    userId: userId || 1,
                    type: action,
                    status: 1,
                    state: '',
                    clientOrderId: orderId,
                    row: ''
                }).catch((err) => {
                    logger_1.outLogger.error(err);
                });
            }).finally(() => {
                if (this.orderConfigMap[symbol].contract && action) {
                    this.beforeContractOrder(symbol, action);
                }
            });
            // orderConfig.trainer.run().then((config) => {
            //     Object.assign(orderConfig,
            //         pick(
            //             config,
            //             [
            //                 'oversoldRatio',
            //                 'overboughtRatio',
            //                 'sellAmountRatio',
            //                 'buyAmountRatio',
            //             ]
            //         )
            //     );
            // });
        });
    }
    cancelAutoTrader(userId, symbol) {
        delete this.orderConfigMap[symbol];
    }
    /**
     * 开单前处理
     * @param symbol
     * @param action
     */
    async beforeContractOrder(symbol, action) {
        const contractSymbol = symbol.replace('usdt', '').toUpperCase();
        const data = await this.sdk.contractMarketDetailMerged(`${contractSymbol}_CQ`);
        const list = await this.sdk.contractPositionInfo(contractSymbol.toLocaleLowerCase());
        // const action = 'buy'
        const digit = data.tick.close.length - 1 - data.tick.close.lastIndexOf('.');
        const rate = action === 'buy' ? 0.997 : 1.004;
        const closeRate = 1;
        const buyVolume = this.orderConfigMap[symbol].buy_usdt * 10;
        const sellVolume = this.orderConfigMap[symbol].sell_usdt * 10;
        const lever_rate = 20;
        let buyAvailable = 0;
        let sellAvailable = 0;
        list.forEach((item) => {
            if (item.direction === 'buy') {
                buyAvailable += item.available;
            }
            else {
                sellAvailable += item.available;
            }
        });
        const params = {
            symbol: contractSymbol,
            contract_type: 'quarter',
            direction: action,
            price: -1,
            volume: 0,
            /**
            * 开仓倍数
            */
            lever_rate,
            order_price_type: 'limit'
        };
        if (action === 'buy') {
            // 开多
            await this.contractOrder({
                ...params,
                price: utils_1.keepDecimalFixed(Number(data.tick.close) * rate, digit),
                volume: buyVolume,
                offset: 'open',
            });
            if (sellAvailable > 0) {
                // 平空
                this.contractOrder({
                    ...params,
                    price: utils_1.keepDecimalFixed(Number(data.tick.close) * closeRate, digit),
                    volume: sellAvailable < sellVolume ? sellAvailable : sellVolume,
                    offset: 'close',
                });
            }
        }
        else if (action === 'sell') {
            // 开空
            await this.contractOrder({
                ...params,
                price: utils_1.keepDecimalFixed(Number(data.tick.close) * rate * 1.008, digit),
                volume: sellVolume,
                offset: 'open',
            });
            if (buyAvailable >= 0) {
                // 平多
                this.contractOrder({
                    ...params,
                    price: utils_1.keepDecimalFixed(Number(data.tick.close) * closeRate, digit),
                    volume: buyAvailable < buyVolume ? buyAvailable : buyVolume,
                    offset: 'close',
                });
            }
        }
        logger_1.outLogger.info(`
            symbol: ${symbol}
            action: ${action}
            close: ${data.tick.close}
            buyVolume: ${buyVolume}
            sellVolume: ${sellVolume}
            buyAvailable: ${buyAvailable}
            sellAvailable: ${sellAvailable}
        `);
        sentMail_1.default(config_1.default.get('email'), {
            from: 'hubo2008@163.com',
            to: 'hubo11@jd.com',
            subject: `Hello ✔${symbol}`,
            text: 'Hello world?',
            html: `<p><br><b>${action}</b> <i>${symbol}<i> (${data.tick.close}) at ${dayjs_1.default(new Date()).utcOffset(8).format("YYYY-MM-DD HH:mm:ss")}</p>` // html body
        });
    }
    async order(symbol, type, amount, price, userId) {
        logger_1.outLogger.info(`order:  ${type} ${symbol} -> (${price}, ${amount})`);
        const priceIndex = util_1.getPriceIndex(symbol);
        const symbolInfo = await this.getSymbolInfo(symbol);
        await this.getBalance();
        if (!symbolInfo) {
            return await this.order(symbol, type, amount, price, userId);
        }
        const quoteCurrencyBalance = this._balanceMap[symbolInfo['quote-currency']];
        const baseCurrencyBalance = this._balanceMap[symbolInfo['base-currency']];
        const hasEnoughBalance = quoteCurrencyBalance > (amount * this.orderConfigMap[symbol].price * priceIndex * 1.002);
        const hasEnoughAmount = baseCurrencyBalance > (amount * 1.002);
        logger_1.outLogger.info(`quoteCurrencyBalance: ${quoteCurrencyBalance}, baseCurrencyBalance: ${baseCurrencyBalance}`);
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
        const openOrderRes = await this.sdk.getOpenOrders(symbol, {
            size: 10,
        });
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
                // const gain2 = Math.abs((oriderInfo.price - this.orderConfigMap[symbol].price) / this.orderConfigMap[symbol].price);
                // if (gain2 > 0.4) {
                //     outLogger.info(`gain: symbol(${gain2})`);
                //     this.cancelOrder(oriderInfo.id)
                // }
            }
        }
        const data = await this.sdk.order(symbol, `${type}-limit`, this.amountToFixed(symbol, amount), this.priceToFixed(symbol, price));
        return data;
    }
    async contractOrder(params) {
        const textMap = {
            'buyopen': '买入开多',
            'sellclose': '卖出平多',
            'sellopen': '卖出开空',
            'buyclose': '买入平空',
        };
        return this.sdk.contractOrder(params).finally(() => {
            logger_1.outLogger.info(`${textMap[params.direction + params.offset]}`);
        });
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
exports.Trader = Trader;
Trader.symbolInfoMap = {};
