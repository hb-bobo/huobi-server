// import { outLogger } from "ROOT/common/logger";
import { isNumber, isObjectLike, omit, pick, throttle, toNumber } from "lodash";
import xlsx from "xlsx";
import { errLogger, outLogger } from "ROOT/common/logger";
import config from "config";
import { Quant } from "ROOT/lib/quant";
import { autoToFixed, keepDecimalFixed } from "ROOT/utils";
import HuobiSDK, {
    CandlestickIntervalEnum,
    ContractType,
    SymbolInfo
} from "../lib/huobi-sdk/src";
import { Period } from "./interface";
import {
    getPriceIndex,
    getSameAmount,
    getSymbolInfo,
    getTracePrice,
    _SYMBOL_INFO_MAP
} from "./util";
import { Trainer } from "./Trainer";
import * as AutoOrderHistoryService from "ROOT/module/auto-order-history/AutoOrderHistory.service";
import dayjs from "dayjs";
import sentMail from "ROOT/common/sentMail";

interface SymbolConfig {
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
    min: number;
    max: number;
    depth: {
        bidsList: any[];
        asksList: any[];
    };
    trainer?: Trainer;
    contract: boolean;
    /**
     * 取消跟单任务，包含退订消息
     */
    cancelAutoTraderTask: Array<() => void>;
    buy_open: number;
    sell_close: number;
    sell_open: number;
    buy_close: number;
    lever_rate: number;
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
        makerFeeRate: 0.002,
        takerFeeRate: 0.002
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
        });

        this.sdk.subAuth(data => {
            outLogger.info("subAuth", data);
            this.sdk.subAccountsUpdate({}, data => {
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        this._balanceMap[item.currency] = toNumber(
                            item.available
                        );
                    });
                }
                if (data.currency) {
                    if (!this._balanceMap) {
                        this._balanceMap = {};
                    }
                    this._balanceMap[data.currency] = toNumber(data.available);
                }
            });
        });

        setInterval(async () => {
            const historys = await AutoOrderHistoryService.find(
                {},
                {
                    pageSize: 20,
                    current: 1
                }
            );
            historys.list.forEach(item => {
                if (!item.clientOrderId || item.state !== "") {
                    return;
                }
                this.sdk.getOrder(item.clientOrderId).then(data => {
                    if (isObjectLike(data)) {
                        item.state = data.state;
                        AutoOrderHistoryService.updateOne(
                            { id: item.id },
                            item
                        );
                    }
                });
            });
        }, 1000 * 60 * 30);
    }
    /**
     * 获取余额
     * @param symbol usdt btc ht
     */
    getBalance = () => {
        return this.sdk.getAccountBalance().then(data => {
            if (!Array.isArray(data.list)) {
                return;
            }

            data.list.forEach(item => {
                if (item.type === "trade") {
                    this._balanceMap[item.currency] = toNumber(item.balance);
                }
            });
            return this._balanceMap;
        });
    };
    async getSymbolInfo(symbol: string) {
        const symbolInfo = await getSymbolInfo(symbol);

        if (Trader.symbolInfoMap[symbol] === undefined && symbolInfo) {
            Trader.symbolInfoMap[symbol] = symbolInfo;
        }

        return symbolInfo;
    }
    async autoTrader(
        {
            symbol,
            buy_usdt = 0,
            sell_usdt = 0,
            period = CandlestickIntervalEnum.MIN5,
            oversoldRatio,
            overboughtRatio,
            sellAmountRatio,
            buyAmountRatio,
            contract,
            buy_open,
            sell_close,
            sell_open,
            buy_close,
            lever_rate
        }: // forceTrade,
        Partial<SymbolConfig> & { symbol: string },
        userId: number
    ) {
        if (this.orderConfigMap[symbol]) {
            Object.assign(this.orderConfigMap[symbol], {
                buy_open,
                sell_close,
                sell_open,
                buy_close,
                lever_rate,
                period
            });
            return;
        }
        this.orderConfigMap[symbol] = {
            buy_usdt: buy_usdt || 0,
            sell_usdt: sell_usdt || 0,
            period,

            oversoldRatio: oversoldRatio || 0.03,
            overboughtRatio: overboughtRatio || -0.034,
            sellAmountRatio: sellAmountRatio || 1.2,
            buyAmountRatio: buyAmountRatio || 1.2,
            price: 0,
            depth: {
                bidsList: [],
                asksList: []
            },
            min: 0,
            max: 0,
            contract: Boolean(contract),
            cancelAutoTraderTask: [],
            buy_open: 0,
            sell_close: 0,
            sell_open: 0,
            buy_close: 0,
            lever_rate: 20
        } as any;
        await this.getSymbolInfo(symbol);
        await this.sdk.getAccountId();
        await this.getBalance();

        if (!this._balanceMap) {
            return errLogger.error("_balanceMap", this.sdk.spot_account_id);
        }

        const quant = new Quant({
            symbol: symbol,
            quoteCurrencyBalance: this._balanceMap[
                Trader.symbolInfoMap[symbol]["quote-currency"]
            ],
            baseCurrencyBalance: this._balanceMap[
                Trader.symbolInfoMap[symbol]["base-currency"]
            ],
            mins: [],
            maxs: [],
            minVolume: Trader.symbolInfoMap[symbol]["limit-order-min-order-amt"]
        });

        this.orderConfigMap[symbol].quant = quant;
        this.orderConfigMap[symbol].trainer = new Trainer(quant, {
            buy_usdt,
            sell_usdt
        });
        const orderConfig = this.orderConfigMap[symbol];

        const unSubMarketDepth = await this.sdk.subMarketDepth(
            { symbol },
            throttle(
                data => {
                    // 处理数据
                    const bidsList = getSameAmount(data.data.bids, {
                        type: "bids",
                        symbol: symbol
                    });

                    const asksList = getSameAmount(data.data.asks, {
                        type: "asks",
                        symbol: symbol
                    });
                    orderConfig.depth = {
                        bidsList: bidsList,
                        asksList: asksList
                    };
                },
                10000,
                { leading: true }
            )
        );
        // 添加到取消跟单任务里
        this.orderConfigMap[symbol].cancelAutoTraderTask.push(unSubMarketDepth);

        const data = await this.sdk.getMarketHistoryKline(
            symbol,
            orderConfig.period,
            400
        );
        if (!data) {
            errLogger.error("getMarketHistoryKline", data);
            return;
        }
        const rData = data.reverse();

        quant.analysis(rData as any[]);

        const unSubMarketKline = await this.sdk.subMarketKline(
            { symbol, period: orderConfig.period },
            data => {
                orderConfig.price = data.data.close;
                const kline = this.orderConfigMap[symbol].kline;
                if (!kline) {
                    outLogger.error("subMarketKline err", kline);
                }
                if (kline && kline.id !== data.data.id) {
                    orderConfig.quant.analysis(kline);
                    // outLogger.info('subMarketKline', data.data.id);
                }
                this.orderConfigMap[symbol].kline = data.data;
            }
        );
        // 添加到取消跟单任务里
        this.orderConfigMap[symbol].cancelAutoTraderTask.push(unSubMarketKline);
        const unUse = quant.use(row => {
            orderConfig.price = row.close;
            if (!row.MA120 || !row.MA5 || !row.MA10 || !row.MA30 || !row.MA60) {
                return;
            }

            let action: "buy" | "sell" | undefined;

            let amount = 0;
            let price = 0;
            if (
                row.MA5 > row.MA10 &&
                //  && row.MA10 > row.MA30 && row.MA30 > row.MA60 && row.MA60 > row.MA120
                row["close/MA60"] > orderConfig.oversoldRatio &&
                row["amount/amountMA20"] > orderConfig.sellAmountRatio
            ) {
                action = "sell";
                const pricePoolFormDepth = getTracePrice(orderConfig.depth);
                amount = (sell_usdt as number) / row.close;
                price = pricePoolFormDepth.sell[0] || row.close * 1.02;
            }

            // 买
            if (
                row.MA5 < row.MA10 &&
                row["close/MA60"] < orderConfig.overboughtRatio &&
                row["amount/amountMA20"] > orderConfig.buyAmountRatio
            ) {
                action = "buy";
                const pricePoolFormDepth = getTracePrice(orderConfig.depth);
                outLogger.info(pricePoolFormDepth);
                amount = (buy_usdt as number) / row.close;
                price = pricePoolFormDepth.buy[0] || row.close * 0.98;
            }

            if (
                !action &&
                (row["amount/amountMA20"] > 2 || row.amplitude > 2)
            ) {
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
            outLogger.info(
                `context: ${symbol}, row.close/MA60: ${row["close/MA60"]},`,
                ` amount/amountMA20: ${row["amount/amountMA20"]}`
            );

            if (amount < Number.MIN_SAFE_INTEGER) {
                amount = buy_usdt / row.close;
            }
            if (!isNumber(price) || price < Number.MIN_SAFE_INTEGER) {
                const pricePoolFormDepth = getTracePrice(orderConfig.depth);
                price =
                    action === "sell"
                        ? pricePoolFormDepth.sell[0]
                        : pricePoolFormDepth.buy[0];
            }
            this.order(symbol, action, amount, price, userId)
                .then(async orderId => {
                    AutoOrderHistoryService.create({
                        datetime: new Date(),
                        symbol,
                        price: this.priceToFixed(symbol, price),
                        amount: this.amountToFixed(symbol, amount),
                        userId: userId || 1,
                        type: action,
                        status: 1,
                        state: "",
                        clientOrderId: orderId,
                        row: ""
                    }).catch(err => {
                        outLogger.error(err);
                    });
                })
                .finally(() => {
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
        // 添加到取消跟单任务里
        this.orderConfigMap[symbol].cancelAutoTraderTask.push(unUse);
    }
    cancelAutoTrader = (userId, symbol) => {
        if (!this.orderConfigMap[symbol]) {
            errLogger.error(`${symbol} not exist`);
            return;
        }
        this.orderConfigMap[symbol].cancelAutoTraderTask.forEach(fn => fn());
        delete this.orderConfigMap[symbol];
    };
    /**
     * 开单前处理
     * @param symbol
     * @param action
     */
    async beforeContractOrder(symbol: string, action: "buy" | "sell") {
        const contractSymbol: string = symbol.replace("usdt", "").toUpperCase();
        const data = await this.sdk.contractMarketDetailMerged(
            `${contractSymbol}_CQ`
        );
        const list = await this.sdk.contractPositionInfo(
            contractSymbol.toLocaleLowerCase()
        );

        // const action = 'buy'
        const digit =
            data.tick.close.length - 1 - data.tick.close.lastIndexOf(".");
        const rate = action === "buy" ? 0.997 : 1.004;
        const closeRate = 1;
        const {
            buy_open,
            sell_close,
            sell_open,
            buy_close,
            lever_rate
        } = this.orderConfigMap[symbol];
        let buyAvailable = 0;
        let sellAvailable = 0;
        list.forEach(item => {
            if (item.direction === "buy") {
                buyAvailable += item.available;
            } else {
                sellAvailable += item.available;
            }
        });
        const params = {
            symbol: contractSymbol,
            contract_type: "quarter" as const,
            direction: action,
            price: -1,
            volume: 0,
            /**
             * 开仓倍数
             */
            lever_rate,
            order_price_type: "limit" as const
        };
        if (action === "buy") {
            // 开多
            await this.contractOrder({
                ...params,
                price: keepDecimalFixed(Number(data.tick.close) * rate, digit),
                volume: buy_open,
                offset: "open"
            });

            if (sellAvailable > 0) {
                // 平空
                this.contractOrder({
                    ...params,
                    price: keepDecimalFixed(
                        Number(data.tick.close) * closeRate,
                        digit
                    ),
                    volume:
                        sellAvailable < buy_close ? sellAvailable : buy_close,
                    offset: "close"
                });
            }
        } else if (action === "sell") {
            // 开空
            await this.contractOrder({
                ...params,
                price: keepDecimalFixed(
                    Number(data.tick.close) * rate * 1.008,
                    digit
                ),
                volume: sell_open,
                offset: "open"
            });

            if (buyAvailable >= 0) {
                // 平多
                this.contractOrder({
                    ...params,
                    price: keepDecimalFixed(
                        Number(data.tick.close) * closeRate,
                        digit
                    ),
                    volume: buyAvailable < sell_close ? buyAvailable : sell_close,
                    offset: "close"
                });
            }
        }
        // outLogger.info(`
        //     symbol: ${symbol}
        //     action: ${action}
        //     close: ${data.tick.close}
        //     buyVolume: ${buyVolume}
        //     sellVolume: ${sellVolume}
        //     buyAvailable: ${buyAvailable}
        //     sellAvailable: ${sellAvailable}
        // `);
        sentMail(config.get("email"), {
            from: "hubo2008@163.com", // sender address
            to: "hubo11@jd.com", // list of receivers
            subject: `Hello ✔${symbol}`, // Subject line
            text: "Hello world?", // plain text body
            html: `<p><br><b>${action}</b> <i>${symbol}<i> (${
                data.tick.close
            }) at ${dayjs(new Date())
                .utcOffset(8)
                .format("YYYY-MM-DD HH:mm:ss")}</p>` // html body
        });
    }
    async order(
        symbol: string,
        type: "buy" | "sell",
        amount: number,
        price: number,
        userId: number
    ): Promise<any> {
        outLogger.info(`order:  ${type} ${symbol} -> (${price}, ${amount})`);

        const priceIndex = getPriceIndex(symbol);
        const symbolInfo = await this.getSymbolInfo(symbol);
        await this.getBalance();
        if (!symbolInfo) {
            return await this.order(symbol, type, amount, price, userId);
        }
        const quoteCurrencyBalance = this._balanceMap[
            symbolInfo["quote-currency"]
        ];
        const baseCurrencyBalance = this._balanceMap[
            symbolInfo["base-currency"]
        ];

        const hasEnoughBalance =
            quoteCurrencyBalance >
            amount * this.orderConfigMap[symbol].price * priceIndex * 1.002;
        const hasEnoughAmount = baseCurrencyBalance > amount * 1.002;

        outLogger.info(
            `quoteCurrencyBalance: ${quoteCurrencyBalance}, baseCurrencyBalance: ${baseCurrencyBalance}`
        );

        if (!hasEnoughBalance && type === "buy") {
            const msg = `quote-currency( ${symbolInfo["quote-currency"]} ) not enough`;
            outLogger.info(msg);
            return Promise.reject(msg);
        } else if (!hasEnoughAmount && type === "sell") {
            const msg = `base-currency( ${symbolInfo["base-currency"]} ) not enough`;
            outLogger.info(msg);
            return Promise.reject(msg);
        }
        const openOrderRes = await this.sdk.getOpenOrders(symbol, {
            size: 10
        });
        for (let i = 0; i < openOrderRes.length; i++) {
            const oriderInfo = openOrderRes[i];
            if (oriderInfo.source === "api") {
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
        const data = await this.sdk.order(
            symbol,
            `${type}-limit`,
            this.amountToFixed(symbol, amount),
            this.priceToFixed(symbol, price)
        );
        return data;
    }
    async contractOrder(params: {
        symbol: string;
        contract_type: ContractType;
        price: number | string;
        volume: number;
        direction: "buy" | "sell";
        offset: "open" | "close";
        /**
         * 开仓倍数
         */
        lever_rate: number;
        order_price_type: "limit";
    }) {
        const textMap = {
            buyopen: "买入开多",
            sellclose: "卖出平多",
            sellopen: "卖出开空",
            buyclose: "买入平空"
        };

        return this.sdk.contractOrder(params).finally(() => {
            outLogger.info(`${textMap[params.direction + params.offset]}`);
        });
    }
    cancelOrder(id: string) {
        return this.sdk.cancelOrder(id);
    }

    amountToFixed(symbol, amount: number) {
        const symbolInfo = _SYMBOL_INFO_MAP[symbol];
        return keepDecimalFixed(amount, symbolInfo["amount-precision"]);
    }
    priceToFixed(symbol, amount: number) {
        const symbolInfo = _SYMBOL_INFO_MAP[symbol];
        return keepDecimalFixed(amount, symbolInfo["price-precision"]);
    }
}
