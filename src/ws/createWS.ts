import noop from 'lodash/noop';
import { errLogger, outLogger } from 'ROOT/common/logger';
import Sockette, { SocketteOptions } from './sockette';

const defaultOptions = {
    timeout: 1000 * 60 * 2,
    maxAttempts: 20,
}
export function createWS (url: string, options: SocketteOptions = {}){
    const {
        ...mergeOptions
    } = {...options, ...defaultOptions};
    return new Sockette(url, {
        ...mergeOptions,
    });
} 
