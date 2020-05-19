
import config from 'config';
import pako from 'pako';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { SocketFrom } from 'ROOT/interface/ws';
import { AppConfig } from 'typings/global.app';
import { createWS } from './createWS';
import { EventTypes, WSEmitter } from './events';
import { ws_auth } from './huobi.cmd';
import Sockette from './sockette';

const huobi = config.get<AppConfig['huobi']>('huobi');
let ws: Sockette;
export function start (accessKey: string) {
    ws = createWS(huobi.ws_url_prex);
    ws.on('open', function () {
        outLogger.info(`socket opened: ${huobi.ws_url_prex}`);
        ws.json(ws_auth(accessKey));
    });
    ws.on('message', function (data) {
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
    });
    ws.on('close', function (e) {
        outLogger.info(`socket closed: ${e}`);
    });
    ws.on('error', function (e) {
        errLogger.info(`socket[${huobi.ws_url_prex}] error: ${e}`);
        setTimeout(() => {
            if (!ws.isOpen()) {
                outLogger.info(`socket opened: ${huobi.ws_url_prex}`);
                start(accessKey);
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