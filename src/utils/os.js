"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmd = void 0;
const child_process_1 = __importDefault(require("child_process"));
/**
 * cmd
 * @param {string} cmdStr
 * @returns {Promise<string>}
 */
function cmd(cmdStr) {
    return new Promise(function (resolve, reject) {
        const exec = child_process_1.default.exec;
        exec(cmdStr, function (err, stdout, srderr) {
            if (err) {
                reject(srderr);
                return;
            }
            resolve(stdout);
        });
    });
}
exports.cmd = cmd;
