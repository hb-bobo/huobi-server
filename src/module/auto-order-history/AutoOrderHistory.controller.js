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
const AutoOrderHistoryService = __importStar(require("./AutoOrderHistory.service"));
let AutoOrderController = /** @class */ (() => {
    class AutoOrderController {
    }
    AutoOrderController.index = async (ctx) => {
        const { id, current, pageSize } = ctx.request.query;
        const userId = ctx.state.user && ctx.state.user.id;
        try {
            let res;
            if (id) {
                res = await AutoOrderHistoryService.find({ id: id });
                if (!res) {
                    ctx.sendError({ message: 'error' });
                    return;
                }
                ctx.sendSuccess({
                    data: res
                });
            }
            else {
                res = await AutoOrderHistoryService.find({ userId: userId }, { current, pageSize });
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
    AutoOrderController.updateOne = async (ctx) => {
        const data = ctx.request.body;
        const validator = new async_validator_1.default({
            symbol: {
                type: "string",
                required: true,
            },
            amount: {
                type: "number",
            },
            money: {
                type: "number",
            },
            buyCount: {
                type: "number",
            },
            sellCount: {
                type: "number",
            },
            period: {
                type: "number",
            },
            forceTrade: {
                type: "boolean",
            },
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
                //
            }
            else if (data.title) {
                res = await AutoOrderHistoryService.create(data);
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
    AutoOrderController.removeOne = async (ctx) => {
        const data = ctx.request.body;
        try {
            // const res = await AutoOrderHistoryService.deleteOne({id: data._id});
            // ctx.sendSuccess({
            //     data: res
            // });
        }
        catch (error) {
            ctx.sendError({ message: error });
        }
    };
    return AutoOrderController;
})();
exports.default = AutoOrderController;
