const { throttle } = require('lodash')
const moment = require('moment')
const config = require('config')
const hbsdk = require('../../../lib/sdk/hbsdk')
const Models = require('../../models')
const utils = require('../../utils')
const AnalyseKline = require('../../extend/AnalyseKline')
const StatisticalTrade = require('../../extend/StatisticalTradeData')
const WS_HUOBI = require('../../ws/ws-huobi')

// async function test () {
//    const res = await Models.charts.trade.getTrade({symbol: 'eosusdt', time: [
//     moment(Date.now() - (24 * 60 * 60 * 1000)).format("YYYY/MM/DD H:mm:ss"),
//     moment().format("YYYY/MM/DD H:mm:ss")
// ]});
// //    console.log(res);
//    res.forEach(data => {

//     if (Number(data.buy + data.sell )> 86076.63726809758) {
//         if (data.buy / data.sell > 6) {
//             console.log(data.time, '大量买入')
//             // fetchKline(symbol)
//         }
//         if (data.sell / data.buy > 6) {
//             console.log(data.time, '大量卖出')
//             // fetchKline(symbol)
//         }
//     }
//    })
// }
// test();
/**
 * 多种币的缓存
 */
const symbolInfo = {
    // symbol: {
    //     /* 缓存depth处理函数,每一个币都存一个throttle包裹的handleDepth方法*/
    //     depthHandle: Function, // (handleDepth) => void,
    //     /* 缓存深度数据 */
    //     depth: {bidsList: []: asksList: []}, 
    //     /* 缓存获取kline数据方法 */
    //     fetchKlineHandle: Function,
    //     /* 缓存kline处理函数 */
    //     klineHandle:
    //     /* 缓存kline最新的close */
    //     close: Number,
    //     /* 每次下单的量 */
    //     amount: Number,
    //     /* 下的的单数 */
    //     sellCount: 3,
    //     buyCount: 3,
    //     /* period */
    //     period: 5, // 5 | 10 | 30,
    //     msg: '币的信息',
    //     /* 交易类型 */
    //     tradeType: undefined,  // 'buy' | 'sell' | undefined
    // }
};
exports.symbolInfo = symbolInfo;

