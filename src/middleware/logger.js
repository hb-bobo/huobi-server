"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../common/logger");
/**
 * 日志中间件
 */
exports.default = async (ctx, next) => {
    const start = new Date().getTime();
    logger_1.outLogger.info(`<-- ${ctx.method} ${ctx.url}`);
    await next();
    const ms = new Date().getTime() - start;
    logger_1.outLogger.info(`--> ${ctx.method} ${ctx.url} - ${ms}ms`);
};
