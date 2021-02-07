
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
