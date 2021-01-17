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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTrade = exports.handleKline = exports.handleDepth = void 0;
const throttle_1 = __importDefault(require("lodash/throttle"));
const ws_1 = require("../interface/ws");
const events_1 = require("./events");
const price_1 = __importDefault(require("./price"));
const StatisticalTradeData_1 = __importDefault(require("./StatisticalTradeData"));
const TradeHistoryService = __importStar(require("../module/trade-history/TradeHistory.service"));
const DepthService = __importStar(require("../module/depth/depth.service"));
const WatchService = __importStar(require("../module/watch/watch.service"));
const AbnormalMonitor_1 = __importDefault(require("../lib/quant/analyse/AbnormalMonitor"));
const utils_1 = require("../utils");
const util_1 = require("./util");
const minute = 1000 * 60;
let watchSymbols = [];
// 每一个币都存一个throttle包裹的handleDepth方法
const depthHandles = {};
// 交易数据处理方法
const tradeHandles = {};
async function getWatchSymbols() {
    if (watchSymbols.length === 0) {
        const WatchEntityList = await WatchService.find();
        watchSymbols = WatchEntityList.map((WatchEntity) => {
            return WatchEntity.symbol;
        });
    }
    return watchSymbols;
}
async function handleDepth(data) {
    const symbol = data.symbol;
    await getWatchSymbols();
    if (typeof depthHandles[symbol] !== 'function') {
        depthHandles[symbol] = throttle_1.default(analyseAndWriteDepth, 5000, { trailing: false, leading: true });
    }
    /* ch:"market.bchusdt.depth.step0"
    channel:"depth"
    symbol:"bchusdt"
    tick:Object {bids: Array(150), asks: Array(150), ts: 1554568106017, …}
    type:"WS_HUOBI" */
    depthHandles[symbol]({ symbol, ...data.data });
}
exports.handleDepth = handleDepth;
async function handleKline(data) {
    const symbol = data.symbol;
    await getWatchSymbols();
    if (symbol === 'btcusdt') {
        price_1.default.set('btc', data.data.close);
    }
    else if (symbol === 'etcusdt') {
        price_1.default.set('eth', data.data.close);
    }
    else if (symbol === 'htusdt') {
        price_1.default.set('ht', data.data.close);
    }
    events_1.ws_event.emit("server:ws:message", {
        from: ws_1.SocketFrom.server,
        type: events_1.EventTypes.huobi_kline,
        data: {
            symbol: symbol,
            ...data.data,
        },
    });
}
exports.handleKline = handleKline;
async function handleTrade(data) {
    const symbol = data.symbol;
    const list = data.data;
    await getWatchSymbols();
    if (tradeHandles[symbol] === undefined) {
        tradeHandles[symbol] = new StatisticalTradeData_1.default({
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
            };
            TradeHistoryService.create(_data);
            events_1.ws_event.emit("server:ws:message", {
                from: ws_1.SocketFrom.server,
                type: events_1.EventTypes.huobi_trade,
                data: {
                    ..._data,
                },
            });
        });
    }
    tradeHandles[symbol].merge(list);
}
exports.handleTrade = handleTrade;
/* ----------------------------------------------------------------------------- */
const disTime = 1000 * 10;
// 状态异常监控(缓存多个币)
const status = {};
// const buyMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 6}});
// const sellMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 6}});
// 懒惰任务，1000 * 60 s后不激活自动停止
// const LazyTask = new LazyTask(1000 * 10);
/**
 * 处理深度数据
 */
const analyseAndWriteDepth = async function (data) {
    if (!data.symbol) {
        throw Error(`data.tick, data.symbol`);
    }
    const symbol = data.symbol;
    // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
    const _price = util_1.getPriceIndex(symbol);
    const originBids = data.bids;
    const originAsks = data.asks;
    const bids1 = originBids[0];
    const bids2 = originBids[1];
    const aks1 = originAsks[0];
    const aks2 = originAsks[1];
    // 处理数据
    const bidsList = util_1.getSameAmount(originBids, {
        type: 'bids',
        symbol: symbol,
    });
    const asksList = util_1.getSameAmount(originAsks, {
        type: 'asks',
        symbol: symbol,
    });
    events_1.ws_event.emit("server:ws:message", {
        from: ws_1.SocketFrom.server,
        type: events_1.EventTypes.huobi_depth,
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
        sell_1: utils_1.autoToFixed((aks1[1])),
        sell_2: utils_1.autoToFixed((aks2[1])),
        buy_1: utils_1.autoToFixed((bids1[1])),
        buy_2: utils_1.autoToFixed((bids2[1])),
        usdtPrice: 0,
        price: utils_1.autoToFixed(currentPrice),
        bids_max_1: bidsList[0].amount,
        bids_max_2: bidsList[1].amount,
        asks_max_1: asksList[0].amount,
        asks_max_2: asksList[1].amount,
        bids_max_price: [bidsList[0].price, bidsList[1].price].join(','),
        asks_max_price: [asksList[0].price, asksList[1].price].join(','),
        time: datetime,
    };
    insertData.usdtPrice = utils_1.autoToFixed(insertData.price * util_1.getPriceIndex(symbol));
    // 非监控的币，不写入数据库，直接返回给前端
    if (!watchSymbols.includes(symbol.toUpperCase())) {
        return;
    }
    /* -------write------- */
    // 缓存多个币的异常监控方法
    let buyMaxAM;
    let sellMaxAM;
    if (status[symbol] === undefined) {
        status[symbol] = {};
        status[symbol].buyMaxAM = new AbnormalMonitor_1.default({ config: { disTime: disTime, recordMaxLen: 10 } });
        status[symbol].sellMaxAM = new AbnormalMonitor_1.default({ config: { disTime: disTime, recordMaxLen: 10 } });
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
    const buyStatus = utils_1.getRepeatCount(bidsHistoryStatus);
    const sellStatus = utils_1.getRepeatCount(asksHistoryStatus);
    // 无状况
    if (bidsHistoryStatus.length > 2
        && buyStatus['涨'] === 0
        && buyStatus['跌'] === 0
        && sellStatus['跌'] === 0
        && sellStatus['跌'] === 0) {
        write(insertData);
    }
    else if (
    // 异常
    bidsHistoryStatus.length === 1
        || bidsHistoryStatus[bidsHistoryStatus.length - 1].status !== '横盘'
        || asksHistoryStatus[asksHistoryStatus.length - 1].status !== '横盘'
        || Number(insertData.buy_1) > (5 * price_1.default.get('btc'))
        || Number(insertData.sell_1) > (5 * price_1.default.get('btc'))) {
        write2(insertData);
    }
    // console.log(bidsHistoryStatus, asksHistoryStatus)
};
const write = throttle_1.default(function (insertData) {
    DepthService.create(insertData);
    events_1.ws_event.emit("server:ws:message", {
        from: ws_1.SocketFrom.server,
        type: events_1.EventTypes.huobi_depth_chart,
        data: {
            ...insertData,
        },
    });
}, minute * 10, { trailing: false, leading: true });
const write2 = throttle_1.default(function (insertData) {
    DepthService.create(insertData);
    events_1.ws_event.emit("server:ws:message", {
        from: ws_1.SocketFrom.server,
        type: events_1.EventTypes.huobi_depth_chart,
        data: {
            ...insertData,
        },
    });
}, minute * 3, { trailing: false, leading: true });
