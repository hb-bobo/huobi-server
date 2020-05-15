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
    [EventTypes.huobi_depth]: HuobiEventData<EventTypes.huobi_depth, HuobiDepth>;
    [EventTypes.huobi_kline]: HuobiEventData<EventTypes.huobi_kline, HuobiKline>;
    [EventTypes.huobi_trade]: HuobiEventData<EventTypes.huobi_trade, HuobiTrade>;
    [EventTypes.huobi_open]: {
        type: EventTypes.huobi_open,
        from: SocketFrom.huobi,
        ws_auth: (accessKey: string) => void;
    };
}
class Eventss extends EventEmitter {
    public emit!: (event: keyof WSEvent, arg: WSEvent[keyof WSEvent]) => boolean;
    public on!: (event: keyof WSEvent, listener: (arg: WSEvent[keyof WSEvent]) => void) => this;
}
// 自定义事件
export const WSEmitter = new Eventss();

