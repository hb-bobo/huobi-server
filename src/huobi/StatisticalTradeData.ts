import Emitter from 'events';
import isEmpty from 'lodash/isEmpty';
import getPriceIndex from "./getPriceIndex";

/**
 * 按一定时间统计买卖量(buy sell 转换成usdt价格)
 */
export default class StatisticalTrade extends Emitter{
    symbol: string;
    exchange: string;
    disTime: number;
    _mergeData: {
        buy: number;
        sell: number;
        exchange: string;
        _time?: number;
        time: Date;
        amount: number;
    } = {} as any;
    constructor({
        symbol,
        exchange = 'huobi',
        disTime = 5 * 60 * 1000
    }) {
        super();
        this.symbol = symbol;
        this.exchange = exchange;
        this.disTime = disTime;
        this.init();
    }
    init() {
        this._mergeData = {} as any;
    }
    /**
     * 按时间合并交易数据
     * @param {{ts: number, data: {amount: number, ts: number, price: number, direction: 'buy' | 'sell'}[]}} trade 
     */
    merge(trade) {
        const symbol = this.symbol;
        const ts = trade.ts;
        const tradeData = trade.data;
        // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
        const _priceIndex = getPriceIndex(symbol);
        // 先找缓存的数据是否存在
        if (isEmpty(this._mergeData)) {
            let _tempData = mergeTradeData(tradeData, ts, _priceIndex, symbol);
            if (_tempData) {
                Object.assign(this._mergeData, _tempData);
            }
            return;
        }
        // 上一个时间(位数归了0，比实际时间早)
        const preTime = this._mergeData._time as number;
        // 当前时间 > 上一个时间
        if ((ts - preTime)  > this.disTime) {
            // 开始一个新数据前把上次合并好的数据整理并emit；
            let time = new Date(Number(this._mergeData._time));
            if (this._mergeData) {
                this._mergeData.buy = Number(this._mergeData.buy.toFixed(2));
                this._mergeData.sell = Number(this._mergeData.sell.toFixed(2));
                // this._mergeData.amount = this._tempData.amount;
                this._mergeData.exchange = this.exchange;
                delete this._mergeData._time;
                this.emit('merge', symbol, this._mergeData);
                // mysqlModel.insert('HUOBI_TRADE', tempTradeData);
            }
            // 开始一个新数据
            // this._mergeData.sell = 0;
            // this._mergeData.buy = 0;
            // this._mergeData.amount = 0;
            let _tempData = mergeTradeData(tradeData, ts, _priceIndex, symbol);
            if (_tempData) {
                Object.assign(this._mergeData, _tempData);
                this._mergeData.time = time;
                // tempTradeData = _tempData;
            }
        } else {
            // 合并数据
            let _tempData = mergeTradeData(tradeData, ts, _priceIndex, symbol);
            if (_tempData) {
                this._mergeData.buy += _tempData.buy;
                this._mergeData.sell += _tempData.sell;
                this._mergeData.amount += _tempData.amount;
            }
        }
    }
}

/**
 * 合并一个时间点的买卖交易量
 * @param {Array<Object>} tradeData
 * @param {string} _time
 * @param {number} _priceIndex
 * @param {string} symbol
 * @return {Array<Object>}
 */
function mergeTradeData(tradeData, _time, _priceIndex, symbol) {
    let _tempData = {
        symbol: symbol,
        buy: 0,
        sell: 0,
        _time: _time,
        amount: 0,
    }
    if (!Array.isArray(tradeData)) {
        console.error('tradeData must be a Array');
        return;
    }
    // 累加买卖交易量
    tradeData.forEach(item => {
        const amountMoney = item.amount * item.price * _priceIndex;
        const direction = item.direction;
        _tempData[direction] = Number((amountMoney + _tempData[direction]).toFixed(2));
        _tempData.amount += item.amount;
    });
    return _tempData;
}