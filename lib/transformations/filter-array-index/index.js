// 'use strict';

// function WHITELIST_ARRAY() {
//     const t = this;
//     var allowedIndexes = t.allowedIndexes;

//     function transform(batch) {
//         var retLines = []
//         batch.forEach(function(line) {
//             var filteredLine = line.filter((item, i, arr) => {
//                 return allowedIndexes.indexOf(i) >= 0;
//             });
//             retLines.push(filteredLine);
//         });
//         return retLines;
//     };

//     return {
//         transform: transform
//     };
// };

// module.exports = {
//     name: 'WHITELIST_ARRAY',
//     exe: WHITELIST_ARRAY
// };
// 'use strict';
// const Readable = require('stream').Readable;
// const csvParser = require('csv-parse/lib/sync');

// // This should be RFC 4180 ? 

// function TEXT_LINE_TO_ARRAY() {
//     const t = this;
//     const parseOptions = {
//         auto_parse: true,
//         auto_parse_date: true,
//         columns: null,
//         comment: '',
//         delimiter: t.delimiter,
//         escape: t.escapeChar,
//         from: 0,
//         to: 1,
//         ltrim: true,
//         rtrim: true,
//         max_limit_on_data_read: 128000,
//         quote: t.textQualifier,
//         relax: true,
//         relax_column_count: false,
//         skip_empty_lines: true,
//         skip_lines_with_empty_values: true
//     };
//     const keys = csvParser(t.attributeNames, parseOptions)[0];

//     function transform(lines) {
//         var retObjs = [];
//         lines.forEach(function(line) {
//             var values = csvParser(line, parseOptions)[0];
//             retObjs.push(values);
//         });
//         return retObjs;
//     };

//     return {
//         transform: transform
//     };
// };

// module.exports = {
//     name: 'TEXT_LINE_TO_ARRAY',
//     exe: TEXT_LINE_TO_ARRAY
// };
// 'use strict';

// function WHITELIST_ARRAY() {
//     const t = this;
//     var allowedIndexes = t.allowedIndexes;

//     function transform(batch) {
//         var retLines = []
//         batch.forEach(function(line) {
//             var filteredLine = line.filter((item, i, arr) => {
//                 return allowedIndexes.indexOf(i) >= 0;
//             });
//             retLines.push(filteredLine);
//         });
//         return retLines;
//     };

//     return {
//         transform: transform
//     };
// };

// module.exports = {
//     name: 'WHITELIST_ARRAY',
//     exe: WHITELIST_ARRAY
// };