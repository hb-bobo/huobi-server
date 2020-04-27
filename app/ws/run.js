
const WS_HUOBI = require('./ws-huobi');
// const WS_FCOIN = require('./ws-fcoin');
const WS_FCOIN = require('./ws-fcoin.1');
// const WS_BINANCE = require('../ws-binance');
const hbsdk = require('../../lib/sdk/hbsdk');
const huobiSymbols = require('../utils/huobiSymbols');
const { watchSymbols } = require('../models/charts');

const { getAllDetail } = require('./handler/difference');
const train = require('./handler/handleKline');

let symbols = [];

async function start() {
    await Promise.all([
        // 查最新的价格
        hbsdk.getMarketHistoryKline({
            symbol: 'btcusdt',
            period: '1min',
        }).then((data) => {
            appConfig.prices.btc = data[0].close;
        }).catch(console.error)
        ,
        hbsdk.getMarketHistoryKline({
            symbol: 'ethusdt',
            period: '1min',
        }).then((data) => {
            appConfig.prices.eth = data[0].close;
        }).catch(console.error)
        ,
        hbsdk.getMarketHistoryKline({
            symbol: 'htusdt',
            period: '1min',
        }).then((data) => {
            appConfig.prices.ht = data[0].close;
        }).catch(console.error)
        ,
        // 获取全部交易对的精度
        huobiSymbols.getSymbols()
        ,
        watchSymbols.get().then(mysqlRes => {
            symbols = mysqlRes.map(item => item.symbol);
        })
    ]).catch(console.error);
    await WS_HUOBI.open().then(function () {
        symbols.forEach((symbol, index) => {
            // 开始订阅
            WS_HUOBI.subscribe.sub(WS_HUOBI, {
                type: `sub`,
                value: `market.${symbol}.depth.step0`,
                symbol: `${symbol}`,
                from: 'server'
            });
            WS_HUOBI.subscribe.sub(WS_HUOBI, {
                type: `sub`,
                value: `market.${symbol}.trade.detail`,
                symbol: `${symbol}`,
                from: 'server'
            });
            WS_HUOBI.subscribe.sub(WS_HUOBI, {
                type: `sub`,
                value:  `market.${symbol}.kline.1min`,
                symbol: `${symbol}`,
                from: 'server'
            });
        });
    }).catch(console.error);
    getAllDetail();
    // train();
    // await WS_BINANCE.open();
}
// start()
module.exports = start;


