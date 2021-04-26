import throttle from 'lodash/throttle';
import { SocketFrom } from "ROOT/interface/ws";
import { EventTypes, ws_event } from 'ROOT/huobi/events';
import symbolPrice from 'ROOT/huobi/price';
import StatisticalTrade from 'ROOT/huobi/StatisticalTradeData';
import * as TradeHistoryService from 'ROOT/module/trade-history/TradeHistory.service';
import * as DepthService from 'ROOT/module/depth/depth.service';
import * as WatchService from 'ROOT/module/watch/watch.service';
import { redis, KEY_MAP } from 'ROOT/db/redis';
import AbnormalMonitor from 'ROOT/lib/quant/analyse/AbnormalMonitor';
import { autoToFixed, getRepeatCount } from 'ROOT/utils';
import { getPriceIndex, getSameAmount } from './util';
import { MarketMessageData } from 'node-huobi-sdk/lib/HuobiSDK';



const minute = 1000 * 60
let watchSymbols: string[] = [];

// 每一个币都存一个throttle包裹的handleDepth方法
const depthHandles: Record<string, typeof analyseAndWriteDepth> = {};
// 交易数据处理方法
const tradeHandles: Record<string, StatisticalTrade> = {};

async function getWatchSymbols() {
    if (watchSymbols.length === 0) {
        const WatchEntityList = await WatchService.find();
        watchSymbols = WatchEntityList.map((WatchEntity) => {
            return WatchEntity.symbol;
        });
    }
    return watchSymbols;
}
export async function handleDepth(data: MarketMessageData) {
    const symbol = data.symbol;
    await getWatchSymbols();
    if (typeof depthHandles[symbol] !== 'function') {
        depthHandles[symbol] = throttle(analyseAndWriteDepth, 1000, { trailing: false, leading: true }) as typeof analyseAndWriteDepth;
    }
    /* ch:"market.bchusdt.depth.step0"
    channel:"depth"
    symbol:"bchusdt"
    tick:Object {bids: Array(150), asks: Array(150), ts: 1554568106017, …}
    type:"WS_HUOBI" */

    depthHandles[symbol]({symbol, ...data.data});
}

export async function handleKline(data: MarketMessageData) {

    const symbol = data.symbol;
    await getWatchSymbols();
    if (symbol === 'btcusdt') {
        symbolPrice.set('btc', data.data.close);
    } else if (symbol === 'etcusdt') {
        symbolPrice.set('eth', data.data.close);
    } else if (symbol === 'htusdt') {
        symbolPrice.set('ht', data.data.close);
    }


    ws_event.emit("server:ws:message", {
        from: SocketFrom.server,
        type: EventTypes.huobi_kline,
        data: {
            symbol: symbol,
            ...data.data,
            // ch: data.ch,
        },
    });
}
export async function handleTrade(data) {
    const symbol = data.symbol;

    const list = data.data;
    await getWatchSymbols();
    if (tradeHandles[symbol] === undefined) {
        tradeHandles[symbol] = new StatisticalTrade({
            symbol: symbol,
            exchange: 1,
            disTime: minute * 5,
        });
        tradeHandles[symbol].on('merge', function (symbol, data) {

            const _data = {
                symbol: symbol,
                sell: data.sell || 0,
                buy: data.buy || 0,
                time: data.time ? new Date(data.time) : new Date(),
                usdtPrice: data.usdtPrice,
            }

            TradeHistoryService.create(_data);
            ws_event.emit("server:ws:message", {
                from: SocketFrom.server,
                type: EventTypes.huobi_trade,
                data: {
                    ..._data,
                },
            });
        });
    }

    tradeHandles[symbol].merge(list);
}


/* ----------------------------------------------------------------------------- */
const disTime = 1000 * 10;
// 状态异常监控(缓存多个币)
const status = {}
// const buyMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 6}});
// const sellMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 6}});

// 懒惰任务，1000 * 60 s后不激活自动停止
// const LazyTask = new LazyTask(1000 * 10);

/**
 * 处理深度数据
 */
