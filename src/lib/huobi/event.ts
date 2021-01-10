import { EventEmitter } from "events";


export interface WSEvent {
    "auth"?: undefined
    'accounts.update': {
        "currency": string,
        "accountId": number,
        "balance":string,
        "changeType": string,
        "accountType":string,
        "changeTime": number,
        available: string,
    }
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

