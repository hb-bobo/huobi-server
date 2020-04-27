
import config from 'config';
import { Advert } from './../..//interface/Advert';
import { ListResult } from './../..//interface/List';
// import { outLogger } from './../../common/logger';

import { IAdvertModel } from './advert.model';
import * as AdvertService from './advert.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: App.KoaContext) => {
    const {  id, from, currentPage, pageSize } = ctx.request.query;
    try {
        let res: IAdvertModel | ListResult<Advert> | Advert[] | null;
        if (id) {
            res = await AdvertService.findOne({_id: id});
            if (!res) {
                ctx.sendError({message: 'error'});
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        } else {
            res = await AdvertService.find({}, {currentPage, pageSize, from});
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
            res = await AdvertService.updateOne({_id: data.id || data._id}, data, { upsert: true });
        } else if (data.title) {
            res = await AdvertService.create(data);
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
        const res = await AdvertService.deleteOne({_id: data._id});
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

