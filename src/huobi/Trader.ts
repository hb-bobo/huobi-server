// import { outLogger } from "ROOT/common/logger";
import { isNumber, omit, pick, throttle, toNumber } from "lodash";
import xlsx from 'xlsx';
import { errLogger, outLogger } from "ROOT/common/logger";
import config from 'config';
import { Quant } from "ROOT/lib/quant";
import { keepDecimalFixed } from "ROOT/utils";
import HuobiSDK, { CandlestickIntervalEnum, SymbolInfo } from "node-huobi-sdk";
import { Period } from "./interface";
import { getPriceIndex, getSameAmount, getSymbolInfo, getTracePrice, _SYMBOL_INFO_MAP } from "./util";
import { Trainer } from "./Trainer";
import * as AutoOrderHistoryService from 'ROOT/module/auto-order-history/AutoOrderHistory.service';

interface SymbolConfig{
    kline?: Record<string, any>;
    price: number;
    buy_usdt: number;
    sell_usdt: number;
    period: Period | CandlestickIntervalEnum;
    quant: Quant;
    oversoldRatio: number;
    overboughtRatio: number;
    buyAmountRatio: number;
    sellAmountRatio: number;
    depth: {
        bidsList: any[];
        asksList: any[];
    }
    trainer: Trainer
}

