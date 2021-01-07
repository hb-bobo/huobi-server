import { readFile } from 'fs';
import { join } from 'path';
import xlsx from 'xlsx';
import config from 'config';
import { Quant } from ".";
import { promisify } from 'util';
import { DollarCostAvg } from './analyse';
import dayjs from 'dayjs';
import Backtest from './Backtest';
import { forEach } from 'lodash';

const readFilePromisify = promisify(readFile);
const publicPath = config.get<string>('publicPath');

const filePath = join(publicPath, '/download/history-data/btcusdt-5min-2021-01-06.json');

async function download() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' })

    const quant = new Quant()
    quant.analysis(JSON.parse(data))

    const sheet = xlsx.utils.json_to_sheet(quant.result);
    const workbook = { //定义操作文档
        SheetNames: ['nodejs-sheetname'], //定义表明
        Sheets: {
            'nodejs-sheetname': sheet //表对象[注意表明]
        },
    }

    xlsx.writeFile(workbook, join(publicPath, '/download/btcusdt-5min-2021-01-06.xlsx')); //将数据写入文件
}

// download();

async function tran() {
    const data = await readFilePromisify(filePath, { encoding: 'utf-8' });
    const history = (JSON.parse(data) as any[]).reverse();
    const dc = new DollarCostAvg({
        maxs: [history[history.length - 1].close * 1.04],
        mins: [history[history.length - 1].close * 0.96],
        minVolume: 0.00001,
        balance: 300 / history[history.length - 1].close,
    });
    const bt = new Backtest({
        symbol: 'btcusdt',
        quoteCurrencyBalance: 300,
        baseCurrencyBalance: 0,
    })
    const quant = new Quant()

    quant.use(function(row) {

        const tradingAdvice = dc.trade(row.close);
        if (tradingAdvice) {
            // const time = dayjs(row.time).format("YYYY/MM/DD H:mm:ss");

            if (tradingAdvice.action === 'buy') {
                bt.buy(row.close, tradingAdvice.volume);
            } else if (tradingAdvice.action === 'sell') {
                bt.sell(row.close, tradingAdvice.volume);
            }
        }
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

    const result: any[] = []
    for (let oversoldRatio = 0.01; oversoldRatio < 0.06; oversoldRatio = oversoldRatio + 0.002) {
        for (let overboughtRatio = -0.01; overboughtRatio > -0.06; overboughtRatio = overboughtRatio - 0.002) {
            const quant = new Quant()

            const bt = new Backtest({
                symbol: 'btcusdt',
                buyAmount: 0.001,
                sellAmount: 0.001,
                quoteCurrencyBalance: 300,
                baseCurrencyBalance: 0,
            })

            quant.use(function (row) {
                if (!row.MA5 || !row.MA60) {
                    return;
                }
                if (row["close/MA60"] > oversoldRatio && row.MA5 > row.MA60) {
                    bt.sell(row.close);
                }
                if (row["close/MA60"] < -overboughtRatio && row.MA5 < row.MA60) {
                    bt.buy(row.close);
                }
            });
            quant.analysis(history);
            result.push({
                oversoldRatio: oversoldRatio,
                overboughtRatio: overboughtRatio,
                return: bt.getReturn() * 100,
            })
        }
    }
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
