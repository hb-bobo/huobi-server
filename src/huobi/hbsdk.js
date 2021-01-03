"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_hbsdk = exports.hbsdk_commom = exports.auth = exports.sign_sha = void 0;
const config_1 = __importDefault(require("config"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const querystring_1 = require("querystring");
// import HmacSHA256 from 'crypto-js/hmac-sha256';
const json_bigint_1 = __importDefault(require("json-bigint"));
const moment_1 = __importDefault(require("moment"));
const logger_1 = require("../common/logger");
const url_1 = __importDefault(require("url"));
const httpClient_1 = require("../lib/http/httpClient");
const { api: BASE_URL } = config_1.default.get('huobi');
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
};
const timeout = 3000;
/**
 * 签名计算
 * @param method
 * @param url
 * @param secretKey
 * @param data
 * @returns {*|string}
 */
function sign_sha(method, curl, secretKey, data) {
    const pars = [];
    const { host, pathname } = url_1.default.parse(curl);
    // 将参数值 encode
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            pars.push(`${key}=${encodeURIComponent(value)}`);
        }
    }
    // 排序 并加入&连接
    const p = pars.sort().join("&");
    // 在method, host, path 后加入\n
    const meta = [method, host, pathname, p].join('\n');
    // 用HmacSHA256 进行加密
    const hash = crypto_js_1.default.HmacSHA256(meta, secretKey);
    // 按Base64 编码 字符串
    const Signature = crypto_js_1.default.enc.Base64.stringify(hash);
    return Signature;
}
exports.sign_sha = sign_sha;
function auth(method, curl, access_key, secretKey, data = {}) {
    const timestamp = moment_1.default.utc().format('YYYY-MM-DDTHH:mm:ss');
    const body = {
        AccessKeyId: access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: "2.1",
        Timestamp: timestamp,
        ...data,
    };
    Object.assign(body, {
        Signature: sign_sha(method, curl, secretKey, body),
    });
    return body;
}
exports.auth = auth;
// function get_body(access_key: string) {
//     return {
//         AccessKeyId: access_key,
//         SignatureMethod: "HmacSHA256",
//         SignatureVersion: 2,
//         Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
//     };
// }
function call_get(path, queryObject) {
    if (queryObject) {
        path = path + '?' + new url_1.default.URLSearchParams(queryObject).toString();
    }
    return httpClient_1.get(path, {
        timeout,
        headers: DEFAULT_HEADERS
    }).then(data => {
        const json = json_bigint_1.default.parse(data);
        if (json.status === 'ok') {
            return json.data || json;
            // outLogger.info(outputStr);
        }
        else {
            logger_1.errLogger.error('调用错误', "-", path, "-", json.data);
        }
    }).catch(ex => {
        logger_1.errLogger.error('GET', '-', path, '异常', ex);
    });
}
function call_post(path, payload, body, tip) {
    const payloadPath = `${path}?${payload}`;
    return httpClient_1.post(payloadPath, body, {
        timeout,
        headers: DEFAULT_HEADERS
    }).then(data => {
        const json = json_bigint_1.default.parse(data);
        if (json.status === 'ok') {
            return json.data || json;
        }
        else {
            logger_1.errLogger.error('调用status' + json.status, json, "\r\n", tip, '......', path, "  结束\r\n");
        }
    }).catch(ex => {
        logger_1.errLogger.error("POST", '-', path, '异常', ex, tip);
    });
}
exports.hbsdk_commom = {
    getSymbols() {
        const path = `${BASE_URL}/v1/common/symbols`;
        return call_get(`${path}`);
        ;
    },
    getMarketHistoryKline(params) {
        const path = `${BASE_URL}/market/history/kline`;
        return call_get(`${path}`, params);
        ;
    },
};
function create_hbsdk({ accessKey, secretKey, account_id_pro } = {}) {
    return function () {
        function GET(path, params = {}) {
            return call_get(`${path}?${querystring_1.stringify(params)}&${auth('GET', path, accessKey, secretKey)}`);
            ;
        }
        function POST(path, data) {
            return call_post(path, auth('POST', path, accessKey, secretKey, data), data);
        }
        return {
            /** 获取账户信息 */
            get_account() {
                const path = `${BASE_URL}/v1/contract_account_info`;
                return GET(`${path}`);
                ;
            },
            /** 获取账户信息 */
            get_balance(account_id_pro) {
                const path = `${BASE_URL}/v1/account/accounts/${account_id_pro}/balance`;
                return GET(`${path}`);
                ;
            },
            /** 获取合约信息 */
            contract_contract_info() {
                return GET('/api/v1/contract_contract_info');
            },
            /** 获取合约指数信息 */
            contract_index() {
                return GET('/api/v1/contract_index');
            },
            /**
             *  获取合约最高限价和最低限价
             */
            contract_price_limit(symbol) {
                return GET('/api/v1/contract_price_limit?symbol=BTC&contract_type=this_week');
            },
            /**
             * 获取当前可用合约总持仓量
             */
            contract_open_interest() {
                return GET('/api/v1/contract_open_interest');
            },
            /**
             * 获取合约用户账户信息
             */
            contract_account_info(accessKey, secretKey, data) {
                const path = `${BASE_URL}/api/v1/contract_account_info`;
                return POST(path, data);
            }
        };
    };
}
exports.create_hbsdk = create_hbsdk;
