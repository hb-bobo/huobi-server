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
const async_validator_1 = __importDefault(require("async-validator"));
const AutoOrderConfigService = __importStar(require("./AutoOrderConfig.service"));
const start_1 = require("../../huobi/start");
let AutoOrderConfigLogController = /** @class */ (() => {
    class AutoOrderConfigLogController {
    }
    AutoOrderConfigLogController.index = async (ctx) => {
        const { id } = ctx.request.query;
        try {
            let res;
            if (id) {
                res = await AutoOrderConfigService.findOne({ id });
                if (!res) {
                    ctx.sendError({ message: 'error' });
                    return;
                }
                ctx.sendSuccess({
                    data: res
                });
            }
            else {
                res = await AutoOrderConfigService.find({});
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
    AutoOrderConfigLogController.updateOne = async (ctx) => {
        const data = ctx.request.body;
        const validator = new async_validator_1.default({
            symbol: {
                type: "string",
                required: true,
            },
            buy_usdt: {
                type: "number",
            },
            sell_usdt: {
                type: "number",
            }
        });
        try {
            await validator.validate(data);
        }
        catch ({ errors, fields }) {
            ctx.sendError({ errors });
            return;
        }
        try {
            let res;
            if (data.id || data._id) {
                res = await AutoOrderConfigService.updateOne({ id: data.id || data._id }, data);
            }
            else if (data) {
                const userId = ctx.state.user && ctx.state.user.id;
                res = await AutoOrderConfigService.create({
                    ...data,
                    userId: userId
                });
                await start_1.trader.autoTrader(data, userId);
            }
            else {
                ctx.sendError({ message: '格式有误' });
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        }
        catch (error) {
            ctx.sendError({ message: error });
        }
    };
    /**
     * 删除单个
     */
    AutoOrderConfigLogController.removeOne = async (ctx) => {
        const data = ctx.request.body;
        const userId = ctx.state.user && ctx.state.user.id;
        const id = data.id || data._id;
        try {
            const res = await AutoOrderConfigService.deleteOne({ id: id });
            if (userId) {
                start_1.trader.cancelAutoTrader(userId, data.symbol);
            }
            ctx.sendSuccess({
                data: res
            });
        }
        catch (error) {
            ctx.sendError({ message: error });
        }
    };
    return AutoOrderConfigLogController;
})();
exports.default = AutoOrderConfigLogController;
