import { EventEmitter } from "events";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import JSONbig from "json-bigint";
import pako from "pako";
import { REST_URL, MARKET_WS, ACCOUNT_WS } from "./constant";
import { request, Options as HttpOptions } from "./utils/httpClient";
import { signature } from "./utils/signature";
import { Sockette } from "../sockette";

dayjs.extend(utc);

export interface HuobiSDKBaseOptions {
    accessKey: string;
    secretKey: string;
    /**
     * 自定义日志方法
     */
    errLogger?: (mssage: string, ...arg: any[]) => void;
    /**
     * 自定义日志方法
     */
    outLogger?: (mssage: string, ...arg: any[]) => void;
    /**
     * http相关设置
     */
    httpOptions?: HttpOptions;
    url?: {
        rest?: string;
        /**
         * 不需要签名
         */
        market_ws?: string;
        /**
         * 需要签名(默认使用V2)
         */
        account_ws?: string;
    };
    socket?: {
        timeout?: number;
        maxAttempts?: number;
    };
}
const SOCKET_CONFIG = {
    timeout: 1000 * 30,
    maxAttempts: 1
};
const DEFAUTL_HTTP_OPTIONS = {
    headers: {
        "Content-Type": "application/json",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
    },
    timeout: 6000
};

export class HuobiSDKBase extends EventEmitter {

    static market_ws?: Sockette;
    static account_ws?: Sockette;
    static market_ws_status?: 'creating' | 'created'
    static account_ws_status?: 'creating' | 'created'

