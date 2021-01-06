"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.ws = void 0;
const config_1 = __importDefault(require("config"));
const pako_1 = __importDefault(require("pako"));
const logger_1 = require("../../common/logger");
const ws_1 = require("../../interface/ws");
const createWS_1 = require("./createWS");
const events_1 = require("./events");
const huobi = config_1.default.get('huobi');
/**
 * 行情数据
 * @param accessKey
 * @param secretKey
 */
function start(accessKey, secretKey) {
    let timer;
    exports.ws = createWS_1.createHuobiWS(huobi.ws_url_prex);
    exports.ws.on('open', function () {
        logger_1.outLogger.info(`huobi-ws opened: ${huobi.ws_url_prex}`);
    });
    exports.ws.on('message', function (data) {
        const text = pako_1.default.inflate(data.data, {
            to: 'string'
        });
        const msg = JSON.parse(text);
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (exports.ws) {
                console.log(exports.ws.isOpen());
            }
        }, 10000);
        if (msg.ping) {
            exports.ws.json({
                pong: msg.ping
            });
        }
        else if (msg.tick) {
            handle(msg);
        }
        else {
            logger_1.outLogger.info(text);
        }
    });
    exports.ws.on('close', function (e) {
        logger_1.outLogger.info(`huobi-ws closed:`, 'connect ECONNREFUSED');
        // ws.close(e.code);
        if (e.code === 1006) {
            logger_1.outLogger.info(`huobi-ws closed:`, 'connect ECONNREFUSED');
        }
        else {
            logger_1.outLogger.info(`huobi-ws closed:`, e.reason);
        }
        // ws.reStart();
    });
    exports.ws.on('error', function (e) {
        exports.ws.reStart();
        logger_1.errLogger.info(`huobi-ws[${huobi.ws_url_prex}] error:`, e.message);
    });
    return exports.ws;
}
exports.start = start;
const handleMap = {
    depth(data) {
        return {
            type: events_1.EventTypes.huobi_depth,
            data: {
                tick: data.tick,
            },
        };
    },
    kline(data) {
        return {
            type: events_1.EventTypes.huobi_kline,
            data: {
                kline: data.tick,
            },
        };
    },
    trade(data) {
        return {
            type: events_1.EventTypes.huobi_trade,
            data: {
                trade: data.tick,
            },
        };
    }
};
/* 处理返回的数据 */
function handle(data) {
    const [type, symbol, channel] = data.ch.split('.');
    if (handleMap[channel]) {
        const { type, data: otherData } = handleMap[channel](data);
        events_1.ws_event.emit('huobi:ws:message', {
            type,
            from: ws_1.SocketFrom.huobi,
            data: {
                channel: channel,
                ch: data.ch,
                symbol,
                ...otherData,
            },
        });
    }
}
