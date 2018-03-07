// 'use strict';
// const fs = require('fs');
// const readline = require('readline');
// const tools = require('../netl-tools');
// const log = tools.log;

// function randLetter() {
//     var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
//     var letter = letters[Math.floor(Math.random() * letters.length)];
//     return letter;
// };

// function randNumber() {
//     return Math.floor(Math.random() * 10)
// };

// function generateKey(keyFormat) {
//     var newKey = '';
//     for (let j = 0; j < keyFormat.length; j++) {
//         let char = keyFormat[j];
//         try {
//             char = parseInt(char)
//             if (isNaN(char)) {
//                 throw new Error()
//             } else {
//                 char = 'number'
//             };
//         } catch (e) {
//             char = 'string'
//         };
//         switch (char) {
//             case 'number':
//                 newKey += randNumber();
//                 break;
//             case 'string':
//                 newKey += randLetter();
//                 break;
//             default:
//                 break;
//         };
//     };
//     return newKey;
// };

// function ANONYMIZE_OBJ() {
//     const t = this;

//     function transform(line) {
//         if (line.length === 0) return null;
//         const colDelim = t.colDelim || ',';
//         const dictionaryHeaders = t.dictionary.headers.split(colDelim);
//         const dictionary = t.dictionary.path;
//         const dictionaryColDelim = t.dictionary.colDelim || ',';
//         const dictionaryLineDelim = t.dictionary.lineDelimRegex || "\r\n|\r|\n";
//         const dictionaryCaseSensitive = t.dictionary.caseSensitive;
//         const anonymizations = t.anonymizations;
//         const keyFormat = t.dictionary.newKeyFormat;

//         // There can be several anonymizations
//         // These are configured as: "column name to replace" : "column name to be replaced"
//         // This object looks at the provided dictionary and holds a reference to which column is which
//         if (!t._dictionaryAnonymizationIndexes) {
//             t._dictionaryAnonymizationIndexes = [];
//             anonymizations.forEach(function(anon, i, arr) {
//                 var from = anon[0];
//                 var to = anon[1];
//                 log.info("netl-trans-anonymize : Anonymizing from column " + from + " to " + to);
//                 var fromI = dictionaryHeaders.indexOf(from);
//                 var toI = dictionaryHeaders.indexOf(to);
//                 t._dictionaryAnonymizationIndexes.push([fromI, toI]);
//             });
//         };

//         // Load the source dictionary if not already loaded
//         // This is built via usage of the t._dictionaryAnonymizationIndexes object
//         if (!t._dictionary) {
//             log.info("netl-trans-anonymize : Loading dictionaries for anonimizations");
//             t._dictionary = [];
//             t._dictionaryAnonymizationIndexes.forEach(function(item, i, arr) {
//                 t._dictionary[i] = {};
//             });
//             let d = new RegExp(dictionaryLineDelim);
//             let dictContents = fs.readFileSync(dictionary, 'utf8').split(d);
//             dictContents.forEach(function(line, i, arr) {
//                 line = line.split(dictionaryColDelim);
//                 t._dictionaryAnonymizationIndexes.forEach(function(anon, j, arr2) {
//                     var aFromI = anon[0];
//                     var aToI = anon[1];
//                     if (line[aFromI] !== '') {
//                         if (dictionaryCaseSensitive) {
//                             t._dictionary[j][line[aFromI].trim()] = line[aToI];
//                         } else {
//                             t._dictionary[j][line[aFromI].trim().toUpperCase()] = line[aToI];
//                         };
//                     };
//                 });
//             });
//         };

//         // Use the CSV headers to figure out the column indexes that need to be replaced
//         // Loop through the anonymizations array, and item[0] contains the column name being replaced
//         var attributeNames = t.attributeNames.split(colDelim);
//         if (!t._replaceIndexes) {
//             t._replaceIndexes = [];
//             anonymizations.forEach(function(anon, i, arr) {
//                 var index = attributeNames.indexOf(anon[0]);
//                 t._replaceIndexes.push(index);
//             });
//         };

//         // For each dictionary, use the corresponding replaceIndex to anonymize the line
//         line = line.split(colDelim);
//         t._dictionary.forEach(function(dic, i, arr) {
//             var replaceIndex = t._replaceIndexes[i];
//             var oldKey = line[replaceIndex];
//             // swap the value at line[x] with the new value from dictionary
//             if (dictionaryCaseSensitive) {
//                 line[replaceIndex] = dic[oldKey.trim()];
//             } else {
//                 line[replaceIndex] = dic[oldKey.trim().toUpperCase()];
//             };
//             // If the swap didn't work, then a new key must be made
//             if (!line[replaceIndex]) {
//                 let newKey = '';
//                 // Confirm the key is not already present
//                 (function getKey() {
//                     var keyOk = true;
//                     newKey = generateKey(keyFormat);
//                     if (Object.values(t._dictionary[i]).indexOf(newKey) >= 0) keyOk = false;
//                     return (keyOk) ? keyOk : getKey();
//                 })();
//                 // Add new key => value to dictionary
//                 log.info("netl-trans-anonymize : New key added to dictionary for anon " + i + " : value: " + newKey);
//                 if (dictionaryCaseSensitive) {
//                     t._dictionary[i][oldKey.trim()] = newKey;
//                 } else {
//                     t._dictionary[i][oldKey.trim().toUpperCase()] = newKey;
//                 };
//                 line[replaceIndex] = newKey;
//             };
//         });

//         return line.join(colDelim);
//     };

//     return {
//         transform: transform
//     };

// };

// module.exports = {
//     name: 'ANONYMIZE_OBJ',
//     exe: ANONYMIZE_OBJ
// };