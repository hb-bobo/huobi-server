
import config from 'config';
import CryptoJS from 'crypto-js';
import { stringify } from 'querystring';
// import HmacSHA256 from 'crypto-js/hmac-sha256';
import JSONbig from 'json-bigint';
import moment from 'moment';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'ROOT/interface/App.ts';
import url from 'url';

import {form_post, get, post} from 'ROOT/lib/http/httpClient';

const { api: BASE_URL} = config.get<AppConfig['huobi']>('huobi');
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
}
const timeout = 3000;

/**
 * 签名计算
 * @param method
 * @param url
 * @param secretKey
 * @param data
 * @returns {*|string}
 */
export function sign_sha(method: 'GET' | 'POST', curl: string,  secretKey: string, data?: Record<string, any>): string {
    const pars: string[] = [];
    const { host, pathname } = url.parse(curl);
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
    const hash = CryptoJS.HmacSHA256(meta, secretKey);
    // 按Base64 编码 字符串
    const Signature = CryptoJS.enc.Base64.stringify(hash);

    return Signature;
}

export function auth(method: 'GET' | 'POST', curl: string,  access_key: string, secretKey: string, data: Record<string, string> = {}) {
    const timestamp = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
    const body = { 
        AccessKeyId: access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: "2.1",
        Timestamp: timestamp,
        ...data,
    }
    Object.assign(body,  {
        Signature: sign_sha(method, curl, secretKey, body),
    });
    return body;
}
// function get_body(access_key: string) {
//     return {
//         AccessKeyId: access_key,
//         SignatureMethod: "HmacSHA256",
//         SignatureVersion: 2,
//         Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
//     };
// }

function call_get<T>(path: string, tip?: string): Promise<T>{
    return get(path, {
        timeout,
        headers: DEFAULT_HEADERS
    }).then(data => {
        const json = JSONbig.parse(data);
        if (json.status === 'ok') {
            return json.data || json;
            // outLogger.info(outputStr);
        } else {
            errLogger.error('调用错误', tip, "-", path, "-", json.data);
        }
    }).catch(ex => {
        errLogger.error('GET', '-', path, '异常', ex, tip);
    });
}
function call_post<T>(path: string, payload, body, tip?: string): Promise<T>{
    const payloadPath = `${path}?${payload}`;
    return post(payloadPath, body, {
            timeout,
            headers: DEFAULT_HEADERS
        }).then(data => {
            const json = JSONbig.parse(data);
            if (json.status === 'ok') {
                return json.data || json;
            } else {
                errLogger.error('调用status'+ json.status, json, "\r\n", tip, '......', path, "  结束\r\n");
            }
        }).catch(ex => {
            errLogger.error("POST", '-', path,  '异常', ex, tip);
        });
}

interface Options {
    accessKey: string;
    secretKey: string;
    account_id_pro: string;
}

export const hbsdk_commom = {
    getSymbols: function() {
        const path = `${BASE_URL}/v1/common/symbols`;
        return call_get<any[]>(`${path}`);;
    },
}
export function create_hbsdk({accessKey, secretKey, account_id_pro}: Options = {} as Options) {

    return function () {
        function GET<T>(path: string, params: Record<string, any> = {} as Record<string, any>) {
            return call_get<T>(`${path}?${stringify(params)}&${auth('GET', path, accessKey, secretKey)}`);;
        }
        function POST<T>(path: string, data) {
            return call_post<T>(
                path,
                auth('POST', path, accessKey, secretKey, data),
                data,
            );
        }
        return {
            
            /** 获取账户信息 */
            get_account() {
                const path = `${BASE_URL}/v1/contract_account_info`;
                return GET(`${path}`);;
            },
            /** 获取账户信息 */
            get_balance(account_id_pro: string) {
                const path = `${BASE_URL}/v1/account/accounts/${account_id_pro}/balance`;
                return GET(`${path}`);;
            },
            /** 获取合约信息 */
            contract_contract_info() {
                interface Data {
                    "symbol": string,
                    "contract_code": string,
                    "contract_type": string,
                    "contract_size": number,
                    "price_tick": number,
                    "delivery_date": string,
                    "create_date": string,
                    "contract_status": number
                }
                return GET<Data[]>('/api/v1/contract_contract_info');
            },
            /** 获取合约指数信息 */
            contract_index(){
                return GET('/api/v1/contract_index');
            },
            /**
             *  获取合约最高限价和最低限价
             */
            contract_price_limit(symbol: string) {
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
            contract_account_info(accessKey: string, secretKey: string, data: {symbol: string}) {
        
                const path = `${BASE_URL}/api/v1/contract_account_info`;
                return POST(
                    path,
                    data,
                );
            }
        }
    }
}
