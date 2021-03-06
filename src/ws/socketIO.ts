import socket from 'socket.io';
import { outLogger } from 'ROOT/common/logger';
import { ws_event } from 'ROOT/huobi/events';
import { hbsdk } from 'ROOT/huobi/hbsdk';
import { CandlestickIntervalEnum } from 'node-huobi-sdk';

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

        const unSubMarketDepth = hbsdk.subMarketDepth({symbol, id: socket.id});
        const unSubMarketKline = hbsdk.subMarketKline({symbol, period: CandlestickIntervalEnum.MIN5, id: socket.id});
        const unsubMarketTrade = hbsdk.subMarketTrade({symbol, id: socket.id});
        // ws.sub(WS_SUB.kline(symbol, '1min'), socket.id);
        // ws.sub(WS_SUB.depth(symbol), socket.id);
        // ws.sub(WS_SUB.tradeDetail(symbol), socket.id);
        unSub = () => {
            // unSubMarketDepth();
            // unSubMarketKline();
            // unsubMarketTrade();
        }
    })
    socket.on("disconnect", (reason) => {
        unSub && unSub();
        delete sockets[socket.id];
    });
    // 发送单个
    // socket.send( 'sss')
    // 发送所有连接1
    // socketIO.sockets.emit('event', 'xxx')
    outLogger.info(`socket connected: ${socket.id}`);
});
ws_event.on("server:ws:message", function(data) {

    if (data.data && data.data.symbol) {
    
        if (!hbsdk.market_cache_ws) {
            return;
        }    
        socketIO.sockets.send(data);
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

