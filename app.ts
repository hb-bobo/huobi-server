require('module-alias/register')
import config from 'config';
import http from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import koaJSON from 'koa-json';
// import koaLogger from 'koa-logger';
import koaOnError from 'koa-onerror';
import Router from 'koa-router';
import session from 'koa-session';
import serve from 'koa-static';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import "reflect-metadata";
import { outLogger } from 'ROOT/common/logger';
import { logger, send } from 'ROOT/middleware';
import routes from 'ROOT/routes';
import { socketIO } from 'ROOT/ws/socketIO';
// const debug = require('debug')('koa2:server')

const app = new Koa()
const router = new Router<App.CustomState, App.CustomContext>()
const port = process.env.PORT || config.get('port')

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
const keys = [config.get<string>('sign')]
app.keys = keys

routes(router)
// error handler
koaOnError(app)
// middlewares
app.use(cors())
  .use(bodyParser({
    onerror (err: Error, ctx: Koa.Context) {
      ctx.throw('body parse error', 422);
    }
  }))
  .use(session(SESSION_CONFIG, app))
  .use(koaJSON())
  .use(logger)
  .use(historyApiFallback({ whiteList: ['/api'] }))
  .use(serve(config.get<string>('publicPath'), {
    maxage: 1000 * 60 * 60 * 24 * 2
  }))
  .use(send)
  .use(router.routes())
  .use(router.allowedMethods())


app.on('error', function(err: Error, ctx: Koa.Context) {
  ctx.body = {
    status: 'error',
    message: err.message,
  }
})

// app.listen(port, () => {
//   outLogger.info(`Listening on http://localhost:${port}`)
// })

const server = http.createServer(app.callback());
socketIO.attach(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

server.listen(port, () => {
  outLogger.info(`Listening on http://localhost:${port}`)
});