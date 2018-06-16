'use strict';
const jsonfile = require('jsonfile');
const TaskManager = require('./lib/task-manager');
const Tools = require('./lib/tools');
const log = Tools.log;
const path = require('path').posix;
path.sep = "/";
__dirname = __dirname.split(/\\/g).join('/');

/**
 * Sets log at at specified path
 * @param {string} fPath 
 */
function setLogPath(fPath) {
    var r = log.setLogPath(fPath);
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
        return;
    };

    /* Load all tasks in the config file */
    configFile.forEach(async(configuration, i, arr) => {

        /* Create task */
        log.info('Creating new task : ' + configuration.ID);

        /* Wait for task completion */
        const taskResult = await netl.taskManager.doTask(configuration);
        log.info(taskResult);

        /* Delete task */
        var killResult
        try {
            killResult = await netl.taskManager.killTask(configuration.ID);
        } catch (error) {
            killResult = "Error killing task: " + error;
        };
        log.info(killResult);
    });
};

// Package info
const npmConfig = jsonfile.readFileSync(path.resolve(__dirname, "./package.json"));

// Set package options
const packageOptions = jsonfile.readFileSync(path.resolve(__dirname, "./netl.config.json"));
setLogPath(path.normalize(packageOptions.logPath));

// Overwrite package options with user options
const userOptions = jsonfile.readFileSync("./netl.config.json");
if (userOptions.logPath) setLogPath(path.normalize(userOptions.logPath));

// Log start of app
log.info(`*** Started ${npmConfig.name} V${npmConfig.version} © ${npmConfig.copyright}`);

// Start standard library
const netl = TaskManager(packageOptions);
packageOptions.extractions.concat((userOptions.extractions || [])).forEach(function(filePath) {
    netl.loadExtractionModule(require(filePath));
});
packageOptions.transformations.concat((userOptions.transformations || [])).forEach(function(filePath) {
    netl.loadTransformationModule(require(filePath));
});
packageOptions.loads.concat((userOptions.transformations || [])).forEach(function(filePath) {
    netl.loadLoadModule(require(filePath));
});

/*
 ******************************************
 ******************************************
 ******************************************
 ****************** CLI *******************
 ******************************************
 ******************************************
 ******************************************
 */
module.exports = (() => {
    /**
     * Interacts with the nETL module
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
                    case 'TASK':
                        fPath = (inputs[2]) ? path.join(__dirname, inputs[2]) : null;
                        if (fPath) {
                            loadTask(fPath);
                            break;
                        };
                    default:
                        print("Incorrect argument for 'LOAD': 'load task <path>'");
                        break;
                };
                break;
            case 'SETLOG':
                fPath = (inputs[1]) ? inputs[1] : null;
                if (fPath) {
                    setLogPath(fPath);
                    break;
                }
                break
            default:
                print();
                print("Unknown CMD. Available commands are:");
                print('1. load task <file>');
                print('2. setlog <file>');
        };
    };

    // Start the CLI
    return () => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }).on('line', (input) => {
            handleInput(input);
        });
    };
})();