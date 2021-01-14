import http from 'http';
import https from 'https';
import got, { Headers, Method } from 'got';
// import HttpAgent from 'agentkeepalive';
// const { HttpsAgent } = HttpAgent;

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
const keepAliveAgent2 = new https.Agent({ keepAlive: true, maxSockets: 256 });


export const request = async function <T>(url, options: Options = {}) {
    const response = await got<T>(url, {
        method: options.method,
        timeout: options.timeout || 6000,
        headers: options.headers || DEFAULT_HEADER,
        agent: {
            http: keepAliveAgent,
            https: keepAliveAgent2,
        },
        json: options.json,
        searchParams: options.searchParams,
        // responseType: 'json',
    })
    if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.body;
    }
    if (response.statusMessage) {
        throw Error(response.statusMessage);
    }
};
