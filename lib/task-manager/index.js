'use strict';
const tools = require('../tools');
const log = tools.log;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    };
};

async function _run(key) {
    try {
        /* Setup Task */
        const currentTask = this.tasks[key];
        const batchSize = currentTask.Extraction.batchSize;
        const E = currentTask.Extraction; // Only single extraction supported
        const Ts = currentTask.Transformations; // Multiple transformations supported
        const L = currentTask.Load; // Only single load supported
        currentTask.startTime = (new Date()).getTime();
        currentTask._itemsExtracted = 0;

        /* Get extraction */
        const extraction = this.extractions[E.Name].call(E);

        /* Get batch iterator */
        const batches = (function*() {
            var finished = false;
            while (!finished) {
                let data = [];
                for (let i = 0; i < batchSize; i++) {
                    let datum = extraction.getNext();
                    if (datum.done) {
                        finished = true;
                        break;
                    };
                    data.push(datum.value);
                };
                log.info("Task : " + key + " : Batch extracted : Batch size : " + data.length);
                yield data;
            };
        })();

        /* Get transformations */
        const transformations = Ts.map((t, i, ts) => {
            return this.transformations[t.Name].call(t);
        });

        /* get load */
        const load = this.loads[L.Name].call(L);

        /* Extract, transform and load batches via a loop */
        await (async function nextBatch() {
            const batch = batches.next();
            const payload = [];
            if (batch.done) return;
            const values = batch.value;

            /* Do transformations */
            await asyncForEach(values, async(item) => {
                await asyncForEach(transformations, async(t) => {
                    item = await t.transform.call(t, item);
                });
                if (item !== {} && item) payload.push(item);
            });
            log.info("Task : " + key + " : Batch transformed : Payload size : " + payload.length);

            /* Do load */
            const loadResult = await load.batch(payload);

            /* Update task metrics */
            const _itemsProcessed = (currentTask._itemsProcessed) ? currentTask._itemsProcessed += payload.length : payload.length;
            currentTask._itemsProcessed = _itemsProcessed;
            currentTask._itemsExtracted += values.length;
            log.info(
                "Task : " + key + " " +
                ": Batch loaded : Destination response " + loadResult + " " +
                ": Extracted / Processed " + currentTask._itemsExtracted + " / " + currentTask._itemsProcessed
            );

            /* Get next batch */
            await nextBatch();
        })();

        /* Return task-run stats */
        return "Task : " + key + " complete! : Extracted / Processed : " + currentTask._itemsExtracted + " / " + currentTask._itemsProcessed;

    } catch (error) {
        return "Task : " + key + " complete with error: " + error.stack;
    };
};

function TaskManager(extractions, transformations, loads) {
    this.extractions = extractions;
    this.transformations = transformations;
    this.loads = loads;
    this.tasks = {};
};

TaskManager.prototype.doTask = async function(task) {
    this.tasks[task.ID] = task;
    return await _run.call(this, task.ID);
};

TaskManager.prototype.killTask = function(id) {
    throw new Error('Function not implemented');
};

module.exports = function(options) {
    // CONFIG: no options used yet

    // VARS
    const _extractions = {};
    const _transformations = {};
    const _loads = {};
    const _taskManager = new TaskManager(_extractions, _transformations, _loads);

    function _loadExtractionModule(extrn) {
        _extractions[extrn.name] = extrn.exe;
    };

    function _loadTransformationModule(trnsfmn) {
        _transformations[trnsfmn.name] = trnsfmn.exe;
    };

    function _loadLoadModule(ld) {
        _loads[ld.name] = ld.exe;
    };

    function _getTaskManager() {
        return _taskManager;
    };

    return {
        taskManager: _getTaskManager(),
        loadExtractionModule: _loadExtractionModule,
        loadTransformationModule: _loadTransformationModule,
        loadLoadModule: _loadLoadModule
    };
};