const analyseAndWriteDepth = async function (data: {symbol: string, bids: any[], asks: any[] }) {

    if (!data.symbol) {

        throw Error(`data.tick, data.symbol`);
    }

    const symbol: string = data.symbol;
    // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
    const _price = getPriceIndex(symbol);

    const originBids = data.bids;
    const originAsks = data.asks;
    const bids1 = originBids[0];
    const bids2 = originBids[1];
    const aks1 = originAsks[0];
    const aks2 = originAsks[1];


    // 处理数据
    const bidsList = getSameAmount(originBids, {
        type: 'bids',
        symbol: symbol,
    });


    const asksList = getSameAmount(originAsks, {
        type: 'asks',
        symbol: symbol,
    });

    ws_event.emit("server:ws:message", {
        from: SocketFrom.server,
        type: EventTypes.huobi_depth,
        data: {
            symbol: symbol,
            bidsList,
            asksList,
            aks1,
            bids1,
        },

    });

    // [ 6584.05, 0.0004 ]
    // [ { count: 1,
    //     amount: '13.0787',
    //     sumCount: '13.0787',
    //     sumMoneny: '86985.78',
    //     sumDollar: '86985.78',
    //     price: '6650.95',
    //     prices: [ 6650.95 ] }
    // ]


    // 取当前时间
    const datetime = new Date();

    const currentPrice = (bids1[0] + aks1[0]) / 2;
    const insertData = {
        symbol: symbol,
        exchange: 1,
        sell_1: autoToFixed((aks1[1])),
        sell_2: autoToFixed((aks2[1])),
        buy_1: autoToFixed((bids1[1])),
        buy_2: autoToFixed((bids2[1])),
        usdtPrice: 0,
        price: autoToFixed(currentPrice),
        bids_max_1: bidsList[0].amount,
        bids_max_2: bidsList[1].amount,
        asks_max_1: asksList[0].amount,
        asks_max_2: asksList[1].amount,
        bids_max_price: [bidsList[0].price, bidsList[1].price].join(','),
        asks_max_price: [asksList[0].price, asksList[1].price].join(','),
        time: datetime,
    }
    insertData.usdtPrice = autoToFixed(insertData.price * getPriceIndex(symbol))
    // 非监控的币，不写入数据库，直接返回给前端
    if (!watchSymbols.includes(symbol.toUpperCase()) && !watchSymbols.includes(symbol.toLowerCase())) {
        return;
    }
    /* -------write------- */
    // 缓存多个币的异常监控方法
    let buyMaxAM;
    let sellMaxAM;
    if (status[symbol] === undefined) {
        status[symbol] = {};
        status[symbol].buyMaxAM = new AbnormalMonitor({ config: { disTime: disTime, recordMaxLen: 10 } });
        status[symbol].sellMaxAM = new AbnormalMonitor({ config: { disTime: disTime, recordMaxLen: 10 } });
    }
    buyMaxAM = status[symbol].buyMaxAM;
    sellMaxAM = status[symbol].sellMaxAM;

    buyMaxAM.speed({
        value: Number(bidsList[0].sumDollar),
        ts: datetime.getTime(),
        symbol: symbol,
    });
    sellMaxAM.speed({
        value: Number(asksList[0].sumDollar),
        ts: datetime.getTime(),
        symbol: symbol,
    });
    const bidsHistoryStatus = buyMaxAM.historyStatus;
    const asksHistoryStatus = sellMaxAM.historyStatus;
    const buyStatus = getRepeatCount(bidsHistoryStatus.map((item) => item.status));
    const sellStatus = getRepeatCount(asksHistoryStatus.map((item) => item.status));

    // 无状况
    if (
        bidsHistoryStatus.length > 2
        && buyStatus['涨'] === 0
        && buyStatus['跌'] === 0
        && sellStatus['跌'] === 0
        && sellStatus['跌'] === 0
    ) {
        write(insertData);
    } else if (
        // 异常
        bidsHistoryStatus.length === 1
        || bidsHistoryStatus[bidsHistoryStatus.length - 1].status !== '横盘'
        || asksHistoryStatus[asksHistoryStatus.length - 1].status !== '横盘'
        || Number(insertData.buy_1) > (5 * symbolPrice.get('btc'))
        || Number(insertData.sell_1) > (5 * symbolPrice.get('btc'))
    ) {
        write2(insertData);
    }

    // console.log(bidsHistoryStatus, asksHistoryStatus)


};

const write = throttle(function (insertData: Parameters<typeof DepthService.create>[0]) {

    DepthService.create(insertData);
    ws_event.emit("server:ws:message", {
        from: SocketFrom.server,
        type: EventTypes.huobi_depth_chart,
        data: {
            ...insertData,
        },
    });
}, minute * 10, { trailing: false, leading: true });

const write2 = throttle(function (insertData: Parameters<typeof DepthService.create>[0]) {

    DepthService.create(insertData);
    ws_event.emit("server:ws:message", {
        from: SocketFrom.server,
        type: EventTypes.huobi_depth_chart,
        data: {
            ...insertData,
        },
    });
}, minute * 3, { trailing: false, leading: true });
