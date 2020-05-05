import config from 'config';
import CryptoJS from 'crypto-js';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import JSONbig from 'json-bigint';
import moment from 'moment';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'typings/global.app';
import url from 'url';
import { isNullOrUndefined } from 'util';
import {form_post, get, post} from '../../lib/http/httpClient';

const { api: BASE_URL} = config.get<AppConfig['huobi']>('huobi');
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
}
const timeout = 3000;

export function sign_sha( method: "GET" | "POST", cpath: string, secretkey, data) {
    const pars: string[] = [];
    const baseurl = url.parse(cpath).host;
    const path = url.parse(cpath).path;
    for (const item in data) {
        if (!isNullOrUndefined(data[item]) && data[item] !== '') {
            pars.push(item + "=" + encodeURIComponent(data[item]));
        }
    }
    let p = pars.sort().join("&");
    const meta = [method, baseurl, path, p].join('\n');
    // console.log(meta);
    const hash = HmacSHA256(meta, secretkey);
    const Signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
    // console.log(`Signature: ${Signature}`);
    p += `&Signature=${Signature}`;
    // console.log(p);
    return p;
}

function get_body(access_key: string) {
    return {
        AccessKeyId: access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: 2,
        Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    };
}

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
function call_post(path: string, payload, body, tip?: string){
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

export const hbsdk = {
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
        return call_get<Data[]>('/api/v1/contract_contract_info');
    },
    /** 获取合约指数信息 */
    contract_index(){
        return call_get('/api/v1/contract_index');
    },
    /**
     *  获取合约最高限价和最低限价
     */
    contract_price_limit(symbol: string) {
        return call_get('/api/v1/contract_price_limit?symbol=BTC&contract_type=this_week');
    },
    /**
     * 获取当前可用合约总持仓量
     */
    contract_open_interest() {
        return call_get('/api/v1/contract_open_interest');
    },
    /**
     * 获取用户账户信息
     */
    contract_account_info(params: {symbol: string}) {
        const body = Object.assign(get_body('access_key'), params);
        const path = `${BASE_URL}/api/v1/contract_account_info`;
        return call_post(
            path,
            sign_sha('POST', path, 'secretkey', body),
            body,
        );
    }
}