"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_REQ = exports.WS_SUB = void 0;
const config_1 = __importDefault(require("config"));
const util_1 = require("./util");
const huobi = config_1.default.get('huobi');
exports.WS_SUB = {};
exports.WS_REQ = {
    /**
     * 发送auth请求
     * @param ws
     */
    auth(accessKey, secretKey, data) {
        return {
            action: 'req',
            ch: "auth",
            params: {
                authType: "api",
                ...util_1.auth_V2('GET', huobi.ws_url_prex, accessKey, secretKey, data)
            }
        };
    }
};
