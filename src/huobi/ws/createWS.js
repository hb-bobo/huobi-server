"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHuobiWS = exports.HuobiSockette = void 0;
const Sockette_1 = __importDefault(require("../../lib/sockette/Sockette"));
const defaultOptions = {
    timeout: 1000 * 30,
    maxAttempts: 1,
};
class HuobiSockette extends Sockette_1.default {
    constructor() {
        super(...arguments);
        this.cache = {};
    }
    reStart() {
        this.open();
        this.on('open', () => {
            const list = Object.keys(this.cache);
            list.forEach((str) => {
                this.json(JSON.parse(str));
            });
        });
    }
    checkCache() {
        for (const key in this.cache) {
            if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
                const subscribers = this.cache[key];
                if (subscribers.length === 0) {
                    this.json({ unsub: key, id: key });
                    delete this.cache[key];
                }
            }
        }
    }
    /**
     * 订阅行为会缓存起来
     * @param data
     */
    async sub(data, id) {
        const _id = id ? id : 'system';
        const dataStr = data.sub;
        if (this.cache[dataStr]) {
            const subscribers = this.cache[dataStr];
            // 订阅
            if (!subscribers.includes(_id)) {
                subscribers.push(_id);
            }
        }
        else {
            // 没有才发送消息
            this.json(data);
            this.cache[dataStr] = [_id];
        }
    }
    /**
     * 退阅行为会删除缓存
     * @param data
     */
    async upsub(data, id) {
        if (data.unsub === undefined) {
            data.unsub = data.sub;
        }
        const _id = id ? id : 'system';
        const dataStr = (data.unsub);
        if (this.cache[dataStr]) {
            const subscribers = this.cache[dataStr];
            const index = subscribers.findIndex((subscriberId) => subscriberId === _id);
            // 订阅
            if (index > -1) {
                subscribers.slice(index, 1);
                this.checkCache();
            }
            else {
                // 没有才发送消息
                this.json(data);
            }
        }
    }
    /**
     * 退阅行为会删除缓存
     * @param data
     */
    async unSubFormClinet(data, id) {
        if (data.sub) {
            data.unsub = data.sub;
            delete data.sub;
            // this.json(data);
        }
        const _id = id;
        for (const key in this.cache) {
            if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
                const subscribers = this.cache[key];
                const index = subscribers.findIndex((subscriberId) => subscriberId === _id);
                // 订阅
                if (index > -1) {
                    subscribers.slice(index, 1);
                }
            }
        }
        this.checkCache();
    }
}
exports.HuobiSockette = HuobiSockette;
/**
 * 与火币服务器的ws(原生ws)
 * @param url
 * @param options
 */
function createHuobiWS(url, options = {}) {
    const { ...mergeOptions } = { ...options, ...defaultOptions };
    return new HuobiSockette(url, {
        ...mergeOptions,
    });
}
exports.createHuobiWS = createHuobiWS;
