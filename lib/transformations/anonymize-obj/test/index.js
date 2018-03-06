const assert = require('assert');

const source =
    `a;b;c;d;e
aaaa;b1;cccc;d1;eeee
aaaa;b2;cccc;d2;eeee
aaaa;b3;cccc;d3;eeee
aaaa;b4;cccc;d4;eeee
aaaa;b5;cccc;d5;eeee
aaaa;b5;cccc;d5;eeee
aaaa;b5;cccc;d5;eeee
aaaa;b5;cccc;d5;eeee
aaaa;b5;cccc;d5;eeee
aaaa;b6;cccc;d6;eeee`

const t1 = {
    "Name": "ANONYMIZE",
    "attributeNames": "a;b;c;d;e",
    "colDelim": ";",
    "anonymizations": [
        ["d", "f"]
    ],
    "dictionary": {
        "headers": "d;f",
        "path": "./test/dictionary.csv",
        "savePath": "./test/dictionaryOut.csv",
        "outputStyle": "csv",
        "caseSensitive": false,
        "writeOutput": true,
        "colDelim": ";",
        "lineDelimRegex": "\r\n|\r|\n",
        "newKeyFormat": "a0a"
    },
    "afterTaskRunCBs": []
};

const t2 = {
    "Name": "ANONYMIZE",
    "attributeNames": "a;b;c;d;e",
    "colDelim": ";",
    "anonymizations": [
        ["d", "f"],
        ["b", "g"]
    ],
    "dictionary": {
        "headers": "d;f;b;g",
        "path": "./test/dictionary.csv",
        "savePath": "./test/dictionaryOut.csv",
        "outputStyle": "csv",
        "caseSensitive": false,
        "writeOutput": true,
        "colDelim": ";",
        "lineDelimRegex": "\r\n|\r|\n",
        "newKeyFormat": "00"
    },
    "afterTaskRunCBs": []
};

describe('ANONYMIZE', function() {
    describe('CSV', function() {
        var lines;
        var table = [];

        it('Can be split into lines by the \\n marker', function() {
            lines = source.split("\n");
            assert.equal(11, lines.length);
        });

        it('Can be split into columns by the ; marker', function() {
            lines.forEach(function(line, i, arr) {
                var row = line.split(';');
                assert.equal(5, row.length);
                table.push(row);
            });
            assert.equal(11, table.length);
        });

        describe('anonymisation', function() {
            it('Works with single anonymisation', function() {
                var anonLines = [];
                var anon = require('../index.js').exe.call(t1);
                lines.forEach(function(line, i, arr) {
                    anonLines.push(anon.transform(line));
                });
                assert.equal(anonLines[1], 'aaaa;b1;cccc;f1;eeee');
                assert.equal(anonLines[2], 'aaaa;b2;cccc;f2;eeee');
            });

            it('Works with multiple anonymisations', function() {
                var anonLines = [];
                var anon = require('../index.js').exe.call(t2);
                lines.forEach(function(line, i, arr) {
                    anonLines.push(anon.transform(line));
                });
                assert.equal(anonLines[1], 'aaaa;g1;cccc;f1;eeee');
                assert.equal(anonLines[2], 'aaaa;g2;cccc;f2;eeee');
            });

            it('Works with uneven anonymisation dictionaries', function() {
                var anonLines = [];
                var anon = require('../index.js').exe.call(t2);
                lines.forEach(function(line, i, arr) {
                    anonLines.push(anon.transform(line));
                });
                assert.equal(anonLines[3].indexOf('g3'), 5);
                assert.equal(anonLines[4].indexOf('g4'), 5);
            });

            it('Single/multiple anons work with case sensitive off', function() {
                assert.equal(1, 2);
            });

            it('Single/multiple anons work with case sensitive on', function() {
                assert.equal(1, 2);
            });
        });
    });
});