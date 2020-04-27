
import fs from 'fs';

/**
 * 创建文件夹
 * @param {Path} p 
 * @param {boolean} automkdir 
 * @return {Promise<any>}
 */
export function mkdir(p: string) {
    return new Promise(function (resolve, reject) {
        fs.exists(p, function (exists) {
            if (exists) {
                resolve();
                return;
            }
            fs.mkdir(p, function (err) {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve();
            });
        });
    })
}

/**
 * 获取文件后缀
 * @param name 
 */
export function getFileExt(name: string) {
    let ext = name.split('.');
    return ext[ext.length - 1];
}
