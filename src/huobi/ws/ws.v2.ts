
import config from 'config';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'ROOT/interface/App';
import { SocketFrom } from 'ROOT/interface/ws';

import { createWS } from 'ROOT/ws/createWS';
import { EventTypes, ws_event } from './events';
import { ws_auth, WS_SUB } from './ws.cmd';
import Sockette from 'ROOT/lib/sockette/Sockette';

const huobi = config.get<AppConfig['huobi']>('huobi');
const ws_url = huobi.ws_url_prex + '/v2';
let ws: Sockette;
export function start (accessKey: string, secretKey: string) {
    ws = createWS(ws_url);
    ws.on('open', function () {
        outLogger.info(`huobi-ws-v2 opened: ${ws_url}`);
        ws.json(ws_auth(accessKey, secretKey));
    });
    ws.on('message', function (ev) {

        if (typeof ev.data !== 'string') {
            outLogger.info(`!ev.data: ${ev.type}`);
            return;
        }
        const msg = JSON.parse(ev.data as string);

        if (msg.action === 'ping') {
            ws.json({
                action: "pong",
                data: {
                    ts: msg.data.ts // 使用Ping消息中的ts值
                }
            });
        } else if (msg.data) {
            handle(msg);
        } else {
            outLogger.info(msg);
        }
    });
    ws.on('close', function (e) {
        if (e.code === 1006) {
            outLogger.info(`huobi-ws-v2 closed:`, 'connect ECONNREFUSED');
            setTimeout(() => {
                if (!ws.isOpen()) {
                    start(accessKey, secretKey);
                }
            }, 1000 * 60);
        } else {
            outLogger.info(`huobi-ws-v2 closed:`, e.reason);
        }
    });
    ws.on('error', function (e) {
        errLogger.info(`huobi-ws-v2[${ws_url}] error:`, e.message);
        setTimeout(() => {
            if (!ws.isOpen()) {
                start(accessKey, secretKey);
            }
        }, 1000 * 60);
    })
    return ws;
}
const handleMap: Record<string, (data: any) => {type: EventTypes, data: any}> = {

    trade(data) {
        return {
            type: EventTypes.huobi_trade,
            data: data.data
        };
    }
}
/* 处理返回的数据 */
function handle(data) {
    const [channel, symbol] = data.ch.split('#');
    if (handleMap[channel]) {
        const {type, data: otherData } = handleMap[channel](data);
        ws_event.emit('huobi:ws:message', {
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