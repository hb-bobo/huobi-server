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

const CLOSE_CODE = 1e3;
const defaultOptions = {
    timeout: 1e3,
}
export default class Sockette extends EventEmitter {
    public wss!: WebSocket;
    public num: number;
    public timer: NodeJS.Timeout | number;
    public max: number;
    public opts: Partial<SocketteOptions> & typeof defaultOptions;
    public url: string;
    constructor(url: string, opts: SocketteOptions = {}) {
        super();
        this.url = url;
        this.opts = Object.assign({}, defaultOptions, opts);
        this.num = 0;
        this.timer = 1;
        this.max = opts.maxAttempts === undefined ? Infinity :  opts.maxAttempts;
        this.open();
    }
    /**
     * @override
     */
    public emit = <T extends keyof EventMap>(event: T, arg: Parameters<EventMap[T]>[0]) => {
        return super.emit(event, arg);
    };
    /**
     * @override
     */
    public on = <E extends keyof EventMap>(event: E, listener: (arg: Parameters<EventMap[E]>[0]) => void) => {
        return super.on(event, listener);
    };
    public open = () => {
        this.wss = new WebSocket(this.url, this.opts.protocols || []);


        this.wss.onmessage = (e) => {
            this.emit('message', e);
        };
        this.wss.onopen = (e) => {
            this.emit('open', e);
            this.num = 0;
        };

        this.wss.onclose = (e) => {
            if (e.code === CLOSE_CODE || e.code === 1001 || e.code === 1005) {
                this.reconnect(e);
            }
            this.emit('close', e);
        };

        this.wss.onerror = (e) => {
            (e && e.type === 'ECONNREFUSED') ? this.reconnect(e) : this.emit('error', e);
        };
    };

    public reconnect = (e) => {
        if (this.timer && this.num++ < this.max) {
            this.timer = setTimeout(() => {
                this.emit('reconnect', e);
                this.open();
            }, this.opts.timeout);
        } else {
            this.emit('maximum', e);
        }
    };

    public json = (message: Record<string, any>) => {
        this.send(JSON.stringify(message));
    };

    public send = (message: any) => {
        if (!this.isOpen()) {
            console.log('send', message)
            // this.emit('error', {
            //     error: 'error',
            //     message: 'ws is not opening',
            //     type: 'error',
            //     target: this.wss,
            // })
            return;
        }
        this.wss.send(message);
    };

    public close = (code = CLOSE_CODE, data?: any) => {
        if (!this.isOpen()) {
            return;
        }
        clearTimeout(this.timer as NodeJS.Timeout);
        this.timer = -1;
        this.wss.close(code, data);
    };
    public isOpen() {
        return this.wss && isOpen(this.wss);
    }
}
