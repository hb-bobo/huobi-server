const config = require('config');
const { mysqlQuery } = require('../../db');
const table = require('../table');

const tableName = 'AUTO_TRADE_LOG';

mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${tableName}(
        id INT UNSIGNED AUTO_INCREMENT,
        symbol VARCHAR(10),
        amoutMA10 FLOAT,
        amoutMA20 FLOAT,
        priceMA5 FLOAT,
        priceMA10 FLOAT,
        priceMA30 FLOAT,
        priceMA60 FLOAT,
        priceMA120 FLOAT,
        priceKline1 FLOAT,
        priceKline2 FLOAT,
        lastAmount FLOAT,
        buy FLOAT,
        sell FLOAT,
        close FLOAT,
        time DATETIME,
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);


function save(data) {
    return table.insert(tableName, data);
}
exports.save = save;