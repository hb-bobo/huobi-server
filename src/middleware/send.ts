import { outLogger } from "ROOT/common/logger";
import { AppContext } from "ROOT/interface/App";
import { ErrorResponseBody, ResponseCodeType, SuccessResponseBody } from "ROOT/interface/Http";

/**
 * 统一成功与失败消息格式
 */
export default async (ctx: AppContext, next: () => Promise<void>) => {
    /**
     * 成功反馈的数据格式
     * @param {object}
     */
    ctx.sendSuccess = function sendSuccess<T> ({data, message = 'success', ...otherData}: SuccessResponseBody<T> = {} as SuccessResponseBody<T>) {
        ctx.body = {
            code: ResponseCodeType.success,
            message,
            status: 'ok',
            ...otherData,
        }

        if (data !== undefined) {
            ctx.body.data = data;
        }
    }
    /**
     * 失败反馈的数据格式
     * @param {object}
     */
    ctx.sendError = function sendError<T> ({code = ResponseCodeType.otherError, message = 'error', errors}: ErrorResponseBody<T> = {} as ErrorResponseBody<T>) {
        ctx.body = {
            code,
            message,
            errors,
            status: 'error',
        }

        if (errors) {
            ctx.body.message = 'Invalid field';
            ctx.body.errors = errors;
            ctx.body.code = ResponseCodeType.formError;
        }
        if (message !== 'error') {
            outLogger.error(message);
        }
    }
    await next();
}