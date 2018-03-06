// 'use strict';
// const fs = require('fs');
// const path = require('path');
// const tools = require('../netl-tools');

// /**
//  * batch(data): data is an array of lines (strings).
//  * Anything else won't work
//  */
// function FLATFILE() {
//     const options = this;
//     const filePath = options.path;
//     const fileType = options.fileType || null;

//     try {
//         // Create outpur directory if not exists
//         var dirPath = tools.getDirFromPath(filePath);
//         if (!fs.existsSync(dirPath)) tools.createDirPath(dirPath);
//     } catch (error) {
//         throw new Error("Error creating output directory for FLATFILE: " + error.message);
//     };

//     if (fileType === 'JSON') {
//         _appendChar('[');
//     };

//     function _appendChar(char) {
//         _append(char)
//             .then(function() {
//                 return;
//             })
//             .catch(function() {
//                 throw new Error("ERROR appending char to FLATFILE");
//             });
//     };

//     function _append(appendString) {
//         return new Promise(function(fulfill, reject) {
//             try {
//                 // Append to output file
//                 fs.appendFile(filePath, appendString, function(err) {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         fulfill(201);
//                     };
//                 });
//             } catch (e) {
//                 reject(e);
//             };
//         });
//     };


//     /* PUBLIC method */
//     function batch(data) {
//         var appendString = '';
//         data.forEach(function(line, i, arr) {
//             if (fileType === 'JSON') {
//                 appendString += JSON.stringify(line) + ',';
//             } else {
//                 appendString += line + '\n';
//             };
//         });
//         return _append(appendString);
//     };

//     /* PUBLIC method */
//     function finalizeJson() {
//         _appendChar('{}]');
//     };

//     /* API */
//     return {
//         batch: batch,
//         finalizeJson: finalizeJson
//     };
// };

// module.exports = {
//     name: 'FLATFILE',
//     exe: FLATFILE
// };