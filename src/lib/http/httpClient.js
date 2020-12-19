"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.form_post = exports.post = exports.get = void 0;
const request_1 = __importDefault(require("request"));
const logger_1 = require("../../common/logger");
const DEFAULT_HEADER = {
    'content-type': 'application/json;charset=utf-8',
};
const agentOptions = {
    keepAlive: true,
    maxSockets: 256,
};
exports.get = function (url, options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        const httpOptions = {
            url,
            method: 'get',
            timeout: options.timeout || 3000,
            headers: options.headers || DEFAULT_HEADER,
            proxy: options.proxy || '',
            agentOptions
        };
        request_1.default.get(httpOptions, function (err, res, body) {
            if (err) {
                reject(err);
            }
            else {
                if (res.statusCode === 200) {
                    resolve(body);
                }
                else {
                    reject(res.statusCode);
                }
            }
        }).on('error', logger_1.errLogger.error);
    });
};
exports.post = function (url, postdata, options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        const httpOptions = {
            url,
            body: JSON.stringify(postdata),
            method: 'post',
            timeout: options.timeout || 3000,
            headers: options.headers || DEFAULT_HEADER,
            proxy: options.proxy || '',
            agentOptions
        };
        request_1.default(httpOptions, function (err, res, body) {
            if (err) {
                reject(err);
            }
            else {
                if (res.statusCode === 200) {
                    resolve(body);
                }
                else {
                    reject(res.statusCode);
                }
            }
        }).on('error', logger_1.errLogger.error);
    });
};
exports.form_post = function (url, postdata, options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        const httpOptions = {
            url,
            form: postdata,
            method: 'post',
            timeout: options.timeout || 3000,
            headers: options.headers || DEFAULT_HEADER,
            proxy: options.proxy || '',
            agentOptions
        };
        request_1.default(httpOptions, function (err, res, body) {
            if (err) {
                reject(err);
            }
            else {
                if (res.statusCode === 200) {
                    resolve(body);
                }
                else {
                    reject(res.statusCode);
                }
            }
        }).on('error', logger_1.errLogger.error);
    });
};
