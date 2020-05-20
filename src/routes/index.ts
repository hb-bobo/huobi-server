
import Router from  'koa-router'
import { AppContext, AppState } from 'ROOT/interface/App';

// @index: import ${variable} from ${relpath};
import user from "./user";
// /index
const apiPrefix = '/api';

export default (router: Router<AppState, AppContext>) => {
  // @index: router.use(apiPrefix + '/${variable}', ${variable}.routes());
  router.use(apiPrefix + '/user', user.routes());
  // /index
}