'use strict';
const mysql = require('mysql');

function SQL_EXECUTE_MYSQL() {
    // Load configuration
    const options = this;
    const connectionLimit = options.connectionLimit;
    const hostname = options.hostname;
    const username = options.username;
    const password = options.password;
    const database = options.database;
    const port = (options.port) ? (typeof options.port === 'number') ? options.port : 3306 : 3306;
    const multipleStatements = options.multipleStatements;
    const sql = options.sql;

    // Create connection pool
    const pool = mysql.createPool({
        connectionLimit: connectionLimit,
        host: hostname,
        user: username,
        password: password,
        database: database,
        multipleStatements: multipleStatements,
        port: port
    });

    async function invoke() {
        return await new Promise(function(resolve, reject) {
            pool.query(sql, (error, results, fields) => {
                if (error) reject(error)
                else resolve(JSON.stringify(results));
            });
        });
    };

    return { invoke };
};

module.exports = {
    name: 'SQL_EXECUTE_MYSQL',
    exe: SQL_EXECUTE_MYSQL
};