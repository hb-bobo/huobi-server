const Router = require('koa-router')
const router = new Router()

const controllers = require('../controllers');
// const checkToken = require('../middleware/checkToken');

router.get('/getTradingSymbol', controllers.trade.getTradingSymbol)
router.post('/autoTrade', controllers.trade.startAutoTrade);
router.post('/stopAutoTrade', controllers.trade.stopAutoTrade);
router.get('/tradeConfig', controllers.trade.getTradeConfig);
router.post('/tradeConfig', controllers.trade.setTradeConfig);
router.get('/api_config', controllers.api.get)
router.post('/api_config', controllers.api.update)
router.delete('/api_config', controllers.api.remove)
module.exports = router