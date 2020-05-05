import noop from 'lodash/noop';
import { errLogger, outLogger } from 'ROOT/common/logger';
import Sockette, { SocketteOptions } from './sockette';

const defaultOptions = {
    timeout: 1000 * 60 * 2,
    maxAttempts: 20,
    onopen: noop,
    onmessage: noop,
    onreconnect: noop,
    onmaximum: noop,
    onclose: noop,
    onerror: noop,
}
export function createWS (url: string, options: SocketteOptions){
    const {
        onopen,
        onmessage,
        onreconnect,
        onmaximum,
        onclose,
        onerror,
        ...mergeOptions
    } = {...options, ...defaultOptions};
    return new Sockette(url, {
        ...mergeOptions,
        onopen: (e) => {
            onopen(e);
            outLogger.info(`socket opened: ${url}`);
        },
        onmessage: (e) => {
            onmessage(e);
        },
        onreconnect: (e) => {
            onreconnect(e);
            // outLogger.info('');
        },
        onmaximum: (e) => {
            onmaximum(e);
        },
        onclose: (e) => {
            onclose(e);
            outLogger.info(`socket closed: ${e}`);
        },
        onerror: (e) => {
            onerror(e);
            errLogger.info(`socket[${url}] error: ${e}`);
        },
    });
} 
