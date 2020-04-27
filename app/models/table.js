const { mysqlQuery } = require('../db');

/**
 * 
 * @param {string} tableName 
 * @return {Promise}
 */
function delTable(tableName) {
    return mysqlQuery(`DROP TABLE ${tableName}`);
}
exports.delTable = delTable;

/**
 * 
 * @param {string} tableName 
 * @param {Object} param
 * @return {Promise}
 */
function insert(tableName = '', param) {
    if (Object.prototype.toString.call(param) !== '[object Object]') {
        console.error(tableName + '写入数据格式有误');
        return;
    }
    return mysqlQuery(`INSERT INTO ${tableName} SET ?;`, param);
}
exports.insert = insert;