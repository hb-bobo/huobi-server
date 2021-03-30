"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRADE_STATUS = exports.CONTRACT_URL = exports.ACCOUNT_WS = exports.MARKET_WS = exports.REST_URL = void 0;
exports.REST_URL = 'https://api.huobi.de.com';
exports.MARKET_WS = 'wss://api.huobi.de.com/ws';
exports.ACCOUNT_WS = 'wss://api.huobi.de.com/ws/v2';
exports.CONTRACT_URL = 'https://api.hbdm.com';
exports.TRADE_STATUS = {
    done: 1,
    invalid: -1,
    wait: 0.
};
