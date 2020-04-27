var config = require('config');
var CryptoJS = require('crypto-js');
// var Promise = require('bluebird');
var moment = require('moment');
var HmacSHA256 = require('crypto-js/hmac-sha256')
var http = require('../httpClient');

const URL_HUOBI_PRO = 'api.huobi.br.com';
// const URL_HUOBI_PRO = 'api.huobi.pro'; //备用地址
let secretkey = config.huobi.secretkey;


exports.setSecretkey = function(val) {
    secretkey = val;
}

const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
}

function get_auth() {
    var sign = config.huobi.trade_password + 'hello, moto';
    var md5 = CryptoJS.MD5(sign).toString().toLowerCase();
    let ret = encodeURIComponent(JSON.stringify({
        assetPwd: md5
    }));
    return ret;
}

function sign_sha(method, baseurl, path, data) {
    var pars = [];
    for (let item in data) {
        if (data[item] !== '') {
            pars.push(item + "=" + encodeURIComponent(data[item]));
        }
    }
    var p = pars.sort().join("&");
    var meta = [method, baseurl, path, p].join('\n');
    // console.log(meta);
    var hash = HmacSHA256(meta, config.huobi.secretkey);
    var Signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
    // console.log(`Signature: ${Signature}`);
    p += `&Signature=${Signature}`;
    // console.log(p);
    return p;
}

function get_body() {
    return {
        AccessKeyId: config.huobi.access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: 2,
        Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    };
}

function call_api(method, path, payload, body) {
    return new Promise((resolve, reject) => {
        var account_id = config.huobi.account_id_pro;
        var url = `https://${URL_HUOBI_PRO}${path}?${payload}`;
        var headers = DEFAULT_HEADERS;
        headers.AuthData = get_auth();

        if (method == 'GET') {
            http.get(url, {
                headers: headers
            }).then(data => {
                let json = JSON.parse(data);
                if (json.status == 'ok') {
                    // console.log(json.data);
                    resolve(json.data || json);
                } else {
                    console.error(method, path, '调用错误', json);
                    reject(json);
                }
            }).catch(ex => {
                console.error(method, path, '异常', ex);
                reject({
                    code: ex,
                    status: 'err'
                });
                // reject(ex);
            });
        } else if (method == 'POST') {
            http.post(url, body, {
                timeout: 15000,
                headers: headers
            }).then(data => {
                let json = JSON.parse(data);
                if (json.status == 'ok') {
                    // console.log(json.data);
                    resolve(json.data);
                } else {
                    console.error(url, ` 调用错误`, json);
                    reject(json);
                }
            }).catch(ex => {
                console.error(method, path, '异常', ex);
                reject(ex);
            });
        }
    });
}

var HUOBI_PRO = {
    get_account: function() {
        var path = `/v1/account/accounts`;
        var body = get_body();
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    get_balance: function() {
        var account_id = config.huobi.account_id_pro;
        var path = `/v1/account/accounts/${account_id}/balance`;
        var body = get_body();
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    /**
     * 历史订单
     * @param {string} symbol 
     */
    get_orders: function(symbol) {
        var path = `/v1/order/history`;
        var body = get_body();
        body.symbol = symbol;
        body.states = 'filled,partial-filled,canceled';
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    get_order: function(order_id) {
        var path = `/v1/order/orders/${order_id}`;
        var body = get_body();
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    /**
     * 查询当前未成交订单
     */
    get_open_orders: function ({
        symbol = '',
        side = null, // “buy”或者“sell”
        size = 20
    }) {
        
        var path = `/v1/order/openOrders`;
        var body = get_body();
        
        body["account-id"] = config.huobi.account_id_pro;
        body.symbol = symbol;
        if (side) {
            body.side = side;
        }
        body.size = size;
        
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    /**
     * 获取k线
     */
    getMarketHistoryKline: function ({
        symbol = '',
        period = '1day', // 	1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
        size = 10
    }) {
        
        var path = `/market/history/kline`;
        var body = get_body();
        body["account-id"] = config.huobi.account_id_pro;
        body.symbol = symbol;
        body.period = period;
        body.size = size;
        
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    getMarketDepth: function({
        symbol = '',
        type = 'step0'
    }) {
        var path = `/market/depth`;
        var body = get_body();
        body["account-id"] = config.huobi.account_id_pro;
        body.symbol = symbol;
        body.type = type;
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    getSymbols: function() {
        var path = `/v1/common/symbols`;
        var body = get_body();
        body["account-id"] = config.huobi.account_id_pro;
        var payload = sign_sha('GET', URL_HUOBI_PRO, path, body);
        return call_api('GET', path, payload, body);
    },
    buy_limit: function(params) {
        var path = '/v1/order/orders/place';
        var body = get_body();
        var payload = sign_sha('POST', URL_HUOBI_PRO, path, body);
        body["account-id"] = config.huobi.account_id_pro;
        body.type = params.type || 'buy-limit';
        body.amount = params.amount;
        body.symbol = params.symbol;
        if (params.price) {
            body.price = params.price;
        }
        
        return call_api('POST', path, payload, body);
    },
    sell_limit: function(params) {
        var path = '/v1/order/orders/place';
        var body = get_body();
        var payload = sign_sha('POST', URL_HUOBI_PRO, path, body);
        body["account-id"] = config.huobi.account_id_pro;
        body.type = params.type || "sell-limit";
        body.amount = params.amount;
        body.symbol = params.symbol;
        if (params.price) {
            body.price = params.price;
        }

        return call_api('POST', path, payload, body);
    },
    /**
     * 取消订单
     */
    cancelOrder: function(orderId) {
        var path = `/v1/order/orders/${orderId}/submitcancel`;
        var body = get_body();
        var payload = sign_sha('POST', URL_HUOBI_PRO, path, body);
        body["account-id"] = config.huobi.account_id_pro;

        return call_api('POST', path, payload, body);
    },
    
    withdrawal: function(address, coin, amount, payment_id) {
        var path = `/v1/dw/withdraw/api/create`;
        var body = get_body();
        var payload = sign_sha('POST', URL_HUOBI_PRO, path, body);

        body.address = address;
        body.amount = amount;
        body.currency = coin;
        if (coin.toLowerCase() == 'xrp') {
            if (payment_id) {
                body['addr-tag'] = payment_id;
            } else {
                console.log('huobi withdrawal', coin, 'no payment id provided, cancel withdrawal');
                return Promise.resolve(null);
            }
        }

        return call_api('POST', path, payload, body);
    }
}

module.exports = HUOBI_PRO;