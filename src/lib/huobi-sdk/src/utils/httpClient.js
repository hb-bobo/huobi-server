"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const got_1 = __importDefault(require("got"));
const DEFAULT_HEADER = {
    'content-type': 'application/json;charset=utf-8',
};
const keepAliveAgent = new http_1.default.Agent({ keepAlive: true, maxSockets: 256 });
const keepAliveAgent2 = new https_1.default.Agent({ keepAlive: true, maxSockets: 256 });
const request = async function (url, options = {}) {
    const response = await got_1.default(url, {
        method: options.method,
        timeout: options.timeout || 6000,
        headers: options.headers || DEFAULT_HEADER,
        agent: {
            http: keepAliveAgent,
            https: keepAliveAgent2,
        },
        json: options.json,
        searchParams: options.searchParams,
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.body;
    }
    if (response.statusMessage) {
        throw Error(response.statusMessage);
    }
};
exports.request = request;
