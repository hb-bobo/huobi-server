
const Models = require('../../models')
const utils = require('../../utils')
const diffControllers = require('../../ws/handler/difference')
const { setSecretkey } = require('../../../lib/sdk/hbsdk');
console.log(setSecretkey)
const get = async (ctx, next) => {
    const query = ctx.request.query;
    try {
        let res = await Models.trade.api.get({
            user: ctx.state.user.user,
            ...query
        });
        if (query.id) {
            res = res[0];
        }
        ctx.sendSuccess({data: res});
    } catch (error) {
        console.log(error)
        ctx.sendError({message: error});
    }
}
exports.get = get;


const update = async (ctx, next) => {
    const {
        // exchange,
        id,
        ...other
    } = ctx.request.body;
    try {
      
        let res = await Models.trade.api.update({
            user: ctx.state.user.user,
            id: id
        }, {
            user: ctx.state.user.user,
            ...other
        });
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.update = update;

const remove = async (ctx, next) => {
    const data = ctx.request.body;
    const id = data.id;
    if (!id) {
        ctx.sendError({message: 'id有误'});
        return;
    }
    try {
        let res = await Models.trade.api.remove({id: id});
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.remove = remove;