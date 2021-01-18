import { readFile, writeFile } from 'fs';
import { join } from 'path';
import xlsx from 'xlsx';
import config from 'config';
import { Quant } from ".";
import { promisify } from 'util';
import { DollarCostAvg, Analyser } from './analyse';
import dayjs from 'dayjs';
import Backtest from './Backtest';


const writeFilePromisify = promisify(writeFile);
const readFilePromisify = promisify(readFile);
const publicPath = config.get<string>('publicPath');
const fileName = 'btcusdt-5min-2021-01-18'
const jsonFilePath = join(publicPath, `/download/history-data/${fileName}.json`);

async function download() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' })

    const analyser = new Analyser()
    analyser.analysis(JSON.parse(data))

    const sheet = xlsx.utils.json_to_sheet(analyser.result);
    const workbook = { //定义操作文档
        SheetNames: ['analyser-result'], //定义表明
        Sheets: {
            'analyser-result': sheet //表对象[注意表明]
        },
    }

    xlsx.writeFile(workbook, join(publicPath, `/download/${fileName}.xlsx`)); //将数据写入文件
}

// download();

async function tranSafeTrade() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });
    const history = JSON.parse(data);


    const quant = new Quant({
        symbol: 'btcusdt',
        price: history[history.length - 1].close,
        quoteCurrencyBalance: 800,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.12],
        mins: [history[history.length - 1].close * 0.88],
        minVolume: 0.00001,
    });

    const bt = new Backtest({
        symbol: 'btcusdt',
        quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
        baseCurrencyBalance: quant.config.baseCurrencyBalance,
    });

    quant.use(function(row) {
        const tradingAdvice = quant.safeTrade(row.close);
        if (tradingAdvice) {
            const time = dayjs(row.time).format("YYYY/MM/DD H:mm:ss");

            if (tradingAdvice.action === 'buy') {
                bt.buy(row.close, tradingAdvice.volume);
            } else if (tradingAdvice.action === 'sell') {
                bt.sell(row.close, tradingAdvice.volume);
            }
        }
        // quant.dc.updateConfig({
        //     maxs: [row.close * 1.1],
        //     mins: [row.close * 0.9],
        // });
    })

    quant.analysis(history);
    quant.analysis(history);
    console.log(
        `
        quoteCurrencyBalance: ${bt.quoteCurrencyBalance}
        baseCurrencyBalance: ${bt.baseCurrencyBalance}
        收益率: ${bt.getReturn() * 100}%
        `
    )

}
// tranSafeTrade();

async function tran2() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });

    const history = JSON.parse(data);
    const quant = new Quant({
        symbol: 'btcusdt',
        price: history[history.length - 1].close,
        quoteCurrencyBalance: 300,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
    });
    quant.analysis(history);
    const result: any[] = []
    for (let oversoldRatio = 0.01; oversoldRatio < 0.08; oversoldRatio = oversoldRatio + 0.001) {
        for (let overboughtRatio = -0.01; overboughtRatio > -0.08; overboughtRatio = overboughtRatio - 0.001) {

            const bt = new Backtest({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                baseCurrencyBalance: quant.config.baseCurrencyBalance,
            })

            quant.mockUse(function (row) {
                if (!row.MA5 || !row.MA60 || !row.MA30 || !row.MA10) {
                    return;
                }
                if (row["close/MA60"] > oversoldRatio) {
                    bt.sell(row.close);
                }
                if (row["close/MA60"] < overboughtRatio) {
                    bt.buy(row.close);
                }
                // if (row.MA5 && row.MA10 > row.MA30 && row.MA30 > row.MA60) {

                // }
                // if (row.close < row.M10 && row.MA10 < row.MA30 && row.MA30 < row.MA60) {

                // }
            });

            result.push({
                oversoldRatio: oversoldRatio,
                overboughtRatio: overboughtRatio,
                return: bt.getReturn() * 100,
            })
        }
    }
    const sortedList = result.sort((a, b) => {
        return  b.return - a.return
    });

    const sheet = xlsx.utils.json_to_sheet(sortedList);
    const workbook = {
        SheetNames: ['超卖超买分析'], //定义表名
        Sheets: {
            '超卖超买分析': sheet //表对象[注意表明]
        },
    }
    console.log(sortedList[0])
    xlsx.writeFile(workbook, join(publicPath, '/download/tran2.xlsx'));
}
tran2();



async function tranAmount() {
    const data = await readFilePromisify(jsonFilePath, { encoding: 'utf-8' });

    const history = JSON.parse(data);
    const quant = new Quant({
        symbol: 'btcusdt',
        price: history[history.length - 1].close,
        quoteCurrencyBalance: 300,
        baseCurrencyBalance: 0,
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
    });
    quant.analysis(history);

    const result: any[] = []
    for (let sellAmountRatio = 1.4; sellAmountRatio < 8; sellAmountRatio = sellAmountRatio + 0.2) {
        for (let buyAmountRatio = 1.4; buyAmountRatio < 8; buyAmountRatio = buyAmountRatio + 0.2) {

            const bt = new Backtest({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                baseCurrencyBalance: quant.config.baseCurrencyBalance,
            })

            quant.mockUse(function (row) {

                if (!row.MA5 || !row.MA10 || !row.MA60 || !row.MA30) {
                    return;
                }
                  // 卖
                  if (row.close > row.MA10 && row.MA10> row.MA60) {
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

            result.push({
                sellAmountRatio,
                buyAmountRatio,
                return: bt.getReturn() * 100,
            })
        }
    }
    const sortedList = result.sort((a, b) => {
        return  b.return - a.return
    });


    const sheet = xlsx.utils.json_to_sheet(sortedList);
    const workbook = {
        SheetNames: ['买卖量分析'], //定义表名
        Sheets: {
            '买卖量分析': sheet //表对象[注意表明]
        },
    }
    console.log(sortedList[0])
    xlsx.writeFile(workbook, join(publicPath, '/download/tran-amount.xlsx'));
}
// tranAmount();
