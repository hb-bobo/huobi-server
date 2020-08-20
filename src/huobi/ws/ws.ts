
import config from 'config';
import pako from 'pako';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'ROOT/interface/App';
import { SocketFrom } from 'ROOT/interface/ws';

import { createWS } from 'ROOT/ws/createWS';
import { EventTypes, ws_event } from './events';
import { ws_auth, WS_SUB } from './ws.cmd';
import Sockette from 'ROOT/lib/sockette/Sockette';


const huobi = config.get<AppConfig['huobi']>('huobi');
let ws: Sockette;
export function start (accessKey: string, secretKey: string) {
    ws = createWS(huobi.ws_url_prex);
    ws.on('open', function () {
        outLogger.info(`huobi-ws opened: ${huobi.ws_url_prex}`);
    });
    ws.on('message', function (data) {
   
        const text = pako.inflate(data.data, {
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
    });
    ws.on('close', function (e) {
        if (e.code === 1006) {
            outLogger.info(`huobi-ws closed:`, 'connect ECONNREFUSED');
            setTimeout(() => {
                if (!ws.isOpen()) {
                    start(accessKey, secretKey);
                }
            }, 1000 * 60);
        } else {
            outLogger.info(`huobi-ws closed:`, e.reason);
        }
    });
    ws.on('error', function (e) {
        errLogger.info(`huobi-ws[${huobi.ws_url_prex}] error:`, e.message);
        setTimeout(() => {
            if (!ws.isOpen()) {
                start(accessKey, secretKey);
            }
        }, 1000 * 60);
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