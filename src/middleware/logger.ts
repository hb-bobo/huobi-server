
import { outLogger } from "../common/logger";
/**
 * 日志中间件
 */
export default async (ctx: App.KoaContext, next: () => Promise<void>) => {
    const start = new Date().getTime()
    outLogger.info(`<-- ${ctx.method} ${ctx.url}`)
    await next()
    const ms = new Date().getTime() - start
    outLogger.info(`--> ${ctx.method} ${ctx.url} - ${ms}ms`)
}