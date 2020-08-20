import noop from 'lodash/noop';
import { errLogger, outLogger } from 'ROOT/common/logger';
import Sockette, { SocketteOptions } from '../lib/sockette/Sockette';

const defaultOptions = {
    timeout: 1000 * 60 * 2,
    maxAttempts: 1,
}
export function createWS (url: string, options: SocketteOptions = {}){
    const {
        ...mergeOptions
    } = {...options, ...defaultOptions};
    return new Sockette(url, {
        ...mergeOptions,
    });
} 
