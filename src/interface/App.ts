import { BaseContext, Context } from 'koa';
import { RouterContext } from 'koa-router';
import { ErrorResponseBody, SuccessResponseBody } from 'ROOT/interface/Http';

export interface SessionData {
    token: string;
}
export interface AppConfig{
    port: number;
    host: string;
    publicPath: string;
    env: 'dev' | 'beta' | 'prod';
    dbConfig: {
        host     : string;
        user     : string;
        password : string;
        database : string;
        port: number;
    };
    sign: string;
    admin: {
        user: string;
        password: string;
    };
    huobi: {
        ws_url_prex: string;
        api: string;
    }
}

export interface AppState{
    user?: {
        user: string;
        id: string;
    }
}
export interface CustomContext{
    session: SessionData;
    sendSuccess({ data, message, ...otherData }?: Partial<SuccessResponseBody>): void;
    sendSuccess<T>({ data, message, ...otherData }?: Partial<SuccessResponseBody<T>>): void;
    sendError({ code, message }?: Partial<ErrorResponseBody>): void;
    sendError<T>({ code, message }?: Partial<ErrorResponseBody<T>>): void;
}
export type AppContext = RouterContext<AppState, CustomContext> & BaseContext;


