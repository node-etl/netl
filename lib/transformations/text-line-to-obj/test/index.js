'use strict';
const assert = require('assert');

describe('CSV values:', function() {
    describe('Are correctly split:', function() {
        const t = {
            "Name": "TEXT_LINE_TO_OBJ",
            "attributeNames": "h1,h2,h3",
            "delimiter": ",",
            "textQualifier": "\"",
            "escapeChar": "\\",
            "afterTaskRunCBs": []
        };
        it(`"a,1,true" is split into 3 ordered columns via a standard delimiter (,)`, function() {
            const m = require('../index.js').exe.call(t);
            const result = m.transform("a,1,true");
            const vals = Object.values(result);
            const valCount = vals.length;
            assert.equal(3, valCount);
            assert.equal(vals[0], 'a');
            assert.equal(vals[1], '1');
            assert.equal(vals[2], 'true');
        });
        it(`"a;1;true" is split into 3 ordered columns via alternative delimiter (;)`, function() {
            const t = {
                "Name": "TEXT_LINE_TO_OBJ",
                "delimiter": ";",
                "attributeNames": "h1;h2;h3",
                "textQualifier": "\"",
                "escapeChar": "\\",
                "afterTaskRunCBs": []
            };
            var m = require('../index.js').exe.call(t);
            var result = m.transform("a;1;true");
            const vals = Object.values(result);
            const valCount = vals.length;
            assert.equal(3, valCount);
            assert.equal(vals[0], 'a');
            assert.equal(vals[1], '1');
            assert.equal(vals[2], 'true');
        });
        it(`"a;1;true" is split into 3 ordered columns via a complex delimiter (|~|)`, function() {
            var t = {
                "Name": "TEXT_LINE_TO_OBJ",
                "delimiter": "|~|",
                "attributeNames": "h1|~|h2|~|h3",
                "textQualifier": "\"",
                "escapeChar": "\\",
                "afterTaskRunCBs": []
            };
            var m = require('../index.js').exe.call(t);
            var result = m.transform("a|~|1|~|true");
            const vals = Object.values(result);
            const valCount = vals.length;
            assert.equal(3, valCount);
            assert.equal(vals[0], 'a');
            assert.equal(vals[1], '1');
            assert.equal(vals[2], 'true');
        });
        it(`Headers are matched to the correct columns`, function() {
            const m = require('../index.js').exe.call(t);
            const result = m.transform("a,1,true");
            assert.equal(result['h1'], 'a');
            assert.equal(result['h2'], '1');
            assert.equal(result['h3'], 'true');
        });
        it(`JavaScript objects are created`, function() {
            const m = require('../index.js').exe.call(t);
            const result = m.transform("a,1,true");
            assert.equal('object', typeof result);
        });
    });

    describe('Are parsed corectly:', function() {
        it('Values can be wrapped by a qualifier (")', function() {
            var t = {
                "Name": "TEXT_LINE_TO_OBJ",
                "delimiter": ",",
                "attributeNames": "\"h1\",\"h2\",\"h3\"",
                "textQualifier": "\"",
                "escapeChar": "\\",
                "afterTaskRunCBs": []
            };
            var m = require('../index.js').exe.call(t);
            var result = m.transform("v1,\"2\",true");
            assert.equal(result.h1, 'v1');
            assert.equal(result.h2, 2);
            assert.equal(result.h3, 'true');
        });
        it("Date conversion is implicit", function() {
            var t = {
                "Name": "TEXT_LINE_TO_OBJ",
                "delimiter": ",",
                "attributeNames": "\"h1\",\"h2\",\"h3\"",
                "textQualifier": "\"",
                "escapeChar": "\\",
                "afterTaskRunCBs": []
            };
            var m = require('../index.js').exe.call(t);
            var result = m.transform("v1,\"2016-02-08 12:47:45\",true");
            assert.equal(result.h1, 'v1');
            assert.equal(Object.prototype.toString.call(result['h2']), '[object Date]');
            assert.equal(result.h3, 'true');
        });
    });
});