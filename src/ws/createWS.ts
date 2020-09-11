import noop from 'lodash/noop';
import { errLogger, outLogger } from 'ROOT/common/logger';
import Sockette, { SocketteOptions } from '../lib/sockette/Sockette';

const defaultOptions = {
    timeout: 1000 * 30,
    maxAttempts: 1,
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
    return new Sockette(url, {
        ...mergeOptions,
    });
} 
