
import config from 'config';
import CryptoJS from 'crypto-js';
// import HmacSHA256 from 'crypto-js/hmac-sha256';
import JSONbig from 'json-bigint';
import moment from 'moment';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'ROOT/interface/App';
import url from 'url';

import { get, post } from 'ROOT/lib/http/httpClient';
import { BalanceItem, Period } from './interface';

// const { api: BASE_URL } = config.get<AppConfig['huobi']>('huobi');
const BASE_URL = 'https://api.huobi.de.com'
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
export function signatureSHA(
    method: 'GET' | 'POST',
    fullURL: string,
    secretKey: string,
    data?: Record<string, any>
): string {
    const pars: string[] = [];
    const { host, pathname } = url.parse(fullURL);

    // 将参数值 encode
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
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

export function auth(
    method: 'GET' | 'POST',
    fullURL: string,
    access_key: string,
    secretKey: string,
    data: Record<string, string> = {}
) {
    const timestamp = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
    const body = {
        AccessKeyId: access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: "2",
        Timestamp: timestamp,
        ...data,
    }

    Object.assign(body, {
        Signature: signatureSHA(method, fullURL, secretKey, body),
    });
    return body;
}


function call_get<T = any>(path: string, queryObject?: Record<string, any>): Promise<T> {
 
    if (queryObject) {
        path = path + '?' + new url.URLSearchParams(queryObject).toString()
    }
 
    return get(path, {
        timeout,
        headers: DEFAULT_HEADERS
    }).then(data => {
        try {
            const json = JSONbig.parse(data);
            if (json.status === 'ok') {
                return json.data || json;
            } else {
                errLogger.error('GET', "-", path, "错误", data);
            }
        } catch (error) {
            errLogger.error('GET', "-", path, "解析异常", error);
        }
        
    }).catch(ex => {
        errLogger.error('GET', '-', path, '异常', ex);
    });
}
function call_post<T>(path: string, payload: Record<string, any>, body: Record<string, any>, tip?: string): Promise<T> {
    let payloadPath = `${path}?${payload}`;
    if (payload) {
        payloadPath = payloadPath + '?' + new url.URLSearchParams(payload).toString()
    }
    return post(payloadPath, body, {
        timeout,
        headers: DEFAULT_HEADERS
    }).then(data => {
        const json = JSONbig.parse(data);
        if (json.status === 'ok') {
            return json.data || json;
        } else {
            errLogger.error('POST -', path, json, "\r\n", tip);
        }
    }).catch(ex => {
        errLogger.error("POST", '-', path, '异常', ex, tip);
    });
}

interface Options {
    accessKey: string;
    secretKey: string;
}

export const hbsdk_commom = {
   
    getSymbols() {
        const path = `${BASE_URL}/v1/common/symbols`;
        return call_get<any[]>(`${path}`);
    },
    getMarketHistoryKline(symbol: string, period?: Period, size?: number) {
        const path = `${BASE_URL}/market/history/kline`;
        return call_get<any[]>(`${path}`, {
            symbol,
            period,
            size,
        });
    },
}
export function create_hbsdk({ accessKey, secretKey }: Options = {} as Options) {

    function GET<T = any>(path: string, params: Record<string, any> = {} as Record<string, any>) {
        return call_get<T>(
            `${BASE_URL}${path}`,
            auth('GET', `${BASE_URL}${path}`, accessKey, secretKey, params)
        );
    }
    function POST<T = any>(path: string, body: Record<string, any>) {
        return call_post<T>(
            `${BASE_URL}${path}`,
            auth('POST', `${BASE_URL}${path}`, accessKey, secretKey, body),
            body,
        );
    }
    let account_id_pro = ''
    return {

        /** 获取账户信息 */
        get_account() {
            const path = `/v1/account/accounts`;

            return GET(`${path}`).then((data) => {
                data.forEach(item => {
                    if (item.type === 'spot') {
                        account_id_pro = item.id;
                    }
                })
            });
        },
        /** 获取账户信息 */
        get_balance() {
            const path = `/v1/account/accounts/${account_id_pro}/balance`;
            return GET<{list: BalanceItem[]}>(`${path}`);
        },
            /**
         * 查询当前未成交订单
         */
        get_open_orders  ({
            symbol = '',
            side = null, // “buy”或者“sell”
            size = 20
        }) {
            
            const path = `/v1/order/openOrders`;
            return GET(path, {
                symbol,
                side, // “buy”或者“sell”
                size
            });
        },
        /**
         * 历史订单
         * @param {string} symbol 
         */
        get_orders (symbol) {
            const path = `/v1/order/history`;
            return GET(path, {
                symbol,
                states: 'filled,partial-filled,canceled'
            });
        },
        get_order (order_id) {
            const path = `/v1/order/orders/${order_id}`;
            return GET(path);
        },
        order ({
            symbol,
            type = 'buy-limit',
            amount,
            price,
        }) {
            const path = '/v1/order/orders/place'
            return POST(path, {
                "account-id": account_id_pro,
                symbol,
                type,
                amount,
                price,
            })

        },
        /**
         * 取消订单
         */
        cancelOrder: function(orderId) {
            const path = `/v1/order/orders/${orderId}/submitcancel`;
            return POST(path, {
                account_id_pro,
            })
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
        contract_index() {
            return GET('/api/v1/contract_index');
        },
        /**
         *  获取合约最高限价和最低限价
         */
        contract_price_limit(symbol: string) {
            return GET(`/api/v1/contract_price_limit?symbol=${symbol}&contract_type=this_week`);
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
        contract_account_info(symbol: string) {
            const path = `/api/v1/contract_account_info`;
            return POST( path, {symbol: symbol});
        }
    }

}
