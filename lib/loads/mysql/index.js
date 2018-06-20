'use strict';
const mysql = require('mysql');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    };
};

async function MYSQL() {
    const options = this;
    const username = options.username || null;
    const password = options.password || null;
    const hostname = options.hostname || null;
    const port = (options.port) ? (typeof options.port === 'number') ? options.port : 3306 : 3306;
    const database = options.database || null;
    const multipleStatements = options.multipleStatements || false;
    const connectionLimit = options.connectionLimit;

    // Create MySQL connection pool
    var pool = mysql.createPool({
        connectionLimit: connectionLimit,
        host: hostname,
        user: username,
        password: password,
        database: database,
        multipleStatements: multipleStatements,
        port: port
    });

    /* PUBLIC method */
    async function invoke(sqlStmnts) {
        if (sqlStmnts.length < 1) return '0';
        const fnResults = [];
        await asyncForEach(sqlStmnts, async(stmt) => {
            await new Promise((resolve, reject) => {
                pool.query(stmt, (error, results, fields) => {
                    try {
                        if (error) throw (error.sql) ? error.sql : error;
                        resolve(JSON.stringify(results));
                    } catch (error) {
                        reject(error);
                    };
                });
            });
            fnResults.push(res);
        });
        return fnResults;
    };

    return { invoke };
};

module.exports = {
    name: 'MYSQL',
    exe: MYSQL
};