    options: Required<HuobiSDKBaseOptions> = {} as Required<HuobiSDKBaseOptions>;
    constructor(options?: Partial<HuobiSDKBaseOptions>) {
        super();
        if (!options) {
            return;
        }
        this.setOptions(options);
    }
    setOptions  (options: Partial<HuobiSDKBaseOptions> = {})  {
        const {httpOptions, url, socket, ...otherOptions } = options;

        Object.assign(this.options, {
            httpOptions: {
                ...DEFAUTL_HTTP_OPTIONS,
                ...(httpOptions || {})
            },
            url: {
                rest: REST_URL,
                market_ws: MARKET_WS,
                account_ws: ACCOUNT_WS,
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
    _request = <T>(path: string, options: HttpOptions): Promise<T> => {

        return request<T>(path, {
            ...this.options.httpOptions,
            ...options
        })
            .then(data => {
                try {
                    const json = JSONbig.parse(data);
                    if (json.status === "ok") {
                        return json.data || json;
                    } else {
                        this.errLogger(options.method as string, "-", path, "服务错误", json['err-msg']);
                    }
                } catch (error) {
                    this.errLogger(options.method as string, "-", path, "解析异常", error);
                }
            })
            .catch(err => {
                this.errLogger(options.method as string, "-", path, "异常", err);
            });
    }
    request = <T>(path: string, options: HttpOptions): Promise<T> => {

        return this._request<T>(`${this.options.url.rest}${path}`, options);
    }
    auth_get = <T = any>(
        path: string,
        params: Record<string, any> = {} as Record<string, any>
    ) => {
        const PATH = `${this.options.url.rest}${path}`;
        const { accessKey, secretKey } = this.options;

        return this._request<T>(PATH, {
            method: "GET",
            searchParams: signature("GET", PATH, accessKey, secretKey, params)
        });
    }
    auth_post = <T = any>(path: string, data: Record<string, any>) => {
        const PATH = `${this.options.url.rest}${path}`;
        const { accessKey, secretKey } = this.options;
        return this._request<T>(PATH, {
            method: "POST",
            searchParams: signature("POST", PATH, accessKey, secretKey, data),
            json: data
        });
    }

    errLogger = (msg: string, ...arg: any[]) => {
        if (typeof this.options.errLogger === "function") {
            this.options.errLogger(msg, ...arg);
            return;
        }
        const prefix = `[${dayjs()
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm:ss")}] [ERROR] `;
        console.error(`${prefix} ${msg}`, ...arg);
    }
    outLogger = (msg: string, ...arg: any[]) => {
        if (typeof this.options.outLogger === "function") {
            this.options.outLogger(msg, ...arg);
            return;
        }
        const prefix = `[${dayjs()
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm:ss")}] [INFO] `;

        console.log(`${prefix} ${msg}`, ...arg);
    }
    createMarketWS() {

        if (HuobiSDKBase.market_ws) {
            return HuobiSDKBase.market_ws;
        }


        HuobiSDKBase.market_ws = new Sockette(this.options.url.market_ws as string, {
            ...this.options.socket
        });
        HuobiSDKBase.market_ws.on('open',  () => {
            this.emit('market_ws.open');
            this.outLogger(`${this.options.url.market_ws} open`);
        });
        HuobiSDKBase.market_ws.on("message", ev => {
            const text = pako.inflate(ev.data, {
                to: "string"
            });
            const msg = JSON.parse(text);

            if (msg.ping) {
                (HuobiSDKBase.market_ws as Sockette).json({
                    pong: msg.ping
                });
            } else if (msg.tick) {
                this.handleMarketWSMessage(msg);
            } else {
                this.outLogger(`market_ws: on message ${text}`);
            }
        });
        HuobiSDKBase.market_ws.on('close', (e) => {
            if (e.code === 1006) {
                this.errLogger(`market_ws closed:`, 'connect ECONNREFUSED');
            }
            else {
                this.errLogger(`market_ws closed:`, e.reason);
            }
        });
        HuobiSDKBase.market_ws.on('error', (e) => {
            this.errLogger(`market_ws  error: `, e.message);
        });
        return HuobiSDKBase.market_ws;
    }
    handleMarketWSMessage(msg) {
        if(!msg.ch) {
            return;
        }
        const [type, symbol, channel] = msg.ch.split('.');
        const commonData = {
            data: {
                ...msg.tick,
            },
            ch: msg.ch,
            channel: channel,
            symbol,
        }

        switch(channel) {
            case 'depth':
                this.emit('market.depth', commonData);
                break;
            case 'kline':
                this.emit('market.kline', commonData);
                break;
            case 'trade':
                this.emit('market.trade', commonData);
                break;
            default: return;
        }
    }
    createAccountWS() {
        if (HuobiSDKBase.account_ws) {
            return HuobiSDKBase.account_ws;
        }

        HuobiSDKBase.account_ws = new Sockette(this.options.url.account_ws as string, {
            ...this.options.socket
        });
        HuobiSDKBase.account_ws.on('open',  () => {
            this.emit('account_ws.open');
            this.outLogger(`${this.options.url.account_ws} open`);
        });
        HuobiSDKBase.account_ws.on("message", ev => {
            if (typeof ev.data !== 'string') {
                this.outLogger(`account_ws: !ev.data ${ev.data}`);
            }
            const msg = JSON.parse(ev.data as string);
            if (msg.action === 'ping') {
                (HuobiSDKBase.account_ws as Sockette).json({
                    action: "pong",
                    data: {
                        ts: msg.data.ts // 使用Ping消息中的ts值
                    }
                });
            } else if (msg.data) {
                this.handleAccountWSMessage(msg);
            } else {
                this.outLogger(`account_ws: on message ${JSON.stringify(msg)}`);
            }
        });
        HuobiSDKBase.account_ws.on('close', (e) => {
            if (e.code === 1006) {
                this.errLogger(`account_ws closed:`, 'connect ECONNREFUSED');
            }
            else {
                this.errLogger(`account_ws closed:`, e.reason);
            }
        });
        HuobiSDKBase.account_ws.on('error', (e) => {
            this.errLogger(`account_ws  error: `, e.message);
        });
        return HuobiSDKBase.account_ws;
    }
    handleAccountWSMessage(msg) {
        if(!msg.ch) {
            return;
        }
        const [channel] = msg.ch.split('#');
        switch(channel) {
            case 'auth':
                this.emit('auth', msg);
                break;
            case 'accounts.update':
                this.emit('accounts.update', msg.data);
                break;
            default:return;
        }
    }
}
