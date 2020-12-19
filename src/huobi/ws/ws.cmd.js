"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ws_auth = exports.WS_REQ = exports.WS_SUB = void 0;
const config_1 = __importDefault(require("config"));
const hbsdk_1 = require("../hbsdk");
const huobi = config_1.default.get('huobi');
exports.WS_SUB = {
    /**
     * k线订阅
     * @param param0
     */
    kline(symbol, period = '5min') {
        return {
            "sub": `market.${symbol}.kline.${period}`,
            "id": `sub_${symbol}_${period}`
        };
    },
    /**
     * 市场深度行情数据
     * @param symbol
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
/**
 * 发送auth请求
 * @param ws
 */
function ws_auth(accessKey, secretKey, data) {
    return {
        op: 'auth',
        ...hbsdk_1.auth('GET', huobi.ws_url_prex, accessKey, secretKey, data)
    };
}
exports.ws_auth = ws_auth;