async function init(data) {
    const {
        amount,
        money,
        symbol,
        buyCount,
        sellCount,
        tradeType,
        period,
        forceTrade,
        user,
    } = data;
    const target = 'server-auto-trade-' + symbol;
    symbolInfo[symbol] = {};
    symbolInfo[symbol].amount = amount;
    symbolInfo[symbol].money = money;
    
    symbolInfo[symbol].buyCount = buyCount;
    symbolInfo[symbol].sellCount = sellCount;
    symbolInfo[symbol].tradeType = tradeType;
    symbolInfo[symbol].period = period;
    symbolInfo[symbol].forceTrade = forceTrade;
    symbolInfo[symbol].tradeHandle = new StatisticalTrade({
        symbol,
        exchange: 'huobi',
        disTime: symbolInfo[symbol].period * 60 * 1000,
    });
    symbolInfo[symbol].tradeHandle.on('merge', async function(symbol, data) {
        if (symbolInfo[symbol].klineHandle === undefined
            || symbolInfo[symbol].close === undefined
            || symbolInfo[symbol].depth === undefined) {
            return;
        }
         /* 
            buy:"1014.02"
            exchange:"huobi"
            sell:"205.00"
            symbol:"hteth"
        */
        const newKlineData = Object.assign({
            close: symbolInfo[symbol].close,
            // amount: data.amount,
            id: data.time,
        }, data);
        // 分析kline
        symbolInfo[symbol].klineHandle.run(newKlineData);
        // 分析买卖量
        const {
            // priceMA5,
            // priceMA60,
            amoutMA10,
        } = symbolInfo[symbol].klineHandle;
        const depth = symbolInfo[symbol].depth;
        // 放量下单
        // if (data.amount > amoutMA10.last() * 2) {
        //     if (data.buy / data.sell && symbolInfo[symbol].sellCount > 2) {
        //         symbolInfo[symbol].buyCount++;
        //         symbolInfo[symbol].sellCount--;
        //         // setTimeout(function () {
        //         //     callOrderHanlder(symbol, 'buy')
        //         // }, 30 * 60 * 1000);
        //     }
           
        //     if (data.sell / data.buy && symbolInfo[symbol].buyCount > 2) {
        //         symbolInfo[symbol].buyCount--;
        //         symbolInfo[symbol].sellCount++;
        //         // setTimeout(function () {
        //         //     callOrderHanlder(symbol, 'sell')
        //         // }, 30 * 60 * 1000);
        //     }
        //     Models.trade.autoTrade.update({
        //         // user: 'hubo2',
        //         symbol: symbol,
        //     }, {
        //         buyCount: symbolInfo[symbol].buyCount,
        //         sellCount: symbolInfo[symbol].sellCount,
        //     });
        // }
        // 无需判断，直接下单
        if (symbolInfo[symbol].forceTrade) {
            const pricePool = utils.getTracePrice({
                symbol,
                bidsList: depth.bidsList,
                asksList: depth.asksList,
            });
            await handleOrder({symbol, pricePool, type: 'buy'});
            await handleOrder({symbol, pricePool, type: 'sell'});
        }
    });
    const AnalyseKlineConfig = await Models.trade.config.getOne({ user});
    symbolInfo[symbol].klineHandle = new AnalyseKline({
        symbol: symbol,
        config: AnalyseKlineConfig ? AnalyseKline.transformConfig(AnalyseKlineConfig) : {},
        callback: function(symbol, actionType, {extraCount, extraAmountCoefficient}) {
            if (!symbolInfo[symbol].depth) {
                return;
            }
            const depth = symbolInfo[symbol].depth;
            
            if (actionType === 'buy') {
                const pricePool = utils.getTracePrice({
                    symbol,
                    bidsList: depth.bidsList,
                    asksList: depth.asksList,
                });
                handleOrder({symbol, pricePool, type: 'buy', extraCount, extraAmountCoefficient})
            } else {
                const pricePool = utils.getTracePrice({
                    symbol,
                    bidsList: depth.bidsList,
                    asksList: depth.asksList,
                });
                handleOrder({symbol, pricePool, type: 'sell', extraCount, extraAmountCoefficient})
            }
        }
    });
    await fetchKline(symbol);
    // 开始订阅
    WS_HUOBI.subscribe.sub(target, {
        type: `sub`,
        value: `market.${symbol}.depth.step0`,
        symbol: `${symbol}`,
        from: 'server-auto-trade',
    });
    WS_HUOBI.subscribe.sub(target, {
        type: `sub`,
        value: `market.${symbol}.trade.detail`,
        symbol: `${symbol}`,
        from: 'server-auto-trade',
    });
    WS_HUOBI.subscribe.sub(target, {
        type: `sub`,
        value:  `market.${symbol}.kline.5min`,
        symbol: `${symbol}`,
        from: 'server-auto-trade',
    });
}
exports.init = init;

function callOrderHanlder (symbol, type) {
    console.log(symbol, type, symbolInfo[symbol].close, moment().format("YY/MM/DD H:mm:ss"))
    const pricePool = utils.getTracePrice({
        symbol,
        bidsList: symbolInfo[symbol].depth.bidsList,
        asksList: symbolInfo[symbol].depth.asksList,
    });
    handleOrder({symbol, pricePool, type, extraCount: 1, extraAmountCoefficient: 1})
}
function handleMsg (data) {
    const symbol = data.symbol;
    switch (data.channel) {
        case 'depth':
            if(typeof symbolInfo[symbol].depthHandle !== 'function') {
                symbolInfo[symbol].depthHandle = throttle(handleDepth, 10000, {trailing: false, leading: true});
            }
            symbolInfo[symbol].depthHandle(data);
            break;
        case 'kline':
            /* 
                amount:755.39
                close:0.01732035
                count:7
                high:0.01732765
                id:1553742600
                low:0.01731837
                open:0.01731931
                vol:13.0886667283
            */
            symbolInfo[symbol].close = data.kline.close;

            // if(typeof symbolInfo[symbol].fetchKlineHandle !== 'function') {
            //     symbolInfo[symbol].fetchKlineHandle = throttle(function() {
            //         fetchKline(symbol)
            //     }, 1000 * 60, {trailing: false, leading: true});
            // }
            // symbolInfo[symbol].fetchKlineHandle(data);
            break;
        case 'trade':
            if (symbolInfo[symbol].tradeHandle === undefined) {
                return;
            }
            symbolInfo[symbol].tradeHandle.merge(data.trade);
            break;
        default:
    }
}

