
import { writeFile, readdir } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import stream from 'stream';
import dayjs from 'dayjs';
import schema from 'async-validator';
import config from 'config';
import { AppContext } from 'ROOT/interface/App';

import { mkdir } from 'ROOT/utils';
import { hbsdk } from 'ROOT/huobi/hbsdk';
import got from 'got/dist/source';
import { Analyser } from 'ROOT/lib/quant/analyse';
import { Quant } from 'ROOT/lib/quant';
import { Trader } from 'ROOT/huobi/Trader';
import { Trainer } from "ROOT/huobi/Trainer";
import { getSymbolInfo } from 'ROOT/huobi/util';

const writeFilePromisify = promisify(writeFile);
const pipelinePromisify = promisify(stream.pipeline);
const readdirPromisify = promisify(readdir);
const publicPath = config.get<string>('publicPath');

const downloadPath = join(publicPath, '/download/history-data/');
const analysisPath = join(publicPath, '/download/analysis/');
async function initdir() {
    await mkdir(publicPath);
    await mkdir(join(publicPath, '/download/'));
    await mkdir(downloadPath);
    await mkdir(analysisPath);
}
initdir();
/**
 * 下载数据
 */
export const download = async (ctx: AppContext) => {
    const body = ctx.request.body;

    const validator = new schema({
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
    } catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }

    try {

        const data = await hbsdk
            .getMarketHistoryKline( body.symbol, body.period, body.size);
        const fileName = `${body.symbol}-${body.period}-${dayjs().format("YYYY-MM-DD")}.json`
        if (data === undefined) {
            ctx.sendError({ message: '数据拉取失败' });
            return;
        }
        await writeFilePromisify(join(downloadPath, fileName), JSON.stringify(data.reverse()))
        ctx.sendSuccess({
            data: {
                url: `${ctx.URL.origin}/download/history-data/${fileName}`
            }
        });
    } catch (error) {
        ctx.sendError({ message: error });
    }
}

/**
 * 分析数据列表
 */
export const AnalysisList = async (ctx: AppContext) => {

    try {
        let list = await readdirPromisify(analysisPath)
        list = list.map((fileName) => {
            return `${ctx.URL.origin}/download/analysis/${fileName}`
        })
        ctx.sendSuccess({
            data: list
        });
    } catch (error) {
        ctx.sendError({ message: error });
    }
}

/**
 * 分析数据
 */
export const Analysis = async (ctx: AppContext) => {
    const body = ctx.request.body;

    const validator = new schema({
        url: {
            type: "string",
            required: true,
        }
    });

    try {
        await validator.validate(body);
    } catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }

    try {
        const urlArr: string[] = body.url.split('/');
        const fileName = urlArr[urlArr.length - 1];
        const response = await got(body.url);
        const analyser = new Analyser();
        const list: any[] = [];
        analyser.use((row) => {
            list.push(row);
        })
        analyser.analysis(JSON.parse((response.body)));
        // await pipelinePromisify(got(body.url), fs.createWriteStream('index.html'))
        await writeFilePromisify(join(analysisPath, fileName), JSON.stringify(list))
        ctx.sendSuccess({
            data: {
                url: `${ctx.URL.origin}/download/analysis/${fileName}`
            }
        });
    } catch (error) {
        ctx.sendError({ message: error });
    }
}


/**
 * 分析数据
 */
export const Train = async (ctx: AppContext) => {
    const body = ctx.request.body;

    const validator = new schema({
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
    } catch ({ errors, fields }) {
        ctx.sendError({ errors });
        return;
    }

    try {
        let symbol = '';
        let historyList: any[] = [];
   
        if (body.symbol && body.period && body.size) {
            symbol = body.symbol
            const data = await hbsdk
            .getMarketHistoryKline( body.symbol, body.period, body.size);
            if (data === undefined) {
                ctx.sendError({ message: '数据拉取失败' });
                return;
            }
            historyList = data.reverse();
        } else {
            const urlArr: string[] = body.url.split('/');
            const fileName = urlArr[urlArr.length - 1];
            symbol = fileName.split('-')[0];
            const response = await got(body.url);
            historyList = JSON.parse((response.body));
        }
        const symbolInfo = await getSymbolInfo(symbol);
        if (!symbolInfo) {
            ctx.sendError({ message: 'symbol数据拉取失败' });
            return;
        }
        const analyser = new Analyser();

        analyser.analysis(historyList);
        const quant = new Quant({
            symbol: symbol,
            quoteCurrencyBalance: body.quoteCurrencyBalance || 300,
            baseCurrencyBalance: body.baseCurrencyBalance || symbolInfo['limit-order-min-order-amt'] * 10,
            mins: [],
            maxs: [],
            minVolume: symbolInfo['limit-order-min-order-amt'],
        });
        const trainer = new Trainer(quant, {
            buy_usdt: body.buy_usdt || 10,
            sell_usdt: body.sell_usdt || 10,
        });
        const result = await trainer.run(analyser.result)

        ctx.sendSuccess({
            data: result
        });
    } catch (error) {
        ctx.sendError({ message: error });
    }
}

