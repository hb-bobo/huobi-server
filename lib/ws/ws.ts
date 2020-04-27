
import * as events from 'events';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import WebSocket from 'ws';
import { outLogger } from '../../app/common/logger';

export class SocketServer extends events.EventEmitter{
    public pathname: string;
    public wss!: WebSocket.Server;
    constructor({pathname = '/ws'} = {}) {
        super();
        this.pathname = pathname;
        this.init();
    }
    public init() {
        this.wss = new WebSocket.Server({ noServer: true});
        this.wss.on('connection', this.onConnection);
        this.handleUpgrade = this.handleUpgrade.bind(this);
    }
    /**
     *  Broadcast to all.
     * @param {object} data 
     */
    public broadcast(data: any) {
        this.wss.clients.forEach(function (client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
    /**
     * 
     * @param {WebSocket} ws 
     */
    public onConnection(ws: WebSocket) {
        // const self = this;
        ws.on('message', function (message: string) {
            const msg = JSON.parse(message);
            const isOpen = ws.readyState === WebSocket.OPEN;
            if (!isOpen) {
                return;
            }
            
            switch(msg.type) {
                case 'sub':
                // self.listeners['']
                break;
                case 'unsub':
                msg.from = 'client';
                break;
                default:
                return;
            }
        });
        ws.on('close', function (err: Error) {
            outLogger.error('ws.close', err);
        });
        ws.on('error', function (err: Error) {
            outLogger.error('ws.err', err);
        });
    }
    /**
     * @param {http.IncomingMessage} request 
     * @param {net.Socket} socket 
     * @param {Buffer} head 
     */
    public handleUpgrade (request: IncomingMessage, socket: Socket, head: Buffer)  {
        const pathname = request.url;
        if (pathname === '/ws') {
          this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request);
          });
        } else {
          outLogger.log('destroy')
        }
    }
}

