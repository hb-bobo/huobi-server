import { ResponseBody } from "ROOT/interface/Http";
import { outLogger } from "../common/logger";

/**
 * 统一成功与失败消息格式
 */
export default async (ctx: App.KoaContext, next: () => Promise<void>) => {
    /**
     * 成功反馈的数据格式
     * @param {object}
     */
    ctx.sendSuccess = function sendSuccess<T> ({data, message = 'success', ...otherData}: ResponseBody<T> = {} as ResponseBody<T>) {
        ctx.body = Object.assign({
            code: 0,
            message,
            status: 'ok',
        }, otherData)

        if (data !== undefined) {
            ctx.body.data = data;
        }
    }
    /**
     * 失败反馈的数据格式
     * @param {object}
     */
    ctx.sendError = function sendError<T> ({code = 1, message = 'error'}: ResponseBody<T> = {} as ResponseBody<T>) {
        ctx.body = {
            code,
            message,
            status: 'error',
        }
        if (message) {
            ctx.body.message =message;
        }
        if (message !== 'error') {
            outLogger.error(message);
        }
    }
    await next();
}