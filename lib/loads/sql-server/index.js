// 'use strict';
// const fs = require('fs');
// const path = require('path');
// const tools = require('../netl-tools');
// const log = tools.log;
// const sql = require('mssql');

// function _getSqlType(desc) {
//     // TODO: Add all the types
//     // TODO: Allow for varchar length config
//     switch (desc.toUpperCase()) {
//         case 'NVARCHAR(250)':
//             return "NVarChar";
//         default:
//             break
//     }
// };

// function _getNullable(desc) {
//     return (desc === "NULL") ? true : false;
// };

// function _getPrimary(desc) {
//     return (desc.indexOf("NOT") >= 0) ? false : true;
// };

// /**
//  * batch(data): data is an array of lines (strings).
//  * Anything else won't work
//  */
// function SQL_SERVER() {
//     var options = this;
//     const db = options.db;
//     const tableName = options.table;
//     const tableDefinition = options.tableDefinition;
//     const attributeNames = options.attributeNames;

//     // Configure database
//     const sqlConfig = {
//         user: options.username,
//         password: options.password,
//         server: options.server,
//         database: db,
//         pool: {
//             max: 100,
//             min: 0,
//             idleTimeoutMillis: 30000
//         },
//         options: {
//             encrypt: true
//         }
//     };

//     // Create a connection pool for multiple use
//     const pool = new sql.ConnectionPool(sqlConfig)

//     /* PUBLIC method */
//     function batch(data) {
//         return new Promise(function(fulfill, reject) {
//             const sample = data[0];
//             const table = new sql.Table(tableName);
//             table.create = true;
//             attributeNames.split(',').forEach((col) => {
//                 table.columns.add(col, sql.NVarChar(sql.MAX), { nullable: true, primary: false });
//             });

//             // add here rows to insert into the table
//             data.forEach(function(val, i, arr) {
//                 table.rows.add(...val);
//             });

//             if (!pool.connected) {
//                 pool.connect().then(pool => {
//                         return pool.request().bulk(table);
//                     }).then(rslt => {
//                         fulfill(201);
//                     })
//                     .catch(err => {
//                         reject(err);
//                     });
//             } else {
//                 pool.request().bulk(table)
//                     .then(rslt => {
//                         fulfill(201);
//                     })
//                     .catch(err => {
//                         reject(err);
//                     });
//             };
//         });
//     };
//     /* API */
//     return {
//         batch: batch
//     };
// };

// module.exports = {
//     name: 'SQL_SERVER',
//     exe: SQL_SERVER
// };