exports.handleMsg = handleMsg;

/**
 * 处理深度数据
 */
const handleDepth = function (data) {
    if (data.tick && data.symbol) {
        const symbol = data.symbol;
        // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
        // const _price = utils.getPriceIndex(symbol);

        const originBids = data.tick.bids;
        const originAsks = data.tick.asks;
        // let bids1 = originBids[0];
        // let bids2 = originBids[1];
        // let aks1 = originAsks[0];
        // let aks2 = originAsks[1];


         // 处理数据
        let bidsList = utils.getSameAmount(originBids, {
            type: 'bids',
            symbol: symbol,
        });
       
        
        let asksList = utils.getSameAmount(originAsks, {
            type: 'asks',
            symbol: symbol,
        });

        symbolInfo[symbol].depth = {
            bidsList,
            asksList,
        }
        // [ 6584.05, 0.0004 ]
        // [ { count: 1,
        //     amount: '13.0787',
        //     sumCount: '13.0787',
        //     sumMoneny: '86985.78',
        //     sumDollar: '86985.78',
        //     price: '6650.95',
        //     pricePool: [ 6650.95 ] }
        // ]
        // console.log(111, aks1, asksList);
    }
};

async function fetchKline(symbol) {
    if (!symbolInfo[symbol]) { return; }
    await hbsdk.getMarketHistoryKline({
        symbol: symbol,
        period: `${symbolInfo[symbol].period}min`,
        size: 1000,
    }).then((data) => {
        let rData = data.reverse();
        // console.log(rData)
        symbolInfo[symbol].klineHandle.run(rData);
        // 
        // const pricePool = utils.getTracePrice({
        //     symbol,
        //     bidsList: symbolInfo[symbol].depth.bidsList,
        //     asksList: symbolInfo[symbol].depth.asksList,
        // });
        // handleOrder({symbol, pricePool, type: 'buy'});
        // handleOrder({symbol, pricePool, type: 'sell'});
    }).catch((err) => {
        symbolInfo[symbol].msg = err;
        console.log('fetchKline:', symbol, err)
        fetchKline(symbol);
        // throw Error(err)
    });
}
exports.fetchKline = fetchKline;


/**
 * 下单
 * @param {object} param
 */
