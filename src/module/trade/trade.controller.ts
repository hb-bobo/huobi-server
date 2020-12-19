
import config from 'config';
import schema from 'async-validator';
import { AppContext } from 'ROOT/interface/App';

import * as TradeService from './trade.service';


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
        let res = await TradeService.find({
            start: new Date(start),
            end: new Date(end), symbol: (symbol as string).toLowerCase()}
        );

        ctx.sendSuccess({data: res});
    } catch (error) {
 
        ctx.sendError({message: error});
    }
}

/**
 * 新建
 */
export const create = async (ctx: AppContext) => {
    const data = ctx.request.body;
    const validator = new schema({
        buy: {
            type: "boolean",
            required: true,
        },
        sell: {
            type: "string",
            required: true,
        },
        symbol: {
            type: "string",
            required: true,
        },
        time: {
            type: "date",
            required: true,
        },
    });
    try {
        await validator.validate(data);
    } catch ({ errors, fields }) {
        ctx.sendError({errors});
        return;
    }
    try {
        let res;
        if (data.title) {
            res = await TradeService.create(data);
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



