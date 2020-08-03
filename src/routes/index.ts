
import Router from  'koa-router'
import { AppContext, AppState } from 'ROOT/interface/App';
import checkToken from 'ROOT/middleware/checkToken';
import * as UserController from 'ROOT/module/user/user.controller';
import * as TradeAccountController from 'ROOT/module/trade-account/TradeAccount.controller';
import * as MailController from 'ROOT/module/email/config.controller';
// /index
const apiPrefix = '/api';
const router = new Router<AppState, AppContext>();
export default router;

// router.get(`${apiPrefix}/user/users`, checkToken, UserController.get);
router.get(`${apiPrefix}/user/currentUser`, checkToken, UserController.userInfo);
router.get(`${apiPrefix}/user/firstUser`, UserController.createFirstUser);
router.post(`${apiPrefix}/user/create`, checkToken, UserController.createUser);
router.post(`${apiPrefix}/login`, UserController.login);

router.get(`${apiPrefix}/trade-account`, checkToken, TradeAccountController.get);
router.post(`${apiPrefix}/trade-account`, checkToken, TradeAccountController.updateOne);
router.post(`${apiPrefix}/login`, UserController.login);


router.get(`${apiPrefix}/send-email`, MailController.index);
router.post(`${apiPrefix}/send-email`, MailController.create);