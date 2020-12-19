"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketIO = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const logger_1 = require("../common/logger");
const ws_1 = require("../huobi/ws/ws");
const ws_cmd_1 = require("../huobi/ws/ws.cmd");
/**
 * 与客户端的socket
 */
exports.socketIO = socket_io_1.default({
    path: '/socket.io',
    serveClient: false,
});
exports.socketIO.on('connection', function (socket) {
    let unSub = () => { };
    socket.on('sub', function ({ symbol }) {
        ws_1.ws.sub(ws_cmd_1.WS_SUB.kline(symbol, '1min'), socket.id);
        ws_1.ws.sub(ws_cmd_1.WS_SUB.depth(symbol), socket.id);
        ws_1.ws.sub(ws_cmd_1.WS_SUB.tradeDetail(symbol), socket.id);
        unSub = () => {
            ws_1.ws.unSubFormClinet(ws_cmd_1.WS_SUB.kline(symbol, '1min'), socket.id);
            ws_1.ws.unSubFormClinet(ws_cmd_1.WS_SUB.depth(symbol), socket.id);
            ws_1.ws.unSubFormClinet(ws_cmd_1.WS_SUB.tradeDetail(symbol), socket.id);
        };
    });
    socket.on("disconnect", (reason) => {
        unSub();
    });
    // 发送单个
    // socket.send( 'sss')
    // 发送所有连接
    // socketIO.sockets.emit('event', 'xxx')
    logger_1.outLogger.info(`socket connected: ${socket.id}`);
});
// socketIO.on('')
