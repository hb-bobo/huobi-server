"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiSDK = void 0;
const HuobiSDKBase_1 = require("./HuobiSDKBase");
const CacheSockett_1 = require("./ws/CacheSockett");
const ws_cmd_1 = require("./ws/ws.cmd");
const ws_cmd_v2_1 = require("./ws/ws.cmd.v2");
class HuobiSDK extends HuobiSDKBase_1.HuobiSDKBase {
    /**
     * huobi sdk 包含rest api, 行情ws, 账户与订单ws
     * @param parameters
     */
    constructor(parameters) {
        super(parameters);
        this.setOptions = (options) => {
            super.setOptions(options);
        };
        this.getSocket = (type) => {
            return new Promise((resolve, reject) => {
                if ((this['market_cache_ws'] === undefined || this['market_ws'] === undefined) && type.includes('market')) {
                    const market_ws = this.createMarketWS();
                    if (this.market_cache_ws == undefined) {
                        this.market_cache_ws = new CacheSockett_1.CacheSockett(market_ws);
                        this.market_cache_ws.ws.on('close', () => {
                            this.outLogger('close.reStart');
                            this.market_cache_ws.reStart();
                        });
                    }
                    if (market_ws.isOpen()) {
                        resolve(this[type] || HuobiSDKBase_1.HuobiSDKBase[type]);
                    }
                    else {
                        this.once('market_ws.open', () => {
                            resolve(this[type] || HuobiSDKBase_1.HuobiSDKBase[type]);
                        });
                    }
                }
                if ((this['account_cache_ws'] === undefined || this['account_ws'] === undefined) && type.includes('account')) {
                    const account_ws = this.createAccountWS();
                    if (this.account_cache_ws === undefined) {
                        this.account_cache_ws = new CacheSockett_1.CacheSockett(account_ws);
                    }
                    if (account_ws.isOpen()) {
                        resolve(this[type] || HuobiSDKBase_1.HuobiSDKBase[type]);
                    }
                    else {
                        this.once('account_ws.open', () => {
                            resolve(this[type] || HuobiSDKBase_1.HuobiSDKBase[type]);
                        });
                    }
                }
                if ((this['futures_cache_ws'] === undefined || this['futures_ws'] === undefined) && type.includes('futures')) {
                    const futures_ws = this.createFuturesWS();
                    if (this.futures_cache_ws === undefined) {
                        this.futures_cache_ws = new CacheSockett_1.CacheSockett(futures_ws);
                    }
                    if (futures_ws.isOpen()) {
                        resolve(this[type] || HuobiSDKBase_1.HuobiSDKBase[type]);
                    }
                    else {
                        this.once('account_ws.open', () => {
                            resolve(this[type] || HuobiSDKBase_1.HuobiSDKBase[type]);
                        });
                    }
                }
                // if (this[type] === undefined && HuobiSDKBase[type]) {
                //     reject(`${type} 不存在`);
                // }
                // return resolve(this[type] || HuobiSDKBase[type]);
            });
        };
    }
    /**
     * 添加事件
     * @param event
     * @param callback
     */
    addEvent(event, callback) {
        if (typeof callback === 'function') {
            this.on(event, callback);
        }
    }
    /**
     */
    getSymbols() {
        const path = `/v1/common/symbols`;
        return this.request(`${path}`, {
            method: 'GET'
        });
    }
    getMarketHistoryKline(symbol, period, size) {
        const path = `/market/history/kline`;
        return this.request(`${path}`, {
            method: 'GET',
            searchParams: {
                symbol,
                period,
                size,
            }
        });
    }
    getAccounts() {
        const path = `/v1/account/accounts`;
        return this.auth_get(`${path}`);
    }
    async getAccountId(type = 'spot') {
        const data = await this.getAccounts();
        if (!data) {
            return;
        }
        data.forEach(item => {
            if (item.type === type) {
                this.spot_account_id = item.id;
            }
        });
    }
    getAccountBalance(spot_account_id = this.spot_account_id) {
        if (!spot_account_id) {
            throw Error('请先初始化getAccountId()');
        }
        const path = `/v1/account/accounts/${spot_account_id}/balance`;
        return this.auth_get(`${path}`);
    }
    /**
     * 查询当前未成交订单
     * @param symbol
     * @param side
     * @param size
     */
    getOpenOrders(symbol, optional) {
        const path = `/v1/order/openOrders`;
        return this.auth_get(`${path}`, {
            'account-id': this.spot_account_id,
            symbol,
            ...optional
        });
    }
    getOrders(symbol, states = 'filled,partial-filled,canceled') {
        const path = `/v1/order/history`;
        return this.auth_get(`${path}`, {
            symbol,
            states
        });
    }
    getOrder(orderId) {
        const path = `/v1/order/orders/${orderId}`;
        return this.auth_get(`${path}`);
    }
    /**
     * 下单(现货)
     * @param symbol
     * @param type
     * @param amount
     * @param price
     * @return orderId
     */
    order(symbol, type, amount, price) {
        const path = '/v1/order/orders/place';
        return this.auth_post(`${path}`, {
            "account-id": this.spot_account_id,
            symbol,
            type,
            amount,
            price,
        });
    }
    /**
    * 获取合约信息
    * "BTC_CQ"表示BTC当季合约,
    * @param symbol
    * @param contract_type
    * @returns
    */
    contractMarketDetailMerged(symbol) {
        const path = `/market/detail/merged`;
        return this._request(`${this.options.url.contract}${path}`, {
            searchParams: {
                symbol,
            }
        });
    }
    /**
     *  合约k线数据
     * @param symbol
     */
    contractMarketHistoryKline(symbol, period, size) {
        const path = `/market/history/kline`;
        return this._request(`${this.options.url.contract}${path}`, {
            searchParams: {
                period: symbol,
                size: period,
                symbol: size
            }
        });
    }
    /**
     * 获取用户持仓信息
     * @param symbol
     */
    contractPositionInfo(symbol) {
        const path = `/api/v1/contract_position_info`;
        return this.auth_post_contract(path, {
            period: symbol,
        });
    }
    /**
     * 合约下单
     *
     * 开多：买入开多(direction用buy、offset用open)
     *
     * 平多：卖出平多(direction用sell、offset用close)
     *
     * 开空：卖出开空(direction用sell、offset用open)
     *
     * 平空：买入平空(direction用buy、offset用close)
     *
     */
    contractOrder(params) {
        const path = '/api/v1/contract_order';
        return this.auth_post_contract(`${path}`, params);
    }
    cancelOrder(orderId) {
        const path = `/v1/order/orders/${orderId}/submitcancel`;
        return this.auth_post(path, {
            "account-id": this.spot_account_id,
        });
    }
    /** 获取合约信息 */
    contractContractInfo() {
        return this.auth_get('/api/v1/contract_contract_info');
    }
    /** 获取合约指数信息 */
    contractIndex() {
        return this.auth_get('/api/v1/contract_index');
    }
    /**
     *  获取合约最高限价和最低限价
     */
    contractPriceLimit(symbol, contractType = 'this_week') {
        return this.auth_get(`/api/v1/contract_price_limit?symbol=${symbol}&contract_type=${contractType}`);
    }
    /**
     * 获取当前可用合约总持仓量
     */
    contractOpenInterest(symbol, contract_type) {
        const path = `/api/v1/contract_open_interest`;
        return this._request(`${this.options.url.contract}${path}`, {
            searchParams: {
                symbol: symbol,
                contract_type,
            }
        });
    }
    /**
     * 获取合约用户账户信息
     */
    contractAccountInfo(symbol) {
        const path = `/api/v1/contract_account_info`;
        return this.auth_post_contract(path, { symbol: symbol });
    }
    /**
     * 获取合约订单信息
     */
    contractOrderInfo(symbol) {
        const path = `/api/v1/contract_order_info`;
        return this.auth_post_contract(path, { symbol: symbol });
    }
    async subMarketDepth({ symbol, step, id }, subscription) {
        const subMessage = ws_cmd_1.WS_SUB.depth(symbol, step);
        const market_cache_ws = await this.getSocket('market_cache_ws');
        if (!market_cache_ws.hasCache(subMessage)) {
            market_cache_ws.sub(subMessage, id);
        }
        this.addEvent(subMessage.sub, subscription);
    }
    async upMarketDepth({ symbol, step, id }, subscription) {
        const subMessage = ws_cmd_1.WS_UNSUB.depth(symbol, step);
        const market_cache_ws = await this.getSocket('market_cache_ws');
        market_cache_ws.upsub(subMessage, id);
        // this.once(subMessage.unsub, subscription);
    }
    async subMarketKline({ symbol, period, id }, subscription) {
        const subMessage = ws_cmd_1.WS_SUB.kline(symbol, period);
        const market_cache_ws = await this.getSocket('market_cache_ws');
        if (!market_cache_ws.hasCache(subMessage)) {
            market_cache_ws.sub(subMessage, id);
        }
        this.addEvent(subMessage.sub, subscription);
    }
    async upMarketKline({ symbol, period, id }, subscription) {
        const subMessage = ws_cmd_1.WS_UNSUB.kline(symbol, period);
        const market_cache_ws = await this.getSocket('market_cache_ws');
        market_cache_ws.upsub(subMessage, id);
        // this.once(subMessage.unsub, subscription);
    }
    async subMarketTrade({ symbol, id }, subscription) {
        const subMessage = ws_cmd_1.WS_SUB.tradeDetail(symbol);
        const market_cache_ws = await this.getSocket('market_cache_ws');
        if (!market_cache_ws.hasCache(subMessage)) {
            market_cache_ws.sub(subMessage, id);
        }
        this.addEvent(subMessage.sub, subscription);
    }
    async upMarketTrade({ symbol, id }, subscription) {
        const subMessage = ws_cmd_1.WS_UNSUB.tradeDetail(symbol);
        const market_cache_ws = await this.getSocket('market_cache_ws');
        market_cache_ws.upsub(subMessage, id);
        // this.once(subMessage.unsub, subscription);
    }
    async subAuth(subscription) {
        const account_ws = await this.getSocket('account_ws');
        account_ws.json(ws_cmd_v2_1.WS_REQ_V2.auth(this.options.accessKey, this.options.secretKey, this.options.url.account_ws));
        this.addEvent('auth', subscription);
    }
    async subAccountsUpdate({ mode }, subscription) {
        const subMessage = ws_cmd_v2_1.WS_REQ_V2.accounts(mode);
        const account_cache_ws = await this.getSocket('account_cache_ws');
        const account_ws = await this.getSocket('account_ws');
        if (!account_cache_ws.hasCache(subMessage)) {
            account_cache_ws.setCache(subMessage);
            account_ws.json(subMessage);
        }
        this.addEvent('accounts.update', subscription);
    }
}
exports.HuobiSDK = HuobiSDK;
exports.default = HuobiSDK;
