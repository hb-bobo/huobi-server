const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
    port: 3000,
    host: isDev ? 'localhost' : '139.224.62.3:3001',
    isDev,
    publicPath: path.join(__dirname, '../public'),
    huobi: {
        ws_url_prex: 'wss://api.huobi.pro/ws', // "wss://www.hbdm.com/ws"
        api: 'https//api.huobi.de.com', // // 'https//api.huobi.br.com'
    },
}
