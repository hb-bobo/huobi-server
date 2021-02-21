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
exports.remove = exports.create = exports.index = void 0;
const async_validator_1 = __importDefault(require("async-validator"));
const ConfigService = __importStar(require("./config.service"));
const index = async (ctx) => {
    const { current = 1, pageSize } = ctx.request.query;
    try {
        const list = await ConfigService.find({}, { current: Number(current), pageSize: Number(pageSize) });
        ctx.sendSuccess({
            data: list
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
        return;
    }
};
exports.index = index;
const create = async (ctx) => {
    const { type, content } = ctx.request.body;
    const validator = new async_validator_1.default({
        type: {
            type: "string",
            required: true,
        },
    });
    try {
        await validator.validate({ type, content });
    }
    catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }
    try {
        const res = await ConfigService.create({
            type,
            content,
        });
        ctx.sendSuccess();
    }
    catch (error) {
        ctx.sendError({ message: error.message });
    }
};
exports.create = create;
const remove = async (ctx) => {
    const { id } = ctx.request.body;
    const validator = new async_validator_1.default({
        id: {
            type: "string",
            required: true,
        },
    });
    try {
        await validator.validate({ id });
    }
    catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }
    try {
        const res = await ConfigService.deleteOne({ id });
        ctx.sendSuccess({ data: res });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
exports.remove = remove;
