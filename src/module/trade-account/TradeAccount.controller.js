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
exports.removeOne = exports.updateOne = exports.get = void 0;
const async_validator_1 = __importDefault(require("async-validator"));
const TradeAccountService = __importStar(require("./TradeAccount.service"));
/**
 * 查询单个或者多个
 */
exports.get = async (ctx) => {
    const { id } = ctx.request.query;
    try {
        let res;
        if (id) {
            res = await TradeAccountService.findOne({ id });
            if (!res) {
                ctx.sendError({ message: 'error' });
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        }
        else {
            res = await TradeAccountService.find({});
            ctx.sendSuccess({ data: res });
        }
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
/**
 * 更新或者新建
 */
exports.updateOne = async (ctx) => {
    const { id, _id, auto_trade, exchange, access_key, secret_key, uid, trade_password, } = ctx.request.body;
    const ID = id || _id;
    const DATA = {
        auto_trade,
        exchange,
        access_key,
        secret_key,
        uid,
        trade_password,
    };
    const validator = new async_validator_1.default({
        id: {
            type: "string",
        },
        exchange: {
            type: "string",
        },
        access_key: {
            type: "string",
            required: true,
        },
        secret_key: {
            type: "string",
            required: true,
        },
        uid: {
            type: "string",
            required: true,
        },
        trade_password: {
            type: "string",
            required: true,
        },
    });
    try {
        await validator.validate(DATA);
    }
    catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }
    try {
        DATA.auto_trade = Number(DATA.auto_trade);
        let res;
        if (ID) {
            res = await TradeAccountService.updateOne({ id: ID }, DATA);
            ctx.sendSuccess();
        }
        else {
            res = await TradeAccountService.create({
                ...DATA,
                userId: ctx.state.user && ctx.state.user.id
            });
            ctx.sendSuccess({
                data: res
            });
        }
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
/**
 * 删除单个
 */
exports.removeOne = async (ctx) => {
    const data = ctx.request.body;
    try {
        const res = await TradeAccountService.deleteOne({ id: data._id });
        ctx.sendSuccess({
            data: res
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
