
/**
 * cmd
 * @param {string} cmdStr
 * @returns {Promise<string>} 
 */
function exec(cmdStr: string) {
    return new Promise(function (resolve, reject) {
        const exec = require('child_process').exec;
        exec(cmdStr, function (err: NodeJS.ErrnoException, stdout: string, srderr: string) {
            if (err) {
                resolve(srderr);
                return;
            }
            resolve(stdout);
        });
    });
}
export default exec;