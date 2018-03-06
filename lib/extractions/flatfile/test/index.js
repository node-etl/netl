'use strict';
const assert = require('assert');
const path = require('path');

const e = {
    "Name": "FLATFILE",
    "path": path.join(__dirname, '/test.csv'),
    "skipHeaderRows": 1,
    "bufferSize": 65536,
    "batchSize": 1,
    "startFrom": 0,
    "afterTaskRunCBs": []
};

describe('CSV Parsing', function() {
    it("Returns all the lines in a CSV", function() {
        const m = require('../index.js').exe.call(e);
        var row = m.getNext();
        var c = 1;
        while (!row.done) {
            c++;
            row = m.getNext();
        };
        assert.equal(c, 16);
    });
    it("Returns single rows at a time", function() {
        const m = require('../index.js').exe.call(e);
        var row = m.getNext();
        for (let i = 0; i < 5; i++) {
            row = m.getNext();
        };
        const vals = row.value;
        assert.equal('Row 7 Column 1,Row 7 Column 2,Row 7 Column 3,Row 7 Column 4,Row 7 Column 5', vals);
    });
});