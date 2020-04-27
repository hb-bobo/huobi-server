

const Router = require('koa-router')
const router = new Router()

const controllers = require('../controllers')
const checkToken = require('../middleware/checkToken');

router.get('/amount', controllers.charts.getPressure)
router.get('/trade', controllers.charts.getTrade)
router.get('/watchSymbols', controllers.charts.getWatchSymbols)
    .put('/watchSymbols', checkToken, controllers.charts.putWatchSymbols)
    .delete('/watchSymbols', checkToken, controllers.charts.removeWatchSymbols)
module.exports = router