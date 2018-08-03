'use strict';
const jsonfile = require('jsonfile');
const TaskManager = require('./lib/task-manager');
const Tools = require('./lib/tools');
const log = Tools.log;
const path = require('path').posix;
path.sep = "/";
__dirname = __dirname.split(/\\/g).join('/');

// Setup environment variables
process.env["CLI"] = false;

// Package info
const npmConfig = jsonfile.readFileSync(path.join(__dirname, "./package.json"));

// Set package options
const packageOptions = jsonfile.readFileSync(path.join(__dirname, "./netl.config.json"));
log.setLogPath(path.normalize(packageOptions.logPath));

// Overwrite package options with user options (if there are user options)
var userOptions;
try {
    userOptions = jsonfile.readFileSync(path.join(process.cwd(), "./netl.config.json"));
} catch (error) {
    log.warn(`Error loading user-defined netl configuration options. Error reading path: ${path.join(process.cwd(), "./netl.config.json")}`);
    userOptions = {};
};
if (userOptions.logPath) log.setLogPath(path.normalize(userOptions.logPath));

// Start standard library
const netl = TaskManager(packageOptions);
packageOptions.extractions
    .concat((userOptions.extractions || []).map((p) => path.join(process.cwd(), p)))
    .forEach((filePath) => {
        netl.loadExtractionModule(require(filePath));
    });
packageOptions.transformations
    .concat((userOptions.transformations || []).map((p) => path.join(process.cwd(), p)))
    .forEach((filePath) => {
        netl.loadTransformationModule(require(filePath));
    });
packageOptions.loads
    .concat((userOptions.loads || []).map((p) => path.join(process.cwd(), p)))
    .forEach((filePath) => {
        netl.loadLoadModule(require(filePath));
    });
packageOptions.functions
    .concat((userOptions.functions || []).map((p) => path.join(process.cwd(), p)))
    .forEach((filePath) => {
        netl.loadFunctionModule(require(filePath));
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
const CLI = (function() {
    var rl;

    /**
     * Loads a JSON file from taskPath
     * Executes tasks from JSON configuration
     * @param {string} taskPath 
     */
    function loadTask(taskPath) {
        // Read Task configuration
        try {
            var configFile = jsonfile.readFileSync(taskPath);
        } catch (error) {
            log.error("Error loading task: reading config file:\n" + error);
            log.console("Error loading task: reading config file:\n" + error);
            return;
        };
        // Load all tasks in the config file
        configFile.forEach(async(configuration, i, arr) => {
            // Create task
            log.info(`Creating new task : ${configuration.ID}`);
            log.console(`Creating new task : ${configuration.ID} (logging to ${log.logPath})`);
            // Wait for task completion
            const taskResult = await netl.taskManager.doTask(configuration);
            log.info(taskResult);
            log.console(taskResult);
            // Delete task
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

module.exports = (() => {
    // Log start of app
    log.info(`*** Started ${npmConfig.name} V${npmConfig.version} © ${npmConfig.copyright}`);
    log.info(`Timestamps in UTC time`);

    // Get process flags and arguments
    var args = require('minimist')(process.argv.slice(2));
    if (!args.task && !args.cli) throw new Error("Either CLI flag (--cli) or task argument (--task <path>) is required");

    // Start the CLI or just run the specified task file(s)
    if (args.cli) {
        process.env["CLI"] = true;
        console.log();
        log.console(`> ---------------------\n> ${npmConfig.name} V${npmConfig.version} © ${npmConfig.copyright}\n> ---------------------\n`);
        CLI.start();
    } else {
        args.task.split(",").forEach((taskFilePath) => {
            CLI.loadTask(path.normalize(taskFilePath));
        });
    };
})();