
import fs from 'fs';
import util from 'util';

const accessPromisify = util.promisify(fs.access);
const mkdirPromisify = util.promisify(fs.mkdir);
/**
 * 创建文件夹
 * @param {Path} p
 * @param {boolean} automkdir
 * @return {Promise<any>}
 */
export function mkdir(p: string) {
    return accessPromisify(p).then((res) => {
        return;
    }).catch(() => {
        return mkdirPromisify(p).catch((err) => {throw err})
    });
}

/**
 * 获取文件后缀
 * @param name
 */
export function getFileExt(name: string) {
    const ext = name.split('.');
    return ext[ext.length - 1];
}
