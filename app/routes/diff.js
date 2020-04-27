

const Router = require('koa-router')
const router = new Router()

const controllers = require('../controllers/index')
const checkToken = require('../middleware/checkToken')


router.get('/characteristic', controllers.diff.getCharacteristic)
router.get('/characteristic/chart', controllers.diff.getPressure)
router.get('/diffSymbols', controllers.diff.getDiffSymbols)
module.exports = router