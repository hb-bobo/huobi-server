const quoteCurrencyList = ['btc', 'eth', 'usdt', 'ht'];
/**
 * 获取结算单位
 * @param {string} symbol
 * @return { 'btc' | 'eth' | 'usdt' | 'ht' }  
 */
const getQuoteCurrency = function (symbol) {
    let index = -1;
    for (let i = 0; i < quoteCurrencyList.length; i++) {
        const element = quoteCurrencyList[i];
        if (symbol.endsWith(element)) {
            index = i;
            break;
        }
    }
    return quoteCurrencyList[index];
}
module.exports = getQuoteCurrency;