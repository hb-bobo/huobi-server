"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const utils_1 = require("./utils");
const CLOSE_CODE = 1e3;
const defaultOptions = {
    timeout: 1e3,
};
class Sockette extends events_1.EventEmitter {
    constructor(url, opts = {}) {
        super();
        /**
         * @override
         */
        this.emit = (event, arg) => {
            return super.emit(event, arg);
        };
        /**
         * @override
         */
        this.on = (event, listener) => {
            return super.on(event, listener);
        };
        this.open = () => {
            this.wss = new ws_1.default(this.url, this.opts.protocols || []);
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
        this.reconnect = (e) => {
            if (this.timer && this.num++ < this.max) {
                this.timer = setTimeout(() => {
                    this.emit('reconnect', e);
                    this.open();
                }, this.opts.timeout);
            }
            else {
                this.emit('maximum', e);
            }
        };
        this.json = (message) => {
            if (!this.isOpen()) {
                return;
            }
            this.wss.send(JSON.stringify(message));
        };
        this.send = (message) => {
            if (!this.isOpen()) {
                return;
            }
            this.wss.send(message);
        };
        this.close = (code = CLOSE_CODE, data) => {
            if (!this.isOpen()) {
                return;
            }
            clearTimeout(this.timer);
            this.timer = -1;
            this.wss.close(code, data);
        };
        this.url = url;
        this.opts = Object.assign({}, defaultOptions, opts);
        this.num = 0;
        this.timer = 1;
        this.max = opts.maxAttempts === undefined ? Infinity : opts.maxAttempts;
        this.open();
    }
    isOpen() {
        return this.wss && utils_1.isOpen(this.wss);
    }
}
exports.default = Sockette;
