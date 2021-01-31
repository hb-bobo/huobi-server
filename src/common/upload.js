"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = exports.uploadFromNetWork = void 0;
const config_1 = __importDefault(require("config"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const got_1 = __importDefault(require("got"));
const fs_2 = require("../utils/fs");
const validator_1 = __importDefault(require("validator"));
const publicPath = config_1.default.get('publicPath');
fs_2.mkdir(path_1.default.join(publicPath, '/upload/'));
// utils.mkdir(path.join(publicPath, '/upload/images/network'));
/**
 * 通过远程文件上传到本地服务器
 * @param {string} url
 * @param {string} writePath 写入本地的路径(完整路径xxx/xxx.png)
 * @param {{headers: object}} requestOption
 * @return {Promise<string>}
 */
const uploadFromNetWork = (url, writePath, requestOption) => {
    return new Promise(function (resolve, reject) {
        if (!validator_1.default.isURL(url)) {
            reject('url Invalid');
            return;
        }
        if (fs_1.default.existsSync(writePath)) {
            resolve(true);
            return;
        }
        got_1.default.stream(url, requestOption)
            .on('error', function (err) {
            reject(err);
        })
            .on('close', function () {
            resolve(true);
        })
            .pipe(fs_1.default.createWriteStream(writePath));
    });
};
exports.uploadFromNetWork = uploadFromNetWork;
// 图片上传目录相对路径
// const relativePath = `/upload/network`;
// // 图片上传目录绝对路径
// const imgUploadPath = path.join(publicPath, relativePath);
fs_2.mkdir(path_1.default.join(publicPath, '/upload/files/'));
/**
 * 上传文件
 * @param {Files} files
 * @param {string} host
 * @param {string} relativePath
 */
const uploadFiles = async (files, host, relativePath) => {
    // 上传目录绝对路径
    const uploadPath = path_1.default.join(publicPath, relativePath);
    // 没有上传的路径则创建
    await fs_2.mkdir(uploadPath);
    const data = {};
    const keys = Object.keys(files);
    try {
        for (const name of keys) {
            const file = files[name];
            // 获取文件后缀(带.)
            const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
            const fileName = file.name.replace(fileExtension, '');
            // 带hash的文件名带后缀
            const fileFullName = `${fileName}_${file.hash}${fileExtension}`;
            // 文件写入地址
            const filePath = path_1.default.join(uploadPath, `/`) + fileFullName;
            // 创建可读流
            const reader = fs_1.default.createReadStream(file.path);
            // 创建可写流
            const upStream = fs_1.default.createWriteStream(filePath);
            // 可读流通过管道写入可写流
            reader.pipe(upStream);
            // 删除临时文件
            fs_1.default.unlink(file.path, function (error) {
                if (error) {
                    throw Error('删除临时文件出错:' + error.message);
                }
            });
            data[name] = `http://${host}${relativePath}/${fileFullName}`;
        }
        return data;
    }
    catch (error) {
        throw Error(error);
    }
};
exports.uploadFiles = uploadFiles;