export class Trader {
    static symbolInfoMap: Record<string, SymbolInfo> = {};
    sdk: HuobiSDK;
    _balanceMap: Record<string, number> = {};
    bidsList: any[];
    asksList: any[];
    orderConfigMap: Record<string, SymbolConfig> = {};
    /**
     * 交易费率
     */
    transactFeeRate = {
        "makerFeeRate": 0.002,
        "takerFeeRate": 0.002,
    };
    constructor(sdk) {
        this.sdk = sdk;
        if (this.sdk.options.url) {
            this.init();
        }
    }
    init() {
        this.sdk.getAccountId().then(() => {
            this.getBalance();
        })

        this.sdk.subAuth((data) => {
            outLogger.info('subAuth', data);
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
    getBalance = (symbol?: string) => {
        if (this._balanceMap && symbol) {
            return Promise.resolve(this._balanceMap[symbol]);
        }
        return this.sdk.getAccountBalance().then((data) => {
            if (!Array.isArray(data.list)) {
                return;
            }

            data.list.forEach((item) => {
                if (item.type === 'trade') {
                    this._balanceMap[item.currency] = toNumber(item.balance);
                }
            });
            return this._balanceMap;
        });
    }
    async getSymbolInfo(symbol: string) {
        const symbolInfo = await getSymbolInfo(symbol);

        if (Trader.symbolInfoMap[symbol] === undefined && symbolInfo) {
            Trader.symbolInfoMap[symbol] = symbolInfo;
        }

        return symbolInfo;
    }
    async autoTrader({
        symbol,
        buy_usdt,
        sell_usdt,
        period = CandlestickIntervalEnum.MIN5,
        // forceTrade,
    }, userId: number) {
        await this.getSymbolInfo(symbol);
        await this.sdk.getAccountId();
        await this.getBalance(symbol);

        if (!this._balanceMap) {
            return errLogger.error('_balanceMap', this.sdk.spot_account_id);
        }

        const quant = new Quant({
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
            oversoldRatio: 0.03,
            overboughtRatio: -0.034,
            sellAmountRatio: 1.2,
            buyAmountRatio: 1.2,
            price: 0,
            depth: {
                bidsList: [],
                asksList: [],
            },
            trainer: new Trainer(quant, this.sdk, {
                buy_usdt,
                sell_usdt,
            })
        }
        const orderConfig = this.orderConfigMap[symbol];

        this.sdk.subMarketDepth({symbol}, throttle((data) => {
             // 处理数据
            const bidsList = getSameAmount(data.data.bids, {
                type: 'bids',
                symbol: symbol,
            });


            const asksList = getSameAmount(data.data.asks, {
                type: 'asks',
                symbol: symbol,
            });
            orderConfig.depth = {
                bidsList: bidsList,
                asksList: asksList,
            };
        }, 10000, {leading: true}));


        const data = await this.sdk.getMarketHistoryKline(symbol, orderConfig.period, 600);
        if (!data) {
            errLogger.error('getMarketHistoryKline', data);
            return;
        }
        const rData = data.reverse();

        quant.analysis(rData as any[]);
        // orderConfig.trainer.run(rData).then((config) => {
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
        quant.use((row) => {
            orderConfig.price = row.close;
            if (!row.MA120 || !row.MA5 || !row.MA10 || !row.MA30 || !row.MA60) {
                return;
            }

            let action: 'buy' | 'sell' | undefined;

            let amount = 0;
            let price =  0;
            if (
                row.MA5 > row.MA10
                //  && row.MA10 > row.MA30 && row.MA30 > row.MA60 && row.MA60 > row.MA120
                && row["close/MA60"] > orderConfig.oversoldRatio
                && row['amount/amountMA20'] > orderConfig.sellAmountRatio
            ) {
                action = 'sell';
                const pricePoolFormDepth = getTracePrice(orderConfig.depth);
                amount = sell_usdt / row.close;
                price =  pricePoolFormDepth.sell[0] || row.close * 1.02;
            }

            // 买
            if (
                row.MA5 < row.MA10 &&
                row["close/MA60"] < orderConfig.overboughtRatio
                && row['amount/amountMA20'] > orderConfig.buyAmountRatio
            ) {
                action = 'buy';
                const pricePoolFormDepth = getTracePrice(orderConfig.depth);
                amount = buy_usdt / row.close;
                price =  pricePoolFormDepth.buy[0] || row.close *  0.98;
            }

            if (!action && (row['amount/amountMA20'] > 2 || row.amplitude > 2)) {
                const tradingAdvice = quant.safeTrade(row.close);
                if (tradingAdvice) {
                    action = tradingAdvice.action;
                    amount = tradingAdvice.volume;
                    price = tradingAdvice.price;
                    outLogger.info('tradingAdvice', JSON.stringify(tradingAdvice), `, ${row.amplitude}: row.amplitude,`, ` amount/amountMA20: ${row['amount/amountMA20']}`);
                }
            }

            if (!action) {
                return;
            }
            if (amount < Number.MIN_SAFE_INTEGER) {
                amount = buy_usdt / row.close;
            }
            if (!isNumber(price) || price < Number.MIN_SAFE_INTEGER) {
                const pricePoolFormDepth = getTracePrice(orderConfig.depth);
                price = action === 'sell' ? pricePoolFormDepth.sell[0] : pricePoolFormDepth.buy[0]
            }
            this.order(
                symbol,
                action,
                price,
                amount,
                userId,
            );

            AutoOrderHistoryService.create({
                datetime: new Date(),
                symbol,
                price: price || 0,
                amount: amount || 0,
                userId: userId || 1,
                type: action || 'buy',
                status: -1,
                row: JSON.stringify(omit(row, ['close', 'vol', 'time']))
            }).catch((err) => {
                outLogger.error(err)
            });
            orderConfig.trainer.run().then((config) => {
                Object.assign(orderConfig,
                    pick(
                        config,
                        [
                            'oversoldRatio',
                            'overboughtRatio',
                            'sellAmountRatio',
                            'buyAmountRatio',
                        ]
                    )
                );
            });
        });

        this.sdk.subMarketKline({symbol, period: orderConfig.period}, (data) => {
            orderConfig.price = data.data.close;
            const kline = this.orderConfigMap[symbol].kline;

            if (kline && kline.id !== data.data.id) {
                orderConfig.quant.analysis(kline);
                outLogger.info('subMarketKline', data.data.id);
            }
            this.orderConfigMap[symbol].kline = data.data;
        })
    }
    cancelAutoTrader(userId, symbol) {
        delete this.orderConfigMap[symbol];
    }
    async order(symbol: string, type: 'buy' | 'sell', amount: number, price: number, userId: number) {
        outLogger.info(`order:  ${type} ${symbol} -> (${price}, ${amount})`);

        const priceIndex = getPriceIndex(symbol);
        const symbolInfo = await this.getSymbolInfo(symbol);
        if (!symbolInfo) {
            return await this.order(symbol, type, amount, price, userId);
        }
        const quoteCurrencyBalance = this._balanceMap[symbolInfo['quote-currency']];
        const baseCurrencyBalance = this._balanceMap[symbolInfo['base-currency']];

        const hasEnoughBalance = quoteCurrencyBalance > (amount * this.orderConfigMap[symbol].price * priceIndex * 1.002);
        const hasEnoughAmount = baseCurrencyBalance > (amount * 1.002);

        if (!hasEnoughBalance && type === 'buy') {
            const msg = `quote-currency( ${symbolInfo['quote-currency']} ) not enough`
            outLogger.info(msg);
            return Promise.reject(msg);
        } else if (!hasEnoughAmount && type === 'sell') {
            const msg = `base-currency( ${symbolInfo['base-currency']} ) not enough`
            outLogger.info(msg);
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
                    outLogger.info(msg);
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

        if (data) {
            outLogger.info(data);
            AutoOrderHistoryService.create({
                datetime: new Date(),
                symbol,
                price: this.priceToFixed(symbol, price),
                amount: this.amountToFixed(symbol, amount),
                userId: userId || 1,
                type: type,
                status: 1,
            }).catch((err) => {
                outLogger.error(err)
            });
        }
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
