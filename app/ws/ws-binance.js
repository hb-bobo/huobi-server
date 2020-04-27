
// const moment = require('moment');
const WebSocket = require('ws');
const handleWS = require('./handler/handleWS');
const WS_SERVER = require('./ws-server');
const WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@depth';
var symbols = [];

// var WS_SERVER = null;
var WS_HUOBI = null;
let ws_huobi_ping = 0;
let ws_huobi_pre_ping = 0;
/* 是否打开状态 */
function isOpen (ws = WS_HUOBI) {
    return  ws !== null && ws.readyState === WebSocket.OPEN;
};
/* 是否关闭状态 */
function isClosed (ws = WS_HUOBI) {
    return  ws === null || (ws !== null && ws.readyState === WebSocket.CLOSED);
};

function setWSS (ws) {
    if (WS_SERVER === null) {
        WS_SERVER = ws;
    }
}
exports.setWSS = setWSS;

/**
 * 
 * @param {WebSocket} ws 
 * @param {Object} data 
 */
function broadcast(ws, data) {
    // if (isOpen(ws)) {
    //     ws.broadcast(data);
    //     return;
    // }
    
    handleWS(data);
    // console.log(data)
}

/* 处理返回的数据 */
function handle(data) {
    let symbol = data.ch.split('.')[1];
    let channel = data.ch.split('.')[2];

    switch (channel) {
        case 'depth':
            broadcast(WS_SERVER, {
                type: 'WS_HUOBI',
                tick: data.tick,
                symbol: symbol,
                channel: channel,
            });
            break;
        case 'kline':
            broadcast(WS_SERVER, {
                type: 'WS_HUOBI',
                kline: data.tick,
                symbol: symbol,
                channel: channel,
            });
            break;
        case 'trade':
            broadcast(WS_SERVER, {
                type: 'WS_HUOBI',
                trade: data.tick,
                symbol: symbol,
                channel: channel,
            });
            break;
    }
}

// 订阅过的缓存起来
const subscribeList = [];
/**
 * 订阅数据
 * @param {Objetc} msg 
 */
function call(msg) {
    let action = msg.value;
    let symbol = msg.symbol;
    if (symbol && !symbols.includes(symbol)) {
        symbols.push(symbol);
    }
    console.log('action', msg);
    if (action && action.indexOf('subscribe') > -1) {
        if (!isOpen()) {
            broadcast(WS_SERVER, {
                type: 'WS_HUOBI',
                status: 'error',
                msg: 'WS_HUOBI 没有打开',
            });
            return;
        }
        let index = subscribeList.findIndex((o) => o.value === action);
        if (index === -1) {
            subscribeList.push(msg);
        }
    }

    switch(action) {
        case 'reset':
            reset();
        case 'open':
            open().catch(console.error);
            break;
        case 'close':
            close().catch(console.error);
            break;
        case 'subscribeDepth':    
            // 订阅深度
            // 谨慎选择合并的深度，ws每次推送全量的深度数据，若未能及时处理容易引起消息堆积并且引发行情延时
            for (let symbol of symbols) {
                WS_HUOBI.send(JSON.stringify({
                    "sub": `market.${symbol}.depth.step0`,
                    "id": `${symbol}`
                }));
            }
            break;
        case 'subscribeKline':
            // 订阅K线
            for (let symbol of symbols) {
                WS_HUOBI.send(JSON.stringify({
                    "sub": `market.${symbol}.kline.1min`,
                    "id": `${symbol}`
                }));
            }
            break;
        case 'subscribeTrade':
            // 买卖成交量
            try {
                WS_HUOBI.send(JSON.stringify({
                    "sub": `market.${msg.symbol}.trade.detail`,
                    "id": `${msg.symbol}`
                })); 
            } catch (error) {
                console.log(error)
            }
            break;
    }
}
exports.call = call;
/**
 * 初始化 WS_HUOBI
 * @return {Promise}  
 */
function init(fn) {
    return new Promise(function (resolve, reject) {
        WS_HUOBI = new WebSocket(WS_URL);
        WS_HUOBI.on('message', (data) => {
            console.log(data)
            let msg = JSON.parse(data);

            if (msg.ping) {
                if (isOpen()) {
                    WS_HUOBI.send(JSON.stringify({
                        pong: msg.ping
                    }));
                }
                ws_huobi_ping = msg.ping;
            } else if (msg.tick || msg.data) {
                handle(msg);
             } else if (msg.status === 'error') {
                console.log(msg);
            } else {
                console.log('text', text);
            }
        });
        WS_HUOBI.on('open', () => {
            resolve(true);
            console.log('WS_HUOBI.open');
        });
        WS_HUOBI.on('close', () => {
            console.log('huobi.close');
            setTimeout(() => {
                reset();
            }, 100);
        });
        WS_HUOBI.on('error', err => {
            console.log('WS_HUOBI', err)
            broadcast(WS_SERVER, {
                type: 'WS_HUOBI',
                status: 'error',
                msg: err,
            });
            reject(err);
            reset();
        });
    }); 
}
exports.init = init;

/**
 * @return {Promise}
 */
const open = function () {
    return new Promise(function (resolve, reject) {
        if (!isClosed()) {
            resolve();
            return;
        }
        init().then(() => {
            broadcast(WS_SERVER, {
                type: 'WS_HUOBI',
                status: 'ok',
                msg: 'WS_HUOBI open'
            });
            resolve();
        }).catch(err => {
            reject(err);
            console.log('open:err', err)
        });
    });
};
exports.open = open;
/**
 * @return {Promise}
 */
const close = function () {
    return new Promise(function (resolve, reject) {
        if (!isOpen()) {
            setTimeout(() => {
                resolve({});
            }, 100);
            return;
        }
        WS_HUOBI.on('close', () => {
            console.log('WS_HUOBI.close');
            broadcast(WS_SERVER, {
                type: 'WS_HUOBI',
                status: 'ok',
                msg: 'WS_HUOBI closed',
            });
            resolve({});
        });
        WS_HUOBI.close();
    });
};
exports.close = close;

function reset() {
    console.log('huobi.reset')
    close().then(() => {
        symbols.length = 0;
        open()
        .then(() => {
            if (subscribeList) {
                setTimeout(() => {
                    subscribeList.forEach(action => {
                        exports.call(action);
                    });
                });
            }
        })
        .catch(console.error);
    }).catch(console.error);
    
}
exports.reset = reset;


// 心跳检测
// setInterval(function () {
//     if (ws_huobi_ping === ws_huobi_pre_ping) {
//         reset();
//     } else {
//         ws_huobi_pre_ping = ws_huobi_ping;
//     }
// }, 1000 * 60 * 30);
