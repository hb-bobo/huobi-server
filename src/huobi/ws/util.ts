import moment from "moment";
import { sign_sha } from "../hbsdk";

/**
 * 鉴权v2.1版
 * @param method 
 * @param curl 
 * @param access_key 
 * @param secretKey 
 * @param data 
 */
export function auth_V2(method: 'GET' | 'POST', curl: string,  access_key: string, secretKey: string, data: Record<string, string> = {}) {
    const timestamp = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
    const body = { 
        accessKey: access_key,
        signatureMethod: "HmacSHA256",
        signatureVersion: "2.1",
        timestamp: timestamp,
        ...data,
    }
    Object.assign(body,  {
        signature: sign_sha(method, curl, secretKey, body),
    });
    return body;
}
