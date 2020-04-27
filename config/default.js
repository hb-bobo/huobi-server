const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
    port: 3001,
    host: isDev ? 'localhost' : '139.224.62.3:3001',
    isDev,
    publicPath: path.join(__dirname, '../public'),
}
