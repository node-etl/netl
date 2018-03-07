'use strict';
const path = require('path');
const jsonfile = require('jsonfile');
const NETL = require('./lib/task-manager');
const Tools = require('./lib/tools');
const log = Tools.log;

// Start the application
console.log();
print("> ---------------------\n> nETL V0.1 © 2017\n> ---------------------\n");
const options = jsonfile.readFileSync("./netl.config.json");;
setLogPath(path.join(__dirname, options.log_path));
const netl = NETL(options);

/* Load Extraction Modules */
options.extractions.forEach(function(filePath) {
    netl.loadExtractionModule(require(filePath));
});

/* Load Transformation Modules */
options.transformations.forEach(function(filePath) {
    netl.loadExtractionModule(require(filePath));
});
/* Load Load Modules */
options.loads.forEach(function(filePath) {
    netl.loadExtractionModule(require(filePath));
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

/**
 * Sets log at at specified path
 * @param {string} fPath 
 */
function setLogPath(fPath) {
    var r = log.setLogPath(fPath);
    process.stdout.write(r + "\n> ");
};

/**
 * Loads a JSON file from taskPath
 * Executes tasks from JSON configuration
 * @param {string} taskPath 
 */
function loadTask(taskPath) {
    try {
        var configFile = jsonfile.readFileSync(taskPath);
        configFile.forEach(function(configuration, i, arr) {
            print('Creating new task : ' + configuration.ID);
            log.info('Creating new task : ' + configuration.ID);
            netl.taskManager.newTask(configuration, function(result) {
                print(result);
            });
        });
    } catch (error) {
        print("Error running task: " + error);
    };
}

/**
 * Prints to the console in a friendly way
 * @param {string} msg 
 */
function print(msg) {
    if (msg) {
        process.stdout.write(msg + "\n> ");
    } else {
        process.stdout.write("\n> ");
    };
};

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
                    fPath = (inputs[2]) ? path.resolve(inputs[2]) : null;
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
            print("Unknown CMD. Available commands are:");
            print('1. load task <file>');
            print('2. setlog <file>');
    };
};

// Start the CLI
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (input) => {
    handleInput(input);
});