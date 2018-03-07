'use strict';
const assert = require('assert');

const objs = [
    { a: "a", b: "b", c: "c" },
    { a: "a2", b: "b2", c: "c2" },
    { a: "a3", b: "b3", c: "c3" }
];

describe('Object attribute whitelisting:', function() {
    it("Generally works as expected", function() {
        const t = {
            "Name": "WHITELIST",
            "allowedAttributes": ["a", "c", "f"]
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        result.forEach(function(item, i) {
            const sourceObj = objs[i];
            delete objs[i]['b'];
            assert.equal(JSON.stringify(item), JSON.stringify(sourceObj));
        });
    });
});