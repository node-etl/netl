'use strict';
const jsonfile = require('jsonfile');
const path = require('path').posix;
path.sep = "/";
__dirname = __dirname.split(/\\/g).join('/');
const fs = require('fs');
const os = require('os');
const Tools = {};

Tools.createDirPath = function(dir) {
    const splitPath = dir.split('/');
    if (splitPath[0] === '') splitPath[0] = '/'; // For Windows BASH
    splitPath.reduce((path, subPath) => {
        let currentPath;
        if (path !== "" && subPath != '.') {
            currentPath = path + '/' + subPath;
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            };
        } else {
            currentPath = subPath;
        };
        return currentPath
    }, '');
};

Tools.getDirContents = function(dir) {
    return fs.readdirSync(dir)
        .reduce((files, file) =>
            fs.statSync(path.join(dir, file)).isDirectory() ?
            files.concat(read(path.join(dir, file))) :
            files.concat(path.join(dir, file)), []);
};

Tools.getDirFromPath = function(path) {
    var revPath = path.split('').reverse().join('');
    var fileNameStart = revPath.indexOf('/');
    var fileNameReversed = revPath.substr(0, fileNameStart);
    var filename = fileNameReversed.split('').reverse().join('');
    if (filename[filename.length - 4] === '.') {
        return path.substr(0, (path.length - fileNameStart));
    } else {
        return path;
    };
};

Tools.log = (function(msg) {
    var fileLogger;

    function setLogPath(filePath) {
        this.logPath = filePath;
        Tools.createDirPath(Tools.getDirFromPath(this.logPath));
        fileLogger = fs.createWriteStream(this.logPath, {
            flags: 'a'
        });
    };

    // Log both to file and console
    function log(msg, level) {
        var logData = `${(new Date()).toISOString()} : ${level} : ${JSON.stringify(msg)}`;
        try {
            fileLogger.write(logData + os.EOL);
        } catch (error) {
            process.stdout.write("Unable to append log at path: " + this.logPath);
        };
    };

    /**
     * Prints to the console in a friendly way
     * @param {string} msg 
     */
    function printToConsole(msg) {
        if (msg) {
            process.stdout.write(`${msg}${(process.env["CLI"]) ? "\n": "\n>"}`);
        } else {
            process.stdout.write("\n> ");
        };
    };

    function trace(msg) {
        log(msg, 'TRACE');
    };

    function debug(msg) {
        log(msg, 'DEBUG');
    };

    function info(msg) {
        log(msg, 'INFO');
    };

    function warn(msg) {
        log(msg, 'WARN');
    };

    function error(msg) {
        log(msg, 'ERROR');
    };

    return {
        console: printToConsole,
        setLogPath: setLogPath,
        trace: trace,
        debug: debug,
        info: info,
        warn: warn,
        error: error
    };
})();

module.exports = Tools;