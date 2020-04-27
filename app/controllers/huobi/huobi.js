const hbsdk = require('../../../lib/sdk/hbsdk');
const utils = require('../../utils')

const buy_limit = async (ctx, next) => {
    const data = ctx.request.body;
    try {
        let res = await hbsdk.buy_limit(data);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.buy_limit = buy_limit;

const cancel_order = async (ctx, next) => {
    const data = ctx.request.body;

    try {
        let res = await hbsdk.cancelOrder(data.orderId);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.cancel_order = cancel_order;


const limit = async (ctx, next) => {
    const data = ctx.request.body;
    let action = data.action + '_limit';
    if (action !== 'buy_limit' && action !== 'sell_limit') {
        ctx.sendError({message: 'action must eq "buy" | "sell"'})
    }
    try {
        let res = await hbsdk[action](data);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.limit = limit;


const get_open_orders = async (ctx, next) => {
    const query = ctx.request.query;
    if (!query.symbol) {
        ctx.sendError({message: 'symbol 无效'});
        return;
    }
    try {
        let res = await hbsdk.get_open_orders(query);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.get_open_orders = get_open_orders;

const get_balance = async (ctx, next) => {
    try {
        let res = await hbsdk.get_balance();
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.get_balance = get_balance;

/**
 * 根据id查单个订单
 */
const get_order = async (ctx, next) => {
    const data = ctx.request.query;
    if (!query.orderId) {
        ctx.sendError({message: 'orderId 无效'});
        return;
    }
    try {
        let res = await hbsdk.get_order(data.orderId);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.get_order = get_order;

/**
 * 根据symbol查最近的订单
 * @param {Koa.Context} ctx 
 * @param {() => Promise<void>} next 
 */
const get_orders = async (ctx, next) => {
    const query = ctx.request.query;
    if (!query.symbol) {
        ctx.sendError({message: 'symbol 无效'});
        return;
    }
    try {
        let res = await hbsdk.get_orders(query.symbol);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.get_orders = get_orders;

/**
 * 获取k线
 */
const getMarketHistoryKline = async (ctx, next) => {
    const data = ctx.request.query;
    try {
        let res = await hbsdk.getMarketHistoryKline(data);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.getMarketHistoryKline = getMarketHistoryKline;

/**
 * 获取深度
 */
const getMarketDepth = async (ctx, next) => {
    const data = ctx.request.body;
    try {
        let res = await hbsdk.getMarketDepth(data);
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.getMarketDepth = getMarketDepth;



/**
 * 获取Symbols 交易对 精度信息
 */
const getSymbols = async (ctx, next) => {
    try {
        let res = await hbsdk.getSymbols();
        ctx.sendSuccess({data: res})
    } catch (error) {
        ctx.sendError({message: error})
    }
}
exports.getSymbols = getSymbols;