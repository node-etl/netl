'use strict';
const path = require('path').posix;
path.sep = "/";
__dirname = __dirname.split(/\\/g).join('/');
const jsonfile = require('jsonfile');
const TaskManager = require('./lib/task-manager');
const Tools = require('./lib/tools');
const log = Tools.log;


// Start the application
const npmConfig = jsonfile.readFileSync("./package.json");
console.log();
print(`> ---------------------\n> ${npmConfig.name} V${npmConfig.version} © ${npmConfig.copyright}\n> ---------------------\n`);

// Set log path
const options = jsonfile.readFileSync("./netl.config.json");
const logPath = path.join(__dirname, options.log_path);
setLogPath(logPath);

// Load the task manager
const netl = TaskManager(options);

/* Load Extraction Modules */
options.extractions.forEach(function(filePath) {
    netl.loadExtractionModule(require(filePath));
});

/* Load Transformation Modules */
options.transformations.forEach(function(filePath) {
    netl.loadTransformationModule(require(filePath));
});
/* Load Load Modules */
options.loads.forEach(function(filePath) {
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
    /* Read Task configuration */
    try {
        var configFile = jsonfile.readFileSync(taskPath);
    } catch (error) {
        log.error("Error reading config file:\n" + error);
        print("Error reading config file:\n" + error);
        return;
    };

    /* Load all tasks in the config file */
    configFile.forEach(async(configuration, i, arr) => {

        /* Create task */
        print('Creating new task : ' + configuration.ID);
        log.info('Creating new task : ' + configuration.ID);

        /* Wait for task completion */
        const taskResult = await netl.taskManager.doTask(configuration);
        print(taskResult);
        log.info(taskResult);

        /* Delete task */
        var killResult
        try {
            killResult = await netl.taskManager.killTask(configuration.ID);
        } catch (error) {
            killResult = "Error killing task: " + error;
        };
        print(killResult);
        log.info(killResult);
    });

};

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
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (input) => {
    handleInput(input);
});