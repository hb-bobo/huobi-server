import { EventEmitter } from 'events';
import { SocketFrom, SocketMessage } from 'ROOT/interface/ws';

export enum EventTypes {
    huobi_kline = 'huobi:kline',
    huobi_trade = 'huobi:trade',
    huobi_depth = 'huobi:depth',
    huobi_open = 'huobi:open',
}
interface HuobiEventData<T extends string, D> extends SocketMessage{
    type: T;
    from: SocketFrom.huobi | SocketFrom.server,
    data: {
        symbol: string,
        channel: string,
        ch: string,
    } & D;
}
export interface HuobiDepth {
    tick: any,
}
export interface HuobiKline {
    kline: any,
}
export interface HuobiTrade {
    trade: any,
}

export interface WSEvent{
    'huobi:ws:message': HuobiEventData<EventTypes.huobi_depth, HuobiDepth>
        | HuobiEventData<EventTypes.huobi_kline, HuobiKline>
        | HuobiEventData<EventTypes.huobi_trade, HuobiTrade>;
}
class Eventss extends EventEmitter {
    public emit!: (event: keyof WSEvent, arg: WSEvent[keyof WSEvent]) => boolean;
    public on!: (event: keyof WSEvent, listener: (arg: WSEvent[keyof WSEvent]) => void) => this;
}
// 自定义事件
export const WSEmitter = new Eventss();

