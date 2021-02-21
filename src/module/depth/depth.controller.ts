
import config from 'config';
import { AppContext } from 'ROOT/interface/App';
import schema from 'async-validator';
import * as DepthService from './depth.service';

/**
 * 查询单个或者多个
 */
export const get = async (ctx: AppContext) => {
    const { start, end, symbol } = ctx.request.query;

    const validator = new schema({
        start: {
            type: "string",
            required: true,
        },
        end: {
            type: "string",
            required: true,
        },
        symbol: {
            type: "string",
            required: true,
        }
    });
    try {
        await validator.validate({ start, end, symbol });
    } catch ({ errors, fields }) {
        ctx.sendError({errors});
        return;
    }
    try {
        const res = await DepthService.find({
            start: new Date(start as string),
            end: new Date(end as string), 
            symbol: (symbol as string).toLowerCase()}
        );

        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}

/**
 * 更新或者新建
 */
export const create = async (ctx: AppContext) => {
    const data = ctx.request.body;
    try {
        const res = await DepthService.create(data);
        ctx.sendSuccess({
            data: res
        });

    } catch (error) {
        ctx.sendError({message: error});
    }
}