const handleOrder = async function ({
    symbol = '',
    pricePool,
    type, // 下单方向
    buyCount = symbolInfo[symbol].buyCount, // 下的个数(包含原有的挂单)
    sellCount = symbolInfo[symbol].sellCount, // 下的个数(包含原有的挂单)
    extraCount = 0, // 额外补充的下单机会
    extraAmountCoefficient = 1, // 额外补充的量的系数
}) {
    const priceIndex = utils.getPriceIndex(symbol);
    const amountPrecision = utils.huobiSymbols.getSymbolInfo(symbol)['amount-precision'];
    let amount = symbolInfo[symbol].money > 0 
        ? Number((symbolInfo[symbol].money / (symbolInfo[symbol].close * priceIndex)).toFixed(amountPrecision))
        : symbolInfo[symbol].amount;
    amount = amount * extraAmountCoefficient || 0.001;

    // const money = symbolInfo[symbol].money * extraAmountCoefficient || 0.001;
    // 查余额(usdt/btc/eth/ht) 缓存起来避免查询失败

    // 对币余额(btc,usdt,eth)
    if (symbolInfo[symbol].quoteCurrencyBalance === undefined) {
        symbolInfo[symbol].quoteCurrencyBalance = 0;
    }
    // 当前币的余额
    if (symbolInfo[symbol].baseCurrencyBalance === undefined) {
        symbolInfo[symbol].baseCurrencyBalance = 0;
    }
    let quoteCurrencyBalance = symbolInfo[symbol].quoteCurrencyBalance;
    let baseCurrencyBalance = symbolInfo[symbol].baseCurrencyBalance;

    const quoteCurrency = utils.getQuoteCurrency(symbol);
    // 同时查
    // const fetchs = [];
    // 查余额
    let balanceRes = {list: []};
    await hbsdk.get_balance().then((res) => {
        balanceRes = res;
    });
    // 当前币的价格
    let baseCurrencyPrice = symbolInfo[symbol].close;
    // 统计挂单数
    let openOrderRes = [];
    await hbsdk.get_open_orders({symbol, size: 10}).then((orders) => {
        openOrderRes = orders;
    }).catch(function () {
         // 避免get_open_orders失败，api经常会请求失败
         sellCount = 1;
         buyCount = 1;
    });
    try {
        // await Promise.all(fetchs).catch(console.error);
        // 筛选币与对币的余额
        balanceRes.list.forEach((item) => {
            if (item.currency === quoteCurrency && item.type === 'trade') {
                quoteCurrencyBalance = Number(item.balance) * priceIndex;
                symbolInfo[symbol].quoteCurrencyBalance  = quoteCurrencyBalance;
            }
            const baseSymbol = symbol.replace(quoteCurrency, '');
            if (item.currency === baseSymbol && item.type === 'trade') {
                baseCurrencyBalance = Number(item.balance);
                symbolInfo[symbol].baseCurrencyBalance  = baseCurrencyBalance;
            }
        });
    
        // 判断可下多少单
        let openSellCount = 0;
        let openBuyCount  = 0;
        // 用key记录原来挂单的价格
        let originOrder = {};
        const buyAvg =  utils.getAvg(pricePool.buy);
        const sellAvg =  utils.getAvg(pricePool.sell);
        openOrderRes.forEach(function (item) {
            originOrder[Number(item.price).toFixed(10)] = 1;
            if (item.type.indexOf('sell') > -1) {
                openSellCount++;
            } else if (item.type.indexOf('buy') > -1) {
                openBuyCount++;
                // openBuyCount++;
            }
            /* 检测订单价格是否合理 */
            if (item.source === 'api') {
                // console.log(type, item.price, buyAvg, utils.getGain(item.price, buyAvg))
                if (item.type.includes('buy')
                    && type === 'buy'
                    && item.price < buyAvg
                    && !isIncludesFromPricePool(item.price, pricePool.buy)
                    && Math.abs(utils.getGain(item.price, buyAvg)) > 0.0382
                ) {
                    console.log('utils.getGain:', type, symbol, item.price, utils.getGain(item.price, buyAvg))
                    cancelOrder(item.id)         
                } else if (
                    item.type.includes('sell')
                    && type === 'sell'
                    && !isIncludesFromPricePool(item.price, pricePool.sell)
                    && item.price > buyAvg
                    && Math.abs(utils.getGain(item.price, sellAvg)) > 0.0382
                ) {
                    console.log('utils.getGain:', type, symbol, item.price, utils.getGain(item.price, sellAvg))
                    cancelOrder(item.id)
                }
            }
        });
        
        // (quoteCurrencyBalance * utils.getPriceIndex(quoteCurrency))
     
        const hasEnoughBalance = quoteCurrencyBalance > (amount * baseCurrencyPrice * priceIndex);
        const hasEnoughAmount = baseCurrencyBalance > (amount * 1.0005);

        if (!hasEnoughBalance) {
            symbolInfo[symbol].msg = `${quoteCurrency}不足`
        } else if (!hasEnoughAmount) {
            symbolInfo[symbol].msg = '当前币不足'
        }
        /* 最终可买卖的量(实际余额允不允许) */
        let _canSellCount = Number.parseInt((baseCurrencyBalance / amount).toFixed(8), 10);
        let _canBuyCount = Number.parseInt(quoteCurrencyBalance / (amount * baseCurrencyPrice), 10);
        let canSellCount = Math.min(sellCount - openSellCount, _canSellCount);
        let canBuyCount = Math.min(buyCount - openBuyCount, _canBuyCount);

        // if (forceTrade) {
        //     if (type === 'sell') {
        //         canSellCount += 2;
        //     }
        //     if (type === 'buy') {
        //         canBuyCount += 2;
        //     }
        // }
        if (type === 'buy') {
            canBuyCount += extraCount;
        }
        if (type === 'sell') {
            canSellCount += extraCount;
        }

        // 可卖
        if ((canSellCount > 0)
            && hasEnoughAmount
            && type === 'sell'
        ) {
            await placeOrder({
                amount,
                pricePool: pricePool.sell,
                type,
                count: canSellCount,
                originOrder,
                symbol
            });
        }
        
        // 可买
        if ((canBuyCount > 0)
            && hasEnoughBalance
            && type === 'buy'
        ) {
            await placeOrder({
                amount,
                pricePool: pricePool.buy,
                type,
                count: canBuyCount,
                originOrder,
                symbol
            });
        }
    } catch (error) {
        console.error(error);
    }
    
}
exports.handleOrder = handleOrder;

