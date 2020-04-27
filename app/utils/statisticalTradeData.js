const { isEmpty } = require('lodash')
const getPriceIndex = require('./getPriceIndex');
/**
 * 处理交易数据/ 合并制定时间内的交易
 * @param {Object} data 
 * @param { object } tempTradeData
 * @param { number } disTime
 * @param { (symbol: string, data: object) => void } callback
 */
const statisticalTradeData = function(
    {   data,
        tempTradeData,
        disTime = 2 * 60 * 1000,
        callback = function() {}
    } = {}
) {
    if (!data.trade) {
        return;
    }
    // data.trade = {
    //     id: 25385409501,
    //     ts: 1540131649981,
    //     data: [
    //         {
    //             amount: 0.0073,
    //             ts: 1540131649981,
    //             id: 2.5385409501151216e+21,
    //             price: 6637.01,
    //             direction: 'buy'
    //         }
    //     ]
    // }
    const tradeData = data.trade;
    let symbol = data.symbol;
    const ts = tradeData.ts;
    // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
    const _price = getPriceIndex(symbol);
    // 2分钟合并一次交易
    // let disTime = 2 * 60 * 1000;
    // 先找缓存的数据是否存在
    if (isEmpty(tempTradeData)) {
        
        let _tempData = mergeTradeData(tradeData.data, ts, _price, symbol);
        if (_tempData) {
            Object.assign(tempTradeData, _tempData);
        }
        return;
    }
    // 上一个时间(位数归了0，比实际时间早)
    const preTime = tempTradeData._time;
    // 当前时间 > 上一个时间
    if ((ts - preTime)  > disTime) {
        // 记录上一个数据；
        let time = new Date(Number(tempTradeData._time));
        if (tempTradeData) {
            tempTradeData.time = time;
            tempTradeData.buy = tempTradeData.buy.toFixed(2);
            tempTradeData.sell = tempTradeData.sell.toFixed(2);
            tempTradeData.exchange = 'huobi';
            delete tempTradeData._time;
            callback(symbol, tempTradeData);
            // mysqlModel.insert('HUOBI_TRADE', tempTradeData);
        }
        // 开始一个新数据
        let _tempData = mergeTradeData(tradeData.data, ts, _price, symbol);
        if (_tempData) {
            Object.assign(tempTradeData, _tempData);
            // tempTradeData = _tempData;
        }
    } else {
        // 合并数据
        let _tempData = mergeTradeData(tradeData.data, ts, _price, symbol);
        tempTradeData.buy += _tempData.buy;
        tempTradeData.sell += _tempData.sell;
    }
}


module.exports = statisticalTradeData;
/**
 * 合并一个时间点的买卖交易量
 * @param {Array<Object>} tradeData
 * @param {string} _time
 * @param {number} _price
 * @param {string} symbol
 * @return {Array<Object>}
 */
function mergeTradeData(tradeData, _time, _price, symbol) {
    let _tempData = {
        symbol: symbol,
        buy: 0,
        sell: 0,
        _time: _time
    }
    if (!Array.isArray(tradeData)) {
        console.error('tradeData must be a Array');
        return;
    }
    // 累加买卖交易量
    tradeData.forEach(item => {
        const amount = item.amount * item.price * _price;
        const direction = item.direction;
        _tempData[direction] = Number((amount + _tempData[direction]).toFixed(2));
    });
    return _tempData;
}

// module.exports = mergeTradeData;