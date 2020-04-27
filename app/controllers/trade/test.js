const fs = require('fs')
const path = require('path')
const moment = require('moment')
const config = require('config')
const hbsdk = require('../../../lib/sdk/hbsdk')
const AnalyseKline = require('../../extend/AnalyseKline')
const utils = require('../../utils')

const count = 1;
const privatePaht = path.join(config.get('rootPath'), `data`);

let buyConut = 0;
let sellCount = 0;
const symbol = 'htusdt';
// 对币余额(btc,usdt,eth)
let quoteCurrencyBalance = 1000;
// 当前币的余额
let baseCurrencyBalance = 100;
const klineHandle = new AnalyseKline({
    symbol: symbol,
    config: {isUp: false},
    callback: function(symbol, actionType, {extraCount, extraAmountCoefficient, klineData}) {
        let price = klineData.close;
        let time = moment(Number(klineData.id + '000')).format("YYYY/MM/DD H:mm:ss");
        let amount = extraAmountCoefficient * (count + extraCount);
        let sum = price * amount;
        console.log(time, actionType, price , `${amount}`, `extraCount:${extraCount}`, `extraAmountCoefficient: ${extraAmountCoefficient}`)
        if (actionType === 'buy') {
            quoteCurrencyBalance -= sum;
            baseCurrencyBalance += amount;
            buyConut++;
        } else if (actionType === 'sell') {
            quoteCurrencyBalance += sum;
            baseCurrencyBalance -= amount;
            sellCount++;
        }
        // console.log(`
        //     actionType: ${actionType}
        //     quoteCurrencyBalance: ${quoteCurrencyBalance}
        //     baseCurrencyBalance: ${baseCurrencyBalance}
        //     price: ${price}
        //     other: extraCount: ${extraCount} extraAmountCoefficient: ${Number(extraAmountCoefficient).toFixed(2)}
        //     time: ${time}
        // `)
        // console.log()
    }
});


function startTest(klineData) {
    let list = klineData.reverse();
    let oldBalance = quoteCurrencyBalance + baseCurrencyBalance * (list[0].close);
    list.forEach((item) => {
        klineHandle.run(item);
    });

    fs.writeFileSync(path.join(config.get('rootPath'), `data/log.json`), JSON.stringify(klineHandle.logs))
    console.log((new Date(Number(list[list.length - 1].id + '000'))))
    let newBalance = quoteCurrencyBalance + baseCurrencyBalance * ((list[list.length - 1].close + list[list.length - 1].open) / 2);
    console.log(`
        初始: ${oldBalance}
        结束: ${newBalance}
        收益率: ${utils.getGain(oldBalance, newBalance) * 100}
        quoteCurrencyBalance: ${quoteCurrencyBalance}
        baseCurrencyBalance: ${baseCurrencyBalance}
        sellCount${sellCount} buyCount${buyConut}
    `)
}
const klineData = fs.readFileSync(path.join(privatePaht, `ethusdt-5min-2019-05-13.json`), {encoding: 'utf8'})
// startTest(JSON.parse(klineData))
async function fetchKline(symbol, period = '5min') {
    await hbsdk.getMarketHistoryKline({
        symbol: symbol,
        period: period,
        size: 1000,
    }).then((data) => {
        // let rData = data.reverse();
        fs.writeFileSync(path.join(config.get('rootPath'), `data/${symbol}-${period}-${moment().format("YYYY-MM-DD")}.json`), JSON.stringify(data))
        startTest(data)
        // console.log(rData)
        // symbolInfo[symbol].klineHandle.run(rData);
        // 
        // const pricePool = utils.getTracePrice({
        //     symbol,
        //     bidsList: symbolInfo[symbol].depth.bidsList,
        //     asksList: symbolInfo[symbol].depth.asksList,
        // });
        // handleOrder({symbol, pricePool, type: 'buy'});
        // handleOrder({symbol, pricePool, type: 'sell'});
    }).catch((err) => {
        console.log('fetchKline:', symbol, err)
        // fetchKline(symbol);
        // throw Error(err) 
    });
}
fetchKline('htbtc')


