
const { mysqlQuery } = require('../../db');
const table = require('../table');

mysqlQuery(`
    CREATE TABLE IF NOT EXISTS WATCH_SYMBOLS(
        id INT UNSIGNED AUTO_INCREMENT,
        symbol VARCHAR(10),
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);
/**
 * @return {Promise<{symbol: string}[]>}
 */
function get() {
    return mysqlQuery(
        `
        SELECT symbol FROM WATCH_SYMBOLS 
        `
    )
}
exports.get = get;

/**
 * @return {Promise}
 */
function put(data) {
    return table.insert('WATCH_SYMBOLS', data);
}
exports.put = put;

/**
 * @return {Promise}
 */
function remove(data) {
    return mysqlQuery(
        `
        DELETE FROM WATCH_SYMBOLS 
        WHERE symbol='${data.symbol}'
        `
    )
}
exports.remove = remove;