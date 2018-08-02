'use strict';
const request = require('request');

async function COUCHDB() {
    const options = this;
    const username = options.username || null;
    const password = options.password || null;
    const server = options.server || null;
    const protocol = (options.ssl) ? 'https' : 'http';
    const port = (options.port) ? (typeof options.port === 'number') ? options.port : 80 : 80;
    const db = options.database || null;
    const address = protocol + '://' + username + ':' + password + '@' + server + ':' + port + '/' + db;

    /* PUBLIC method */
    async function invoke(data) {
        var postData = { docs: data };
        var endpoint = '/_bulk_docs';
        var url = address + endpoint;
        return await new Promise(function(resolve, reject) {
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
                    if (error) {
                        reject(new Error('No response from CouchDB: ' + error));
                    } else if (res.statusCode !== 201) {
                        reject(new Error('Unexpected response from CouchDB ' + res.statusCode));
                    } else {
                        resolve(res.statusCode);
                    };
                });
            } catch (error) {
                reject(error);
            };
        });
    };

    /* API */
    return new Promise(async(resolve, reject) => {
        setImmediate(() => {
            try {
                resolve({ invoke });
            } catch (error) {
                reject(error);
            };
        });
    });
};

module.exports = {
    name: 'COUCHDB',
    exe: COUCHDB
};