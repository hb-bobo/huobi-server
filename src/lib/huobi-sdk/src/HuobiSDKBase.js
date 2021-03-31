"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiSDKBase = void 0;
const events_1 = require("events");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const json_bigint_1 = __importDefault(require("json-bigint"));
const pako_1 = __importDefault(require("pako"));
const constant_1 = require("./constant");
const httpClient_1 = require("./utils/httpClient");
const signature_1 = require("./utils/signature");
const sockett_1 = require("sockett");
dayjs_1.default.extend(utc_1.default);
const SOCKET_CONFIG = {
    timeout: 1000 * 30,
    maxAttempts: 1
};
const DEFAUTL_HTTP_OPTIONS = {
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
    },
    timeout: 6000
};
class HuobiSDKBase extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.options = {};
        this._request = (path, options) => {
            return httpClient_1.request(path, {
                ...this.options.httpOptions,
                ...options
            })
                .then(data => {
                try {
                    const json = json_bigint_1.default.parse(data);
                    if (json.status === "ok") {
                        return json.data || json;
                    }
                    else {
                        this.errLogger(options.method, "-", path, json['err-msg'] || json['err_msg'] || json);
                    }
                }
                catch (error) {
                    this.errLogger(options.method, "-", path, "Parse Error", error);
                }
            })
                .catch(err => {
                this.errLogger(options.method, "-", path, err);
            });
        };
        this.request = (path, options) => {
            if (!this.options.url.rest) {
                return Promise.reject('未设置options.url.rest');
            }
            return this._request(`${this.options.url.rest}${path}`, options);
        };
        this.auth_get = (path, params = {}) => {
            if (!this.options.url.rest) {
                return Promise.reject('未设置options.url.rest');
            }
            const PATH = `${this.options.url.rest}${path}`;
            const { accessKey, secretKey } = this.options;
            return this._request(PATH, {
                method: "GET",
                searchParams: signature_1.signature("GET", PATH, accessKey, secretKey, params)
            });
        };
        this.auth_post = (path, data) => {
            const PATH = `${this.options.url.rest}${path}`;
            const { accessKey, secretKey } = this.options;
            return this._request(PATH, {
                method: "POST",
                searchParams: signature_1.signature("POST", PATH, accessKey, secretKey, data),
                json: data
            });
        };
        this.auth_get_contract = (path, params = {}) => {
            if (!this.options.url.contract) {
                return Promise.reject('未设置options.url.contract');
            }
            const PATH = `${this.options.url.contract}${path}`;
            const { accessKey, secretKey } = this.options;
            return this._request(PATH, {
                method: "GET",
                searchParams: signature_1.signature("GET", PATH, accessKey, secretKey, params)
            });
        };
        this.auth_post_contract = (path, data) => {
            const PATH = `${this.options.url.contract}${path}`;
            const { accessKey, secretKey } = this.options;
            return this._request(PATH, {
                method: "POST",
                searchParams: signature_1.signature("POST", PATH, accessKey, secretKey, data),
                json: data
            });
        };
        this.errLogger = (msg, ...arg) => {
            if (typeof this.options.errLogger === "function") {
                this.options.errLogger(msg, ...arg);
                return;
            }
            const prefix = `[${dayjs_1.default()
                .utcOffset(8)
                .format("YYYY-MM-DD HH:mm:ss")}] [ERROR] `;
            console.error(`${prefix} ${msg}`, ...arg);
        };
        this.outLogger = (msg, ...arg) => {
            if (typeof this.options.outLogger === "function") {
                this.options.outLogger(msg, ...arg);
                return;
            }
            const prefix = `[${dayjs_1.default()
                .utcOffset(8)
                .format("YYYY-MM-DD HH:mm:ss")}] [INFO] `;
            console.log(`${prefix} ${msg}`, ...arg);
        };
        if (!options) {
            return;
        }
        this.setOptions(options);
    }
    setOptions(options = {}) {
        const { httpOptions, url, socket, ...otherOptions } = options;
        Object.assign(this.options, {
            httpOptions: {
                ...DEFAUTL_HTTP_OPTIONS,
                ...(httpOptions || {})
            },
            url: {
                rest: constant_1.REST_URL,
                market_ws: constant_1.MARKET_WS,
                account_ws: constant_1.ACCOUNT_WS,
                ...(url || {})
            },
            socket: {
                ...(socket || {}),
                ...SOCKET_CONFIG
            },
        });
        if (otherOptions) {
            Object.assign(this.options, otherOptions);
        }
    }
    createMarketWS() {
        if (HuobiSDKBase.market_ws) {
            return HuobiSDKBase.market_ws;
        }
        HuobiSDKBase.market_ws = new sockett_1.Sockett(this.options.url.market_ws, {
            ...this.options.socket
        });
        HuobiSDKBase.market_ws.on('open', () => {
            this.emit('market_ws.open');
            this.outLogger(`${this.options.url.market_ws} open`);
        });
        HuobiSDKBase.market_ws.on("message", ev => {
            const text = pako_1.default.inflate(ev.data, {
                to: "string"
            });
            const msg = JSON.parse(text);
            if (msg.ping) {
                HuobiSDKBase.market_ws.json({
                    pong: msg.ping
                });
            }
            else if (msg.tick) {
                this.handleMarketWSMessage(msg);
            }
            else {
                this.outLogger(`market_ws: on message ${text}`);
            }
        });
        HuobiSDKBase.market_ws.on('close', (e) => {
            if (e.code === 1006) {
                this.outLogger(`market_ws closed:`, 'connect ECONNREFUSED');
            }
            else {
                this.outLogger(`market_ws closed:`, e.reason, ` code ${e.code}`);
            }
        });
        HuobiSDKBase.market_ws.on('error', (e) => {
            this.outLogger(`market_ws  error: `, e.message);
        });
        return HuobiSDKBase.market_ws;
    }
    handleMarketWSMessage(msg) {
        if (!msg.ch) {
            return;
        }
        const [type, symbol, channel, other] = msg.ch.split('.');
        const commonData = {
            data: {
                ...msg.tick,
            },
            ch: msg.ch,
            channel: channel,
            symbol,
        };
        switch (channel) {
            case 'depth':
                this.emit(`market.${symbol}.depth.${other}`, commonData);
                break;
            case 'kline':
                this.emit(`market.${symbol}.kline.${other}`, commonData);
                break;
            case 'trade':
                this.emit(`market.${symbol}.trade.${other}`, commonData);
                break;
            default: return;
        }
    }
    createAccountWS() {
        if (HuobiSDKBase.account_ws) {
            return HuobiSDKBase.account_ws;
        }
        HuobiSDKBase.account_ws = new sockett_1.Sockett(this.options.url.account_ws, {
            ...this.options.socket
        });
        HuobiSDKBase.account_ws.on('open', () => {
            this.emit('account_ws.open');
            this.outLogger(`${this.options.url.account_ws} open`);
        });
        HuobiSDKBase.account_ws.on("message", ev => {
            if (typeof ev.data !== 'string') {
                this.outLogger(`account_ws: !ev.data ${ev.data}`);
            }
            const msg = JSON.parse(ev.data);
            if (msg.action === 'ping') {
                HuobiSDKBase.account_ws.json({
                    action: "pong",
                    data: {
                        ts: msg.data.ts // 使用Ping消息中的ts值
                    }
                });
            }
            else if (msg.data) {
                this.handleAccountWSMessage(msg);
            }
            else {
                this.outLogger(`account_ws: on message ${JSON.stringify(msg)}`);
            }
        });
        HuobiSDKBase.account_ws.on('close', (e) => {
            if (e.code === 1006) {
                this.outLogger(`account_ws closed:`, 'connect ECONNREFUSED');
            }
            else {
                this.outLogger(`account_ws closed:`, e.reason, ` code ${e.code}`);
            }
        });
        HuobiSDKBase.account_ws.on('error', (e) => {
            this.outLogger(`account_ws  error: `, e.message);
        });
        return HuobiSDKBase.account_ws;
    }
    createFuturesWS() {
        if (HuobiSDKBase.futures_ws) {
            return HuobiSDKBase.futures_ws;
        }
        HuobiSDKBase.futures_ws = new sockett_1.Sockett(this.options.url.futures_ws, {
            ...this.options.socket
        });
        HuobiSDKBase.futures_ws.on('open', () => {
            this.emit('futures_ws.open');
            this.outLogger(`${this.options.url.futures_ws} open`);
        });
        HuobiSDKBase.futures_ws.on("message", ev => {
            if (typeof ev.data !== 'string') {
                this.outLogger(`futures_ws: !ev.data ${ev.data}`);
            }
            const msg = JSON.parse(ev.data);
            if (msg.action === 'ping') {
                HuobiSDKBase.futures_ws.json({
                    action: "pong",
                    data: {
                        ts: msg.data.ts // 使用Ping消息中的ts值
                    }
                });
            }
            else if (msg.data) {
                this.handleAccountWSMessage(msg);
            }
            else {
                this.outLogger(`futures_ws: on message ${JSON.stringify(msg)}`);
            }
        });
        HuobiSDKBase.futures_ws.on('close', (e) => {
            if (e.code === 1006) {
                this.outLogger(`futures_ws closed:`, 'connect ECONNREFUSED');
            }
            else {
                this.outLogger(`futures_ws closed:`, e.reason, ` code ${e.code}`);
            }
        });
        HuobiSDKBase.futures_ws.on('error', (e) => {
            this.outLogger(`futures_ws  error: `, e.message);
        });
        return HuobiSDKBase.futures_ws;
    }
    handleAccountWSMessage(msg) {
        if (!msg.ch) {
            return;
        }
        const [channel] = msg.ch.split('#');
        switch (channel) {
            case 'auth':
                this.emit('auth', msg);
                break;
            case 'accounts.update':
                this.emit('accounts.update', msg.data);
                break;
            default: return;
        }
    }
}
exports.HuobiSDKBase = HuobiSDKBase;
