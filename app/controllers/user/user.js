
const crypto = require('crypto');
const config = require('config');
const jwt = require('jsonwebtoken');

const sign = config.get('sign');
const models = require('../../models');
const utils = require('../../utils');

/**
 * 
 * @param {Koa.Context} ctx 
 * @param {Function} next 
 */
const login = async (ctx, next) => {
    const data = ctx.request.body;
    if (!data) {
        ctx.sendError({message: '用户名或密码为空'});
        return;
    }
    if (!utils.isValidValue(data.user) || !utils.isValidValue(data.password)) {
        ctx.sendError({message: '用户名或密码为空'});
        return;
    }
    const password = crypto.createHmac('md5', sign)
                   .update(data.password)
                   .digest('hex');
    let res = await models.user.findOne({user: data.user, password});
    console.log(res)
    if (!res) {
        ctx.sendError({message: '账户或密码有误'});
        return;
    }
    // 签发token
    const userToken = {
        user: data.user,
        id: res.id
    }
    try {
        const token = jwt.sign(userToken, sign, {expiresIn: '7d'});  // 签发token
        ctx.sendSuccess({data: {
            token,
        }});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
exports.login = login;

/**
 * 
 * @param {Koa.Context} ctx 
 * @param {Function} next 
 */
const createUser = async (ctx, next) => {
    const data = ctx.request.body;
    if (!utils.isValidValue(data.user) || !utils.isValidValue(data.password)) {
        ctx.sendError({message: '内容有误'});
        return;
    }
    let res = await models.user.findOne({user: data.user});
    if (res.length !== 0) {
        ctx.sendError({message: '用户名已存在'});
        return;
    }
    const password = crypto.createHmac('md5', sign)
                   .update(data.password)
                   .digest('hex');
    try {
        res = await models.user.insert({user: data.user, password: password});
        if (res._id) {
            ctx.sendSuccess();
        }
    } catch (err) {
        ctx.sendError({message: err});
    }
}
exports.createUser = createUser;


/**
 * 
 * @param {Koa.Context} ctx 
 * @param {Function} next 
 */
const getUserInfo = async (ctx, next) => {
    const res = await models.user.getUserInfo(ctx.state.user);
    ctx.sendSuccess({data: res});
}
exports.getUserInfo = getUserInfo;
