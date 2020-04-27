
import { DeviceTag } from 'APP/interface/Device';
import { isObject } from 'util';
import * as DeviceTagService from './device-tag.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: App.KoaContext) => {
    try {
         const res: DeviceTag[] = await DeviceTagService.find();
        ctx.sendSuccess({data: res});
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
        if (isObject(data) && data._id) {
            res = await DeviceTagService.updateOne({_id: data._id}, data, { upsert: true });
        } else {
            res = await DeviceTagService.create(data);
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
        const res = await DeviceTagService.deleteOne({_id: data.id});
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

