"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prices = void 0;
const price_1 = __importDefault(require("./price"));
exports.prices = {
    btc: 5200,
    eth: 172,
    ht: 2.4,
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
    return _price - 0;
}
exports.default = getPriceIndex;
