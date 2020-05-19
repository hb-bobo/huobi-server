import { EventEmitter } from 'events';
import WebSocket from "ws";
import { isOpen } from './utils';

export interface SocketteOptions {
    protocols?: string | string[];
    timeout?: number;
    maxAttempts?: number;
}
interface EventMap {
    open: (ev: WebSocket.OpenEvent) => any;
    message: (ev: WebSocket.MessageEvent) => any;
    reconnect: (ev: WebSocket.OpenEvent | WebSocket.CloseEvent) => any;
    maximum: (ev: WebSocket.CloseEvent) => any;
    close: (ev: WebSocket.CloseEvent) => any;
    error: (ev: WebSocket.ErrorEvent) => any;
}


export default class Sockette extends EventEmitter{
    public wss!: WebSocket;
    public num: number;
    public timer: NodeJS.Timeout | number;
    public max: number;
    public opts: Partial<SocketteOptions>;
    public url: string;
    constructor(url:string , opts: SocketteOptions = {}){
        super();
        this.url = url;
        this.opts = opts;
        this.num=0;
        this.timer=1;
        this.max = opts.maxAttempts || Infinity;
        this.open();
    }
    /**
     * @override
     */
    public emit = (event: keyof EventMap, ...arg: Parameters<EventMap[keyof EventMap]>) => {
        return super.emit(event, arg);
    };
    /**
     * @override
     */
    public on = (event: keyof EventMap, listener: (arg: Parameters<EventMap[keyof EventMap]>) => void) => {
        return super.on(event, listener);
    };
    public open =  () => {
		this.wss = new WebSocket(this.url, this.opts.protocols || []);

		this.wss.onmessage = (e) => {
            this.emit('message', e);
        };

		this.wss.onopen = (e) => {
			this.emit('open', e);
			this.num = 0;
		};

		this.wss.onclose =  (e) => {
			e.code === 1e3 || e.code === 1001 || e.code === 1005 || this.reconnect(e);
			this.emit('close', e);
		};

		this.wss.onerror =  (e) => {
			(e && e.type==='ECONNREFUSED') ? this.reconnect(e) : this.emit('error', e);
		};
	};

	public reconnect =  (e) => {
		if (this.timer && this.num++ < this.max) {
			this.timer = setTimeout( () => {
				this.emit('reconnect', e);
				this.open();
			}, this.opts.timeout || 1e3);
		} else {
            this.emit('maximum', e);
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
