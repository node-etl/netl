'use strict';
const Readable = require('stream').Readable;
const csvParser = require('csv-parse/lib/sync');

async function TEXT_LINE_TO_OBJ() {
    const t = this;
    const parseOptions = {
        auto_parse: true,
        auto_parse_date: true,
        columns: null,
        comment: '',
        delimiter: t.delimiter,
        escape: t.escapeChar,
        from: 0,
        to: 1,
        ltrim: true,
        rtrim: true,
        max_limit_on_data_read: 128000,
        quote: t.textQualifier,
        relax: true,
        relax_column_count: false,
        skip_empty_lines: true,
        skip_lines_with_empty_values: true
    };
    const keys = csvParser(t.attributeNames, parseOptions)[0];

    function invoke(line) {
        return new Promise(function(resolve, reject) {
            setImmediate(() => {
                try {
                    var values = csvParser(line, parseOptions)[0];
                    var obj = Object.create(null);
                    keys.forEach(function(el, i, arr) {
                        obj[el] = values[i];
                    });
                    return resolve(obj);
                } catch (error) {
                    return reject(new Error("TEXT_LINE_TO_OBJ:\n" + error));
                };
            });
        });
    };

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
    name: 'TEXT_LINE_TO_OBJ',
    exe: TEXT_LINE_TO_OBJ
};