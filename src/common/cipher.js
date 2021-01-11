"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
/**
 * 可逆加密
 */
exports.default = {
    createCipher(content, password) {
        const cipher = crypto_1.createCipheriv('aes192', password, null); // 使用aes192加密
        let enc = cipher.update(content, 'utf8', 'hex'); // 编码方式从utf-8转为hex;
        enc += cipher.final('hex'); // 编码方式转为hex;
        return enc;
    },
    decipher(content, password) {
        const decipher = crypto_1.createDecipheriv('aes192', password, null);
        let enc = decipher.update(content, 'hex', 'utf8');
        enc += decipher.final('utf8');
        return enc;
    }
};
