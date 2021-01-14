
import config from 'config';
import schema from 'async-validator';
import { AppContext } from 'ROOT/interface/App';

import OrderEntity from './AutoOrder.entity';
import * as AutoOrderService from './AutoOrder.service';

export default class AutoOrderController {
    public static index = async (ctx: AppContext) => {
        const { id } = ctx.request.query;
        try {
            let res: OrderEntity | OrderEntity[] | undefined;
            if (id) {
               
                if (!res) {
                    ctx.sendError({message: 'error'});
                    return;
                }
                ctx.sendSuccess({
                    data: res
                });
            } else {
                res = await AutoOrderService.find({});
                ctx.sendSuccess({data: res});
            }
        } catch (error) {
            ctx.sendError({message: error});
        }
    }

    /**
     * 更新或者新建
     */
    public static updateOne = async (ctx: AppContext) => {
        const data = ctx.request.body;
        const validator = new schema({
            symbol: {
                type: "string",
                required: true,
            },
            amount: {
                type: "number",
            },
            money: {
                type: "number",
            },
            buyCount: {
                type: "number",
            },
            sellCount: {
                type: "number",
            },
            // tradeType: {
            //     type: "string",
            // },
            period: {
                type: "number",
            },
            forceTrade: {
                type: "boolean",
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
            if (data.id || data._id) {
                //
            } else if (data.title) {
                res = await AutoOrderService.create(data);
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
    public static  removeOne = async (ctx: AppContext) => {
        const data = ctx.request.body;
        try {
            // const res = await AutoOrderService.deleteOne({id: data._id});
            // ctx.sendSuccess({
            //     data: res
            // });
        } catch (error) {
            ctx.sendError({message: error});
        }
    }
}


