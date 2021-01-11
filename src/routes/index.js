"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const checkToken_1 = __importDefault(require("../middleware/checkToken"));
const UserController = __importStar(require("../module/user/user.controller"));
const TradeAccountController = __importStar(require("../module/trade-account/TradeAccount.controller"));
const TradeController = __importStar(require("../module/trade/Trade.controller"));
const DepthController = __importStar(require("../module/depth/Depth.controller"));
const WatchController = __importStar(require("../module/watch/watch.controller"));
const MailController = __importStar(require("../module/email/config.controller"));
const ConfigController = __importStar(require("../module/config/config.controller"));
const TrainController = __importStar(require("../module/train/train.controller"));
// /index
const apiPrefix = '/api';
const router = new koa_router_1.default();
exports.default = router;
// router.get(`${apiPrefix}/user/users`, checkToken, UserController.get);
router.get(`${apiPrefix}/user/currentUser`, checkToken_1.default, UserController.userInfo);
router.get(`${apiPrefix}/user/firstUser`, UserController.createFirstUser);
router.post(`${apiPrefix}/user/create`, checkToken_1.default, UserController.createUser);
router.post(`${apiPrefix}/login/account`, UserController.login);
router.get(`${apiPrefix}/trade-account`, checkToken_1.default, TradeAccountController.get);
router.post(`${apiPrefix}/trade-account`, checkToken_1.default, TradeAccountController.updateOne);
router.get(`${apiPrefix}/send-email`, MailController.index);
router.post(`${apiPrefix}/send-email`, MailController.create);
router.get(`${apiPrefix}/watch-symbol`, checkToken_1.default, WatchController.get);
router.post(`${apiPrefix}/watch-symbol`, checkToken_1.default, WatchController.updateOne);
router.delete(`${apiPrefix}/watch-symbol`, checkToken_1.default, WatchController.removeOne);
router.get(`${apiPrefix}/config`, checkToken_1.default, ConfigController.index);
router.post(`${apiPrefix}/config`, checkToken_1.default, ConfigController.create);
router.get(`${apiPrefix}/trade`, checkToken_1.default, TradeController.get);
router.get(`${apiPrefix}/depth`, checkToken_1.default, DepthController.get);
router.post(`${apiPrefix}/train/download`, checkToken_1.default, TrainController.download);
