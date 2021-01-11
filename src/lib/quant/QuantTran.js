"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const xlsx_1 = __importDefault(require("xlsx"));
const config_1 = __importDefault(require("config"));
const _1 = require(".");
const util_1 = require("util");
const analyse_1 = require("./analyse");
const Backtest_1 = __importDefault(require("./Backtest"));
const readFilePromisify = util_1.promisify(fs_1.readFile);
const publicPath = config_1.default.get('publicPath');
const filePath = path_1.join(publicPath, '/download/history-data/btcusdt-5min-2021-01-06.json');
async function download() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' });
    const analyser = new analyse_1.Analyser();
    analyser.analysis(JSON.parse(data));
    const sheet = xlsx_1.default.utils.json_to_sheet(analyser.result);
    const workbook = {
        SheetNames: ['nodejs-sheetname'],
        Sheets: {
            'nodejs-sheetname': sheet //表对象[注意表明]
        },
    };
    xlsx_1.default.writeFile(workbook, path_1.join(publicPath, '/download/btcusdt-5min-2021-01-06.xlsx')); //将数据写入文件
}
// download();
async function tran() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' });
    const history = JSON.parse(data).reverse();
    const dc = new analyse_1.DollarCostAvg({
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
        balance: 300 / history[history.length - 1].close,
    });
    const bt = new Backtest_1.default({
        symbol: 'btcusdt',
        quoteCurrencyBalance: 300,
        baseCurrencyBalance: 0,
    });
    const quant = new _1.Quant({
        symbol: 'btcusdt',
        quoteCurrencyBalance: 300,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
    });
    quant.use(function (row) {
        const tradingAdvice = dc.trade(row.close);
        if (tradingAdvice) {
            // const time = dayjs(row.time).format("YYYY/MM/DD H:mm:ss");
            if (tradingAdvice.action === 'buy') {
                bt.buy(row.close, tradingAdvice.volume);
            }
            else if (tradingAdvice.action === 'sell') {
                bt.sell(row.close, tradingAdvice.volume);
            }
        }
    });
    quant.analysis(history);
    quant.analysis(history);
    console.log(`
        quoteCurrencyBalance: ${bt.quoteCurrencyBalance}
        baseCurrencyBalance: ${bt.baseCurrencyBalance}
        收益率: ${bt.getReturn() * 100}%
        `);
}
// tran();
async function tran2() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' });
    const history = JSON.parse(data).reverse();
    const result = [];
    for (let oversoldRatio = 0.01; oversoldRatio < 0.06; oversoldRatio = oversoldRatio + 0.002) {
        for (let overboughtRatio = -0.01; overboughtRatio > -0.06; overboughtRatio = overboughtRatio - 0.002) {
            const quant = new _1.Quant({
                symbol: 'btcusdt',
                quoteCurrencyBalance: 300,
                baseCurrencyBalance: 0,
                maxs: [history[history.length - 1].close * 1.04],
                mins: [history[history.length - 1].close * 0.96],
                minVolume: 0.00001,
            });
            const bt = new Backtest_1.default({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                baseCurrencyBalance: 0,
            });
            quant.use(function (row) {
                if (!row.MA5 || !row.MA60) {
                    return;
                }
                if (row["close/MA60"] > oversoldRatio && row.MA5 > row.MA60) {
                    bt.sell(row.close);
                }
                if (row["close/MA60"] < overboughtRatio && row.MA5 < row.MA60) {
                    bt.buy(row.close);
                }
            });
            quant.analysis(history);
            result.push({
                oversoldRatio: oversoldRatio,
                overboughtRatio: overboughtRatio,
                return: bt.getReturn() * 100,
            });
        }
    }
    const sheet = xlsx_1.default.utils.json_to_sheet(result);
    const workbook = {
        SheetNames: ['超卖超买分析'],
        Sheets: {
            '超卖超买分析': sheet //表对象[注意表明]
        },
    };
    xlsx_1.default.writeFile(workbook, path_1.join(publicPath, '/download/tran2.xlsx'));
}
tran2();
