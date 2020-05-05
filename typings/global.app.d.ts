import { BaseContext, Context, ParameterizedContext } from 'koa';
import { ResponseBody } from 'ROOT/interface/Http';
import { IRouterParamContext, RouterContext } from 'koa-router';

export as namespace App;

export interface SessionData {
    token: string;
}
export interface AppConfig{
    port: number;
    host: string;
    isDev: boolean;
    publicPath: string;
    dbConfig: {
        host     : string;
        user     : string; //
        password : string; //
        database : string;
        port: number // 27000
    };
    sign: string;
    admin: {
        user: string;
        password: string
    };
    huobi: {
        ws_url_prex: string;
        api: string;
    }
}

export interface CustomState{
    user?: {
        user: string;
        id: string;
    }
}
export interface CustomContext{
    session: SessionData;
    sendSuccess({ data, message, ...otherData }?: Partial<ResponseBody<any>>): void;
    sendSuccess<T>({ data, message, ...otherData }?: Partial<ResponseBody<T>>): void;
    sendError({ code, message }?: Partial<ResponseBody<any>>): void;
    sendError<T>({ code, message }?: Partial<ResponseBody<T>>): void;
}
export type KoaContext = RouterContext<CustomState, CustomContext>;

