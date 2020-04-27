
const { mysqlQuery } = require('../../db');
const table = require('../table');
const getInterval24 = require('../../utils/getInterval24');
const modelUtil = require('../utils');
const tableName = modelUtil.getYearTable('HUOBI_PRESSURE_ZONE');

mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${tableName}(
        id INT UNSIGNED AUTO_INCREMENT,
        symbol VARCHAR(10) NOT NULL,
        price FLOAT(15),
        time DATETIME,
        exchange VARCHAR(10),

        bids_max_1 FLOAT(20) NOT NULL,
        bids_max_2 FLOAT(20),
        asks_max_1 FLOAT(20) NOT NULL,
        asks_max_2 FLOAT(20),

        sell_1 FLOAT(20) NOT NULL,
        sell_2 FLOAT(20) NOT NULL,
        buy_1 FLOAT(20) NOT NULL,
        buy_2 FLOAT(20) NOT NULL,
        
        bids_max_price VARCHAR(22) NOT NULL,
        asks_max_price VARCHAR(22) NOT NULL,
        
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);
/**
 * 获取压力位 以amount 体现
 * @param {string} param.symbol
 * @return {Promise}
 */
function getPressure({
    symbol = 'btcusdt',
    time = getInterval24(),
    exchange = 'huobi',
    period = '',
    tableName = modelUtil.getYearTable('HUOBI_PRESSURE_ZONE')
} = {}) {
    let query =  `
    SELECT
        bids_max_1,
        asks_max_1,
        sell_1,
        buy_1,
        bids_max_price,
        asks_max_price,
        price,
        DATE_FORMAT(time,'%Y/%m/%d %H:%i:%s') as time 
    FROM
        ${tableName}
    WHERE
        time BETWEEN '${time[0]}' AND '${time[1]}'
        AND symbol = '${symbol}'
        AND \`exchange\` = '${exchange}'
    `;
    if (period === '1day') {
        query = `
        SELECT
            MAX(bids_max_1) as bids_max_1,
            MAX(asks_max_1) as asks_max_1,
            MAX(sell_1) as sell_1,
            MAX(buy_1) as buy_1,
            AVG(price) as price,
            DATE_FORMAT(time,'%Y/%m/%d') as time 
        FROM
            ${tableName}
        WHERE
            symbol = '${symbol}'
            AND \`exchange\` = '${exchange}'
        GROUP BY DATE_FORMAT(time,'%Y/%m/%d')
        `;
    }
    return  mysqlQuery(query);
}
exports.getPressure = getPressure;

function save(data) {
    table.insert(modelUtil.getYearTable('HUOBI_PRESSURE_ZONE'), data);
}

exports.save = save;