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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOne = exports.updateOne = exports.get = void 0;
const ws_cmd_1 = require("../../huobi/ws/ws.cmd");
const ws_1 = require("../../huobi/ws/ws");
const WatchEntityService = __importStar(require("./watch.service"));
/**
 * 查询单个或者多个
 */
exports.get = async (ctx) => {
    const { id } = ctx.request.query;
    try {
        let res;
        if (id) {
            res = await WatchEntityService.findOne({ id });
            if (!res) {
                ctx.sendError({ message: 'error' });
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        }
        else {
            res = await WatchEntityService.find({});
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
    const data = ctx.request.body;
    try {
        let res;
        if (data.id || data._id) {
            res = await WatchEntityService.updateOne({ id: data.id || data._id }, data);
        }
        else if (data.symbol) {
            res = await WatchEntityService.create(data);
            const SYMBOL = data.symbol.toLowerCase();
            ws_1.ws.sub(ws_cmd_1.WS_SUB.kline(SYMBOL, '1min'));
            ws_1.ws.sub(ws_cmd_1.WS_SUB.depth(SYMBOL));
            ws_1.ws.sub(ws_cmd_1.WS_SUB.tradeDetail(SYMBOL));
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
exports.removeOne = async (ctx) => {
    const data = ctx.request.body;
    const id = data.id || data._id;
    if (!id) {
        ctx.sendError({ message: 'id 不存在' });
        return;
    }
    try {
        const res = await WatchEntityService.deleteOne({ id: id });
        const SYMBOL = res.symbol.toLowerCase();
        ws_1.ws.upsub(ws_cmd_1.WS_SUB.kline(SYMBOL, '1min'));
        ws_1.ws.upsub(ws_cmd_1.WS_SUB.depth(SYMBOL));
        ws_1.ws.upsub(ws_cmd_1.WS_SUB.tradeDetail(SYMBOL));
        ctx.sendSuccess({
            data: res
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
