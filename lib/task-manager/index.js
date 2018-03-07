'use strict';
const tools = require('../tools');
const log = tools.log;

function _run(key, callback) {
    try {
        const currentTask = this.tasks[key];
        currentTask.startTime = (new Date()).getTime();
        const batchSize = currentTask.Extraction.batchSize;
        const E = currentTask.Extraction; // Only single extraction supported
        const Ts = currentTask.Transformations; // Multiple transformations supported
        const L = currentTask.Load; // Only single load supported
        currentTask._itemsExtracted = 0;

        // Load the extraction module
        var extraction;
        try {
            extraction = this.extractions[E.Name].call(E);
        } catch (error) {
            throw new Error(error.message);
        };

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

        /**
         * Load the transformation closures
         * The same transformation may be loaded multiple times
         * This is fine - since Ts are called via index when doing the transformation
         * 
         */
        const transformations = [];
        Ts.forEach(function(t, i, ts) {
            transformations.push(this.transformations[t.Name].call(t));
        }.bind(this));

        // Load the loading module
        const load = this.loads[L.Name].call(L);

        // Generate and handle batches
        var batch = null;
        (function doEtlTask(self) {
            var payload = [];
            batch = batches.next();
            if (!batch.done) {
                batch = batch.value;
                self.tasks[key]._itemsExtracted += batch.length;

                /* Transform item in batch */
                (function getBatchItem(i) {
                    if (i < batch.length) {
                        var item = batch[i];

                        /* Do all transformations on each item */
                        try {
                            (function transformItem(j) {
                                if (item && j < transformations.length) {
                                    const t = transformations[j];
                                    t.transform.call(t, item, function(transformedItem) {
                                        item = transformedItem;
                                        j++;
                                        transformItem(j);
                                    });

                                } else {
                                    /* All transformations applied */
                                    if (item !== {} && item) payload.push(item);
                                    i++;
                                    getBatchItem(i);
                                };
                            })(0);
                        } catch (error) {
                            // TODO: To handle errors properly
                        };

                    } else {
                        /* All items transformed */
                        log.info("Task : " + key + " : Batch Transformed : Payload size : " + payload.length);

                        // Load extracted batch
                        load.batch(payload)
                            .then(function(msg) {
                                log.info("Task : " + key + " : Batch loaded : res = " + msg);
                                self.tasks[key]._itemsProcessed = (self.tasks[key]._itemsProcessed) ? self.tasks[key]._itemsProcessed += payload.length : payload.length;
                                log.info("Task : " + key + " : Extracted / Processed : " + self.tasks[key]._itemsExtracted + " / " + self.tasks[key]._itemsProcessed);
                                doEtlTask(self);
                            })
                            .catch(function(msg) {
                                log.error(key + " : Load module message : " + msg);
                                log.error(key + " : Task failed to recover. Completed with errors");
                            });
                    };
                })(0);

            } else {
                /* All batches loaded */
                log.info("Task : " + key + " : Loading completed");

                // Handle after-extraction functions
                var afterE = E.afterTaskRunCBs || [];
                afterE.forEach(function(functionName) {
                    extraction[functionName]();
                });

                // Handle after-transformation functions
                transformations.forEach(function(t, i, ts) {
                    var afterT = t.afterTaskRunCBs || [];
                    afterT.forEach(function(functionName) {
                        t[functionName]();
                    });
                });

                // Handle after-load functions
                var afterL = L.afterTaskRunCBs || [];
                afterL.forEach(function(functionName) {
                    load[functionName]();
                });

                // Log the end of the task
                self.tasks[key].endTime = (new Date()).getTime();
                self.tasks[key].runTimeInSeconds = (self.tasks[key].endTime - self.tasks[key].startTime) / 1000;
                var endMsg = "Task : " + key + " : Task completed in " + self.tasks[key].runTimeInSeconds + " seconds : " + self.tasks[key]._itemsExtracted + " Items extracted : " + self.tasks[key]._itemsProcessed + " Items processed";
                log.info(endMsg);
                callback(endMsg);
            };
        })(this);
    } catch (error) {
        log.error(error.message);
        throw new Error(error.message);
    };
};

function TaskManager(extractions, transformations, loads) {
    this.extractions = extractions;
    this.transformations = transformations;
    this.loads = loads;
    this.tasks = {};
};

TaskManager.prototype.newTask = function(task, callback) {
    this.tasks[task.ID] = task;
    _run.call(this, task.ID, callback);
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