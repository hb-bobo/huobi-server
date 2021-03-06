import { EventEmitter } from "events";
import { SocketFrom, SocketMessage } from "ROOT/interface/ws";


export enum EventTypes {
    huobi_kline = "huobi:kline",
    huobi_trade = "huobi:trade",
    huobi_depth = "huobi:depth",
    huobi_depth_chart = "huobi:depth_chart",
    huobi_open = "huobi:open"
}
interface HuobiEventData<T extends string, D> extends SocketMessage {
    type: T;
    from: SocketFrom.huobi | SocketFrom.server;
    data: {
        symbol: string;
        channel?: string;
        ch?: string;
    } & D;
}


export interface HuobiDepth {}
export interface HuobiKline {
    kline: any;
}
export interface HuobiTrade {
    trade: any;
}

export interface WSEvent {
    // 当前服务端转发到客户端的数据
    "server:ws:message":
        | HuobiEventData<
              EventTypes.huobi_depth,
              {
                  bidsList: any;
                  asksList: any;
                  aks1: any;
                  bids1: any;
              }
          >
        | HuobiEventData<
              EventTypes.huobi_depth_chart,
              {
                  buy_1: any;
                  buy_2: any;
                  sell_1: any;
                  sell_2: any;
                  bids_max_1: any;
                  [x: string]: any;
              }
          >
        | HuobiEventData<EventTypes.huobi_trade, Record<string, any>>
        | HuobiEventData<EventTypes.huobi_kline, Record<string, any>>;
}
class Eventss extends EventEmitter {
    public emit!: <K extends keyof WSEvent>(
        event: K,
        arg: WSEvent[K]
    ) => boolean;
    public on!: <K extends keyof WSEvent>(
        event: K,
        listener: (arg: WSEvent[K]) => void
    ) => this;
}
// 自定义事件
export const ws_event = new Eventss();

