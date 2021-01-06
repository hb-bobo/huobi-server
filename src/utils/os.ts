import child_process from 'child_process';
/**
 * cmd
 * @param {string} cmdStr
 * @returns {Promise<string>}
 */
export function cmd(cmdStr: string) {
    return new Promise(function (resolve, reject) {
        const exec = child_process.exec;
        exec(cmdStr, function (err: Error | null, stdout: string, srderr: string) {
            if (err) {
                reject(srderr);
                return;
            }
            resolve(stdout);
        });
    });
}
