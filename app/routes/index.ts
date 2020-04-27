
import Router from  'koa-router'
import { CustomContext, CustomState } from "typings/global.app";
// @index: import ${variable} from ${relpath};
import advert from "./advert";
import device from "./device";
import user from "./user";
// /index
const apiPrefix = '/api';

export default (router: Router<App.CustomState, App.CustomContext>) => {
  // @index: router.use(apiPrefix + '/${variable}', ${variable}.routes());
  router.use(apiPrefix + '/advert', advert.routes());
  router.use(apiPrefix + '/device', device.routes());
  router.use(apiPrefix + '/user', user.routes());
  // /index
}