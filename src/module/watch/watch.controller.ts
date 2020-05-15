
import config from 'config';
import WatchEntity from './watch.entity';
import * as WatchEntityService from './watch.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: App.KoaContext) => {
    const { id } = ctx.request.query;
    try {
        let res: WatchEntity | WatchEntity[] | undefined;
        if (id) {
            res = await WatchEntityService.findOne({id});
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
export const updateOne = async (ctx: App.KoaContext) => {
    const data = ctx.request.body;
    try {
        let res;
        if (data.id || data._id) {
            res = await WatchEntityService.updateOne({id: data.id || data._id}, data);
        } else if (data.title) {
            res = await WatchEntityService.create(data);
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
        const res = await WatchEntityService.deleteOne({id: data._id});
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

