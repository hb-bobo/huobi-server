const { throttle } = require('lodash');
const AbnormalMonitor = require('../../extend/AbnormalMonitor');
const Queue = require('../../extend/Queue');
const utils = require('../../utils');
const hbsdk = require('../../../lib/sdk/hbsdk');
const models = require('../../models');

const {
    huobiSymbols,
    getSameAmount,
    getPriceIndex,
    getStatusNum,
} = utils;
const queue = new Queue({ limit: 1 });

const errorSymbols = [];
function getAllDetail() {

    huobiSymbols.getSymbols().then(list => {
        list.forEach(item => {
            if (
                item['quote-currency'] === 'usdt'
                || item['quote-currency'] === 'btc'
            ) {
                if (appConfig.watchSymbols.includes(item.symbol) || errorSymbols.includes(item.symbol)) {
                    return;
                }
                fecthDepth(item);
            }
        });
    });
    queue.onend = function () {
        queue.clear();
        getAllDetail();
    }
}
exports.getAllDetail = getAllDetail;


let disTime = 1000 * 10;
// 状态异常监控(缓存多个币)
const status = {}
// 数据缓存
const cache = {};
exports.cache = cache;

function fecthDepth(data) {
    const symbol = data.symbol;

    const queueItem = function (done) {
        hbsdk.getMarketDepth({
            symbol: symbol,
            type: 'step0'
        }).then((res) => {
            handleDepth(res, symbol);
            setTimeout(() => {
                done(queueItem);
            }, 10000);
        }).catch((err) => {
            if (!errorSymbols.includes(symbol)) {
                errorSymbols.push(symbol);
            }
            setTimeout(() => {
                done(queueItem);
            }, 10000);
        });
    };
    // 会自动开始处理队列
    queue.push(queueItem);
}

function handleDepth(res, symbol) {
    const ts = new Date();
    const originBids = res.tick.bids;
    const originAsks = res.tick.asks;

    let originBids1 = originBids[0];
    let originBids2 = originBids[1];
    let originAsks1 = originAsks[0];
    let originAsks2 = originAsks[1];
    let currentPrice = (originBids1[0] + originAsks1[0]) / 2;
    // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
    const _price = getPriceIndex(symbol);
    // 精度
    let symbolInfo = huobiSymbols.getSymbolInfo(symbol);
    let amountPrecision = symbolInfo['amount-precision'];
    let pricePrecision = symbolInfo['price-precision'];
    // 原数据的记录
    let buy_1 = (originBids1[1] * originBids1[0] * _price).toFixed(pricePrecision);
    let buy_2 = (originBids2[1] * originBids2[0] * _price).toFixed(pricePrecision);
    let sell_1 = (originAsks1[1] * originAsks1[0] * _price).toFixed(pricePrecision);
    let sell_2 = (originAsks2[1] * originAsks2[0] * _price).toFixed(pricePrecision);
    let originBidsLen = originBids.length;
    let originAsksLen = originAsks.length;

    // 处理数据
    let bidsList = getSameAmount(originBids, {
        symbol: symbol,
        type: 'bids'
    });
    let asksList = getSameAmount(originAsks, {
        symbol: symbol,
        type: 'asks'
    });
    // 如果处理完后没有数据，则不记录，最好是删除该币
    if (bidsList[1] === undefined || asksList[1] === undefined || !bidsList.length || !asksList.length) {
        queue.done(queueItem);
        errorSymbols.push(symbol);
        return;
    }
    let bids_max_1 = bidsList[0].sumDollar;
    let bids_max_2 = bidsList[1].sumDollar;
    let asks_max_1 = asksList[0].sumDollar;
    let asks_max_2 = asksList[1].sumDollar;
    let bidsLen = bidsList.length;
    let asksLen = asksList.length;

    //最后处理因为sort会改变原数据
    let bidsListOrderByCount = bidsList.sort(function (a, b) {
        return b.count - a.count;
    });
    let asksListOrderByCount = asksList.sort(function (a, b) {
        return b.count - a.count;
    });
    let bidsRobotMaxCount = bidsListOrderByCount[0].count;
    let asksRobotMaxCount = asksListOrderByCount[0].count;
    
    let insertData = {
        symbol,
        exchange: 'huobi',
        time: ts,
        price: (currentPrice).toString().length > pricePrecision ? currentPrice.toFixed(pricePrecision) : currentPrice,
        bids_max_1,
        bids_max_2,
        asks_max_1,
        asks_max_2,

        buy_1,
        buy_2,
        sell_1,
        sell_2,

        originBidsLen,
        originAsksLen,
        bidsLen,
        asksLen,
        bidsRobotMaxCount,
        asksRobotMaxCount,
    }
    cache[symbol] = insertData;

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
        ts: ts.getTime(),
        symbol: symbol,
    });

    sellMaxAM.speed({
        value: Number(asksList[0].sumDollar),
        ts: ts.getTime(),
        symbol: symbol,
    });
  
    let bidsHistoryStatus = buyMaxAM.historyStatus;
    let asksHistoryStatus = sellMaxAM.historyStatus;
    let buyStatus = getStatusNum(bidsHistoryStatus);
    let sellStatus = getStatusNum(asksHistoryStatus);
   

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
        || Number(insertData.buy_1) > (5 * appConfig.prices.btc)
        || Number(insertData.sell_1) > (5 * appConfig.prices.btc)
    ) {
        write2(insertData);
    }

}

const write = throttle(function (insertData) {
    // mysqlModel.insert('HUOBI_CHARACTERISTIC', insertData);
    models.diff.save(insertData);
}, 1000 * 60 * 10, { trailing: false, leading: true });

const write2 = throttle(function (insertData) {
    // mysqlModel.insert('HUOBI_CHARACTERISTIC', insertData);
    models.diff.save(insertData);
}, 1000 * 10, { trailing: false, leading: true });