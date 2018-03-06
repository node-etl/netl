'use strict';
const assert = require('assert');

const data = [
    { a: "a", b: "b", c: "c" },
    { a: "a2", b: "b2", c: "c2" },
    { a: "a3", b: "b3", c: "c3" }
];

describe('CouchDB loading:', function() {
    it("Batch load recieves 201 response", function() {
        const l = {
            "Name": "COUCHDB",
            "username": "admin",
            "password": "password",
            "server": "localhost",
            "port": 5984,
            "ssl": false,
            "database": "test"
        };
        const m = require('../index.js').exe.call(l);
        m.batch(data)
            .then(function(res) {
                assert.equal(res, 201);
            })
            .catch(function(msg) {
                assert.fail("Loading data into CouchDB did not succeed: " + msg);
            })
    });
});