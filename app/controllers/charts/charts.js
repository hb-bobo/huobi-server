
const Models = require('../../models')
const utils = require('../../utils')

const getPressure = async (ctx, next) => {
    let query = ctx.request.query;
    if (!query.symbol) {
        ctx.sendError({message: '参数错误'});
        return;
    }
    if (query.time) {
        query.time = query.time.split(',')
    }
    try {
        let res = await Models.charts.depth.getPressure(query);
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.getPressure = getPressure;

const getTrade = async (ctx, next) => {
    let query = ctx.request.query;
    if (!query.symbol) {
        ctx.sendError({message: '参数错误'});
        return;
    }
    if (query.time) {
        query.time = query.time.split(',')
    }
    try {
        let res = await Models.charts.trade.getTrade(query);
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.getTrade = getTrade;

const getWatchSymbols = async (ctx, next) => {
    const data = ctx.request.query;
    try {
        let res = await Models.charts.watchSymbols.get(data);
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.getWatchSymbols = getWatchSymbols;

const putWatchSymbols = async (ctx, next) => {
    const data = ctx.request.body;
    try {
        let res = await Models.charts.watchSymbols.put(data);
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.putWatchSymbols = putWatchSymbols;


const removeWatchSymbols = async (ctx, next) => {
    const data = ctx.request.body;
    try {
        let res = await Models.charts.watchSymbols.remove(data);
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.removeWatchSymbols = removeWatchSymbols;