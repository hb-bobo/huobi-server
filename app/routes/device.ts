
import checkToken from 'APP/middleware/checkToken';
import * as controller from 'APP/module/device/device.controller';
import Router from 'koa-router';
const router = new Router<App.CustomState, App.CustomContext>()
router.get('/', controller.get);
router.get('/:id', controller.get);
router.post('/', checkToken, controller.updateOne);
router.post('/remove', checkToken, controller.removeOne);
router.post('/update', checkToken, controller.updateOne);
export default router