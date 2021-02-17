module.exports = {
    host: 'localhost',
    env: 'dev',
    dbConfig: {
        host     : "cdb-rh7sl6qr.gz.tencentcdb.com",
        port     : 10032,
        user     : "root",
        password : "-8590550aA-",
        database : "huobi",
    },
    redis: {
        host: "localhost",
        port: 6379,
        password : "123456",
    },
    email: require('./production').email,
    /* config/production.js 不能与此文件一样 */
    sign: 'a12',
}

