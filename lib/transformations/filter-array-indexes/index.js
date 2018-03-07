// 'use strict';

// function FILTER_ARRAY_INDEXES() {
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
//     name: 'FILTER_ARRAY_INDEXES',
//     exe: FILTER_ARRAY_INDEXES
// };