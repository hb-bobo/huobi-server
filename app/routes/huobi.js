

const Router = require('koa-router')
const router = new Router()

const controllers = require('../controllers')
const checkToken = require('../middleware/checkToken')


router.post('/buy_limit', checkToken, controllers.huobi.buy_limit)
router.post('/limit', checkToken, controllers.huobi.limit)
router.post('/cancel_order', checkToken, controllers.huobi.cancel_order)
router.get('/get_open_orders', checkToken, controllers.huobi.get_open_orders)
router.get('/get_balance', checkToken, controllers.huobi.get_balance)
router.get('/get_order', checkToken, controllers.huobi.get_order)
router.get('/get_orders', checkToken, controllers.huobi.get_orders)
router.get('/market/history/kline', controllers.huobi.getMarketHistoryKline)
router.get('/market/depth', controllers.huobi.getMarketDepth)
router.get('/common/symbols', controllers.huobi.getSymbols)

module.exports = router