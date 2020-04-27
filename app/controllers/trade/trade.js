const _ = require('lodash');
const hbsdk = require('../../../lib/sdk/hbsdk');
const utils = require('../../utils');
const AnalyseKline = require('../../extend/AnalyseKline')
const WS_HUOBI = require('../../ws/ws-huobi');
const ws = require('./ws')
const Models = require('../../models')
const common = require('./common')


/* 因子集合 */


function handleMsg (data) {
    
    if (common.symbolInfo[data.symbol] !== undefined) {
        common.handleMsg(data)
    }
}
WS_HUOBI.huobiEmitter.on('msg', handleMsg);
WS_HUOBI.huobiEmitter.on('open',async function () {
    if (Object.keys(common.symbolInfo).length > 0) {
        return;
    }
    const res = await Models.trade.autoTrade.get();
    for (let i = 0; i < res.length; i++) {
        const item = res[i];
        await common.init({
            symbol: item.symbol,
            amount: item.amount,
            money: item.money,
            sellCount: item.sellCount,
            buyCount: item.buyCount,
            period: item.period,
            forceTrade:  Boolean(item.forceTrade),
            user: item.user,
        });
    }
    console.log('AutoTrade init')
});
/**
 * 自动交易
 * @param {koa.context} ctx 
 * @param {Function} next 
 */
const startAutoTrade = async (ctx, next) => {
    const {
        symbol,
        amount,
        money = 1.5,
        buyCount = 3,
        sellCount = 3,
        tradeType = null,
        period = 5,
        forceTrade = false,
    } = ctx.request.body;

    if (!symbol) {
        ctx.sendError({message: 'symbol不能为空'});
        return;
    }
    if (!amount) {
        // ctx.sendError({message: 'amount不能为空'});
        // return;
    }

    try {
        const initData = {
            symbol: symbol,
            amount: amount,
            money: money,
            sellCount: sellCount,
            buyCount: buyCount,
            period: period,
            // tradeType: tradeType,
            forceTrade: forceTrade ? 1 : 0,
        }
        // 记录数据
        await Models.trade.autoTrade.update({
            user: ctx.state.user.user,
            symbol: symbol,
        }, initData);
        common.init(initData);
        // WS_HUOBI.huobiEmitter.on('auth', onAuth);
        // WS_HUOBI.huobiEmitter.on('msg', handleMsg);
        ctx.sendSuccess({data: '订阅成功'});
    
        // 判断因子(求平均)，因子:[-1 ~ 1]
        // let grade = 0;
        // factors.forEach(fn => {
        //     if (typeof fn === 'function') {
        //         grade += fn();
        //     }
        // });
        // // 求平均
        // grade = grade / factors.length;
        // // 挂单， 记录数据， 一旦买单成功，挂卖单，记录
        // // > 0.5开刷
        // if (grade > 0.5) {

        // }
    } catch (error) {
        console.error(error)
        ctx.sendError({message: error});
    }
}
exports.startAutoTrade = startAutoTrade;

const stopAutoTrade = async (ctx, next) => {
    const {
        symbol,
    } = ctx.request.body;
    if (common.symbolInfo[symbol] === undefined) {
        ctx.sendError({message: `${symbol}不存在`});
        return;
    }
    const target = 'server-auto-trade-' + symbol;
    try {
        await Models.trade.autoTrade.remove({symbol: symbol});
        await Models.trade.config.remove({
            user: ctx.state.user.user,
            symbol: symbol,
        });
        delete common.symbolInfo[symbol];
        // 开始订阅
        WS_HUOBI.subscribe.unsub(target, {
            value: `market.${symbol}.depth.step0`,
        });
        WS_HUOBI.subscribe.unsub(target, {
            value: `market.${symbol}.trade.detail`,
        });
        WS_HUOBI.subscribe.unsub(target, {
            value:  `market.${symbol}.kline.1min`,
        });
        ctx.sendSuccess({data: WS_HUOBI.subscribe});
    } catch (error) {
        ctx.sendError({message: error});
    }
  
    
}
exports.stopAutoTrade = stopAutoTrade;

const getTradingSymbol = async (ctx, next) => {
    const data = {}
    for(let symbol in common.symbolInfo) {
        let item = common.symbolInfo[symbol];
        let quoteCurrency = utils.getQuoteCurrency(symbol);
        
        data[symbol] = _.pick(item, [
            'close',
            'amount',
            'money',
            'sellCount',
            'buyCount',
            'period',
            'msg',
            // 'tradeType',
            'forceTrade'
        ]);
        data[symbol].quoteCurrency = quoteCurrency;
        data[symbol].baseCurrency = symbol.replace(quoteCurrency, '');
    }
    ctx.sendSuccess({data: data})
}
exports.getTradingSymbol = getTradingSymbol;

const getTradeConfig = async (ctx, next) => {
    const {symbol} = ctx.request.query;
    try {
        let res = await Models.trade.config.getOne({
            user: ctx.state.user.user,
            symbol: symbol ? symbol : null,
        });
        if (symbol && common.symbolInfo[symbol]) {
            res = common.symbolInfo[symbol].klineHandle.config;
        } else {
            res = AnalyseKline.config;
        }
        if (Array.isArray(res.sellStrengths)) {
            res.buyStrengths = JSON.stringify(res.buyStrengths)
            res.sellStrengths = JSON.stringify(res.sellStrengths)
            res.sellAmountThreshold = JSON.stringify(res.sellAmountThreshold)
            res.buyAmountThreshold = JSON.stringify(res.buyAmountThreshold)
        }
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error});
    }    
}
exports.getTradeConfig = getTradeConfig;

const setTradeConfig = async (ctx, next) => {
    const {id, ...data} = ctx.request.body;
    try {
        
        if (data.symbol && common.symbolInfo[data.symbol]) {
            const configData = AnalyseKline.transformConfig(data);
            Object.assign(common.symbolInfo[data.symbol].klineHandle.config, configData);
        }
        // 全局的
        if (!data.symbol) {
            await Models.trade.config.update({
                user: ctx.state.user.user,
                id,
                // symbol: data.symbol,
            }, data);
            AnalyseKline.setConfig(data);
            for(let symbol in common.symbolInfo) {
                const configData = AnalyseKline.transformConfig(data);
                Object.assign(common.symbolInfo[symbol].klineHandle.config, configData);
            }
        }
        ctx.sendSuccess();
    } catch (error) {
        ctx.sendError({message: error});
    }    
}
exports.setTradeConfig = setTradeConfig;