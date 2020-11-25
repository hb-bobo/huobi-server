
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
    /**
     * 订阅行为会缓存起来
     * @param data
     */
    async sub(data: {sub: string, id: string}, id?: string) {
        this.json(data);
        const _id = id ? id : 'system';
        const dataStr = JSON.stringify(data);
        if (this.cache[dataStr]) {
            const subscribers = this.cache[dataStr];
            // 订阅
            if (!subscribers.includes(_id)) {
                subscribers.push(_id)
            }
        } else {
            this.cache[dataStr] = [_id];
        }
        console.log(data, this.cache)
    }
    /**
     * 退阅行为会删除缓存
     * @param data
     */
    async upsub(data: {unsub: string, id: string}, id?: string) {
        this.json(data);
        const _id = id ? id : 'system';
        const dataStr = JSON.stringify(data);
        if (this.cache[dataStr]) {
            const subscribers = this.cache[dataStr];
            const index = subscribers.findIndex((subscriberId) => subscriberId === _id);
            // 订阅
            if (index > -1) {
                subscribers.slice(index, 1);
            }
        }
        console.log(data, this.cache)
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
