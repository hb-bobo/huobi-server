
/**
 * 
 * @param {string} cmdStr
 * @returns {Promise<string>} 
 */
function exec(cmdStr) {
    return new Promise(function (resolve, reject) {
        const exec = require('child_process').exec;
        exec(cmdStr, function (err, stdout, srderr) {
            console.log(stdout, srderr)
            if (err) {
                resolve(srderr);
                return;
            }
            resolve(stdout);
            
        });
    });
}
module.exports = exec;

exec('npm login').then(async (stdout) => {
    exec('git');
    exec('8590550a')
})
