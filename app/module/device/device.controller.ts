
import config from 'config';
import { outLogger } from './../../common/logger';
import { Device } from './../../interface/Device';
import { ListResult } from './../../interface/List';

import { IDeviceModel } from './device.model';
import * as DeviceService from './device.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: App.KoaContext) => {
    const { id } = ctx.query;
    const { currentPage, pageSize } = ctx.request.query;
    try {
        let res: IDeviceModel | ListResult<Device> | null;
        if (id) {
            res = await DeviceService.findOne({id});
            if (!res) {
                ctx.sendError({message: 'error'});
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        } else {
            res = await DeviceService.find({}, {currentPage, pageSize});
            ctx.sendSuccess(res);
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
        if (data._id) {
            res = await DeviceService.updateOne({_id: data._id}, data, { upsert: true });
        } else {
            res = await DeviceService.create(data);
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
    const data = ctx.body;
    try {
        const res = await DeviceService.deleteOne({id: data.id});
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

