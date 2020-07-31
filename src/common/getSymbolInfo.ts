// import { create_hbsdk } from "ROOT/huobi/hbsdk";

// create_hbsdk
// 有问题的symbols 或者不需要监控的symbols
const errorSymbols = [ 
    'venusdt',
    'mtxbtc',
    'venbtc',
    'mdsbtc',
    'ekobtc',
    'evxbtc',
    'saltbtc',
    'gxcbtc',
    'bixbtc',
    'bixusdt',
    'bt1btc',
    'bt2btc',
    'bkbtbtc',
    'ucbtc',
    'hotbtc',
    'zjltbtc',
    'cdcbtc' 
]
;
// 缓存结果
export let _symbols = [];

/**
 * @return { Promise<object[]>}
 */
export const getSymbols = async function() {
    if (_symbols.length > 0) {
        return _symbols;
    }
    _symbols = await hbsdk.getSymbols().then((data) => {
        return data.filter((item) => {
            if (errorSymbols.includes(item.symbol)) {
                return false;
            }
            return true;
        })
    });
    return _symbols;
}


/**
 * 根据symbol获取精度，base-currency, quote-currency
 * @param {string} symbol
 * @param {object} symbol 
 */
export const getSymbolInfo = function (symbol: string) {
    if(!symbol) {
        throw Error(`param error`);
    }
    let info = {
        'price-precision': 4,
        'amount-precision': 4,
    };
    // let _symbols = await getSymbols();
    _symbols.some((item) => {
        // base-currency:"yee"
        // price-precision:8
        // quote-currency:"eth"
        if (
            symbol.startsWith(item['base-currency']) 
            && symbol.endsWith(item['quote-currency'])
        ) {
            info['price-precision'] = item['price-precision'];
            info['amount-precision'] = item['amount-precision'];
            info['base-currency'] = item['base-currency'];
            info['quote-currency'] = item['quote-currency'];
            return true;
        }
        return false;
    });
    return info;
}