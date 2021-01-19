"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandlestickIntervalEnum = exports.ACCOUNT_WS = exports.MARKET_WS = exports.REST_URL = void 0;
exports.REST_URL = 'https://api.huobi.de.com';
exports.MARKET_WS = 'wss://api.huobi.de.com/ws';
exports.ACCOUNT_WS = 'wss://api.huobi.de.com/ws/v2';
var CandlestickIntervalEnum;
(function (CandlestickIntervalEnum) {
    CandlestickIntervalEnum["MIN1"] = "1min";
    CandlestickIntervalEnum["MIN5"] = "5min";
    CandlestickIntervalEnum["MIN15"] = "15min";
    CandlestickIntervalEnum["MIN30"] = "30min";
    CandlestickIntervalEnum["MIN60"] = "60min";
    CandlestickIntervalEnum["HOUR4"] = "4hour";
    CandlestickIntervalEnum["DAY1"] = "1day";
    CandlestickIntervalEnum["MON1"] = "1mon";
    CandlestickIntervalEnum["WEEK1"] = "1week";
    CandlestickIntervalEnum["YEAR1"] = "1year";
})(CandlestickIntervalEnum = exports.CandlestickIntervalEnum || (exports.CandlestickIntervalEnum = {}));
