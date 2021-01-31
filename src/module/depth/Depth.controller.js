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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.get = void 0;
const async_validator_1 = __importDefault(require("async-validator"));
const DepthService = __importStar(require("./depth.service"));
/**
 * 查询单个或者多个
 */
const get = async (ctx) => {
    const { start, end, symbol } = ctx.request.query;
    const validator = new async_validator_1.default({
        start: {
            type: "string",
            required: true,
        },
        end: {
            type: "string",
            required: true,
        },
        symbol: {
            type: "string",
            required: true,
        }
    });
    try {
        await validator.validate({ start, end, symbol });
    }
    catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }
    try {
        let res = await DepthService.find({
            start: new Date(start),
            end: new Date(end),
            symbol: symbol.toLowerCase()
        });
        ctx.sendSuccess({ data: res });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
exports.get = get;
/**
 * 更新或者新建
 */
const create = async (ctx) => {
    const data = ctx.request.body;
    try {
        let res = await DepthService.create(data);
        ctx.sendSuccess({
            data: res
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
exports.create = create;
