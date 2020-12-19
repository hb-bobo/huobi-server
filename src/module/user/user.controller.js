"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInfo = exports.createFirstUser = exports.createUser = exports.login = exports.get = void 0;
const async_validator_1 = __importDefault(require("async-validator"));
const config_1 = __importDefault(require("config"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../../constants");
const UserService = __importStar(require("./user.service"));
const sign = config_1.default.get('sign');
const userValidator = new async_validator_1.default({
    userName: {
        type: "string",
        required: true,
    },
    password: {
        type: "string",
        required: true,
    },
});
function get() {
    return UserService.find({});
}
exports.get = get;
/**
 *
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
exports.login = async (ctx) => {
    const { userName, password } = ctx.request.body;
    try {
        await userValidator.validate({ userName, password });
    }
    catch (error) {
        ctx.sendError({ message: '用户名或密码为空' });
        return;
    }
    const passwordHex = crypto_1.default.createHmac('md5', sign)
        .update(password)
        .digest('hex');
    const res = await UserService.findOne({ user: userName });
    if (!res || !res.id) {
        ctx.sendError({ message: '用户名不存在' });
        return;
    }
    if (res.password !== passwordHex) {
        ctx.sendError({ message: '账户或密码有误' });
        return;
    }
    // 签发token
    const userToken = {
        id: res.id,
        user: userName,
    };
    const token = jsonwebtoken_1.default.sign(userToken, sign, { expiresIn: '7d' }); // 签发token
    ctx.session.token = token;
    ctx.sendSuccess({
        data: {
            user: userName,
            role: res.role,
        }
    });
};
/**
 *
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
exports.createUser = async (ctx) => {
    const { userName, password } = ctx.request.body;
    try {
        await userValidator.validate({ userName, password });
    }
    catch ({ errors }) {
        ctx.sendError({ errors });
        return;
    }
    const res = await UserService.find({ user: userName });
    if (res.length !== 0) {
        ctx.sendError({ message: '用户名已存在' });
        return;
    }
    try {
        const newUser = await UserService.create(userName, password, constants_1.AUTHORITY.user);
        if (newUser.id) {
            ctx.sendSuccess({ data: newUser.id });
        }
    }
    catch (err) {
        ctx.sendError({ message: err });
    }
};
/**
 * 创建第一个用户
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
exports.createFirstUser = async (ctx) => {
    const { userName, password } = ctx.query;
    try {
        await userValidator.validate({ userName, password });
    }
    catch ({ errors }) {
        ctx.sendError({ errors });
        return;
    }
    const res = await UserService.find({});
    if (res.length !== 0) {
        ctx.sendError({ message: '写入失败' });
        return;
    }
    const newUser = UserService.create(userName, password, constants_1.AUTHORITY.admin);
    if (newUser) {
        ctx.sendSuccess();
    }
};
/**
 *
 * @param {Koa.Context} ctx
 * @param {Function} next
 */
exports.userInfo = async (ctx) => {
    if (!ctx.state.user) {
        ctx.sendError({ message: '没有权限' });
        return;
    }
    const user = await UserService.findOne({ user: ctx.state.user.user });
    if (user) {
        const userData = {
            user: user.user,
            role: user.role,
            userid: user.id
        };
        ctx.sendSuccess({ data: userData });
        return;
    }
    ctx.sendError({ message: 'Unlogin' });
};
