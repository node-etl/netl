'use strict';
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const log = require('../../tools').log;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    };
};

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
    const _sqlFiles = options.sqlFiles || null;
    var sqlStatements;

    // Load SQL from file if required
    if (_sqlFiles) {
        var sqlStatements = _sqlFiles.map((p) => {
            const _p = path.join(process.cwd(), p);
            log.info(`Function : ${options.Name} : Loaded SQL from file path: ${_p}`);
            return fs.readFileSync(_p).toString();
        });
    } else {
        sqlStatements = [options.sql];
        log.info(`Function : ${options.Name} : Loaded SQL string: ${JSON.stringify(sqlStatements[0])}`);
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
        var results = [];
        await asyncForEach(sqlStatements, async(stmt, i, arr) => {
            log.info(`Function : ${options.Name} : Executing query(s): ${JSON.stringify(stmt)}`);
            var res = await new Promise((resolve, reject) => {
                pool.query(stmt, (error, results, fields) => {
                    if (error) reject(new Error(`Error running SQL: ${error.sqlMessage} : ${error.sql}`));
                    else {
                        log.info(`Function : ${options.Name} : Function execution complete : result : ${JSON.stringify(results)}`);
                        resolve(JSON.stringify(results));
                    };
                });
            });
            results.push(res);
        });
        return results;
    };

    return { invoke };
};

module.exports = {
    name: 'SQL_EXECUTE_MYSQL',
    exe: SQL_EXECUTE_MYSQL
};