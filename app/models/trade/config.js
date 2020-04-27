const config = require('config');
const { mysqlQuery } = require('../../db');
const table = require('../table');
const modelUtil = require('../utils');
const tableName = 'AUTO_TRADE_CONFIG';

mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${tableName}(
        id INT UNSIGNED AUTO_INCREMENT,
        user VARCHAR(10),
        symbol VARCHAR(10),
        sellAmountThreshold VARCHAR(18),
        buyAmountThreshold VARCHAR(18),
        buyStrengths VARCHAR(18),
        sellStrengths VARCHAR(18),
        buyGain FLOAT(4),
        sellGain FLOAT(4),
        isUp TINYINT,
        isFall TINYINT,
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

async function getOne(query = {}) {
    const res = await get(query);
    return res[0]
}
exports.getOne = getOne;

function save(data) {
    return table.insert(tableName, data);
}
exports.save = save;


async function update(query, data) {
    if (data.isUp !== undefined) {
        data.isUp = Number(data.isUp);
    }
    if (data.isFall !== undefined) {
        data.isFall = Number(data.isFall);
    }
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