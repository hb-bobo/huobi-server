
import config from 'config';
import schema from 'async-validator';
import { AppContext } from 'ROOT/interface/App';

import AutoOrderConfigEntity from './AutoOrderConfig.entity';
import * as AutoOrderConfigService from './AutoOrderConfig.service';
import { trader } from 'ROOT/huobi/start';

export default class AutoOrderConfigLogController {
    public static index = async (ctx: AppContext) => {
        const { id } = ctx.request.query;
        try {
            let res: AutoOrderConfigEntity | AutoOrderConfigEntity[] | undefined;
            if (id) {
                res = await AutoOrderConfigService.findOne({id});
                if (!res) {
                    ctx.sendError({message: 'error'});
                    return;
                }
                ctx.sendSuccess({
                    data: res
                });
            } else {
                res = await AutoOrderConfigService.find({});
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
            buy_usdt: {
                type: "number",
            },
            sell_usdt: {
                type: "number",
            }
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
                res = await AutoOrderConfigService.updateOne({id: data.id || data._id}, data);
            } else if (data) {
                const userId = ctx.state.user && ctx.state.user.id;
                res = await AutoOrderConfigService.create({
                    ...data,
                    userId: userId
                });
                await trader.autoTrader(data, userId as number);
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
            const res = await AutoOrderConfigService.deleteOne({id: data._id});
            ctx.sendSuccess({
                data: res
            });
        } catch (error) {
            ctx.sendError({message: error});
        }
    }
}


