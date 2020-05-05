import config from 'config';
import { Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import { os } from 'ROOT/utils';
import validator from 'validator';

const publicPath = config.get<string>('publicPath');
os.mkdir(path.join(publicPath, '/upload/'));
// utils.mkdir(path.join(publicPath, '/upload/images/network'));
/**
 * 通过远程文件上传到本地服务器
 * @param {string} url 
 * @param {string} writePath 写入本地的路径(完整路径xxx/xxx.png)
 * @param {{headers: object}} requestOption
 * @return {Promise<string>}
 */
export const uploadFromNetWork = (url: string, writePath: string, requestOption: any) => {
    return new Promise(function(resolve, reject) {
        if (!validator.isURL(url)) {
            reject('url Invalid');
            return;
        }
        if (fs.existsSync(writePath)) {
            resolve(true);
            return
        }

        request.get(url, requestOption)
        .on('error', function(err) {
            reject(err);
        })
        .on('close', function() {
            resolve(true);
        })
        .pipe(fs.createWriteStream(writePath))
    });
}

// 图片上传目录相对路径
// const relativePath = `/upload/network`;
// // 图片上传目录绝对路径
// const imgUploadPath = path.join(publicPath, relativePath);

os.mkdir(path.join(publicPath, '/upload/files/'));

/**
 * 上传文件
 * @param {Files} files 
 * @param {string} host
 * @param {string} relativePath 
 */

export const uploadFiles = async (files: Files, host: string, relativePath: string) => {
    // 上传目录绝对路径
    const uploadPath = path.join(publicPath, relativePath);
    // 没有上传的路径则创建
    await os.mkdir(uploadPath);
    const data: object = {};
    const keys =  Object.keys(files);
    try {
        for(const name of keys) {
            const file = files[name];
            // 获取文件后缀(带.)
            const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
            const fileName = file.name.replace(fileExtension, '');
            // 带hash的文件名带后缀
            const fileFullName = `${fileName}_${file.hash}${fileExtension}`;
            // 文件写入地址
            const filePath = path.join(uploadPath, `/`) + fileFullName;
            
            // 创建可读流
            const reader = fs.createReadStream(file.path);
            // 创建可写流
            const upStream = fs.createWriteStream(filePath);
            // 可读流通过管道写入可写流
            reader.pipe(upStream);
            
            // 删除临时文件
            fs.unlink(file.path, function (error) {
                if(error){
                    throw Error('删除临时文件出错:' + error.message);
                }
            });
            data[name] = `http://${host}${relativePath}/${fileFullName}`;
        }
        return data;
    } catch (error) {
        throw Error(error);
    }
}
