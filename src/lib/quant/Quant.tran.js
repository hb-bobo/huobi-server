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
const dayjs_1 = __importDefault(require("dayjs"));
const Backtest_1 = __importDefault(require("./Backtest"));
const writeFilePromisify = util_1.promisify(fs_1.writeFile);
const readFilePromisify = util_1.promisify(fs_1.readFile);
const publicPath = config_1.default.get('publicPath');
const fileName = 'btcusdt-5min-2021-02-18';
const jsonFilePath = path_1.join(publicPath, `/download/history-data/${fileName}.json`);
async function download() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });
    const analyser = new analyse_1.Analyser({ maxResult: 800 });
    analyser.analysis(JSON.parse(data));
    const sheet = xlsx_1.default.utils.json_to_sheet(analyser.result);
    const workbook = {
        SheetNames: ['analyser-result'],
        Sheets: {
            'analyser-result': sheet //表对象[注意表明]
        },
    };
    xlsx_1.default.writeFile(workbook, path_1.join(publicPath, `/download/${fileName}.xlsx`)); //将数据写入文件
}
download();
async function tranSafeTrade() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });
    const history = JSON.parse(data).splice(0, 640);
    const quant = new _1.Quant({
        symbol: 'btcusdt',
        price: history[history.length - 1].close,
        quoteCurrencyBalance: 400,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.10],
        mins: [history[history.length - 1].close * 0.90],
        minVolume: 0.00001,
    });
    const bt = new Backtest_1.default({
        symbol: 'btcusdt',
        quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
        baseCurrencyBalance: quant.config.baseCurrencyBalance,
    });
    quant.analysis(history);
    quant.mockUse(function (row) {
        const tradingAdvice = quant.safeTrade(row.close);
        if (tradingAdvice) {
            const time = dayjs_1.default(row.time).format("YYYY/MM/DD H:mm:ss");
            if (tradingAdvice.action === 'buy') {
                bt.buy(row.close, tradingAdvice.volume);
            }
            else if (tradingAdvice.action === 'sell') {
                bt.sell(row.close, tradingAdvice.volume);
            }
        }
    });
    console.log(`
        quoteCurrencyBalance: ${bt.quoteCurrencyBalance}
        baseCurrencyBalance: ${bt.baseCurrencyBalance}
        收益率: ${bt.getReturn() * 100}%
        `);
}
// tranSafeTrade();
async function tran2() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });
    const history = JSON.parse(data);
    const quant = new _1.Quant({
        symbol: 'btcusdt',
        price: history[history.length - 1].close,
        quoteCurrencyBalance: 600,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
    });
    const result = [];
    for (let oversoldRatio = 0.012; oversoldRatio < 0.06; oversoldRatio = oversoldRatio + 0.002) {
        for (let overboughtRatio = -0.012; overboughtRatio > -0.06; overboughtRatio = overboughtRatio - 0.002) {
            const bt = new Backtest_1.default({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                baseCurrencyBalance: quant.config.baseCurrencyBalance,
            });
            let buyCount = 0;
            let sellCount = 0;
            quant.analyser.result = [];
            quant.use(function (row) {
                if (!row.MA5 || !row.MA30 || !row.MA10) {
                    return;
                }
                if (row["close/MA60"] > oversoldRatio) {
                    sellCount++;
                    bt.sell(row.close, 10 / row.close);
                }
                if (row["close/MA60"] < overboughtRatio) {
                    buyCount++;
                    bt.buy(row.close), 10 / row.close;
                }
            });
            quant.analysis(history);
            result.push({
                oversoldRatio: oversoldRatio,
                overboughtRatio: overboughtRatio,
                return: bt.getReturn() * 100,
                buyCount,
                sellCount
            });
        }
    }
    const sortedList = result.sort((a, b) => {
        return b.return - a.return;
    });
    const sheet = xlsx_1.default.utils.json_to_sheet(sortedList);
    const workbook = {
        SheetNames: ['超卖超买分析'],
        Sheets: {
            '超卖超买分析': sheet //表对象[注意表明]
        },
    };
    console.log(sortedList[0]);
    xlsx_1.default.writeFile(workbook, path_1.join(publicPath, '/download/tran2.xlsx'));
}
tran2();
async function tranMA() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });
    const history = JSON.parse(data);
    const quant = new _1.Quant({
        symbol: 'btcusdt',
        price: history[history.length - 1].close,
        quoteCurrencyBalance: 300,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
    });
    quant.analysis(history);
    const result = [];
    const bt = new Backtest_1.default({
        symbol: 'btcusdt',
        buyAmount: 0.001,
        sellAmount: 0.001,
        quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
        baseCurrencyBalance: quant.config.baseCurrencyBalance,
    });
    quant.mockUse(function (row) {
        if (!row.MA5 || !row.MA60 || !row.MA30 || !row.MA10) {
            return;
        }
        if (row.MA5 > row.MA10 && row.MA10 > row.MA30 && row.MA30 > row.MA60) {
            bt.sell(row.close);
        }
        if (row.MA5 < row.MA10 && row.MA10 < row.MA30 && row.MA30 < row.MA60) {
            bt.buy(row.close);
        }
    });
    console.log(`
        quoteCurrencyBalance: ${bt.quoteCurrencyBalance}
        baseCurrencyBalance: ${bt.baseCurrencyBalance}
        收益率: ${bt.getReturn() * 100}%
        `);
    const sheet = xlsx_1.default.utils.json_to_sheet(result);
    const workbook = {
        SheetNames: ['交易结果'],
        Sheets: {
            '交易结果': sheet //表对象[注意表明]
        },
    };
    xlsx_1.default.writeFile(workbook, path_1.join(publicPath, '/download/tran_MA.xlsx'));
}
// tranMA();
async function tranAmount() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });
    const history = JSON.parse(data);
    const quant = new _1.Quant({
        symbol: 'btcusdt',
        price: history[history.length - 1].close,
        quoteCurrencyBalance: 300,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
    });
    const result = [];
    for (let sellAmountRatio = 1.4; sellAmountRatio < 8; sellAmountRatio = sellAmountRatio + 0.2) {
        for (let buyAmountRatio = 1.4; buyAmountRatio < 8; buyAmountRatio = buyAmountRatio + 0.2) {
            const bt = new Backtest_1.default({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                baseCurrencyBalance: quant.config.baseCurrencyBalance,
            });
            quant.analyser.result = [];
            quant.use(function (row) {
                if (!row.MA5 || !row.MA10 || !row.MA60 || !row.MA30) {
                    return;
                }
                // 卖
                if (row.close > row.MA10 && row.MA10 > row.MA30) {
                    if (row['amount/amountMA20'] > sellAmountRatio) {
                        bt.sell(row.close);
                    }
                }
                // 买
                if (row.close < row.MA10 && row.MA10 < row.MA30) {
                    if (row['amount/amountMA20'] > buyAmountRatio) {
                        bt.buy(row.close);
                    }
                }
                //    // 卖
                //     if (row.close > row.MA5 && row.MA5 > row.MA10 && row.MA10> row.MA30 && row.MA30 > row.MA60) {
                //         if (row['amount/amountMA20'] > sellAmountRatio) {
                //             bt.sell(row.close);
                //         }
                //     }
                //     // 买
                //     if (row.close < row.MA5 && row.MA5 < row.MA10 && row.MA10 < row.MA30 && row.MA30 < row.MA60) {
                //         if (row['amount/amountMA20'] > buyAmountRatio) {
                //             bt.buy(row.close);
                //         }
                //     }
            });
            quant.analysis(history);
            result.push({
                sellAmountRatio,
                buyAmountRatio,
                return: bt.getReturn() * 100,
            });
        }
    }
    const sortedList = result.sort((a, b) => {
        return b.return - a.return;
    });
    const sheet = xlsx_1.default.utils.json_to_sheet(sortedList);
    const workbook = {
        SheetNames: ['买卖量分析'],
        Sheets: {
            '买卖量分析': sheet //表对象[注意表明]
        },
    };
    console.log(sortedList[0]);
    xlsx_1.default.writeFile(workbook, path_1.join(publicPath, '/download/tran-amount.xlsx'));
}
// tranAmount();
