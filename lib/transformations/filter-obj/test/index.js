'use strict';
const assert = require('assert');

const objs = [
    { a: "a", b: "b", c: "c" },
    { a: "a2", b: "b2", c: "c2" },
    { a: "a3", b: "b3", c: "c3" }
];

describe('Objects can be filtered by:', function() {
    it("A single value for a single attribute:", function() {
        const t = {
            "Name": "FILTER",
            "filterOn": {
                "a": ["a"]
            }
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        assert.equal(objs[0], result[0]);
        assert.equal(null, result[1]);
        assert.equal(null, result[2]);
    });
    it("Multiple values for a single attribute:", function() {
        const t = {
            "Name": "FILTER",
            "filterOn": {
                "a": ["a", "a2"]
            }
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        assert.equal(objs[0], result[0]);
        assert.equal(objs[1], result[1]);
        assert.equal(null, result[2]);
    });
    it("A single values for a multiple attribute:", function() {
        const t = {
            "Name": "FILTER",
            "filterOn": {
                "a": ["a"],
                "b": ["b"],
            }
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        assert.equal(objs[0], result[0]);
        assert.equal(null, result[1]);
        assert.equal(null, result[2]);
    });
    it("Multiple values for a multiple attribute:", function() {
        const t = {
            "Name": "FILTER",
            "filterOn": {
                "a": ["a", "a2"],
                "b": ["b", "b2"],
            }
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        assert.equal(objs[0], result[0]);
        assert.equal(objs[1], result[1]);
        assert.equal(null, result[2]);
    });
    it("Filtered objects meet all filter conditions:", function() {
        const t = {
            "Name": "FILTER",
            "filterOn": {
                "a": ["a", "a2"],
                "b": ["b"],
            }
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        assert.equal(objs[0], result[0]);
        assert.equal(null, result[1]);
        assert.equal(null, result[2]);
    });
});