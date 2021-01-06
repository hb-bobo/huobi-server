require('module-alias/register');
import "reflect-metadata";
import config from 'config';
import http from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import koaJSON from 'koa-json';
import koaOnError from 'koa-onerror';
import session from 'koa-session';
import serve from 'koa-static';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { logger, send } from 'ROOT/middleware';
import routes from 'ROOT/routes';
import { socketIO } from 'ROOT/ws/socketIO';
import './schedule';
import './db/orm';
// const debug = require('debug')('koa2:server')

const app = new Koa();
const port = process.env.PORT || config.get('port');
const host = config.get('host');
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
const keys = [config.get<string>('sign')];
app.keys = keys;

// error handler
koaOnError(app);
// middlewares
app.use(cors())
  .use(logger)
  .use(serve(config.get<string>('publicPath'), {
    maxage: 1000 * 60 * 60 * 24 * 2
  }))
  .use(historyApiFallback({ whiteList: ['/api'] }))
  .use(bodyParser({
    onerror (err: Error, ctx: Koa.Context) {
      errLogger.error(err)
      ctx.throw(422, 'body parse error');
    }
  }))
  .use(session(SESSION_CONFIG, app))
  // .use(koaJSON())
  .use(send)
  .use(routes.routes())
  .use(routes.allowedMethods())


app.on('error', function(err: Error, ctx: Koa.Context) {
  ctx.body = {
    status: 'error',
    message: err.message,
  }
});

const server = http.createServer(app.callback());

server.listen(port, () => {
  outLogger.info(`Listening on http://${host}:${port}`)
});
socketIO.attach(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

