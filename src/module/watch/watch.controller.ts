
import config from 'config';
import { CandlestickIntervalEnum } from 'node-huobi-sdk';
import { hbsdk } from 'ROOT/huobi/hbsdk';
import { handleDepth, handleKline, handleTrade } from 'ROOT/huobi/huobi-handler';

import { AppContext } from 'ROOT/interface/App';

import WatchEntity from './watch.entity';
import * as WatchEntityService from './watch.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: AppContext) => {
    const { id } = ctx.request.query;
    try {
        let res: WatchEntity | WatchEntity[] | undefined;
        if (id) {
            res = await WatchEntityService.findOne({id: id as any});
            if (!res) {
                ctx.sendError({message: 'error'});
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        } else {
            res = await WatchEntityService.find({});
            ctx.sendSuccess({data: res});
        }
    } catch (error) {
        ctx.sendError({message: error});
    }
}

/**
 * 更新或者新建
 */
export const updateOne = async (ctx: AppContext) => {
    const data = ctx.request.body;
    try {
        let res;
        if (data.id || data._id) {
            res = await WatchEntityService.updateOne({id: data.id || data._id}, data);
        } else if (data.symbol) {
            res = await WatchEntityService.create(data);
            const SYMBOL = data.symbol.toLowerCase();

            hbsdk.subMarketDepth({symbol: SYMBOL}, handleDepth)
            hbsdk.subMarketKline({symbol: SYMBOL, period: CandlestickIntervalEnum.MIN5}, handleKline)
            hbsdk.subMarketTrade({symbol: SYMBOL}, handleTrade)
        } else {
            ctx.sendError({message: '格式有误'});
            return;
        }
        ctx.sendSuccess({
            data: res
        });

    } catch (error) {
        ctx.sendError({message: error});
    }
}


/**
 * 删除单个
 */
export const removeOne = async (ctx: AppContext) => {
    const data = ctx.request.body;
    const id = data.id || data._id;
    if (!id) {
        ctx.sendError({message: 'id 不存在'});
        return;
    }
    try {
        const res = await WatchEntityService.deleteOne({id: id});
        const SYMBOL = res.symbol.toLowerCase();
        // HUOBI_WS.upsub(WS_SUB.kline(SYMBOL, '1min'));
        // HUOBI_WS.upsub(WS_SUB.depth(SYMBOL));
        // HUOBI_WS.upsub(WS_SUB.tradeDetail(SYMBOL));
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

