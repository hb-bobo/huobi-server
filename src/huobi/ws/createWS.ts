
import noop from 'lodash/noop';
import { errLogger, outLogger } from 'ROOT/common/logger';
import Sockette, { SocketteOptions } from 'ROOT/lib/sockette/Sockette';

const defaultOptions = {
    timeout: 1000 * 30,
    maxAttempts: 1,
}

export class HuobiSockette extends Sockette{
    cache: Record<string, string[]> = {};
    reStart() {
        this.open()
        this.on('open', () => {
            const list = Object.keys(this.cache);
            list.forEach((str) => {
                this.json(JSON.parse(str))
            })
        })
    }
    checkCache() {
        for (const key in this.cache) {
            if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
                const subscribers = this.cache[key];
                if (subscribers.length === 0) {
                    outLogger.info('checkCache', {unsub: key, id: key})
                    this.json({unsub: key, id: key})
                    delete this.cache[key];
                }
            }
        }
    }
    /**
     * 订阅行为会缓存起来
     * @param data
     */
    async sub(data: {sub: string, id: string}, id?: string) {

        const _id = id ? id : 'system';
        const dataStr = data.sub;
        if (this.cache[dataStr]) {
            const subscribers = this.cache[dataStr];
            // 订阅
            if (!subscribers.includes(_id)) {
                subscribers.push(_id);
            }
        } else {
            // 没有才发送消息
            this.json(data);
            this.cache[dataStr] = [_id];
        }
    }
    /**
     * 退阅行为会删除缓存
     * @param data
     */
    async upsub(data: {sub?: string, unsub?: string, id: string}, id?: string) {
        if (data.unsub === undefined) {
            data.unsub = data.sub;
        }
        const _id = id ? id : 'system';
        const dataStr: string = (data.unsub) as string;
        if (this.cache[dataStr]) {
            const subscribers = this.cache[dataStr];
            const index = subscribers.findIndex((subscriberId) => subscriberId === _id);
            // 订阅
            if (index > -1) {
                subscribers.slice(index, 1);
                this.checkCache();
            } else {
                // 没有才发送消息
                this.json(data);
            }
        }
    }
    /**
     * 退阅行为会删除缓存
     * @param data
     */
    async unSubFormClinet(data, id: string) {
        if (data.sub) {
            data.unsub = data.sub
            delete data.sub
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
/**
 * 与火币服务器的ws(原生ws)
 * @param url
 * @param options
 */
export function createHuobiWS (url: string, options: SocketteOptions = {}){
    const {
        ...mergeOptions
    } = {...options, ...defaultOptions};
    return new HuobiSockette(url, {
        ...mergeOptions,
    });
}
