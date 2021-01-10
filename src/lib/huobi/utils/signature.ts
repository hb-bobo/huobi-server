import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import url from 'url';

dayjs.extend(utc)

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
/**
 * 鉴权v2
 * @param method 
 * @param fullURL 
 * @param access_key 
 * @param secretKey 
 * @param data 
 */
export function signature(
    method: 'GET' | 'POST',
    fullURL: string,
    access_key: string,
    secretKey: string,
    data: Record<string, string> = {}
) {
    const timestamp = dayjs().utc().format('YYYY-MM-DDTHH:mm:ss');
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

/**
 * 鉴权v2.1版
 * @param method
 * @param curl
 * @param access_key
 * @param secretKey
 * @param data
 */
export function signature_V2(
    method: "GET" | "POST",
    curl: string,
    access_key: string,
    secretKey: string,
    data: Record<string, string> = {}
) {
    const timestamp = dayjs().utc().format('YYYY-MM-DDTHH:mm:ss');
    const body = {
        accessKey: access_key,
        signatureMethod: "HmacSHA256",
        signatureVersion: "2.1",
        timestamp: timestamp,
        ...data
    };
    Object.assign(body, {
        signature: signatureSHA(method, curl, secretKey, body)
    });
    return body;
}
