
import { signature } from '../utils/signature';
import { Period } from '../interface'
import { CandlestickIntervalEnum } from '../constant';



export const WS_SUB = {
    /**
     * k线订阅
     * @param param0
     */
    kline (symbol: string, period: CandlestickIntervalEnum) {
        return {
            "sub": `market.${symbol}.kline.${period}`,
            "id": `sub_${symbol}_${period}`
        }
    },
    /**
     * 市场深度行情数据
     * @param symbol 
     */
    depth(symbol: string, step = 'step0') {
        return {
            "sub": `market.${symbol}.depth.${step}`,
            "id": `sub_${symbol}_${step}`
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
export const WS_REQ = {
    auth(accessKey: string, secretKey: string, WS_URL: string) {
        return {
            op: 'auth',
            ...signature('GET', WS_URL, accessKey, secretKey)
        }
    },
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

