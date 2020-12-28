
import Router from  'koa-router'
import { AppContext, AppState } from 'ROOT/interface/App';
import checkToken from 'ROOT/middleware/checkToken';
import * as UserController from 'ROOT/module/user/user.controller';
import * as TradeAccountController from 'ROOT/module/trade-account/TradeAccount.controller';
import * as TradeController from 'ROOT/module/trade/Trade.controller';
import * as DepthController from 'ROOT/module/depth/Depth.controller';
import * as WatchController from 'ROOT/module/watch/watch.controller';
import * as MailController from 'ROOT/module/email/config.controller';
import * as ConfigController from 'ROOT/module/config/config.controller';
// /index
const apiPrefix = '/api';
const router = new Router<AppState, AppContext>();
export default router;

// router.get(`${apiPrefix}/user/users`, checkToken, UserController.get);
router.get(`${apiPrefix}/user/currentUser`, checkToken, UserController.userInfo);
router.get(`${apiPrefix}/user/firstUser`, UserController.createFirstUser);
router.post(`${apiPrefix}/user/create`, checkToken, UserController.createUser);
router.post(`${apiPrefix}/login/account`, UserController.login);

router.get(`${apiPrefix}/trade-account`, checkToken, TradeAccountController.get);
router.post(`${apiPrefix}/trade-account`, checkToken, TradeAccountController.updateOne);


router.get(`${apiPrefix}/send-email`, MailController.index);
router.post(`${apiPrefix}/send-email`, MailController.create);

router.get(`${apiPrefix}/watch-symbol`, checkToken, WatchController.get);
router.post(`${apiPrefix}/watch-symbol`, checkToken, WatchController.updateOne);
router.delete(`${apiPrefix}/watch-symbol`, checkToken, WatchController.removeOne);


router.get(`${apiPrefix}/config`, checkToken, ConfigController.index);
router.post(`${apiPrefix}/config`, checkToken, ConfigController.create);


router.get(`${apiPrefix}/trade`, checkToken, TradeController.get);

router.get(`${apiPrefix}/depth`, checkToken, DepthController.get);