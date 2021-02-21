"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_REQ = exports.WS_SUB = void 0;
const signature_1 = require("../utils/signature");
exports.WS_SUB = {
    /**
     * k线订阅
     * @param param0
     */
    kline(symbol, period) {
        return {
            "sub": `market.${symbol}.kline.${period}`,
            "id": `sub_${symbol}_${period}`
        };
    },
    /**
     * 市场深度行情数据
     * @param symbol
     * @param step 合并
     */
    depth(symbol, step = 'step0') {
        return {
            "sub": `market.${symbol}.depth.${step}`,
            "id": `sub_${symbol}_${step}`
        };
    },
    /**
     *  订阅 Market Detail 数据
     * @param symbol
     */
    marketDetail(symbol) {
        return {
            "sub": `market.${symbol}.detail`,
            "id": `sub_${symbol}`
        };
    },
    /**
     * 交易数据
     * @param symbol
     */
    tradeDetail(symbol) {
        return {
            "sub": `market.${symbol}.trade.detail`,
            "id": `sub_${symbol}`
        };
    }
};
exports.WS_REQ = {
    auth(accessKey, secretKey, WS_URL) {
        return {
            op: 'auth',
            ...signature_1.signature('GET', WS_URL, accessKey, secretKey)
        };
    },
    /**
     * 请求 KLine 数据
     * @param param0
     */
    kline(symbol, period = '1min') {
        return {
            "req": `market.${symbol}.kline.${period}`,
            "id": `req_${symbol}_${period}`
        };
    },
    /**
     *  请求 Trade Detail 数据
     * @param symbol
     */
    marketDetail(symbol) {
        return {
            "req": `market.${symbol}.detail`,
            "id": `req_${symbol}`
        };
    }
};
