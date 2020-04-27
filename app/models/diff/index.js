
const { mysqlQuery } = require('../../db');
const table = require('../table');
const getInterval24 = require('../../utils/getInterval24');
const modelUtil = require('../utils');

mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${modelUtil.getYearTable('HUOBI_CHARACTERISTIC')}(
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
        
        originBidsLen int(6),
        originAsksLen int(6),
        bidsLen int(5),
        asksLen int(5),
        bidsRobotMaxCount int(3),
        asksRobotMaxCount int(3),
        
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);
/**
 * 获取特征
 * @param {string} param.symbol
 * @return {Promise}
 */
function getCharacteristic({
    symbol = '',
    time = getInterval24(),
    exchange = 'huobi'
} = {}) {
    return mysqlQuery(
        `
        SELECT
            *
        FROM
            ${modelUtil.getYearTable('HUOBI_CHARACTERISTIC')} 
        WHERE
            time BETWEEN '${time[0]}' AND '${time[1]}'
            AND symbol = '${symbol}'
            AND \`exchange\` = '${exchange}'
        `
    );
}
exports.getCharacteristic = getCharacteristic;

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
    tableName = modelUtil.getYearTable('HUOBI_CHARACTERISTIC')
} = {}) {
    let query =  `
    SELECT
        bids_max_1,
        asks_max_1,
        sell_1,
        buy_1,
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
    return mysqlQuery(query);
}
exports.getPressure = getPressure;


function save(data) {
    table.insert(modelUtil.getYearTable('HUOBI_CHARACTERISTIC'), data);
}

exports.save = save;