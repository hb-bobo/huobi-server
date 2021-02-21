
import schema from 'async-validator';
import config from 'config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { outLogger } from 'ROOT/common/logger';
import { AUTHORITY } from 'ROOT/constants/common';
import { AppContext } from 'ROOT/interface/App';
import * as UserService from './user.service';


const sign = config.get<string>('sign');
const userValidator = new schema({
    userName: {
        type: "string",
        required: true,
    },
    password: {
        type: "string",
        required: true,
    },
});


export function get() {
    return UserService.find({});
}
/**
 *
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
export const login = async (ctx: AppContext) => {
    const {userName, password} = ctx.request.body;

    try {
        await userValidator.validate({userName, password});
    } catch (error) {
        ctx.sendError({message: '用户名或密码为空'});
        return;
    }
    const passwordHex = crypto.createHmac('md5', sign)
                   .update(password)
                   .digest('hex');
    const res = await UserService.findOne({user: userName});
    if (!res || !res.id) {
        ctx.sendError({message: '用户名不存在'});
        return;
    }
    if (res.password !== passwordHex) {
        ctx.sendError({message: '账户或密码有误'});
        return;
    }
    // 签发token
    const userToken = {
        id: res.id,
        user: userName,
    }
    const token = jwt.sign(userToken, sign, {expiresIn: '7d'});  // 签发token
    ctx.session.token = token;
    ctx.sendSuccess({
        data: {
            user: userName,
            role: res.role,
        }
    });
}


/**
 *
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
export const createUser = async (ctx: AppContext) => {
    const {userName, password} = ctx.request.body;
    try {
        await userValidator.validate({userName, password});
    } catch ({errors}) {
        ctx.sendError({errors});
        return;
    }
    const res = await UserService.find({user: userName});
    if (res.length !== 0) {
        ctx.sendError({message: '用户名已存在'});
        return;
    }

    try {
        const newUser = await UserService.create(userName, password, AUTHORITY.user);
        if (newUser.id) {
            ctx.sendSuccess({data: newUser.id});
        }
    } catch (err) {
        ctx.sendError({message: err});
    }
}

/**
 * 创建第一个用户
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
export const createFirstUser = async (ctx: AppContext) => {
    const {userName, password} = ctx.query;
    try {
        await userValidator.validate({userName, password});
    } catch ({errors}) {
        ctx.sendError({errors});
        return;
    }
    const res = await UserService.find({});
    if (res.length !== 0) {
        ctx.sendError({message: '写入失败'});
        return;
    }
    const newUser = UserService.create(userName as string, password as string, AUTHORITY.admin);
    if (newUser) {
        ctx.sendSuccess();
    }
}

/**
 *
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
export const userInfo = async (ctx: AppContext) => {
    if (!ctx.state.user) {
        ctx.sendError({message: '没有权限'});
        return;
    }
    const user = await UserService.findOne({user: ctx.state.user.user});
    if (user) {
        const userData = {
            user: user.user,
            role: user.role,
            userid: user.id
        }
        ctx.sendSuccess({data: userData});
        return;
    }
    ctx.sendError({message: 'Unlogin'});
}

