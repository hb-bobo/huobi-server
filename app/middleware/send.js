

/**
 * 统一成功与失败消息格式
 */
module.exports = async (ctx, next) => {
    /**
    * 成功反馈的数据格式
    * @param {object}
    */
    ctx.sendSuccess = function sendSuccess ({data = null, message = 'success', ...otherData} = {}) {
        ctx.body = {
            code: 0,
            message,
            status: 'ok',
            ...otherData,
        }

        if (data !== null) {
            ctx.body.data = data;
        }
    }
    /**
     * 失败反馈的数据格式
     * @param {object}
     */
    ctx.sendError = function sendError ({code = 1, message = 'error'} = {}) {
        ctx.body = {
            code,
            message,
            status: 'error',
        }
        if (message.message) {
            ctx.body.message = message.message;
        }
    }
    await next();
}