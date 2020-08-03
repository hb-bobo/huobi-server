

import schema from 'async-validator';

import { AppContext } from 'ROOT/interface/App';

import * as ConfigService from './config.service';



export const index = async (ctx: AppContext) => {
    const {current = 1, pageSize} = ctx.request.query;
    try {
        const list = await ConfigService.find({}, {current, pageSize});
        ctx.sendSuccess({
            data: list
        });
    } catch (error) {
        ctx.sendError({message: error});
        return;
    }
}

export const create = async (ctx: AppContext) => {
    const { type, content } = ctx.request.body;
    const validator = new schema({
        type: {
            type: "string",
            required: true,
        },
    });
    try {
        await validator.validate({ type, content });
    } catch ({ errors, fields }) {
        ctx.sendError({errors});
        return;
    }
    try {
        const res = await ConfigService.create({
            type,
            content,
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
