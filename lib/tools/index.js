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
    var logPath = null;
    var fileLogger;

    function setLogPath(filePath) {
        logPath = filePath;
        Tools.createDirPath(Tools.getDirFromPath(logPath));
        fileLogger = fs.createWriteStream(logPath, {
            flags: 'a'
        });
        return "Log path set to: " + path.normalize(logPath);
    };

    // Log both to file and console
    function log(msg, level) {
        var logData = `${(new Date()).toISOString()} : ${level} : ${JSON.stringify(msg)}`;
        try {
            fileLogger.write(logData + os.EOL);
        } catch (error) {
            process.stdout.write("Unable to append log at path: " + logPath);
        };
    };

    /**
     * Prints to the console in a friendly way
     * @param {string} msg 
     */
    function printToConsole(msg) {
        if (msg) {
            process.stdout.write(msg + "\n> ");
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

/*
 ******************************************
 ******************************************
 ******************************************
 ****************** CLI *******************
 ******************************************
 ******************************************
 ******************************************
 */
Tools.CLI = (function() {
    var rl;
    var log = Tools.log;

    /**
     * Sets log at at specified path
     * @param {string} fPath 
     */
    function setLogPath(fPath) {
        var r = log.setLogPath(fPath);
        log.logPath = r;
    };

    /**
     * Loads a JSON file from taskPath
     * Executes tasks from JSON configuration
     * @param {string} taskPath 
     */
    function loadTask(taskPath) {
        /* Read Task configuration */
        try {
            var configFile = jsonfile.readFileSync(taskPath);
        } catch (error) {
            log.error("Error reading config file:\n" + error);
            log.console("Error reading config file:\n" + error);
            return;
        };

        /* Load all tasks in the config file */
        configFile.forEach(async(configuration, i, arr) => {

            /* Create task */
            log.info(`Creating new task : ${configuration.ID}`);
            log.console(`Creating new task : ${configuration.ID} (logging to ${log.logPath})`);

            /* Wait for task completion */
            const taskResult = await netl.taskManager.doTask(configuration);
            log.info(taskResult);
            log.console(taskResult);

            /* Delete task */
            var killResult
            try {
                killResult = await netl.taskManager.killTask(configuration.ID);
            } catch (error) {
                killResult = "Error killing task: " + error;
            };
            log.info(killResult);
            log.console(killResult);
        });
    };

    /**
     * Processes user input
     * @param {string} input 
     */
    function handleInput(input) {
        process.stdout.write("> ");
        var inputs = input.split(' ');
        var cmd = inputs[0].toUpperCase();
        var cmd2;
        var fPath;
        switch (cmd) {
            case 'LOAD':
                cmd2 = (inputs[1]) ? inputs[1].toUpperCase() : null;
                switch (cmd2) {
                    case 'FILE':
                        fPath = (inputs[2]) ? path.normalize(inputs[2]) : null;
                        if (fPath) {
                            loadTask(fPath);
                            break;
                        };
                    default:
                        log.console("Incorrect argument for 'LOAD': 'load file <path>'");
                        break;
                };
                break;
            case 'SETLOG':
                fPath = (inputs[1]) ? inputs[1] : null;
                if (fPath) {
                    log.setLogPath(fPath);
                    break;
                }
                break
            default:
                log.console();
                log.console("Unknown CMD. Available commands are:");
                log.console('1. load file <file>');
                log.console('2. setlog <file>');
        };
    };

    /**
     * Starts CLI
     */
    function start() {
        const readline = require('readline');
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }).on('line', (input) => {
            handleInput(input);
        });
    };

    /**
     * Stops the CLI
     */
    function stop() {
        rl.close();
    };

    return {
        start: start,
        stop: stop,
        loadTask: loadTask
    };
})();

module.exports = Tools;