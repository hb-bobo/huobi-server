
const moment = require('moment');
const AbnormalMonitor = require('../../extend/AbnormalMonitor');
const hbsdk = require('../../../lib/sdk/hbsdk');
const { CalculateMA } = require('../../extend/CalculateMA');
const appConfig = require('../../config');

let pRange = 0.01;
let aRage = 1;
let heng = 0;
let dataCount = 2000;
const priceKline = new AbnormalMonitor({config: {range: pRange, disTime: 0, recordMaxLen: dataCount}});
const amount = new AbnormalMonitor({config: {range: aRage, disTime: 0, recordMaxLen: dataCount}});

const status  = {
    action: 'buy',
    MAstatus: '<MA%'
}
function train() {
    hbsdk.getMarketHistoryKline({
        symbol: 'htusdt',
        period: '5min',
        size: dataCount,
    }).then((data) => {
        let pMA5 = new CalculateMA(5);
        let pMA10 = new CalculateMA(10);
        let pMA30 = new CalculateMA(30);
        let pMA60 = new CalculateMA(60);
        let pMA120 = new CalculateMA(120);
        let aMA10 = new CalculateMA(10, {key: 'amount'});
        let rData = data.reverse();
        rData.forEach((item, index) => {
            pMA5.push(rData, index);
            pMA10.push(rData, index);
            pMA30.push(rData, index);
            pMA60.push(rData, index);
            pMA120.push(rData, index);
            aMA10.push(rData, index)
            priceKline.speed({
                value: item.close,
                ts: new Date(Number(item.id + '000')).getTime(),
            });
            amount.speed({
                value: Number(item.amount),
                ts: new Date(Number(item.id + '000')).getTime(),
            });
            if (priceKline.historyStatus.length < 2) {
                return;
            }
            let priceKline1 = priceKline.historyStatus[priceKline.historyStatus.length - 1];
            let amount1 = amount.historyStatus[amount.historyStatus.length - 1];
            let priceKline2 = priceKline.historyStatus[priceKline.historyStatus.length - 2];
            let amount2 = amount.historyStatus[amount.historyStatus.length - 2];

            if (
                // status.action === 'sell' &&
                // 
                // || (priceKline2.status === '涨' && amount1 !== '横盘')
                item.close > pMA60.last()
                // pMA5.last() > pMA10.last()
                // && pMA10.last() > pMA30.last()
                // && pMA30.last() > pMA60.last()
                // && pMA60.last() > pMA120.last()
                && ((priceKline1.status === '涨' || priceKline2.status === '涨') && item.amount > (aMA10.last() * 4))
            ) {
                status.action = 'buy'
                console.log('卖', moment(new Date(Number(item.id + '000'))).format(), (item.close * 1).toFixed(4), priceKline1);
            }
            if (
                // status.action === 'buy' && 
                // (priceKline1.status === '跌' && amount1 === '跌')
                // || (priceKline2.status === '跌' && amount1 !== '横盘')
                item.close < pMA60.last()
                // pMA5.last() < pMA10.last()
                // && pMA10.last() < pMA30.last()
                // && pMA30.last() < pMA60.last()
                // && pMA60.last() < pMA120.last()
                && ((priceKline1.status === '跌' || priceKline2.status === '跌') && item.amount > (aMA10.last() * 4))
            ) {
                status.action = 'sell'
                console.log('买', moment(new Date(Number(item.id + '000'))).format(), (item.close * (1)).toFixed(4), priceKline1);
            }
        });
    }).catch(console.error)
}
// train();
module.exports = train;