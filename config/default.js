const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
    hosts: {
        api_huobi: 'https//api.huobi.de.com', // 'https//api.huobi.br.com' https://api.huobi.pro
        huobi_ws: 'wss://api.huobi.pro/ws', // 'wss://api.huobi.br.com/ws' wss://api.huobi.pro/ws
    },
    isDev,
    publicPath: path.join(__dirname, '../public'),
    rootPath: path.join(__dirname, '../'),
    port: 3000,
}
