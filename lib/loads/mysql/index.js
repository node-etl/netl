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
    function invoke(sqlStmnts) {
        const fnResults = [];
        return new Promise(async(resolveModule, rejectModule) => {
            if (sqlStmnts.length < 1) resolveModule(202);
            await asyncForEach(sqlStmnts, async(stmt) => {
                await new Promise((resolveStmt, rejectStmt) => {
                        pool.query(stmt, (error, results, fields) => {
                            try {
                                if (error) throw (error.sql) ? error.sql : error;
                                resolveStmt(JSON.stringify(results));
                            } catch (error) {
                                rejectStmt(error);
                            };
                        });
                    })
                    .then((res) => {
                        fnResults.push(res);
                    })
                    .catch((error) => {
                        rejectModule(error);
                    });
            });
            resolveModule(fnResults);
        });
    };

    // nETL API requires this to allow for network requests on module loading
    return Promise.resolve({
        invoke: invoke
    });
};

module.exports = {
    name: 'MYSQL',
    exe: MYSQL
};