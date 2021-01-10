
import { signature_V2 } from '../utils/signature';



export const WS_SUB_V2 = {

}
export const WS_REQ_V2 = {
    /**
     * 发送auth请求
     * @param ws
     */
    auth (accessKey: string, secretKey: string, WS_URL: string) {
        return {
            action: 'req',
            ch: "auth",
            params: {
                authType:"api",
                ...signature_V2('GET', WS_URL, accessKey, secretKey)
            }
        }
    },
    /**
     * 订阅账户变更
     */
    accounts (mode?: 1 | 2 | 0) {
        return {
            "action": "sub",
            "ch": "accounts.update"
        }
    },
}

