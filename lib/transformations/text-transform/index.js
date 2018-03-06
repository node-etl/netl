// 'use strict';

// function CASE_CHANGE() {
//     const t = this;
//     const upper = t.upper;
//     const attributes = t.attributes;

//     function transform(batch) {
//         const transformedBatch = [];
//         batch.forEach(function(datum) {
//             attributes.forEach(function(key) {
//                 if (typeof datum[key] === 'string') {
//                     datum[key] = (upper) ? datum[key].toUpperCase() : datum[key].toLowerCase();
//                 };
//             });
//             transformedBatch.push(datum);
//         });
//         return transformedBatch;
//     };

//     return {
//         transform: transform
//     };
// };

// module.exports = {
//     name: 'CASE_CHANGE',
//     exe: CASE_CHANGE
// };