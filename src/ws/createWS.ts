import noop from 'lodash/noop';
import { errLogger, outLogger } from 'ROOT/common/logger';
import Sockette, { SocketteOptions } from 'ROOT/lib/sockette/Sockette';
import { KEY_MAP, redis } from 'ROOT/db/redis';

const defaultOptions = {
    timeout: 1000 * 30,
    maxAttempts: 1,
}

export class HuobiSockette extends Sockette{
    /**
     * 订阅行为会缓存起来
     * @param data
     */
    async sub(data: {sub: string, id: string}) {
        this.json(data);
        const dataStr = JSON.stringify(data);
        const cache = await redis.hget(KEY_MAP["ws-sub"], data.sub)
        // 订阅
        if (!cache) {
            redis.hset(KEY_MAP["ws-sub"], data.sub, dataStr)
        }
    }
    /**
     * 退阅行为会删除缓存
     * @param data 
     */
    async upsub(data: {unsub: string, id: string}) {
        this.json(data);
        const dataStr = JSON.stringify(data);
        const cache = await redis.hdel(KEY_MAP["ws-sub"], data.unsub)
    }
}
/**
 * 与火币服务器的ws(原生ws)
 * @param url
 * @param options 
 */
export function createWS (url: string, options: SocketteOptions = {}){
    const {
        ...mergeOptions
    } = {...options, ...defaultOptions};
    return new HuobiSockette(url, {
        ...mergeOptions,
    });
} 
