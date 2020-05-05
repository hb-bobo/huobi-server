import noop from 'lodash/noop';
import WebSocket, { OpenEvent } from "ws";
import { isOpen } from './utils';

export interface SocketteOptions {
    protocols?: string | string[];
    timeout?: number;
    maxAttempts?: number;
    onopen?: (this: Sockette, ev: WebSocket.OpenEvent) => any;
    onmessage?: (this: Sockette, ev: WebSocket.MessageEvent) => any;
    onreconnect?: (this: Sockette, ev: WebSocket.OpenEvent | WebSocket.CloseEvent) => any;
    onmaximum?: (this: Sockette, ev: WebSocket.CloseEvent) => any;
    onclose?: (this: Sockette, ev: WebSocket.CloseEvent) => any;
    onerror?: (this: Sockette, ev: WebSocket.ErrorEvent) => any;
}

export default class Sockette{
    public wss!: WebSocket;
    public num: number;
    public timer: NodeJS.Timeout | number;
    public max: number;
    public opts: Partial<SocketteOptions>;
    public url: string;
    constructor(url:string , opts: SocketteOptions = {}){
        this.url = url;
        this.opts = opts;
        this.num=0;
        this.timer=1;
        this.max = opts.maxAttempts || Infinity;
        this.open();
    }
    public open =  () => {
		this.wss = new WebSocket(this.url, this.opts.protocols || []);

		this.wss.onmessage = this.opts.onmessage || noop;

		this.wss.onopen = (e) => {
			(this.opts.onopen || noop)(e);
			this.num = 0;
		};

		this.wss.onclose =  (e) => {
			e.code === 1e3 || e.code === 1001 || e.code === 1005 || this.reconnect(e);
			(this.opts.onclose || noop)(e);
		};

		this.wss.onerror =  (e) => {
			(e && e.type==='ECONNREFUSED') ? this.reconnect(e) : (this.opts.onerror || noop)(e);
		};
	};

	public reconnect =  (e) => {
		if (this.timer && this.num++ < this.max) {
			this.timer = setTimeout( () => {
				(this.opts.onreconnect || noop)(e);
				this.open();
			}, this.opts.timeout || 1e3);
		} else {
			(this.opts.onmaximum || noop)(e);
		}
	};

	public json = (x) => {
        if (!this.isOpen()) {
            return;
        }
        this.wss.send(JSON.stringify(x));
	};

	public send =  (x) => {
        if (!this.isOpen()) {
            return;
        }
        this.wss.send(x);
	};

	public close =  (x, y)  => {
        if (!this.isOpen()) {
            return;
        }
        clearTimeout(this.timer as NodeJS.Timeout);
        this.timer = -1;
		this.wss.close(x || 1e3, y);
    };
    public isOpen() {
        return this.wss && isOpen(this.wss);
    }
}
