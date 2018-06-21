'use strict';
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const log = require('../../tools').log;

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
    const _sqlFilePath = options.sqlFilePath || null;
    var sql;

    // Load SQL from file if required
    if (_sqlFilePath) {
        var p = path.join(process.cwd(), _sqlFilePath);
        sql = fs.readFileSync(p).toString();
        log.info(`Function : ${options.Name} : Loaded SQL from file path: ${p}`);
    } else {
        sql = options.sql;
        log.info(`Function : ${options.Name} : Loaded SQL string: ${JSON.stringify(sql)}`);
    };

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
            log.info(`Function : ${options.Name} : Executing query(s): ${JSON.stringify(sql)}`);
            pool.query(sql, (error, results, fields) => {
                if (error) reject(new Error(`Error running SQL: ${error.sqlMessage} : ${error.sql}`));
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