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
const sockets: Record<string, socket.Socket> = {}
socketIO.on('connection', function (socket) {
    let unSub = () => {}
    sockets[socket.id] = socket;
    socket.on('sub', function ({symbol}) {
        outLogger.info('socketIO: onsub ', symbol)
        symbol = symbol.toLowerCase();
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
        delete sockets[socket.id];
    });
    // 发送单个
    // socket.send( 'sss')
    // 发送所有连接
    // socketIO.sockets.emit('event', 'xxx')
    outLogger.info(`socket connected: ${socket.id}`);
});
ws_event.on("server:ws:message", function(data) {
    if (data.data && data.data.symbol) {
        for (const key in ws.cache) {
            if (!Object.prototype.hasOwnProperty.call(ws.cache, key)) {
                return;
            }
            const ids = ws.cache[key];
            // outLogger.info(ids, Object.keys(sockets))
            ids.forEach((id) => {
                if (!sockets[id]) {
                    return;
                }
                sockets[id].send(data);
            })
        }
    }
    // socketIO.sockets.send(data);
});

