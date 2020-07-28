module.exports = {
    host: 'localhost',
    env: 'dev',
    dbConfig: {
        host     : "localhost",
        port     : 3306,
        user     : "test",
        password : "test123456",
        database : "huobi",
    },
    huobi: require('./production').huobi,
    /* config/production.js 不能与此文件一样 */
    sign: 'a12',
}

