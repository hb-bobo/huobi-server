
import config from 'config';
import pako from 'pako';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'ROOT/interface/App';
import { SocketFrom } from 'ROOT/interface/ws';

import { createHuobiWS } from 'ROOT/huobi/ws/createWS';
import { EventTypes, ws_event } from './events';
import {  WS_REQ } from './ws.cmd';




const huobi = config.get<AppConfig['huobi']>('huobi');
export let ws: ReturnType<typeof createHuobiWS>;

/**
 * 行情数据
 * @param accessKey
 * @param secretKey
 */
export function start () {
    if (ws && ws.isOpen()) {
        return ws;
    }
    const ws_url = huobi.ws_url_prex;
    ws = createHuobiWS(ws_url);
    ws.on('open', function () {

        outLogger.info(`huobi-ws opened: ${ws_url}`);
    });

    ws.on('message', function (ev) {

        const text = pako.inflate(ev.data, {
            to: 'string'
        });
        const msg = JSON.parse(text);

        if (msg.ping) {
            ws.json({
                pong: msg.ping
            });
        } else if (msg.tick) {
            handle(msg);
        } else {
            outLogger.info(`huobi-ws on message: ${text}`);
        }
    });
    ws.on('close', function (e) {
        ws.reStart();
        if (e.code === 1006) {
            outLogger.info(`huobi-ws closed:`, 'connect ECONNREFUSED');
        } else {
            outLogger.info(`huobi-ws closed:`, e.reason);
        }
    });
    ws.on('error', function (e) {
        ws.reStart();
        errLogger.info(`huobi-ws error:`, e.message);
    })

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
    const [type, symbol, channel] = data.ch.split('.');

    if (handleMap[channel]) {
        const {type, data: otherData } = handleMap[channel](data);
        ws_event.emit('huobi:ws:message', {
            type,
            from: SocketFrom.huobi,
            data: {
                channel: channel,
                ch: data.ch,
                symbol,
                ...otherData,
            },
        } as any);
    }
}
