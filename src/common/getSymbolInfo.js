"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSymbolInfo = exports.getSymbols = exports._symbols = void 0;
const hbsdk_1 = require("../huobi/hbsdk");
// create_hbsdk
// 有问题的symbols 或者不需要监控的symbols
const errorSymbols = [
    'venusdt',
    'mtxbtc',
    'venbtc',
    'mdsbtc',
    'ekobtc',
    'evxbtc',
    'saltbtc',
    'gxcbtc',
    'bixbtc',
    'bixusdt',
    'bt1btc',
    'bt2btc',
    'bkbtbtc',
    'ucbtc',
    'hotbtc',
    'zjltbtc',
    'cdcbtc'
];
// 缓存结果
exports._symbols = [];
/**
 * @return { Promise<object[]>}
 */
exports.getSymbols = async function () {
    if (exports._symbols.length > 0) {
        return exports._symbols;
    }
    exports._symbols = await hbsdk_1.hbsdk_commom.getSymbols().then((data) => {
        return data.filter((item) => {
            if (errorSymbols.includes(item.symbol)) {
                return false;
            }
            return true;
        });
    });
    return exports._symbols;
};
/**
 * 根据symbol获取精度，base-currency, quote-currency
 * @param {string} symbol
 * @param {object} symbol
 */
exports.getSymbolInfo = function (symbol) {
    if (!symbol) {
        throw Error(`param error`);
    }
    let info = {
        'price-precision': 4,
        'amount-precision': 4,
    };
    // let _symbols = await getSymbols();
    exports._symbols.some((item) => {
        // base-currency:"yee"
        // price-precision:8
        // quote-currency:"eth"
        if (symbol.startsWith(item['base-currency'])
            && symbol.endsWith(item['quote-currency'])) {
            info['price-precision'] = item['price-precision'];
            info['amount-precision'] = item['amount-precision'];
            info['base-currency'] = item['base-currency'];
            info['quote-currency'] = item['quote-currency'];
            return true;
        }
        return false;
    });
    return info;
};
