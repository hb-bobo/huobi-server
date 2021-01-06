
import { writeFileSync } from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';
import schema from 'async-validator';
import config from 'config';
import { AppContext } from 'ROOT/interface/App';
import { hbsdk_commom } from 'ROOT/huobi/hbsdk';
import { mkdir } from 'ROOT/utils';
import { Quant } from 'ROOT/lib/quant';


const publicPath = config.get<string>('publicPath');

const downloadPath = join(publicPath, '/download/history-data/');

async function initdir() {
    await mkdir(publicPath);
    await mkdir(join(publicPath, '/download/'));
    await mkdir(downloadPath);
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

        const data = await hbsdk_commom
            .getMarketHistoryKline({ symbol: body.symbol, size: body.size, period: body.period });
        const fileName = `${body.symbol}-${body.period}-${dayjs().format("YYYY-MM-DD")}.json`
        writeFileSync(join(downloadPath, fileName), JSON.stringify(data))
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
 * 回测
 */
export const Backtest = async (ctx: AppContext) => {
    const body = ctx.request.body;

    const validator = new schema({
        fileName: {
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
        // new Quant()
        const data = await hbsdk_commom
            .getMarketHistoryKline({ symbol: body.symbol, size: body.size, period: body.period });
        const fileName = `${body.symbol}-${body.period}-${dayjs().format("YYYY-MM-DD")}.json`
        writeFileSync(join(downloadPath, fileName), JSON.stringify(data))
        ctx.sendSuccess({
            data: {
                url: `${ctx.URL.origin}/download/history-data/${fileName}`
            }
        });
    } catch (error) {
        ctx.sendError({ message: error });
    }
}
