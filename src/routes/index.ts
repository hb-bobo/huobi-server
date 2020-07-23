
import Router from  'koa-router'
import { AppContext, AppState } from 'ROOT/interface/App';
import checkToken from 'ROOT/middleware/checkToken';
import * as UserController from 'ROOT/module/user/user.controller';
// /index
const apiPrefix = '/api';
const router = new Router<AppState, AppContext>();
export default router;

// router.get(`${apiPrefix}/user/users`, checkToken, UserController.get);
router.get(`${apiPrefix}/user/currentUser`, checkToken, UserController.userInfo);
router.get(`${apiPrefix}/user/firstUser`, UserController.createFirstUser);
router.post(`${apiPrefix}/user/create`, checkToken, UserController.createUser);
router.post(`${apiPrefix}/login`, UserController.login);
