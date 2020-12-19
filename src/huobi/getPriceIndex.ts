import symbolPrice from "./price";

export const prices = {
    btc: 5200,
    eth: 172,
    ht: 2.4,
}

/**
 * 获取btc eth对usdt的系数
 * @param {string} symbol
 * @return {number}
 */
export default function getPriceIndex (symbol: string) {
    // btc eth交易对转美元
    let _temp = {
        usdt: 1,
        btc: symbolPrice.get('btc'),
        eth: symbolPrice.get('eth'),
        ht: symbolPrice.get('ht'),
        husd: 1,
    }
    let _price: number = 0;
    for (let key in _temp) {
        if (symbol.endsWith(key)) {
            _price = _temp[key];
            break;
        }
    }
    return _price - 0;
}
