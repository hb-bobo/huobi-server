"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceIndex = exports.getTracePrice = exports.getTop = exports.getSameAmount = exports.getSymbolInfo = exports._SYMBOL_INFO_MAP = void 0;
const utils_1 = require("../utils");
const hbsdk_1 = require("./hbsdk");
const price_1 = __importDefault(require("./price"));
/**
 * 缓存币的基本信息
 */
exports._SYMBOL_INFO_MAP = {};
/**
 * 根据symbol获取精度，base-currency, quote-currency
 * @param {string} symbol
 */
exports.getSymbolInfo = async function (symbol) {
    if (symbol && exports._SYMBOL_INFO_MAP[symbol]) {
        return exports._SYMBOL_INFO_MAP[symbol];
    }
    const symbolsList = await hbsdk_1.hbsdk.getSymbols();
    if (!symbolsList) {
        return;
    }
    for (let i = 0; i < symbolsList.length; i++) {
        const symbolInfo = symbolsList[i];
        exports._SYMBOL_INFO_MAP[`${symbolInfo['base-currency']}${symbolInfo['quote-currency']}`] = symbolInfo;
    }
    return exports._SYMBOL_INFO_MAP[symbol];
};
/**
 * 合并相同的价格统计次数并排序(价格为usdt)
 * @param {Array<Array<number>>} data
 */
exports.getSameAmount = function (data, { type = '', symbol = '', sortBy = 'sumMoneny', minSumPrice = 100, minPrice = 1000, } = {}) {
    const countTemp = {};
    // 统计重复次数
    for (let i = 0; i < data.length; i++) {
        const count = data[i][1];
        if (countTemp[count] === undefined) {
            countTemp[count] = {
                count: 1,
                prices: [data[i][0]]
            };
            continue;
        }
        countTemp[count].count += 1;
        countTemp[count].prices.push(data[i][0]);
    }
    const arr = [];
    for (const key in countTemp) {
        const prices = countTemp[key].prices;
        let price = 0;
        // 多个重复则取个平均数
        if (prices.length === 1) {
            price = countTemp[key].prices[0];
        }
        else {
            price = prices.reduce((accumulator, item) => accumulator + item) / prices.length;
        }
        // 同数量出现 的次数
        const count = countTemp[key].count;
        // 总量 = 次数 * 单个挂单量
        const sum = count * Number(key);
        // 总价
        const sumPrice = sum * price;
        // 转换成usdt价格(对币可能是eth, btc)
        const sumDollar = sumPrice * getPriceIndex(symbol);
        if ((count > 1 && sumDollar > minSumPrice) //机器人
            || (sumDollar > minPrice) // 大户
            || count > 10 //机器人
            || (sum % 10 === 0 && sumDollar > minSumPrice) // 10整数倍
        ) {
            const data = {
                count: count,
                amount: utils_1.autoToFixed(key),
                sumCount: utils_1.autoToFixed(sum),
                sumMoneny: utils_1.autoToFixed(sumPrice),
                sumDollar: utils_1.autoToFixed(sumDollar),
                price: utils_1.autoToFixed(price),
                prices: countTemp[key].prices,
            };
            arr.push(data);
        }
    }
    if (type === 'asks' && sortBy === 'price') {
        return arr.sort(function (a, b) {
            return Number(a[sortBy]) - Number(b[sortBy]);
        });
    }
    return arr.sort(function (a, b) {
        return b[sortBy] - a[sortBy];
    });
};
/**
 *  amount:"141940.65"
    count:1
    price:"0.00018500"
    prices:Array[1]
    sumCount:"141940.65"
    sumDollar:"172469.25"
    sumMoneny:"26.26"
 * @param {object[]} arr
 * @param {number} len
 */
function getTop(arr, len = 3) {
    return arr.sort(function (a, b) {
        return Number(a.price) - Number(b.price);
    }).slice(0, len);
}
exports.getTop = getTop;
/**
 *
 * 根据买卖压力推荐价格
 */
exports.getTracePrice = function ({ bidsList, asksList, }) {
    /* 交易数据 */
    const prices = {
        sell: [],
        buy: [],
    };
    const newBidsList = getTop(bidsList);
    const newAsksList = getTop(asksList);
    // 重复则取第一个作为备用
    newBidsList.forEach(item => {
        prices.buy.push(Number(item.price));
    });
    newAsksList.forEach(item => {
        prices.sell.push(Number(item.price));
    });
    // 取机器人的价格
    const robotBids = bidsList.filter(item => item.count > 1).sort(function (a, b) {
        return b.count - a.count;
    });
    const robotAsks = asksList.filter(item => item.count > 1).sort(function (a, b) {
        return b.count - a.count;
    });
    if (robotBids.length > 0) {
        if (!prices.buy.includes(Number(robotBids[0].price))) {
            prices.buy.push(Number(robotBids[0].price));
        }
    }
    if (robotAsks.length > 0) {
        if (!prices.sell.includes(Number(robotAsks[0].price))) {
            prices.sell.push(Number(robotAsks[0].price));
        }
    }
    // 添加备用单
    prices.buy.push(Number(utils_1.autoToFixed(Math.min(...prices.buy) * (1 - 0.008))));
    prices.sell.push(Number(utils_1.autoToFixed(Math.max(...prices.sell) * (1 + 0.008))));
    return prices;
};
/**
 * 获取btc eth对usdt的系数
 * @param {string} symbol
 * @return {number}
 */
function getPriceIndex(symbol) {
    // btc eth交易对转美元
    const _temp = {
        usdt: 1,
        btc: price_1.default.get('btc'),
        eth: price_1.default.get('eth'),
        ht: price_1.default.get('ht'),
        husd: 1,
    };
    let _price = 0;
    for (const key in _temp) {
        if (symbol.endsWith(key)) {
            _price = _temp[key];
            break;
        }
    }
    return _price;
}
exports.getPriceIndex = getPriceIndex;
