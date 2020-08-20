import config from 'config'
import { AppConfig } from 'ROOT/interface/App';
import { Period } from "ROOT/interface/Huobi"
import { auth_V2 } from './util';

const huobi = config.get<AppConfig['huobi']>('huobi');

export const WS_SUB = {

}
export const WS_REQ = {
    /**
     * 发送auth请求
     * @param ws
     */
    auth (accessKey: string, secretKey: string, data?: any) {
        return {
            action: 'req',
            ch: "auth",
            params: {
                authType:"api",
                ...auth_V2('GET', huobi.ws_url_prex, accessKey, secretKey, data)
            }
        }
    }
}

