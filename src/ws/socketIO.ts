import socket from 'socket.io';

export const socketIO = socket({
    path: '/socket-io',
    serveClient: false,
});
