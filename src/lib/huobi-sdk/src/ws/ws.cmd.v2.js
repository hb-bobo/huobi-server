"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_REQ_V2 = exports.WS_SUB_V2 = void 0;
const signature_1 = require("../utils/signature");
exports.WS_SUB_V2 = {};
exports.WS_REQ_V2 = {
    /**
     * 发送auth请求
     * @param ws
     */
    auth(accessKey, secretKey, WS_URL) {
        return {
            action: 'req',
            ch: "auth",
            params: {
                authType: "api",
                ...signature_1.signature_V2('GET', WS_URL, accessKey, secretKey)
            }
        };
    },
    /**
     * 订阅账户变更
     */
    accounts(mode) {
        return {
            "action": "sub",
            "ch": "accounts.update"
        };
    },
};
