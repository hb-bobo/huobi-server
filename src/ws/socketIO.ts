import socket from 'socket.io';
import { outLogger } from 'ROOT/common/logger';
import { ws_event } from 'ROOT/huobi/events';
import { hbsdk } from 'ROOT/huobi/hbsdk';
import { CandlestickIntervalEnum } from 'ROOT/lib/huobi';

/**
 * 与客户端的socket
 */
export const socketIO = socket({
    path: '/socket.io',
    serveClient: false,
});
const sockets: Record<string, socket.Socket> = {}
socketIO.on('connection', function (socket) {
    let unSub: () => void;
    sockets[socket.id] = socket;
    socket.on('sub', function ({symbol}) {
        outLogger.info('socketIO: onsub ', symbol)
        symbol = symbol.toLowerCase();

        hbsdk.subMarketDepth({symbol}, (data) => {
            socket.send(data);
        });
        hbsdk.subMarketKline({symbol, period: CandlestickIntervalEnum.MIN1},  (data) => {
            socket.send(data);
        })
        hbsdk.subMarketTrade({symbol},  (data) => {
            socket.send(data);
        })
        // ws.sub(WS_SUB.kline(symbol, '1min'), socket.id);
        // ws.sub(WS_SUB.depth(symbol), socket.id);
        // ws.sub(WS_SUB.tradeDetail(symbol), socket.id);
        unSub = () => {
            if (!hbsdk.market_cache_ws) {
                return;
            }
            hbsdk.market_cache_ws.unSubFormClinet(WS_SUB.kline(symbol, '1min'), socket.id);
            hbsdk.market_cache_ws.unSubFormClinet(WS_SUB.depth(symbol), socket.id);
            hbsdk.market_cache_ws.unSubFormClinet(WS_SUB.tradeDetail(symbol), socket.id);
        }
    })
    socket.on("disconnect", (reason) => {
        unSub && unSub();
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
        if (!hbsdk.market_cache_ws) {
            return;
        }
        for (const key in hbsdk.market_cache_ws.cache) {
            if (!Object.prototype.hasOwnProperty.call(hbsdk.market_cache_ws.cache, key)) {
                return;
            }
            const ids = hbsdk.market_cache_ws.cache[key];
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

