'use strict';
const jsonfile = require('jsonfile');
const TaskManager = require('./lib/task-manager');
const Tools = require('./lib/tools');
const log = Tools.log;
const CLI = Tools.CLI;
const path = require('path').posix;
path.sep = "/";
__dirname = __dirname.split(/\\/g).join('/');

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

module.exports = (() => {

    // Log start of app
    log.info(`*** Started ${npmConfig.name} V${npmConfig.version} © ${npmConfig.copyright}`);
    log.info(`Timestamps in UTC time`);

    // Get process flags and arguments
    var args = require('minimist')(process.argv.slice(2));
    if (args.cli) {
        console.log();
        log.console(`> ---------------------\n> ${npmConfig.name} V${npmConfig.version} © ${npmConfig.copyright}\n> ---------------------\n`);
        CLI.start();
    } else {
        if (!args.task) throw new Error("Either CLI flag (--cli) or task argument (--task <path>) is required");
        CLI.loadTask(path.join(process.cwd(), args.task));
    };
})();