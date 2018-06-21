'use strict';
const tools = require('../tools');
const log = tools.log;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    };
};

async function _runEtl(key, currentTask, etl) {
    const E = etl.Extraction || null; // Only single extraction supported
    const Ts = etl.Transformations || null; // Multiple transformations supported
    const L = etl.Load || null; // Only single load supported

    /* Check configuration */
    if (!E && Ts && L) throw new Error(`Task : ${key} : ETL specified but not configured correctly`);

    /* Setup extraction */
    const batchSize = E.batchSize;
    const extraction = await this.extractions[E.Name].call(E);

    /* Get batch iterator */
    const batches = (function*() {
        var finished = false;
        while (!finished) {
            let data = [];
            for (let i = 0; i < batchSize; i++) {
                let datum = extraction.invoke();
                if (datum.done) {
                    finished = true;
                    break;
                };
                data.push(datum.value);
            };
            log.info(`Task : ${key} : Batch extracted : Batch size : ${data.length}`);
            yield data;
        };
    })();

    /* Setup transformations */
    const transformations = await Ts.reduce(async(accumulator, t) => {
        const arr = await accumulator;
        arr.push(await this.transformations[t.Name].call(t));
        return arr;
    }, []);

    /* Setup load */
    const load = await this.loads[L.Name].call(L);

    /* Extract, transform and load batches via a loop */
    var batch = batches.next();
    var payload;
    var values;
    var _itemsProcessed;
    var loadResult;
    while (!batch.done) {
        values = batch.value;

        /* Do transformations */
        payload = await values.reduce(async(previousResults, item) => {
            /* The accumulator is returned as a promise, so must be awaited */
            const results = await previousResults;

            /* Transform items in sequence */
            await asyncForEach(transformations, async(t) => {
                item = await t.invoke.call(t, item);
            });

            /* Return accumulator */
            if (item !== {} && item) results.push(item);
            return results;
        }, []);

        /* Transformations of batch complete! */
        log.info(`Task : ${key} : Batch transformed : Payload size : ${payload.length}`);

        /* Update object with task progress */
        _itemsProcessed = (currentTask._itemsProcessed) ? currentTask._itemsProcessed += payload.length : payload.length;
        currentTask._itemsProcessed = _itemsProcessed;
        currentTask._itemsExtracted += values.length;

        /* Do load */
        loadResult = await load.invoke(payload);
        log.info(`Task : ${key} : Batch loaded : Destination response ${loadResult} : Extracted / Processed : ${currentTask._itemsExtracted} / ${currentTask._itemsProcessed}`);

        /* Get next batch */
        batch = batches.next();
    };
};

async function _runFunctions(key, currentTask, Fs) {
    /**
     * Setup functions
     * If single function is specified N times
     * That function module is instantiated N times
     * So configuration conflicts are avoided
     */
    const functions = await Fs.reduce(async(accumulator, f) => {
        const arr = await accumulator;
        arr.push(await this.functions[f.Name].call(f));
        return arr;
    }, []);

    /* Execute functions in turn */
    await asyncForEach(functions, async(f) => {
        const result = await f.invoke.call(f);
        log.info(`Task : ${key} : Function execution complete : result : ${result}`);
    });
};

async function _run(key) {
    try {
        /* Setup Task */
        const currentTask = this.tasks[key];
        currentTask.startTime = (new Date()).getTime();
        currentTask._itemsExtracted = 0;
        currentTask._itemsProcessed = 0;

        /* Do ETL if required */
        const etl = currentTask.ETL || null;
        if (etl) await _runEtl.call(this, key, currentTask, etl);

        /* Do Function execution if required */
        const Fs = currentTask.Functions || null;
        if (Fs) await _runFunctions.call(this, key, currentTask, Fs);

        /* Return task-run stats */
        currentTask.endTime = (new Date()).getTime();
        const runTime = currentTask.endTime - currentTask.startTime;
        return `Task : ${key} complete! : Extracted / Processed : ${(currentTask._itemsExtracted) ? currentTask._itemsExtracted : 'NA'} / ${(currentTask._itemsProcessed) ? currentTask._itemsExtracted : 'NA'} : RunTime : ${(runTime / 1000)} sec`;

    } catch (error) {
        return `Task : ${key} complete with error: ${error.stack}`;
    };
};

function TaskManager(extractions, transformations, loads, functions) {
    this.extractions = extractions;
    this.transformations = transformations;
    this.loads = loads;
    this.functions = functions;
    this.tasks = {};
};

TaskManager.prototype.doTask = async function(task) {
    this.tasks[task.ID] = task;
    return await _run.call(this, task.ID);
};

TaskManager.prototype.killTask = function(id) {
    return new Promise(function(resolve, reject) {
        try {
            delete this.tasks[id];
            return resolve(`Task : ${id} killed successfully`);
        } catch (error) {
            return reject(`Task : ${id} kill failed`);
        };
    }.bind(this));
};

module.exports = function(options) {
    // Config
    // const prop1 = options.prop1
    // const prop2 = options.prop2
    // etc. 

    // VARS
    const _extractions = {};
    const _transformations = {};
    const _loads = {};
    const _functions = {};
    const _taskManager = new TaskManager(_extractions, _transformations, _loads, _functions);

    function _loadExtractionModule(extrn) {
        _extractions[extrn.name] = extrn.exe;
    };

    function _loadTransformationModule(trnsfmn) {
        _transformations[trnsfmn.name] = trnsfmn.exe;
    };

    function _loadLoadModule(ld) {
        _loads[ld.name] = ld.exe;
    };

    function _loadFunctionModule(fn) {
        _functions[fn.name] = fn.exe;
    };

    function _getTaskManager() {
        return _taskManager;
    };

    return {
        taskManager: _getTaskManager(),
        loadExtractionModule: _loadExtractionModule,
        loadTransformationModule: _loadTransformationModule,
        loadLoadModule: _loadLoadModule,
        loadFunctionModule: _loadFunctionModule
    };
};