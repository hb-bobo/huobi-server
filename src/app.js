"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
require("reflect-metadata");
const config_1 = __importDefault(require("config"));
const http_1 = __importDefault(require("http"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_cors_1 = __importDefault(require("koa-cors"));
const koa_onerror_1 = __importDefault(require("koa-onerror"));
const koa_session_1 = __importDefault(require("koa-session"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa2_connect_history_api_fallback_1 = __importDefault(require("koa2-connect-history-api-fallback"));
const logger_1 = require("./common/logger");
const middleware_1 = require("./middleware");
const routes_1 = __importDefault(require("./routes"));
const socketIO_1 = require("./ws/socketIO");
require("./schedule");
require("./db/orm");
// const debug = require('debug')('koa2:server')
const app = new koa_1.default();
const port = process.env.PORT || config_1.default.get('port');
const host = config_1.default.get('host');
const SESSION_CONFIG = {
    key: 'koa:sess',
    maxAge: 24 * 60 * 60 * 1000 * 10,
    autoCommit: true,
    overwrite: false,
    httpOnly: true,
    signed: true,
    rolling: true,
    renew: true,
};
const keys = [config_1.default.get('sign')];
app.keys = keys;
// error handler
koa_onerror_1.default(app);
// middlewares
app.use(koa_cors_1.default())
    .use(middleware_1.logger)
    .use(koa_static_1.default(config_1.default.get('publicPath'), {
    maxage: 1000 * 60 * 60 * 24 * 2
}))
    .use(koa2_connect_history_api_fallback_1.default({ whiteList: ['/api'] }))
    .use(koa_bodyparser_1.default({
    onerror(err, ctx) {
        logger_1.errLogger.error(err);
        ctx.throw(422, 'body parse error');
    }
}))
    .use(koa_session_1.default(SESSION_CONFIG, app))
    // .use(koaJSON())
    .use(middleware_1.send)
    .use(routes_1.default.routes())
    .use(routes_1.default.allowedMethods());
app.on('error', function (err, ctx) {
    ctx.body = {
        status: 'error',
        message: err.message,
    };
});
const server = http_1.default.createServer(app.callback());
server.listen(port, () => {
    logger_1.outLogger.info(`Listening on http://${host}:${port}`);
});
socketIO_1.socketIO.attach(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});
