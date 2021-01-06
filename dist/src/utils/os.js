"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileExt = exports.mkdir = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 * 创建文件夹
 * @param {Path} p
 * @param {boolean} automkdir
 * @return {Promise<any>}
 */
function mkdir(p) {
    return new Promise(function (resolve, reject) {
        fs_1.default.exists(p, function (exists) {
            if (exists) {
                resolve();
                return;
            }
            fs_1.default.mkdir(p, function (err) {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve();
            });
        });
    });
}
exports.mkdir = mkdir;
/**
 * 获取文件后缀
 * @param name
 */
function getFileExt(name) {
    const ext = name.split('.');
    return ext[ext.length - 1];
}
exports.getFileExt = getFileExt;
