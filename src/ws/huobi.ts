
import config from 'config';

import pako from 'pako';
import { outLogger } from 'ROOT/common/logger';
import { SocketFrom } from 'ROOT/interface/ws';
import { AppConfig } from 'typings/global.app';
import { createWS } from './createWS';
import { EventTypes, WSEmitter } from './events';

const huobi = config.get<AppConfig['huobi']>('huobi');

const ws = createWS(huobi.ws_url_prex, {
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
        const eventData = handleMap[channel](data);
        WSEmitter.emit(eventData.type, {
            type: eventData.type,
            from: SocketFrom.huobi,
            data: {
                channel: data.channel,
                ch: data.ch,
                symbol,
                ...eventData.data,
            },
        });
    }
}