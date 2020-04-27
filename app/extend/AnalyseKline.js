
const moment = require('moment')
const AbnormalMonitor = require('./AbnormalMonitor');
const { CalculateMA } = require('./CalculateMA');
const Models = require('../models')
const utils = require('../utils')

function parseConfig (data, keys) {
  if (!data) {
    console.error('parseConfig data 不存在');
    return {};
  }
  keys.forEach(function(key) {
    if (typeof data[key] === 'string') {    
      data[key] = JSON.parse(data[key]);
    }
  });
}
/**
 * 分析kline
 */
class AnalyseKline {
  constructor({
    symbol = '',
    config = {},
    callback = () => {},
    priceRange = 0.009,
    amountRange = 3,
    abnormalMonitorLen = 30,

  } = {}) {
    this.symbol = symbol
    this.config = Object.assign({}, AnalyseKline.config, config);
    this.callback = callback;
    this.priceRange = priceRange;
    this.amountRange = amountRange;
    this.abnormalMonitorLen = abnormalMonitorLen;
    // this.status = {
    //   trend: '横', // 涨或跌趋势

    // }
    this.init();
  }
  init() {
    this.priceKline = new AbnormalMonitor({
      config: {
        range: this.priceRange,
        disTime: 0,
        recordMaxLen: this.abnormalMonitorLen
      }
    });
    this.amount = new AbnormalMonitor({
      config: {
        range: this.amountRange,
        disTime: 0,
        recordMaxLen: this.abnormalMonitorLen
      }
    });
     // 5 - 120 天 平局线
    this.priceMA5 = new CalculateMA(5);
    this.priceMA10 = new CalculateMA(10);
    this.priceMA30 = new CalculateMA(30);
    this.priceMA60 = new CalculateMA(60);
    this.priceMA120 = new CalculateMA(120);
    this.amoutMA10 = new CalculateMA(10, {key: 'amount'});
    this.amoutMA20 = new CalculateMA(20, {key: 'amount'});
    this.logs = [];
  }
  run(klineData) {
    if (Array.isArray(klineData)) {
      klineData.forEach((item) => {
        // console.log(this.priceMA5)
        this.priceMA5.push(item.close);
        this.priceMA10.push(item.close);
        this.priceMA30.push(item.close);
        this.priceMA60.push(item.close);
        this.priceMA120.push(item.close);
        this.amoutMA10.push(item.amount);
        this.amoutMA20.push(item.amount);
        // this.priceMA5.push(klineData, index);
        // this.priceMA10.push(klineData, index);
        // this.priceMA30.push(klineData, index);
        // this.priceMA60.push(klineData, index);
        // this.priceMA120.push(klineData, index);
        // this.amoutMA20.push(klineData, index);
        this.priceKline.speed({
          value: item.close,
          ts: new Date(Number(item.id + '000')).getTime(),
        });
        this.amount.speed({
          value: item.amount,
          ts: new Date(Number(item.id + '000')).getTime(),
        });
        // this.analyse(item);
      });
    } else if (klineData && klineData.close !== undefined) {
      this.priceMA5.push(klineData.close);
      this.priceMA10.push(klineData.close);
      this.priceMA30.push(klineData.close);
      this.priceMA60.push(klineData.close);
      this.priceMA120.push(klineData.close);
      this.amoutMA10.push(klineData.amount);
      this.amoutMA20.push(klineData.amount);
      this.priceKline.speed({
        value: klineData.close,
        ts: new Date(klineData.time).getTime(),
      });
      this.amount.speed({
        value: klineData.amount.toFixed(4),
        ts: new Date(klineData.time).getTime(),
      });
    }
    this.analyse(klineData);
  }
  analyse(klineData) {
    if (this.priceKline.historyStatus.length < 5) {
      return;
    }
    const lastClose = klineData.close;
    const gain = utils.getGain(this.priceMA60.last(), lastClose);
    const _config = this.config;

    let priceKline1 = this.priceKline.historyStatus[this.priceKline.historyStatus.length - 1];
    // let amount1 = this.amount.historyStatus[this.amount.historyStatus.length - 1];
    let priceKline2 = this.priceKline.historyStatus[this.priceKline.historyStatus.length - 2];
    // let amount2 = this.amount.historyStatus[this.amount.historyStatus.length - 2];
    const lastAmount = Array.isArray(klineData) ? klineData[klineData.length - 1].amount : klineData.amount;

    // 跌幅越大，增加买卖量
    let extraAmountCoefficient = 1;
    // 跌幅越大，增加买出机会
    let extraCount = 0;
    if (
      
      priceKline1.strength < (_config.sellStrengths[1] * 2)  // 跌
      || priceKline1.strength > (_config.buyStrengths[1] * 2) //涨
    ) {
      extraCount = Math.round(
        Math.max(1, Math.abs(priceKline1.strength), Math.abs(priceKline2.strength))
      )
      extraAmountCoefficient += Math.sqrt(Math.abs(priceKline1.strength)) / 2;
      extraCount =  Math.round(extraAmountCoefficient);
    }

    const data = {
      symbol: this.symbol,
      amoutMA10: parseInt(this.amoutMA10.last()),
      amoutMA20: parseInt(this.amoutMA20.last()),
      priceMA5: this.priceMA5.last(),
      priceMA10: this.priceMA10.last(),
      priceMA30: this.priceMA30.last(),
      priceMA60: this.priceMA60.last(),
      priceMA120: this.priceMA120.last(),
      priceKline1: priceKline1.strength,
      priceKline2: priceKline2.strength,
      lastAmount: parseInt(lastAmount),
      // buy: klineData.buy,
      // sell: klineData.sell,
      close: lastClose,
      // time: new Date(),
      'lastClose/priceMA60': gain,
      'lastAmount/amoutMA20':  parseInt(lastAmount) / parseInt(this.amoutMA20.last()),
      'lastAmount/amoutMA10': parseInt(lastAmount) / parseInt(this.amoutMA10.last()),
      time2: moment(Number(klineData.id + '000')).utc(8).format("YYYY-MM-DD H:mm:ss")
    }
    

    if (process.env.NODE_ENV === 'production') {
      // console.log('dev continue');
      // continue;
      // Models.trade.test.save(data)
    } else {
      this.logs.push(data)
    }
    
    if (
      (
        this.priceMA5.last() > this.priceMA10.last()
        && this.priceMA10.last() > this.priceMA30.last()
        && this.priceMA30.last() > this.priceMA60.last()
        && this.priceMA30.last() > this.priceMA120.last()
        && lastAmount > (this.amoutMA20.last() * _config.sellAmountThreshold[0])
        && gain > _config.sellGain
      )
      // && utils.getGain(this.priceMA60.last(), this.priceMA120.last()) > 0.01
      || (
          this.priceMA5.last() > this.priceMA10.last()
          && this.priceMA10.last() > this.priceMA60.last()
          // && this.priceMA10.last() > this.priceMA120.last()
          && gain > _config.sellGain
          && (
            (priceKline1.strength > _config.sellStrengths[0] || priceKline2.strength > _config.sellStrengths[1])
            && lastAmount > (this.amoutMA20.last() * _config.sellAmountThreshold[1])
          )
        )
      || (
        _config.isFall
        && lastClose >  this.priceMA30.last()
        && lastAmount > this.amoutMA10.last()
        && priceKline1.strength > _config.sellStrengths[0]
      )
      // || (
      //   _config.isFall
      //   && this.priceMA5.last() >  this.priceMA60.last()
      //   && lastAmount > this.amoutMA10.last()
      // )
    ) {
      // console.log('sell', extraCount)
      // console.log('sell', data)
      this.callback(this.symbol, 'sell', {extraCount, extraAmountCoefficient, klineData: klineData});
    }
    
    if (
      (this.priceMA5.last() < this.priceMA10.last()
      && this.priceMA10.last() < this.priceMA30.last()
      && this.priceMA30.last() < this.priceMA60.last()
      && this.priceMA30.last() < this.priceMA120.last()
      && lastAmount > (this.amoutMA20.last() * _config.buyAmountThreshold[0])
      && gain < _config.buyGain
      )
      ||(
        this.priceMA5.last() < this.priceMA10.last()
        && this.priceMA10.last() < this.priceMA60.last()
        // && this.priceMA5.last() < this.priceMA120.last()
        && (
            (priceKline1.strength < _config.buyStrengths[0] || priceKline2.strength < _config.buyStrengths[1])
            && lastAmount > (this.amoutMA20.last() * _config.buyAmountThreshold[1])
        )
        && gain < _config.buyGain
      )
      || (
        _config.isUp
        && lastClose <  this.priceMA10.last()
        && lastAmount > this.amoutMA10.last()
        && priceKline1.strength < _config.buyStrengths[0]
      )
      // || 
    ) {
      // console.log('buy', extraCount)
      // console.log('buy', data)
      this.callback(this.symbol, 'buy', {extraCount, extraAmountCoefficient, klineData: klineData});
    }
  }
}
AnalyseKline.config = {
  sellAmountThreshold: [2, 3], // 涨的时候的，量的阈值
  buyAmountThreshold: [2, 3], // 跌的时候，买入的阈值
  buyStrengths: [-0.5, -1], // 跌的时候的值
  sellStrengths: [0.5, 1],  // 涨的时候的值
  buyGain: -0.033, // close 与 MA60的距离, buy 阈值
  sellGain: 0.033, // close 与 MA60的距离, sell 阈值
  isUp: false,
  isFall: false,
}
AnalyseKline.setConfig = function(config) {

  parseConfig(config, [
    'buyStrengths',
    'sellStrengths',
    'sellAmountThreshold',
    'buyAmountThreshold'
  ])
  Object.assign(AnalyseKline.config, config)
}

AnalyseKline.transformConfig = function(config) {
  parseConfig(config, [
    'buyStrengths',
    'sellStrengths',
    'sellAmountThreshold',
    'buyAmountThreshold'
  ]);
  return config;
}
module.exports = AnalyseKline;




