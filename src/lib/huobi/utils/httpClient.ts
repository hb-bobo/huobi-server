import http from 'http';
import got, { Headers, Method } from 'got';

export interface Options {
    timeout?: number;
    headers?: Headers;
    method?: Method;
    json?: Record<string, any>;
    searchParams?: Record<string, any>;
}



const DEFAULT_HEADER = {
    'content-type': 'application/json;charset=utf-8',
}
const keepAliveAgent = new http.Agent({ keepAlive: true, maxSockets: 256 });


export const request = async function <T>(url, options: Options = {}) {
    const response = await got<T>(url, {
        method: options.method,
        timeout: options.timeout || 6000,
        headers: options.headers || DEFAULT_HEADER,
        agent: keepAliveAgent,
        json: options.json,
        responseType: 'json'
    })
    if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.body;
    }
    if (response.statusMessage) {
        throw Error(response.statusMessage);
    }
};
