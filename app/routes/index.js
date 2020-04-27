const charts = require('./charts')
const common = require('./common')
const diff = require('./diff')
const huobi = require('./huobi')
const user = require('./user')
const trade = require('./trade')
const checkToken = require('../middleware/checkToken');
const apiPrefix = '/api/v1';

module.exports =  (router) => {
  router.use(apiPrefix + '/charts', charts.routes());
  router.use(apiPrefix + '/common', common.routes());
  router.use(apiPrefix + '/diff', diff.routes());
  router.use(apiPrefix + '/huobi', huobi.routes());
  router.use(apiPrefix + '/user', user.routes());
  router.use(apiPrefix + '/trade', checkToken, trade.routes());
}
