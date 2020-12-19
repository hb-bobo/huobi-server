import socket from 'socket.io';
import { outLogger } from 'ROOT/common/logger';
import { ws_event } from 'ROOT/huobi/ws/events';
import { ws } from 'ROOT/huobi/ws/ws'
import { WS_SUB } from 'ROOT/huobi/ws/ws.cmd';
/**
 * 与客户端的socket
 */
export const socketIO = socket({
    path: '/socket.io',
    serveClient: false,
});
socketIO.on('connection', function (socket) {
    let unSub = () => {}
    socket.on('sub', function ({symbol}) {
        ws.sub(WS_SUB.kline(symbol, '1min'), socket.id);
        ws.sub(WS_SUB.depth(symbol), socket.id);
        ws.sub(WS_SUB.tradeDetail(symbol), socket.id);
        unSub = () => {
            ws.unSubFormClinet(WS_SUB.kline(symbol, '1min'), socket.id);
            ws.unSubFormClinet(WS_SUB.depth(symbol), socket.id);
            ws.unSubFormClinet(WS_SUB.tradeDetail(symbol), socket.id);
        }
    })
    socket.on("disconnect", (reason) => {
        unSub();
    });
    // 发送单个
    // socket.send( 'sss')
    // 发送所有连接
    // socketIO.sockets.emit('event', 'xxx')
    outLogger.info(`socket connected: ${socket.id}`);
});
// socketIO.on('')