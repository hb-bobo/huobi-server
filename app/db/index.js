const mysql = require('mysql');
const config = require('config');
const dbConfig = config.get('db');
const dbEvent = require('./event');

let connectionConfig = {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    database: dbConfig.database,
    insecureAuth: true,
    useConnectionPooling: true,
};
let connection = mysql.createConnection(connectionConfig);

connection.connect();
connection.on('error', handleErr);
setTimeout(function() {
    dbEvent.emit('dbstart');
}, 1000);

function handleErr(err) {
    connection.end(() => {
        if (err !== undefined) {
            console.log('connection:', err);
        }

        connection = mysql.createConnection(connectionConfig);
        connection.connect();
        connection.on('error', handleErr);
    });
}


function mysqlQuery(sql, params) {
    return new Promise((resove, reject) => {
        connection.query(sql, params, function (error, results, fields) {
            if (error) {
                console.error(error);
                reject(error);
                handleErr();
                return;
            }
            resove(results);
        });
    })
}

exports.mysqlQuery = mysqlQuery;

