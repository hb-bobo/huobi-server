import config from 'config'
import CryptoJS from 'crypto-js';
import moment from "moment"
import { auth, sign_sha } from 'ROOT/huobi/hbsdk';
import { Period } from "ROOT/interface/Huobi"
import { AppConfig } from "typings/global.app"


const huobi = config.get<AppConfig['huobi']>('huobi');

export const ws_sub = {
    /**
     * k线订阅
     * @param param0
     */
    kline (symbol: string, period: Period = '1min') {
        return {
            "sub": `market.${symbol}.kline.${period}`,
            "id": `sub_${symbol}_${period}`
        }
    },
    /**
     *  订阅 Market Detail 数据
     * @param symbol 
     */
    marketDetail(symbol: string) {
        return{
            "sub": `market.${symbol}.detail`,
            "id": `sub_${symbol}`
        }
    },
    /**
     * 交易数据
     * @param symbol
     */
    tradeDetail(symbol: string) {
        return {
            "sub": `market.${symbol}.trade.detail`,
            "id": `sub_${symbol}`
        }
    }
}
export const ws_req = {
    /**
     * 请求 KLine 数据
     * @param param0
     */
    kline (symbol: string, period: Period = '1min') {
        return {
            "req": `market.${symbol}.kline.${period}`,
            "id": `req_${symbol}_${period}`
        }
    },
    /**
     *  请求 Trade Detail 数据
     * @param symbol 
     */
    marketDetail(symbol: string) {
        return{
            "req": `market.${symbol}.detail`,
            "id": `req_${symbol}`
        }
    }
}


/**
 * 发送auth请求
 * @param ws
 */
export function ws_auth(accessKey: string, data?: any) {
    return {
        op: 'auth',
        ...auth('GET', huobi.ws_url_prex, accessKey, data)
    }
}
