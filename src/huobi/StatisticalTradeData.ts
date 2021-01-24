import Emitter from 'events';
import isEmpty from 'lodash/isEmpty';
import { errLogger } from 'ROOT/common/logger';
import { autoToFixed } from 'ROOT/utils';
import { getPriceIndex } from './util';

interface TradeData {
    id: number,
    ts: number,
    tradeId: number,
    amount: number,
    price: number,
    direction: 'sell' | 'buy'
}
/**
 * 按一定时间统计买卖量(buy sell 转换成usdt价格)
 */
export default class StatisticalTrade extends Emitter{
    symbol: string;
    exchange: number;
    disTime: number;
    _mergeData: {
        buy: number;
        sell: number;
        exchange: number;
        _time?: number;
        time: number;
        amount: number;
        usdtPrice: number;
    } = {} as any;
    constructor({
        symbol,
        exchange = 1,
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
     */
    merge(trade: {ts: number, data: TradeData[]}) {
        const symbol = this.symbol;
        const ts = trade.ts;
        const tradeData = trade.data;
        // 价格系数， 价格换算成usdt ，如果交易对是btc， 要*btc的usdt价格
        const _priceIndex = getPriceIndex(symbol);
        // 先找缓存的数据是否存在
        if (isEmpty(this._mergeData)) {
            const _tempData = mergeTradeData(tradeData, ts, _priceIndex, symbol);
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
            const time = Number(this._mergeData._time);
            if (this._mergeData) {
                this._mergeData.exchange = this.exchange;
                this._mergeData.buy = autoToFixed(this._mergeData.buy, 2);
                this._mergeData.sell = autoToFixed(this._mergeData.sell, 2);
                // this._mergeData.amount = this._tempData.amount;
                if (tradeData[0]) {
                    this._mergeData.usdtPrice = tradeData[0].price
                }
                delete this._mergeData._time;
                this.emit('merge', symbol, this._mergeData);
                // mysqlModel.insert('HUOBI_TRADE', tempTradeData);
            }
            // 开始一个新数据
            // this._mergeData.sell = 0;
            // this._mergeData.buy = 0;
            // this._mergeData.amount = 0;
            const _tempData = mergeTradeData(tradeData, ts, _priceIndex, symbol);
            if (_tempData) {
                Object.assign(this._mergeData, _tempData);
                this._mergeData.time = time;
                // tempTradeData = _tempData;
            }
        } else {
            // 合并数据
            const _tempData = mergeTradeData(tradeData, ts, _priceIndex, symbol);
            if (_tempData) {
                this._mergeData.buy += _tempData.buy;
                this._mergeData.sell += _tempData.sell;
                this._mergeData.amount += _tempData.amount;
                this._mergeData.usdtPrice = _tempData.usdtPrice;
            }
        }
    }
}

/**
 * 合并一个时间点的买卖交易量
 * @return {Array<Object>}
 */
function mergeTradeData(tradeData: TradeData[], _time: number, _priceIndex: number, symbol: string) {
    const _tempData = {
        symbol: symbol,
        buy: 0,
        sell: 0,
        _time: _time,
        amount: 0,
        usdtPrice: 0,
    }
    if (!Array.isArray(tradeData)) {
        errLogger.error('tradeData must be a Array');
        return;
    }
    // 累加买卖交易量
    tradeData.forEach(item => {
        // const amountMoney = item.amount; // * item.price * _priceIndex;
        const direction = item.direction;
        _tempData[direction] = autoToFixed(item.amount + _tempData[direction], 2);
        _tempData.amount += item.amount;
        _tempData.usdtPrice = item.price;
    });
    return _tempData;
}
