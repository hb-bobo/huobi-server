"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Train = exports.Analysis = exports.AnalysisList = exports.download = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const stream_1 = __importDefault(require("stream"));
const dayjs_1 = __importDefault(require("dayjs"));
const async_validator_1 = __importDefault(require("async-validator"));
const config_1 = __importDefault(require("config"));
const utils_1 = require("../../utils");
const hbsdk_1 = require("../../huobi/hbsdk");
const source_1 = __importDefault(require("got/dist/source"));
const analyse_1 = require("../../lib/quant/analyse");
const quant_1 = require("../../lib/quant");
const Trainer_1 = require("../../huobi/Trainer");
const util_2 = require("../../huobi/util");
const writeFilePromisify = util_1.promisify(fs_1.writeFile);
const pipelinePromisify = util_1.promisify(stream_1.default.pipeline);
const readdirPromisify = util_1.promisify(fs_1.readdir);
const publicPath = config_1.default.get('publicPath');
const downloadPath = path_1.join(publicPath, '/download/history-data/');
const analysisPath = path_1.join(publicPath, '/download/analysis/');
async function initdir() {
    await utils_1.mkdir(publicPath);
    await utils_1.mkdir(path_1.join(publicPath, '/download/'));
    await utils_1.mkdir(downloadPath);
    await utils_1.mkdir(analysisPath);
}
initdir();
/**
 * 下载数据
 */
const download = async (ctx) => {
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
exports.download = download;
/**
 * 分析数据列表
 */
const AnalysisList = async (ctx) => {
    try {
        let list = await readdirPromisify(analysisPath);
        list = list.map((fileName) => {
            return `${ctx.URL.origin}/download/analysis/${fileName}`;
        });
        ctx.sendSuccess({
            data: list
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
exports.AnalysisList = AnalysisList;
/**
 * 分析数据
 */
const Analysis = async (ctx) => {
    const body = ctx.request.body;
    const validator = new async_validator_1.default({
        url: {
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
        const urlArr = body.url.split('/');
        const fileName = urlArr[urlArr.length - 1];
        const response = await source_1.default(body.url);
        const analyser = new analyse_1.Analyser();
        const list = [];
        analyser.use((row) => {
            list.push(row);
        });
        analyser.analysis(JSON.parse((response.body)));
        // await pipelinePromisify(got(body.url), fs.createWriteStream('index.html'))
        await writeFilePromisify(path_1.join(analysisPath, fileName), JSON.stringify(list));
        ctx.sendSuccess({
            data: {
                url: `${ctx.URL.origin}/download/analysis/${fileName}`
            }
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
exports.Analysis = Analysis;
/**
 * 分析数据
 */
const Train = async (ctx) => {
    const body = ctx.request.body;
    const validator = new async_validator_1.default({
        quoteCurrencyBalance: {
            type: "number",
        },
        baseCurrencyBalance: {
            type: "number",
        },
        buy_usdt: {
            type: 'number'
        },
        sell_usdt: {
            type: 'number'
        },
    });
    try {
        await validator.validate(body);
    }
    catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }
    try {
        let symbol = '';
        let historyList = [];
        if (body.symbol && body.period && body.size) {
            symbol = body.symbol;
            const data = await hbsdk_1.hbsdk
                .getMarketHistoryKline(body.symbol, body.period, body.size);
            if (data === undefined) {
                ctx.sendError({ message: '数据拉取失败' });
                return;
            }
            historyList = data.reverse();
        }
        else {
            const urlArr = body.url.split('/');
            const fileName = urlArr[urlArr.length - 1];
            symbol = fileName.split('-')[0];
            const response = await source_1.default(body.url);
            historyList = JSON.parse((response.body));
        }
        const symbolInfo = await util_2.getSymbolInfo(symbol);
        if (!symbolInfo) {
            ctx.sendError({ message: 'symbol数据拉取失败' });
            return;
        }
        const analyser = new analyse_1.Analyser();
        analyser.analysis(historyList);
        const quant = new quant_1.Quant({
            symbol: symbol,
            quoteCurrencyBalance: body.quoteCurrencyBalance || 300,
            baseCurrencyBalance: body.baseCurrencyBalance || symbolInfo['limit-order-min-order-amt'] * 10,
            mins: [],
            maxs: [],
            minVolume: symbolInfo['limit-order-min-order-amt'],
        });
        const trainer = new Trainer_1.Trainer(quant, {
            buy_usdt: body.buy_usdt || 10,
            sell_usdt: body.sell_usdt || 10,
        });
        const result = await trainer.run(analyser.result);
        ctx.sendSuccess({
            data: result
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
exports.Train = Train;
