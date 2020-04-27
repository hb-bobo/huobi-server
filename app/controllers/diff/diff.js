
const Models = require('../../models')
const utils = require('../../utils')
const diffControllers = require('../../ws/handler/difference')

const getCharacteristic = async (ctx, next) => {
    const data = ctx.request.query;

    if (!data.symbol) {
        ctx.sendError({message: '参数错误'});
        return;
    }
    if (data.symbol === 'all') {
        ctx.sendSuccess({data: diffControllers.cache});
        return;
    }
    try {
        let res = await Models.diff.getCharacteristic(data);
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.getCharacteristic = getCharacteristic;


const getPressure = async (ctx, next) => {
    const data = ctx.request.query;

    if (!data.symbol) {
        ctx.sendError({message: '参数错误'});
        return;
    }
    try {
        let res = await Models.diff.getPressure(data);
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.getPressure = getPressure;


const getDiffSymbols = async (ctx, next) => {
    const data = ctx.request.query;
    try {
        let data = await utils.huobiSymbols.getSymbols();
        const res = data.filter(item => !appConfig.watchSymbols.includes(item.symbol));;
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.getDiffSymbols = getDiffSymbols;