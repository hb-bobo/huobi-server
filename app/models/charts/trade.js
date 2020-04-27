
const { mysqlQuery } = require('../../db');
const table = require('../table');
const getInterval24 = require('../../utils/getInterval24');
const modelUtil = require('../utils');


mysqlQuery(`
    CREATE TABLE IF NOT EXISTS ${modelUtil.getYearTable('HUOBI_TRADE')}(
        id INT UNSIGNED AUTO_INCREMENT,
        buy FLOAT(12) NOT NULL,
        sell FLOAT(12) NOT NULL, 
        exchange VARCHAR(10),
        symbol VARCHAR(10) NOT NULL,
        time DATETIME,
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);
/**
 * 获取资金交易额
 * @return {Promise}
 */
function getTrade({
    symbol = 'btcusdt',
    time = getInterval24(),
    period = '2min',
    exchange = 'huobi',
    tableName = modelUtil.getYearTable('HUOBI_TRADE')
} = {}) {

    let query = `
        SELECT
            buy,
            sell,
            symbol,
            exchange,
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
                SUM(buy) as buy,
                SUM(sell) as sell,
                symbol,
                exchange,
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
exports.getTrade = getTrade;

function save(data) {
    table.insert(modelUtil.getYearTable('HUOBI_TRADE'), data);
}

exports.save = save;