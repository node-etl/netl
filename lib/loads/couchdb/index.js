'use strict';
const request = require('request');
/**
 * Configuration example:
 * "Load": {
 *     "Name": "COUCHDB",
 *     "username": "admin",
 *     "password": "password",
 *     "server": "localhost",
 *     "port": 5984,
 *     "ssl": false,
 *     "database": "msc",
 *     "afterTaskRunCBs": []
 * }
 */
function COUCHDB() {
    const options = this;
    const username = options.username || null;
    const password = options.password || null;
    const server = options.server || null;
    const protocol = (options.ssl) ? 'https' : 'http';
    const port = (options.port) ? (typeof options.port === 'number') ? options.port : 80 : 80;
    const db = options.database || null;
    const address = protocol + '://' + username + ':' + password + '@' + server + ':' + port + '/' + db;

    /* PUBLIC method */
    function batch(data) {
        var postData = { docs: data };
        var endpoint = '/_bulk_docs';
        var url = address + endpoint;
        return new Promise(function(fulfill, reject) {
            try {
                request({
                    uri: url,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                }, function(err, res, body) {
                    var msg;
                    if (err) {
                        reject(err);
                    } else if (res.statusCode !== 201) {
                        reject(res.statusCode);
                    } else {
                        fulfill(res.statusCode);
                    };
                });
            } catch (e) {
                reject(e);
            };
        });
    };

    /* API */
    return {
        batch: batch
    };
};

module.exports = {
    name: 'COUCHDB',
    exe: COUCHDB
};