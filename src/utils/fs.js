"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileExt = exports.mkdir = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const accessPromisify = util_1.default.promisify(fs_1.default.access);
const mkdirPromisify = util_1.default.promisify(fs_1.default.mkdir);
/**
 * 创建文件夹
 * @param {Path} p
 * @param {boolean} automkdir
 * @return {Promise<any>}
 */
function mkdir(p) {
    return accessPromisify(p).then((res) => {
        return;
    }).catch(() => {
        return mkdirPromisify(p).catch((err) => { throw err; });
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
