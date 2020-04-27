const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')
const cors = require('koa-cors')

// const path = require('path')
const config = require('config')
const routes = require('./app/routes')
const { send } = require('./app/middleware')
const runWS = require('./app/ws/run')
const socketServer = require('./app/ws/ws-server')
const port = process.env.PORT || config.get('port')

// error handler
onerror(app)

// middlewares
app.use(cors({
    maxAge: 1000 * 60 * 60 * 24,
  }))
  .use(bodyparser({
    onerror: function (err, ctx) {
      ctx.throw('body parse error', 422);
    }
  }))
  .use(json())
  .use(logger())
  .use(require('koa-static')(__dirname + '/public', {
    maxage: 1000 * 60 * 60 * 24 * 1
  }))
  .use(require('koa-static')(__dirname + '/logs', {
    maxage: 1000 * 60 * 60 * 24 * 1
  }))
  .use(send)
  .use(router.routes())
  .use(router.allowedMethods())

routes(router)

app.on('error', function(err, ctx) {
  console.error('server error', err)
  ctx.body = {
    status: 'error',
    message: err.message,
  };
})

const server = app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
  runWS()
});
server.on('upgrade', socketServer.handleUpgrade);
module.exports = server;