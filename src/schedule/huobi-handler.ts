import throttle from 'lodash/throttle';
import { SocketFrom } from "ROOT/interface/ws";
import { EventTypes, ws_event } from '../huobi/ws/events';
import getPriceIndex from 'ROOT/huobi/getPriceIndex';
import symbolPrice from 'ROOT/huobi/price';
import StatisticalTrade from 'ROOT/huobi/StatisticalTradeData';
import { getSameAmount } from 'ROOT/common/getSameAmount';
import * as TradeService from 'ROOT/module/trade/trade.service';
import * as DepthService from 'ROOT/module/depth/depth.service';
import * as WatchService from 'ROOT/module/watch/watch.service';
import { getSymbolInfo } from 'ROOT/common/getSymbolInfo';
import AbnormalMonitor from 'ROOT/lib/quant/analyse/AbnormalMonitor';
import { getRepeatCount } from 'ROOT/utils';
import { toNumber } from 'lodash';
interface Event {
    type: EventTypes;
    from: SocketFrom.huobi;
    data: {
        channel: string;
        ch: string;
        symbol: string,
        [x:string]: any;
    },
}

let watchSymbols: string[] = [];
WatchService.find().then(res => {
    watchSymbols = res.map(item => item.symbol);
})
// 每一个币都存一个throttle包裹的handleDepth方法
const depthHandles = {};
// 交易数据处理方法
const tradeHandles = {};
export function handle(event: Event) {
    const symbol = event.data.symbol;
    const data = event.data;
    switch (data.type) {
        case EventTypes.huobi_depth:
            if(typeof depthHandles[symbol] !== 'function') {
                depthHandles[symbol] = throttle(handleDepth, 5000, {trailing: false, leading: true});
            }
            /* ch:"market.bchusdt.depth.step0"
            channel:"depth"
            symbol:"bchusdt"
            tick:Object {bids: Array(150), asks: Array(150), ts: 1554568106017, …}
            type:"WS_HUOBI" */
            // console.log(data)
            depthHandles[symbol](data);
            break;
        case EventTypes.huobi_kline:
            if (symbol === 'btcusdt') {
                symbolPrice.set('btc', data.kline.close);
            } else if(symbol === 'etcusdt') {
                symbolPrice.set('eth', data.kline.close);
            } else if(symbol === 'htusdt') {
                symbolPrice.set('ht', data.kline.close);
            }
            // broadcast(WS_SERVER, {
            //     type: 'WS_HUOBI',
            //     kline: data.tick,
            //     symbol: symbol,
            // });
            break;
        case EventTypes.huobi_trade:
            if (tradeHandles[symbol] === undefined) {
                tradeHandles[symbol] = new StatisticalTrade({
                    symbol: symbol,
                    exchange: 'huobi',
                    disTime: 5 * 60 * 1000,
                });
                tradeHandles[symbol].on('merge', function(symbol, data) {
                    TradeService.create({
                        symbol: symbol,
                        sell: data.sell,
                        buy: data.buy,
                        time: data.time,
                    });
                });
            }
            tradeHandles[symbol].merge(data.trade);
            break;
        default:
    }
}


/* ----------------------------------------------------------------------------- */
let disTime = 1000 * 10;
// 状态异常监控(缓存多个币)
const status = {}
// const buyMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 6}});
// const sellMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 6}});

// 懒惰任务，1000 * 60 s后不激活自动停止
// const LazyTask = new LazyTask(1000 * 10);

/**
 * 处理深度数据
 */
const handleDepth = function (data) {
    if (data.tick && data.symbol) {
        const symbol: string = data.symbol;
        // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
        const _price = getPriceIndex(symbol);

        const originBids = data.tick.bids;
        const originAsks = data.tick.asks;
        let bids1 = originBids[0];
        let bids2 = originBids[1];
        let aks1 = originAsks[0];
        let aks2 = originAsks[1];


         // 处理数据
        let bidsList = getSameAmount(originBids, {
            type: 'bids',
            symbol: symbol,
        });
       
        
        let asksList = getSameAmount(originAsks, {
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
                tick: data.tick,
                ch: data.ch,
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
        // console.log(111, aks1, asksList);

        // 取当前时间
        let ts = Date.now();
        let symbolInfo = getSymbolInfo(symbol);
        let amountPrecision = symbolInfo['amount-precision'];
        let pricePrecision = symbolInfo['price-precision'];

        let currentPrice = (bids1[0] + aks1[0]) / 2;
        let insertData = {
            symbol: symbol,
            sell_1: toNumber((aks1[1] * aks1[0] * _price).toFixed(pricePrecision)),
            sell_2: toNumber((aks2[1] * aks2[0] * _price).toFixed(pricePrecision)),
            buy_1: toNumber((bids1[1] * bids1[0] * _price).toFixed(pricePrecision)),
            buy_2: toNumber((bids2[1] * bids2[0] * _price).toFixed(pricePrecision)),
            price: (currentPrice).toString().length > pricePrecision ? Number(currentPrice.toFixed(pricePrecision)) : currentPrice,
            bids_max_1: bidsList[0].sumDollar,
            bids_max_2: bidsList[1].sumDollar,
            asks_max_1: asksList[0].sumDollar,
            asks_max_2: asksList[1].sumDollar,
            bids_max_price: [bidsList[0].price, bidsList[1].price].join(','),
            asks_max_price: [asksList[0].price, asksList[1].price].join(','),
            time: ts,
        }
        // 非监控的币，不写入数据库，直接返回给前端
        if (!watchSymbols.includes(symbol)) {
            return;
        }
        /* -------write------- */
        // 缓存多个币的异常监控方法
        let buyMaxAM;
        let sellMaxAM;
        if (status[symbol] === undefined) {
            status[symbol] = {};
            status[symbol].buyMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 10}});
            status[symbol].sellMaxAM = new AbnormalMonitor({config: {disTime: disTime, recordMaxLen: 10}});
        }
        buyMaxAM = status[symbol].buyMaxAM;
        sellMaxAM = status[symbol].sellMaxAM;

        buyMaxAM.speed({
            value: Number(bidsList[0].sumDollar),
            ts,
            symbol: symbol,
        });
        sellMaxAM.speed({
            value: Number(asksList[0].sumDollar),
            ts,
            symbol: symbol,
        });
        let bidsHistoryStatus = buyMaxAM.historyStatus;
        let asksHistoryStatus = sellMaxAM.historyStatus;
        let buyStatus = getRepeatCount(bidsHistoryStatus);
        let sellStatus = getRepeatCount(asksHistoryStatus);
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
        
    }
};

const write = throttle(function(insertData: Parameters<typeof DepthService.create>[0]) {
    // mysqlModel.insert('HUOBI_PRESSURE_ZONE', insertData);
    DepthService.create(insertData);
}, 1000 * 60 * 6, {trailing: false, leading: true});

const write2 = throttle(function(insertData: Parameters<typeof DepthService.create>[0]) {
    // mysqlModel.insert('HUOBI_PRESSURE_ZONE', insertData);
    DepthService.create(insertData);
}, 1000 * 20, {trailing: false, leading: true});