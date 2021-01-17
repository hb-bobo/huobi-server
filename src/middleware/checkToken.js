"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../common/logger");
const sign = config_1.default.get('sign');
const isDev = config_1.default.get('env') === 'dev';
/**
 * 判断token是否可用
 */
exports.default = async (ctx, next) => {
    // 拿到token
    const authorization = ctx.get('Authorization') || ctx.session.token;
    if (isDev && authorization === 'test') {
        ctx.state.user = {
            user: 'test',
            id: 1,
        };
        await next();
        return;
    }
    if (!authorization) {
        ctx.sendError({ code: 401, message: 'No token detected in http headerAuthorization' });
        // ctx.throw({
        //     code: 401,
        //     message: 'no token detected in http headerAuthorization',
        // });
        // next();
        return;
    }
    // const token = authorization.split(' ')[1];
    try {
        let payload;
        payload = await jsonwebtoken_1.default.verify(authorization, sign); // 如果token过期或验证失败，将抛出错误
        if (payload) {
            ctx.state.user = {
                user: payload.user,
                id: payload.id
            };
        }
        await next();
    }
    catch (err) {
        logger_1.outLogger.error(err);
        ctx.sendError({ code: 401, message: 'Invalid token' });
        // ctx.throw({
        //     code: 401,
        //     message: 'invalid token',
        // });
    }
};
