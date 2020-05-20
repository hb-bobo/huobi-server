import Router from 'koa-router';

import { AppContext, AppState } from 'ROOT/interface/App';
import checkToken from 'ROOT/middleware/checkToken';
import * as controller from 'ROOT/module/user/user.controller';
const router = new Router<AppState, AppContext>();
// 登录不拦截
router.get('/currentUser', checkToken, controller.userInfo);
router.post('/login', controller.login);
router.post('/create', checkToken, controller.createUser);
router.get('/firstUser', controller.createFirstUser);
export default router