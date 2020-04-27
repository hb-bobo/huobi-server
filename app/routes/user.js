const Router = require('koa-router')
const router = new Router()

const controllers = require('../controllers');
const checkToken = require('../middleware/checkToken');

// 登录不拦截
router.get('/userInfo', checkToken, controllers.user.getUserInfo);
router.post('/login', controllers.user.login);
router.post('/create', checkToken, controllers.user.createUser);
// router.post('/login', controllers.user.login);
module.exports = router