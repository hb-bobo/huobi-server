"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketIO = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const logger_1 = require("../common/logger");
const events_1 = require("../huobi/events");
const hbsdk_1 = require("../huobi/hbsdk");
const node_huobi_sdk_1 = require("node-huobi-sdk");
/**
 * 与客户端的socket
 */
exports.socketIO = socket_io_1.default({
    path: '/socket.io',
    serveClient: false,
});
const sockets = {};
exports.socketIO.on('connection', function (socket) {
    let unSub;
    sockets[socket.id] = socket;
    socket.on('sub', function ({ symbol }) {
        logger_1.outLogger.info('socketIO: onsub ', symbol);
        symbol = symbol.toLowerCase();
        const unSubMarketDepth = hbsdk_1.hbsdk.subMarketDepth({ symbol, id: socket.id });
        const unSubMarketKline = hbsdk_1.hbsdk.subMarketKline({ symbol, period: node_huobi_sdk_1.CandlestickIntervalEnum.MIN5, id: socket.id });
        const unsubMarketTrade = hbsdk_1.hbsdk.subMarketTrade({ symbol, id: socket.id });
        // ws.sub(WS_SUB.kline(symbol, '1min'), socket.id);
        // ws.sub(WS_SUB.depth(symbol), socket.id);
        // ws.sub(WS_SUB.tradeDetail(symbol), socket.id);
        unSub = () => {
            // unSubMarketDepth();
            // unSubMarketKline();
            // unsubMarketTrade();
        };
    });
    socket.on("disconnect", (reason) => {
        unSub && unSub();
        delete sockets[socket.id];
    });
    // 发送单个
    // socket.send( 'sss')
    // 发送所有连接1
    // socketIO.sockets.emit('event', 'xxx')
    logger_1.outLogger.info(`socket connected: ${socket.id}`);
});
events_1.ws_event.on("server:ws:message", function (data) {
    if (data.data && data.data.symbol) {
        if (!hbsdk_1.hbsdk.market_cache_ws) {
            return;
        }
        exports.socketIO.sockets.send(data);
        return;
        // console.log(hbsdk.market_cache_ws.cache)
        // for (const key in hbsdk.market_cache_ws.cache) {
        //     if (!Object.prototype.hasOwnProperty.call(hbsdk.market_cache_ws.cache, key)) {
        //         return;
        //     }
        //     const ids = hbsdk.market_cache_ws.cache[key];
        //     // outLogger.info(ids, Object.keys(sockets))
        //     ids.forEach((id) => {
        //         if (!sockets[id]) {
        //             return;
        //         }
        //         sockets[id].send(data);
        //     })
        // }
    }
});
