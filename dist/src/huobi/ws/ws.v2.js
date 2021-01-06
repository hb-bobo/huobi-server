"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../common/logger");
const ws_1 = require("../../interface/ws");
const createWS_1 = require("./createWS");
const events_1 = require("./events");
const ws_cmd_1 = require("./ws.cmd");
const huobi = config_1.default.get('huobi');
const ws_url = huobi.ws_url_prex + '/v2';
let ws;
/**
 * 账户订单数据
 * @param accessKey
 * @param secretKey
 */
function start(accessKey, secretKey) {
    if (ws && !ws.isOpen()) {
        return ws;
    }
    ws = createWS_1.createHuobiWS(ws_url);
    ws.on('open', function () {
        logger_1.outLogger.info(`huobi-ws-v2 opened: ${ws_url}`);
        ws.json(ws_cmd_1.ws_auth(accessKey, secretKey));
    });
    ws.on('message', function (ev) {
        if (typeof ev.data !== 'string') {
            logger_1.outLogger.info(`!ev.data: ${ev.type}`);
            return;
        }
        const msg = JSON.parse(ev.data);
        if (msg.action === 'ping') {
            ws.json({
                action: "pong",
                data: {
                    ts: msg.data.ts // 使用Ping消息中的ts值
                }
            });
        }
        else if (msg.data) {
            handle(msg);
        }
        else {
            logger_1.outLogger.info(msg);
        }
    });
    ws.on('close', function (e) {
        ws.close(e.code);
        if (e.code === 1006) {
            logger_1.outLogger.info(`huobi-ws-v2 closed:`, 'connect ECONNREFUSED');
            start(accessKey, secretKey);
        }
        else {
            logger_1.outLogger.info(`huobi-ws-v2 closed:`, e.reason);
        }
        setTimeout(() => {
            start(accessKey, secretKey);
        }, 1000 * 60);
    });
    ws.on('error', function (e) {
        logger_1.errLogger.info(`huobi-ws-v2[${ws_url}] error:`, e.message);
        setTimeout(() => {
            start(accessKey, secretKey);
        }, 1000 * 60);
    });
    return ws;
}
exports.start = start;
const handleMap = {
    trade(data) {
        return {
            type: events_1.EventTypes.huobi_trade,
            data: data.data
        };
    }
};
/* 处理返回的数据 */
function handle(data) {
    const [channel, symbol] = data.ch.split('#');
    if (handleMap[channel]) {
        const { type, data: otherData } = handleMap[channel](data);
        events_1.ws_event.emit('huobi:ws:message', {
            type,
            from: ws_1.SocketFrom.huobi,
            data: {
                channel: data.channel,
                ch: data.ch,
                symbol,
                ...otherData,
            },
        });
    }
}
