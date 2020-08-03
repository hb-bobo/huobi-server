

import schema from 'async-validator';

import { AppContext } from 'ROOT/interface/App';

import * as ConfigService from './config.service';



export const index = async (ctx: AppContext) => {
    const {mail} = ctx.request.query;
    try {
        const list = await ConfigService.findOne({mail});
        ctx.sendSuccess({message: ''});
    } catch (error) {
        ctx.sendError({message: '已发送'});
        return;
    }
}

export const create = async (ctx: AppContext) => {
    const { mail } = ctx.request.body;
    const validator = new schema({
        mail: {
            type: "string",
            required: true,
        },
    });
    try {
        await validator.validate({ mail });
    } catch ({ errors, fields }) {
        ctx.sendError({errors});
        return;
    }
    try {
        const res = await ConfigService.create({
            mail
        });
        ctx.sendSuccess();
    } catch (error) {
        ctx.sendError({message: error.message});
    }

}


export const remove = async (ctx: AppContext) => {
    const { id } = ctx.request.body;
    const validator = new schema({
        id: {
            type: "string",
            required: true,
        },
    });
    try {
        await validator.validate({ id });
    } catch ({ errors, fields }) {
        ctx.sendError({errors});
        return;
    }
    try {
        const res = await ConfigService.deleteOne({id});
        ctx.sendSuccess({data: res});
    } catch (error) {
        ctx.sendError({message: error});
    }
}
