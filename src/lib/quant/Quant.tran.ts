import { readFile } from 'fs';
import { join } from 'path';
import xlsx from 'xlsx';
import config from 'config';
import { Quant } from ".";
import { promisify } from 'util';
import { DollarCostAvg, Analyser } from './analyse';
import dayjs from 'dayjs';
import Backtest from './Backtest';

const readFilePromisify = promisify(readFile);
const publicPath = config.get<string>('publicPath');
const fileName = 'btcusdt-5min-2021-01-09'
const filePath = join(publicPath, `/download/history-data/${fileName}.json`);

async function download() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' })

    const analyser = new Analyser()
    analyser.analysis(JSON.parse(data))

    const sheet = xlsx.utils.json_to_sheet(analyser.result);
    const workbook = { //定义操作文档
        SheetNames: ['nodejs-sheetname'], //定义表明
        Sheets: {
            'nodejs-sheetname': sheet //表对象[注意表明]
        },
    }

    xlsx.writeFile(workbook, join(publicPath, `/download/${fileName}.xlsx`)); //将数据写入文件
}

// download();

async function tran() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' });
    const history = (JSON.parse(data) as any[]).reverse();

    
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
            console.log(tradingAdvice)
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
// tran();

async function tran2() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' });

    const history = (JSON.parse(data) as any[]).reverse();
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
    for (let oversoldRatio = 0.01; oversoldRatio < 0.06; oversoldRatio = oversoldRatio + 0.002) {
        for (let overboughtRatio = -0.01; overboughtRatio > -0.06; overboughtRatio = overboughtRatio - 0.002) {

            const bt = new Backtest({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                baseCurrencyBalance: quant.config.baseCurrencyBalance,
            })

            quant.mockUse(function (row) {
                if (!row.MA5 || !row.MA60 || !row.MA30) {
                    return;
                }
                if (row["close/MA60"] > oversoldRatio && row.MA5 > row.MA30) {
                    bt.sell(row.close);
                }
                if (row["close/MA60"] < overboughtRatio && row.MA5 < row.MA30) {
                    bt.buy(row.close);
                }
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

    console.log(sortedList[0])
    const sheet = xlsx.utils.json_to_sheet(result);
    const workbook = {
        SheetNames: ['超卖超买分析'], //定义表名
        Sheets: {
            '超卖超买分析': sheet //表对象[注意表明]
        },
    }

    xlsx.writeFile(workbook, join(publicPath, '/download/tran2.xlsx'));
}
// tran2();



async function tran3() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' });

    const history = (JSON.parse(data) as any[]).reverse();
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
    for (let sellAmountRatio = 1; sellAmountRatio < 10; sellAmountRatio = sellAmountRatio + 0.1) {
        for (let buyAmountRatio = 1; buyAmountRatio < 10; buyAmountRatio = buyAmountRatio + 0.1) {

            const bt = new Backtest({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                baseCurrencyBalance: quant.config.baseCurrencyBalance,
            })

            quant.mockUse(function (row) {
                if (!row.MA5 || !row.MA60 || !row.MA30) {
                    return;
                }
                // 卖
                if (row.close > row.MA30) {
                    if (row['amount/amountMA20'] > sellAmountRatio) {
                        bt.sell(row.close);
                    }
                }
                // 买
                if (row.close < row.MA30) {
                    if (row['amount/amountMA20'] > buyAmountRatio) {
                        bt.buy(row.close);
                    }
                }
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

    console.log(sortedList[0])
    const sheet = xlsx.utils.json_to_sheet(result);
    const workbook = {
        SheetNames: ['买卖量分析'], //定义表名
        Sheets: {
            '买卖量分析': sheet //表对象[注意表明]
        },
    }

    xlsx.writeFile(workbook, join(publicPath, '/download/tran3.xlsx'));
}
tran3();