/**
 * 对比新老订单价格的比
 * @param {number[]} originOrders
 * @param {number} newPrice
 * @return {boolean} 返回false为不合理，价格过于相近
 */
function checkNewPriceAndOpenOrderPrice(originOrders, newPrice) {
    for (let i = 0; i < originOrders.length; i++) {
        const oldPrice = Number(originOrders[i]);
        if (Math.abs(utils.getGain(oldPrice, newPrice)) < 0.002) {
            return false;
        }
    }
    return true;
}
/**
 * 下单
 * @param {object} 
 */
async function placeOrder({
    type,
    pricePool,
    originOrder,
    count,
    amount,
    symbol,
} = {}) {
    const originOrderPrices = Object.keys(originOrder);
    const symbolInfo = utils.huobiSymbols.getSymbolInfo(symbol);
    const pricePrecision = symbolInfo['price-precision'];
    const amountPrecision = symbolInfo['amount-precision'];
    // const amountPrecision = symbolInfo['amount-precision'];
    for (let index = 0; index < pricePool.length; index++) {
        let price = pricePool[index];
        if (originOrder[Number(price).toFixed(10)] !== undefined
            || pricePool[index] === undefined
            || count <= 0
        ) {
            continue;
        }
        /* 价格过于相近则主动扩大价格幅度 */
        if (!checkNewPriceAndOpenOrderPrice(originOrderPrices, price)) {
            const direction = type === 'buy' ? -1 : 1;
            const _oldPrice = price;
            price = (price * (1 + (direction * 0.004))).toFixed(pricePrecision);
            console.log(`${symbol}价格过于相近`, _oldPrice, '->', price);
        }
        if (type === 'buy' && symbolInfo[symbol] && price > symbolInfo[symbol].close * 1.003
            || type === 'sell' && symbolInfo[symbol] && price < symbolInfo[symbol].close * 0.998
        ) {
            console.log('Price Error', symbol, price, type, moment().format("YY/MM/DD H:mm:ss"))
            return;
        }
        originOrder[Number(price).toFixed(10)] = 1;
        count--;
        console.log(symbol, price, type, amount.toFixed(amountPrecision), moment().format("YY/MM/DD H:mm:ss"))
        if (config.get('isDev')) {
            // console.log('dev continue');
            continue;
        }
        
        

        await hbsdk.buy_limit({
            symbol: symbol,
            amount: amount.toFixed(amountPrecision),
            price: price,
            type: `${type}-limit`,
        }).catch(console.error);
    }
}

/**
 * 避免还没取消成功调用多次
 * @param {number} id 
 */
function cancelOrder (id) {
    if (cancelOrder.idMap[id] !== undefined) {
        return;
    }
    // 标记正在处理
    cancelOrder.idMap[id] = 1;
    hbsdk.cancelOrder(id).then(() => {
        delete cancelOrder.idMap[id];
    })
    .catch((error) => {
        console.error(error)
        delete cancelOrder.idMap[id];
    });
}
cancelOrder.idMap = {}

/**
 * 是否来至价格池
 * @param {number} price
 * @param {number[]} pricePool
 */
function isIncludesFromPricePool(price, pricePool) {
    for (let i = 0; i < pricePool.length; i++) {
        const p = pricePool[i];
        if (Number(price) === Number(p)) {
            return true;
        }
    }
    return false;
}