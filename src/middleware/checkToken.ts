import config from 'config';
import jwt from 'jsonwebtoken';
import { AppContext, AppState, AppConfig } from 'ROOT/interface/App';
import { outLogger } from "../common/logger";

const sign = config.get<string>('sign');
const isDev = config.get<AppConfig['env']>('env') === 'dev';
/**
 * 判断token是否可用
 */
export default async (ctx: AppContext, next: () => Promise<void> ) => {
    // 拿到token
    const authorization = ctx.get('Authorization') || ctx.session.token;
    if (isDev && authorization === 'test') {

        ctx.state.user = {
            user: 'test',
            id: 'ss',
        }
        await next();
        return;
    }
    if (!authorization) {
        ctx.sendError({ code: 401, message: 'No token detected in http headerAuthorization'});
        return;
        // ctx.throw({
        //     code: 401,
        //     message: 'no token detected in http headerAuthorization',
        // });
    }

    // const token = authorization.split(' ')[1];
    try {
        let payload: AppState['user'];
        payload = await jwt.verify(authorization, sign) as AppState['user'];     // 如果token过期或验证失败，将抛出错误
        if (payload) {
            ctx.state.user = {
                user: payload.user,
                id: payload.id
            }
        }
        await next();
    } catch (err) {
        outLogger.error(err);
        ctx.sendError({ code: 401, message: 'Invalid token'});
        // ctx.throw({
        //     code: 401,
        //     message: 'invalid token',
        // });
    }
  
};