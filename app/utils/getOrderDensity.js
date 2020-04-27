
const getPriceIndex = require('./getPriceIndex');
/**
 * 挂单密度
 * @param {string[]} asksList 
 * @param {string[]} asksList 
 * @param {number} currentPrice 
 * @param {string} symbol 
 * @return {Object}
 * @example 
 * 
 * getOrderDensity({
        asksList: data2,
        bidsList: data,
        currentPrice: '0.0000079012',
        symbol: 'paibtc',
    })
 */

let config = {
    btcusdt: {
        len: 0.05,
        step: 0.0001,
    }
}
const getOrderDensity = function ({asksList, bidsList, currentPrice, symbol}) {
    const buyDensity = {};
    const sellDensity = {};
    const _asksList = JSON.parse(JSON.stringify(asksList));
    const _bidsList = JSON.parse(JSON.stringify(bidsList));

    let _price = getPriceIndex(symbol);
    let len = config[symbol].len;
    let step = config[symbol].step;
    for (let i = 0.001; i < len; i+=step) {
        i = Number(i.toFixed(6));
        let buyPrice = (currentPrice * (1 - i));
        let sellPrice = (currentPrice * (1 + i));
        buyDensity[-i] = {
            count: 0,
            price: buyPrice,
            sumMoneny: 0,
        };
        sellDensity[i] = {
            count: 0,
            price: sellPrice,
            sumMoneny: 0,
        };
        inter:
        for(let n = 0; n < _asksList.length; n++) {
            // 该单价格
            let price = _asksList[n][0];
            if (sellPrice < Number(price)) {
                break inter;
            }
            
            sellDensity[i].count++;
            sellDensity[i].sumMoneny += _asksList[n][1] * price * _price; // 挂单总价统计，单位为美元
            _asksList.splice(i, 1);
            n--;
        }
        inter2:
        for(let n = 0; n < _bidsList.length; n++) {
            // 该单价格
            let price = _bidsList[n][0];
            if (buyPrice > Number(price)) {
                break inter2;
            }
            buyDensity[-i].count++;
            buyDensity[-i].sumMoneny += _bidsList[n][1] * price * _price; // 挂单总价统计，单位为美元
            _bidsList.splice(i, 1);
            n--;
        }
    }
    return {
        buy: buyDensity,
        sell: sellDensity,
    }
}
module.exports = getOrderDensity;

// export default getOrderDensity;