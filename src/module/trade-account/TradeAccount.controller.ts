
import config from 'config';
import schema from 'async-validator';
import { AppContext } from 'ROOT/interface/App';
import { trader } from 'ROOT/huobi/start';
import TradeAccountEntity from './TradeAccount.entity';
import * as TradeAccountService from './TradeAccount.service';
/**
 * 查询单个或者多个
 */
export const get = async (ctx: AppContext) => {
    const { id } = ctx.request.query;
    try {
        let res: TradeAccountEntity | TradeAccountEntity[] | undefined;
        if (id) {
            res = await TradeAccountService.findOne({id: id as any});
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
export const updateOne = async (ctx: AppContext) => {
    const {
        id,
        _id,
        auto_trade,
        exchange,
        access_key,
        secret_key,
        uid,
        trade_password,
    } = ctx.request.body;
    const ID = id || _id;
    const DATA = {
        auto_trade,
        exchange,
        access_key,
        secret_key,
        uid,
        trade_password,
    }
    const validator = new schema({
        id: {
            type: "string",
        },
        exchange: {
            type: "string",
        },
        access_key: {
            type: "string",
            required: true,
        },
        secret_key: {
            type: "string",
            required: true,
        },
        uid: {
            type: "string",
            required: true,
        },
        trade_password: {
            type: "string",
            required: true,
        },
    });
    try {
        await validator.validate(DATA);
    } catch ({ errors, fields }) {
        ctx.sendError({errors});
        return;
    }
    try {
        DATA.auto_trade = Number(DATA.auto_trade);
        let res;
        if (ID) {
            res = await TradeAccountService.updateOne({id: ID}, DATA);
            if (DATA.access_key) {
                trader.sdk.setOptions({
                    accessKey: DATA.access_key,
                    secretKey: DATA.secret_key,
                });
            }
            ctx.sendSuccess();
        } else {
            res = await TradeAccountService.create({
                ...DATA,
                userId: ctx.state.user && ctx.state.user.id
            });
            ctx.sendSuccess({
                data: res
            });
        }


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
        const res = await TradeAccountService.deleteOne({id: data._id});
        ctx.sendSuccess({
            data: res
        });
    } catch (error) {
        ctx.sendError({message: error});
    }
}

