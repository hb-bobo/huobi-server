import socket from 'socket.io';
import { outLogger } from 'ROOT/common/logger';
/**
 * 与客户端的socket
 */
export const socketIO = socket({
    path: '/socket.io',
    serveClient: false,
});
socketIO.on('connection', function (socket) {

    // 发送单个
    // socket.send( 'sss')
    // 发送所有连接
    // socketIO.sockets.emit('event', 'xxx')
    outLogger.info(`socket connected: ${socket.id}`);
});
// socketIO.on('')