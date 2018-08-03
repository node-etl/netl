'use strict';
const fs = require('fs');
const path = require('path');
const tools = require("../../tools");

async function TXT() {
    const options = this;
    const dirPath = options.dirPath || null;
    const filename = options.filename;
    const filePath = path.join(dirPath, filename);
    const deleteExistingFile = options.deleteExistingFile || false;

    try {
        const directoryPath = tools.getDirFromPath(filePath);
        if (deleteExistingFile) try { fs.unlinkSync(filePath); } catch (e) {};
        if (!fs.existsSync(directoryPath)) tools.createDirPath(directoryPath);
    } catch (error) {
        throw new Error("Error creating output directory for FLATFILE_CSV: " + error.message);
    };

    async function _append(appendString) {
        return await new Promise(function(fulfill, reject) {
            fs.appendFile(filePath, appendString, function(err) {
                if (err) {
                    reject(err);
                } else {
                    fulfill(0);
                };
            });
        });
    };

    async function invoke(arrOfLines) {
        var str = ``;
        arrOfLines.forEach((line) => {
            str += `${line}\n`;
        });
        return await _append(str);
    };
    return { invoke };
};

module.exports = {
    name: 'TXT',
    exe: TXT
};