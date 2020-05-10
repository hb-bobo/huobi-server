
import { createCipher, createDecipher } from 'crypto';

/**
 * 可逆加密
 */
export default {
    createCipher(content: string, password: string) {
        const cipher = createCipher('aes192', password);// 使用aes192加密
        let enc = cipher.update(content, 'utf8', 'hex');// 编码方式从utf-8转为hex;
        enc += cipher.final('hex'); // 编码方式转为hex;
        return enc;
    },
    decipher(content: string, password: string) {
        const decipher = createDecipher('aes192', password);
        let enc = decipher.update(content, 'hex', 'utf8');
        enc += decipher.final('utf8');
        return enc;
    }
}