
// const moment = require('moment');
const FCoin = require('node-fcoin');
const events = require('events');

const config = require('config')
const handleWS = require('./handler/handleWS')
const transformFcoinDepthData = require('./handler/transformFcoinDepthData')
const WS_SERVER = require('./ws-server')
const dbEvent = require('../db/event');
const Models = require('../models')

// 自定义事件
const fcoinEmitter = new events.EventEmitter();
exports.fcoinEmitter = fcoinEmitter;

let fcoin = null;


async function start() {
  const res = await Models.trade.api.get({user: 'hubo', exchange: 'fcoin'});
 
  if (!res) {
    return;
  }
  let api = res[0];
  fcoin = new FCoin({
      key: api.access_key,
      secret: api.secret_key,
  });
  
  fcoin.connectWebSocket();

  fcoin.subscribeDepth('btcusdt', 'L150');

  fcoin.on('ticker', data => {
    console.log(data);
    // fcoin.disconnectWebSocket();
  });
  fcoin.on('depth', data => {
    // const _data = {
    //   "type": "depth.L20.ethbtc",
    //   "ts": 1523619211000,
    //   "seq": 120,
    //   "bids": [0.000100000, 1.000000000, 0.000010000, 1.000000000],
    //   "asks": [1.000000000, 1.000000000]
    // }
    // console.log(data);
    // if (!data.bids) {
    //   return;
    // }
   
    let bids = transformFcoinDepthData(data.depth.bids);
    let asks = transformFcoinDepthData(data.depth.asks);
    console.log(bids, asks);
    handleWS({
      symbol: 'ftusdt',
      channel: 'depth',
      ts: data.ts,
      tick: {
        bids,
        asks,
      }
    });
    // fcoin.disconnectWebSocket();
  });
}
// start();
// dbEvent.once('dbstart', start);