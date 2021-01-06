"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * cmd
 * @param {string} cmdStr
 * @returns {Promise<string>}
 */
function cmd(cmdStr) {
    return new Promise(function (resolve, reject) {
        const exec = require('child_process').exec;
        exec(cmdStr, function (err, stdout, srderr) {
            if (err) {
                resolve(srderr);
                return;
            }
            resolve(stdout);
        });
    });
}
exports.default = cmd;
