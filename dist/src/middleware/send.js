"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../common/logger");
const Http_1 = require("../interface/Http");
/**
 * 统一成功与失败消息格式
 */
exports.default = async (ctx, next) => {
    /**
     * 成功反馈的数据格式
     * @param {object}
     */
    ctx.sendSuccess = function sendSuccess({ data, message = 'success', ...otherData } = {}) {
        ctx.body = Object.assign({
            code: Http_1.ResponseCodeType.success,
            message,
            status: 'ok',
        }, otherData);
        if (data !== undefined) {
            ctx.body.data = data;
        }
    };
    /**
     * 失败反馈的数据格式
     * @param {object}
     */
    ctx.sendError = function sendError({ code = Http_1.ResponseCodeType.otherError, message = 'error', errors } = {}) {
        ctx.body = {
            code,
            message,
            errors,
            status: 'error',
        };
        if (errors) {
            Object.assign(ctx.body, {
                code: Http_1.ResponseCodeType.formError,
                message: 'Invalid field',
                errors,
            });
        }
        if (message !== 'error') {
            logger_1.outLogger.error(message);
        }
    };
    await next();
};
