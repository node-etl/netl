'use strict';
const parse = require('csv-parse');

async function TEXT_LINE_TO_OBJ() {
    const t = this;
    const parseOptions = {
        auto_parse: true,
        auto_parse_date: (t.autoParseDate === undefined) ? true : t.autoParseDate,
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
    const outputType = t.outputObjectType || 'object';

    const keys = await new Promise((resolve, reject) => {
        parse(t.attributeNames, parseOptions, (err, output) => {
            if (err) reject(err);
            else resolve(output[0]);
        });
    });

    async function invoke(line) {
        const values = await new Promise((resolve, reject) => {
            parse(line, parseOptions, (err, output) => {
                if (err) reject(err);
                else resolve(output[0]);
            });
        });
        if (outputType === 'array') {
            return values;
        } else if (outputType === 'object') {
            const obj = Object.create(null);
            keys.forEach((el, i) => {
                obj[el] = values[i];
            });
            return obj;
        };
    };

    return { invoke };
};

module.exports = {
    name: 'TEXT_LINE_TO_OBJ',
    exe: TEXT_LINE_TO_OBJ
};