const path = require('path');
module.exports = {
    port: 3001,
    publicPath: path.join(__dirname, '../public'),
    huobi: {
        ws_url_prex: 'wss://api.huobi.de.com/ws', // "wss://www.hbdm.com/ws", 'wss://api.huobi.pro/ws
        api: 'https//api.huobi.de.com', // // 'https//api.huobi.br.com'
    },
}
