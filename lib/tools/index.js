const path = require('path');
const fs = require('fs');
const os = require('os');
const Tools = {};

Tools.createDirPath = function(dir) {
    const splitPath = dir.split('/');
    splitPath.reduce((path, subPath) => {
        let currentPath;
        if (subPath != '.') {
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
    var logPath = null;
    var fileLogger;

    function setLogPath(filePath) {
        logPath = filePath;
        Tools.createDirPath(Tools.getDirFromPath(logPath));
        fileLogger = fs.createWriteStream(logPath, {
            flags: 'a'
        });
        return "Log path set to: " + path.resolve(logPath);
    };

    // Log both to file and console
    function log(msg, level) {
        var logData = (new Date).getTime() + ' : ' + level + ' : ' + JSON.stringify(msg);
        try {
            fileLogger.write(logData + os.EOL);
        } catch (error) {
            process.stdout.write("Unable to append log at path: " + logPath);
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
        setLogPath: setLogPath,
        trace: trace,
        debug: debug,
        info: info,
        warn: warn,
        error: error
    }
})();

module.exports = Tools;