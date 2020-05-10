
import config from 'config';
import TradeAccountEntity from './TradeAccount.entity';
import * as TradeAccountService from './TradeAccount.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: App.KoaContext) => {
    const { id } = ctx.request.query;
    try {
        let res: TradeAccountEntity | TradeAccountEntity[] | undefined;
        if (id) {
            res = await TradeAccountService.findOne({id});
            if (!res) {
                ctx.sendError({message: 'error'});
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        } else {
            res = await TradeAccountService.find({});
            ctx.sendSuccess({data: res});
        }
    } catch (error) {
        ctx.sendError({message: error});
    }
}

/**
 * 更新或者新建
 */
export const updateOne = async (ctx: App.KoaContext) => {
    const data = ctx.request.body;
    try {
        let res;
        if (data.id || data._id) {
            res = await TradeAccountService.updateOne({id: data.id || data._id}, data);
        } else if (data.title) {
            res = await TradeAccountService.create(data);
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
export const removeOne = async (ctx: App.KoaContext) => {
    const data = ctx.request.body;
    try {
        const res = await TradeAccountService.deleteOne({id: data._id});
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

