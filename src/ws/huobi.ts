
import config from 'config';
import pako from 'pako';
import { outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'ROOT/interface/App';
import { SocketFrom } from 'ROOT/interface/ws';

import { createWS } from './createWS';
import { EventTypes, WSEmitter } from './events';
import { ws_auth } from './huobi.cmd';
import Sockette from './sockette';

const huobi = config.get<AppConfig['huobi']>('huobi');
let ws: Sockette;
export function start (accessKey: string) {
    ws = createWS(huobi.ws_url_prex, {
        onopen: () => {
            ws.json(ws_auth(accessKey));
        },
        onmessage: data => {
            const text = pako.inflate(data, {
                to: 'string'
            });
            const msg = JSON.parse(text);
            if (msg.ping) {
                ws.json({
                    pong: msg.ping
                });
            } else if (msg.tick) {
                // console.log(msg);
                handle(msg);
            } else {
                outLogger.info(text);
            }
        }
    });
    return ws;
}
const handleMap: Record<string, (data: any) => {type: EventTypes, data: any}> = {
    depth(data) {
        return {
            type: EventTypes.huobi_depth,
            data: {
                tick: data.tick,
            },
        };
    },
    kline(data) {
        return {
            type: EventTypes.huobi_kline,
            data: {
                kline: data.tick,
            },
        };
    },
    trade(data) {
        return {
            type: EventTypes.huobi_trade,
            data: {
                trade: data.tick,
            },
        };
    }
}
/* 处理返回的数据 */
function handle(data) {
    const symbol = data.ch.split('.')[1];
    const channel = data.ch.split('.')[2];
    if (handleMap[channel]) {
        const {type, data: otherData } = handleMap[channel](data);
        WSEmitter.emit(type, {
            type,
            from: SocketFrom.huobi,
            data: {
                channel: data.channel,
                ch: data.ch,
                symbol,
                ...otherData,
            },
        } as any);
    }
}