
import checkToken from 'APP/middleware/checkToken';
import * as controller from 'APP/module/advert/advert.controller';
import Router from 'koa-router';
const router = new Router<App.CustomState, App.CustomContext>()
router.get('/', controller.get)
    .post('/', checkToken, controller.updateOne)
    .delete('/', checkToken, controller.removeOne)
    .put('/', checkToken, controller.updateOne)
router.get('/:id', controller.get);

export default router