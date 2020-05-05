
import config from 'config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';


import { isValidValue } from '../../utils/validator';
import UserEntity from './user.entity';
import * as UserService from './user.service';


const sign = config.get<string>('sign');
/**
 * 
 * @param {Koa.Context} ctx 
 * @param {Function} next 
 */
export const login = async (ctx: App.KoaContext) => {
    const data = ctx.request.body;
    if (!isValidValue(data.userName) || !isValidValue(data.password)) {
        ctx.sendError({message: '用户名或密码为空'});
        return;
    }
    const password = crypto.createHmac('md5', sign)
                   .update(data.password)
                   .digest('hex');
    const res = await UserEntity.findOne({user: data.userName});
    if (!res || !res.id) {
        ctx.sendError({message: '用户名不存在'});
        return;
    }
    if (res.password !== password) {
        ctx.sendError({message: '账户或密码有误'});
        return;
    }
    // 签发token
    const userToken = {
        id: res.id,
        user: data.userName,
    }
    const token = jwt.sign(userToken, sign, {expiresIn: '7d'});  // 签发token
    ctx.session.token = token;
    ctx.sendSuccess({
        data: {
            currentAuthority: "admin",
            type: "account"
        }
    });
}


/**
 * 
 * @param {Koa.Context} ctx 
 * @param {Function} next 
 */
export const createUser = async (ctx: App.KoaContext) => {
    const data = ctx.request.body;
    if (!isValidValue(data.user) || !isValidValue(data.password)) {
        ctx.sendError({message: '内容有误'});
        return;
    }
    const res = await UserEntity.find({user: data.user});
    if (res.length !== 0) {
        ctx.sendError({message: '用户名已存在'});
        return;
    }
    
    try {
        const user = await UserService.create(data.user, data.password, 'user');
        if (user.id) {
            ctx.sendSuccess();
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
export const createFirstUser = async (ctx: App.KoaContext) => {
    const {user, password, authority} = ctx.query;
    if (!isValidValue(user) || !isValidValue(password)) {
        ctx.sendError({message: '内容有误'});
        return;
    }
    const res = await UserEntity.find({});
    if (res.length !== 0) {
        ctx.sendError({message: '不可写入'});
        return;
    }
    const newUser = UserService.create(user, password, 'admin');
    if (newUser) {
        ctx.sendSuccess();
    }
}

/**
 * 
 * @param {Koa.Context} ctx 
 * @param {Function} next 
 */
export const userInfo = async (ctx: App.KoaContext) => {
    if (!ctx.state.user) {
        ctx.sendError({message: '没有权限'});
        return;
    }
    const res = await UserEntity.find({user: ctx.state.user.user});
    if (res.length) {
        const userData = {
            name: res[0].user,
            userid: res[0].id
        }
        ctx.sendSuccess({data: userData});
    }
}

