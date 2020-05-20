
import config from 'config';
import { AppContext } from 'ROOT/interface/App';
import OrderEntity from './order.entity';
import * as OrderService from './order.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: AppContext) => {
    const { id } = ctx.request.query;
    try {
        let res: OrderEntity | OrderEntity[] | undefined;
        if (id) {
            res = await OrderService.findOne({id});
            if (!res) {
                ctx.sendError({message: 'error'});
                return;
            }
            ctx.sendSuccess({
                data: res
            });
        } else {
            res = await OrderService.find({});
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
            res = await OrderService.updateOne({id: data.id || data._id}, data);
        } else if (data.title) {
            res = await OrderService.create(data);
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
    try {
        const res = await OrderService.deleteOne({id: data._id});
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

