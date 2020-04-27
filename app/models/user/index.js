const crypto = require('crypto');
const config = require('config');
const  User  = require('./index');
const dbEvent = require('../../db/event');
const { mysqlQuery } = require('../../db');
const Table = require('../table');
const modelUtil = require('../utils');

const sign = config.get('sign');
const defaultUser = config.get('admin');
const tableName = 'USERS';


mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${tableName}(
        id INT UNSIGNED AUTO_INCREMENT,
        user VARCHAR(10),
        password VARCHAR(64),
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);


async function findOne({user, password}) {
    const res = await mysqlQuery(`
        SELECT
            *
        FROM ${tableName}
        ${modelUtil.toWhereString({user, password})}
    `);
    return res[0];
}
exports.findOne = findOne;

function insert(data) {
    return Table.insert(tableName, data);
}
exports.insert = insert;

function getUserInfo(data) {
    return mysqlQuery(`
        SELECT
            user
        FROM ${tableName}
        WHERE user = '${data.user}'
    `);
}
exports.getUserInfo = getUserInfo;


// 主动写入用户
async function insertUser(user, password) {
    let res = await User.findOne({user: user});
    if (res) {
        return;
    }
    const pass = crypto.createHmac('md5', sign)
                   .update(password)
                   .digest('hex');
    await User.insert({user: user, password: pass});
}

dbEvent.on('dbstart', function() {
    insertUser(defaultUser.user, defaultUser.password);
});