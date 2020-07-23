const path = require('path');
module.exports = {
    port: 3001,
    publicPath: path.join(__dirname, '../public'),
    huobi: {
        ws_url_prex: 'wss://api.huobi.pro/ws', // "wss://www.hbdm.com/ws"
        api: 'https//api.huobi.de.com', // // 'https//api.huobi.br.com'
    },
}
