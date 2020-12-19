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
    redis: {
        host: "localhost",
        port: 6379,
        password : "123456",
    },
    huobi: require('./production').huobi,
    email: require('./production').email,
    /* config/production.js 不能与此文件一样 */
    sign: 'a12',
}

