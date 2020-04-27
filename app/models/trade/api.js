
const crypto = require('crypto');
const config = require('config');
const { mysqlQuery } = require('../../db');
const table = require('../table');
const modelUtil = require('../utils');

const tableName = 'API_KEY';


const sign = config.get('sign');

function createCipher(content) {
    const cipher = crypto.createCipher('aes192', sign);//使用aes192加密
    let enc = cipher.update(content, 'utf8', 'hex');//编码方式从utf-8转为hex;
    enc += cipher.final('hex'); //编码方式转为hex;
    return enc;
}

function createDecipher(content) {
    const decipher = crypto.createDecipher('aes192', sign);
    let enc = decipher.update(content, 'hex', 'utf8');
    enc += decipher.final('utf8');
    return enc;
}

mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${tableName}(
        id INT UNSIGNED AUTO_INCREMENT,
        account_id_pro INT,
        access_key VARCHAR(192),
        secret_key VARCHAR(192),
        trade_password VARCHAR(20),
        uid INT,
        user VARCHAR(20),
        exchange VARCHAR(10),
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);

async function get(query = {}) {
    let where = modelUtil.toWhereString(query);
    const res = await mysqlQuery(`
        SELECT
            *
        FROM ${tableName}
        ${where}
    `);
    res.forEach(function (item) {
        if (item.secret_key) {
            try {
                item.secret_key = createDecipher(item.secret_key);
            } catch (error) {
                //
            }
        }
    });
    return res;
}
exports.get = get;


async function save(data) {
    return table.insert(tableName, data);
}
exports.save = save;

/**
 * 
 * @param {object} qeury 
 * @param {object} data 
 */
async function update(query = {}, data = {}) {
    if (data.secret_key) {
        data.secret_key = createCipher(data.secret_key);
    }
    if (query.id) {
        // const res = await get(query);
        let set = modelUtil.toSetString(data);
        let where = modelUtil.toWhereString(query);
        return mysqlQuery(`
            UPDATE ${tableName}
            ${set}
            ${where}
        `);
    }

    return table.insert(tableName, data);
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