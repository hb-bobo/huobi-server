const config = require('config');
const { mysqlQuery } = require('../../db');
const table = require('../table');
const modelUtil = require('../utils');
const tableName = 'AUTO_TRADE_ORDER';

mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${tableName}(
        id INT UNSIGNED AUTO_INCREMENT,
        user VARCHAR(10),
        symbol VARCHAR(10),
        exchange VARCHAR(10),
        amount FLOAT(10),
        money FLOAT(3),
        price FLOAT(10),
        sellCount INT(2),
        buyCount INT(2),
        period INT(3),
        forceTrade TINYINT,
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);

function get(query = {}) {
    return mysqlQuery(`
        SELECT
            *
        FROM ${tableName}
        ${modelUtil.toWhereString(query)}
    `)
}
exports.get = get;


function save(data) {
    return table.insert(tableName, data);
}
exports.save = save;


async function update(query, data) {
    const res = await get(query);
    // if (!query.user) {
    //     throw Error('用户不存在');
    // }
    if (res.length === 0) {
        return table.insert(tableName, {user: query.user, ...data});
    } else {
        let where = modelUtil.toWhereString(query);
        let set = modelUtil.toSetString(data);
        return mysqlQuery(`
            UPDATE ${tableName}
            ${set}
            ${where}
        `);
    }
}

exports.update = update;



async function remove(query) {
    let where = modelUtil.toWhereString(query);
    return mysqlQuery(`
        DELETE FROM ${tableName}
        ${where}
    `);
}

exports.remove = remove;