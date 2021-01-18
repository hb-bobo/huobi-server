"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backtest = exports.download = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const dayjs_1 = __importDefault(require("dayjs"));
const async_validator_1 = __importDefault(require("async-validator"));
const config_1 = __importDefault(require("config"));
const utils_1 = require("../../utils");
const hbsdk_1 = require("../../huobi/hbsdk");
const writeFilePromisify = util_1.promisify(fs_1.writeFile);
const publicPath = config_1.default.get('publicPath');
const downloadPath = path_1.join(publicPath, '/download/history-data/');
async function initdir() {
    await utils_1.mkdir(publicPath);
    await utils_1.mkdir(path_1.join(publicPath, '/download/'));
    await utils_1.mkdir(downloadPath);
}
initdir();
/**
 * 下载数据
 */
exports.download = async (ctx) => {
    const body = ctx.request.body;
    const validator = new async_validator_1.default({
        symbol: {
            type: "string",
            required: true,
        },
        period: {
            type: 'string'
        },
        size: {
            type: 'number'
        }
    });
    try {
        await validator.validate(body);
    }
    catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }
    try {
        const data = await hbsdk_1.hbsdk
            .getMarketHistoryKline(body.symbol, body.period, body.size);
        const fileName = `${body.symbol}-${body.period}-${dayjs_1.default().format("YYYY-MM-DD")}.json`;
        if (data === undefined) {
            ctx.sendError({ message: '数据拉取失败' });
            return;
        }
        await writeFilePromisify(path_1.join(downloadPath, fileName), JSON.stringify(data.reverse()));
        ctx.sendSuccess({
            data: {
                url: `${ctx.URL.origin}/download/history-data/${fileName}`
            }
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
/**
 * 回测
 */
exports.Backtest = async (ctx) => {
    const body = ctx.request.body;
    const validator = new async_validator_1.default({
        fileName: {
            type: "string",
            required: true,
        }
    });
    try {
        await validator.validate(body);
    }
    catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }
    try {
        // new Quant()
        const data = await hbsdk_1.hbsdk
            .getMarketHistoryKline(body.symbol, body.period, body.size);
        const fileName = `${body.symbol}-${body.period}-${dayjs_1.default().format("YYYY-MM-DD")}.json`;
        if (data === undefined) {
            ctx.sendError({ message: '数据拉取失败' });
            return;
        }
        await writeFilePromisify(path_1.join(downloadPath, fileName), JSON.stringify(data.reverse()));
        ctx.sendSuccess({
            data: {
                url: `${ctx.URL.origin}/download/history-data/${fileName}`
            }
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
