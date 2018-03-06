'use strict';
const assert = require('assert');

const objs = [
    { a: "a", b: "b", c: "c" },
    { a: "a2", b: "b2", c: "c2" },
    { a: "a3", b: "b3", c: "c3" }
];

describe('Attributes can be appended to objects:', function() {
    it("A single attribute can be added to objects:", function() {
        const t = {
            "Name": "CREATE_OBJ_FIELD",
            "newAttributes": [
                ["type_", "test"]
            ]
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        result.forEach(function(item) {
            assert.strictEqual(item.type_, "test");
        });
    });
    it("Multiple attribute can be added to objects:", function() {
        const t = {
            "Name": "CREATE_OBJ_FIELD",
            "newAttributes": [
                ["type_", "test"],
                ["otherAttribute", "test2"],
            ]
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        result.forEach(function(item) {
            assert.strictEqual(item.type_, "test");
            assert.strictEqual(item.otherAttribute, "test2");
        });
    });
    it("New key:value pairs added to objects are type sensitive:", function() {
        const t = {
            "Name": "CREATE_OBJ_FIELD",
            "newAttributes": [
                ["bool", false],
                ["bool2", true],
                ["int", 10]
            ]
        };
        const m = require('../index.js').exe.call(t);
        const result = objs.map(function(obj) {
            return m.transform(obj)
        });
        result.forEach(function(item) {
            assert.strictEqual(item.bool, false);
            assert.strictEqual(item.bool2, true);
            assert.strictEqual(item.int, 10);
        });
    });
});