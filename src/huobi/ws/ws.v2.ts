
import config from 'config';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { AppConfig } from 'ROOT/interface/App';
import { createHuobiWS } from 'ROOT/huobi/ws/createWS';
import { ws_event } from './eventsV2';
import { WS_REQ_V2 } from './ws.cmd.v2';

const huobi = config.get<AppConfig['huobi']>('huobi');
const ws_url = huobi.ws_url_prex + '/v2';
export let ws: ReturnType<typeof createHuobiWS>;

/**
 * 账户订单数据
 * @param accessKey
 * @param secretKey
 */
export function start (accessKey: string, secretKey: string) {

    ws = createHuobiWS(ws_url);
    ws.on('open', function () {
        outLogger.info(`huobi-ws-v2 opened: ${ws_url}`);
        ws.json(WS_REQ_V2.auth(accessKey, secretKey, ws_url));

    });
    ws.on('message', function (ev) {

        if (typeof ev.data !== 'string') {
            outLogger.info(`huobi-ws-v2: !ev.data ${ev.data}`);
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
            const [channel] = msg.ch.split('#');
            switch(channel) {
                case 'auth':
                    ws_event.emit('auth', undefined);
                    break;
                case 'accounts.update':
                    ws_event.emit('accounts.update', msg.data);
                    break;
                default:return;
            }
        } else {
            outLogger.info(`huobi-ws-v2: on message ${JSON.stringify(msg)}`);
        }
    });
    ws.on('close', function (e) {
        if (e.code === 1006) {
            ws.reStart();
            outLogger.info(`huobi-ws-v2 closed:`, 'connect ECONNREFUSED');
        } else {
            outLogger.info(`huobi-ws-v2 closed:`, e.reason);
        }
    });
    ws.on('error', function (e) {
        ws.reStart();
        errLogger.info(`huobi-ws-v2[${ws_url}] error:`, e.message);
    })
    return ws;
}
