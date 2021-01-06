"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth_V2 = void 0;
const moment_1 = __importDefault(require("moment"));
const hbsdk_1 = require("../hbsdk");
/**
 * 鉴权v2.1版
 * @param method
 * @param curl
 * @param access_key
 * @param secretKey
 * @param data
 */
function auth_V2(method, curl, access_key, secretKey, data = {}) {
    const timestamp = moment_1.default.utc().format('YYYY-MM-DDTHH:mm:ss');
    const body = {
        accessKey: access_key,
        signatureMethod: "HmacSHA256",
        signatureVersion: "2.1",
        timestamp: timestamp,
        ...data,
    };
    Object.assign(body, {
        signature: hbsdk_1.sign_sha(method, curl, secretKey, body),
    });
    return body;
}
exports.auth_V2 = auth_V2;
