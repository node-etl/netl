'use strict';
const request = require('request');

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
    function invoke(data) {
        var postData = { docs: data };
        var endpoint = '/_bulk_docs';
        var url = address + endpoint;
        return new Promise(function(resolve, reject) {
            try {
                if (data.length < 1) return resolve('0');
                request({
                    uri: url,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                }, function(error, res, body) {
                    var msg;
                    if (error) {
                        return reject(new Error('No response from CouchDB: ' + error));
                    } else if (res.statusCode !== 201) {
                        return reject(new Error('Unexpected response from CouchDB ' + res.statusCode));
                    } else {
                        return resolve(res.statusCode);
                    };
                });
            } catch (error) {
                return reject(error);
            };
        });
    };

    /* API */
    return new Promise(async(resolve, reject) => {
        setImmediate(() => {
            try {
                return resolve({
                    invoke: invoke
                });
            } catch (error) {
                return reject(new Error("Unable to load transformation module"));
            };
        });
    });
};

module.exports = {
    name: 'COUCHDB',
    exe: COUCHDB
};