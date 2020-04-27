
module.exports = {
    /* config/production.js 不能与此文件一样 */
    admin: {
        user: 'hubo',
        password: '11'
    },
    db: {
        host     : "localhost",
        user     : "root",
        password : "8590550aA",
        database : "HUOBI",
        port: 3306,
    },
    /* 未来开发邮件通知时需要在config/production.js 填写 */
    email: {
        host: 'smtp.163.com',
        port: 465,
        secureConnection: true,
        secure: true, // true for 465, false for other ports
        auth: {
            user: '7519688@qq.com', // generated ethereal user
            pass: 'pass' // generated ethereal password
        }
    },
    huobi: require('./production').huobi,
    /* config/production.js 不能与此文件一样 */
    sign: 'a12',
}

