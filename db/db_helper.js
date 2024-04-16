const mysql = require("mysql");
const { promisify } = require('util');

const {database} = require("./db_config");
const pool = mysql.createPool(database);

pool.getConnection((err, conn) => {
    if (err) {
        if (err.code == 'PROTOCOL_CONNECTION_LOST')
            console.error('DATABASE CONNECTION WAS CLOSED');
        if (err.code == 'ER_CON_COUNT_ERROR')
            console.error('DATABASE HAS TOO MANY CONNECTIONS');
        if (err.code == 'ECONNREFUSED')
            console.error('DATABASE CONNECTION WAS REFUSED');
    }
    if (conn) {
        conn.release();
        console.log('DB is conected');
    }
    return;
});

pool.query = promisify(pool.query);
module.exports = pool;