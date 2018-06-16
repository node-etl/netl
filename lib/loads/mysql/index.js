'use strict';
const mysql = require('mysql');
async function MYSQL() {
    const options = this;
    const username = options.username || null;
    const password = options.password || null;
    const hostname = options.hostname || null;
    const port = (options.port) ? (typeof options.port === 'number') ? options.port : 3306 : 3306;
    const database = options.database || null;
    const multipleStatements = options.multipleStatements || false;

    // Create MySQL connection pool
    var db = mysql.createConnection({
        host: hostname,
        user: username,
        password: password,
        database: database,
        multipleStatements: multipleStatements
    });

    /* PUBLIC method */
    function invoke(sqlStmnts) {
        return new Promise(function(resolve, reject) {
            // Try query
            try {
                resolve(202);
                // if not successful return reject()
            } catch (error) {
                reject(error);
            };
        });
    };

    /* API */
    return new Promise(async(resolve, reject) => {
        setImmediate(() => {
            try {
                resolve({
                    invoke: invoke
                });
            } catch (error) {
                reject(new Error("Unable to load module"));
            };
        });
    });
};

module.exports = {
    name: 'MYSQL',
    exe: MYSQL
};