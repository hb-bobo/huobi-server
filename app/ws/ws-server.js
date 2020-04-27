
const WebSocket = require('ws');
const WS_HUOBI = require('./ws-huobi');

class SocketServer{
    constructor({pathname = '/pathname'} = {}) {
        this.pathname = pathname;
        this.init();
    }
    init() {
        this.wss = new WebSocket.Server({ noServer: true});
        this.wss.on('connection', this.onConnection);
        this.handleUpgrade = this.handleUpgrade.bind(this);
    }
    /**
     *  Broadcast to all.
     * @param {object} data 
     */
    broadcast(data) {
        let subItem = WS_HUOBI.subscribe.subData[data.ch];
        if (subItem && Array.isArray(subItem.subscribers)) {
            subItem.subscribers.forEach(function (client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
        // WS_SERVER.clients.forEach(function (client) {
        //     if (client.readyState === WebSocket.OPEN) {
        //         client.send(JSON.stringify(data));
        //     }
        // });
    }
    /**
     * 
     * @param {WebSocket} ws 
     */
    onConnection(ws) {
        ws.on('message', function (message) {
            let msg = JSON.parse(message);
            let isOpen = ws.readyState === WebSocket.OPEN;
            if (!isOpen) {
                return;
            }
            switch(msg.type) {
                case 'sub':
                msg.from = 'client';
                WS_HUOBI.subscribe.sub(ws, msg);
                break;
                case 'unsub':
                msg.from = 'client';
                WS_HUOBI.subscribe.unsub(ws, msg);
                break;
                default:
                return;
            }
            if (msg.type === 'ws-huobi') {
                WS_HUOBI.call(msg);
            }
        });
        ws.on('close', function (err) {
            console.error('ws.close', err);
            WS_HUOBI.subscribe.unsub(ws);
        });
        ws.on('error', function (err) {
            console.error('ws.err', err);
            // openWS();
            // WS_HUOBI.setWSS(WS_SERVER);
            WS_HUOBI.subscribe.unsub(ws);
        });
    }
    /**
     * @param {http.IncomingMessage} request 
     * @param {net.Socket} socket 
     * @param {Buffer} head 
     */
    handleUpgrade (request, socket, head)  {
        const pathname = request.url;
        if (pathname === '/huobi') {
          this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request);
          });
        } else {
          console.log('destroy')
          // socket.destroy();
        }
    }
}

module.exports = new SocketServer();
