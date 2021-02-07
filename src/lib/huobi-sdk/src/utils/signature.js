"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signature_V2 = exports.signature = exports.signatureSHA = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const dayjs_1 = __importDefault(require("dayjs"));
const url_1 = __importDefault(require("url"));
/**
 * 签名计算
 * @param method
 * @param url
 * @param secretKey
 * @param data
 * @returns {*|string}
 */
function signatureSHA(method, fullURL, secretKey, data) {
    const pars = [];
    const { host, pathname } = url_1.default.parse(fullURL);
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
    const hash = crypto_js_1.default.HmacSHA256(meta, secretKey);
    // 按Base64 编码 字符串
    const Signature = crypto_js_1.default.enc.Base64.stringify(hash);
    return Signature;
}
exports.signatureSHA = signatureSHA;
/**
 * 鉴权v2
 * @param method
 * @param fullURL
 * @param access_key
 * @param secretKey
 * @param data
 */
function signature(method, fullURL, access_key, secretKey, data = {}) {
    const timestamp = dayjs_1.default().utc().format('YYYY-MM-DDTHH:mm:ss');
    const body = {
        AccessKeyId: access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: "2",
        Timestamp: timestamp,
        ...data
    };
    Object.assign(body, {
        Signature: signatureSHA(method, fullURL, secretKey, body),
    });
    return body;
}
exports.signature = signature;
/**
 * 鉴权v2.1版
 * @param method
 * @param curl
 * @param access_key
 * @param secretKey
 * @param data
 */
function signature_V2(method, curl, access_key, secretKey, data = {}) {
    const timestamp = dayjs_1.default().utc().format('YYYY-MM-DDTHH:mm:ss');
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
exports.signature_V2 = signature_V2;
