'use strict';
const tools = require('../tools');
const log = tools.log;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    };
};

function _run(key) {
    return new Promise((resolve, reject) => {
            /* Setup Task */
            const currentTask = this.tasks[key];
            const batchSize = currentTask.Extraction.batchSize;
            const E = currentTask.Extraction; // Only single extraction supported
            const Ts = currentTask.Transformations; // Multiple transformations supported
            const L = currentTask.Load; // Only single load supported
            currentTask.startTime = (new Date()).getTime();
            currentTask._itemsExtracted = 0;
            var extraction;
            var batches;
            var load;
            var transformations;

            try {
                extraction = this.extractions[E.Name].call(E);
                batches = (function*() {
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

                transformations = Ts.map((t, i, ts) => {
                    return this.transformations[t.Name].call(t);
                });

                load = this.loads[L.Name].call(L);
            } catch (error) {
                throw error;
            };

            var batch = null;
            (function doEtlTask(self) {
                /* Get new batch */
                return new Promise((resolve, reject) => {
                        batch = batches.next();
                        if (batch.done) {
                            reject('complete');
                            return;
                        };
                        batch = batch.value;
                        self.tasks[key]._itemsExtracted += batch.length;
                        resolve(batch);
                    })
                    /* Transform the batch */
                    .then(function(batch) {
                        return new Promise(async(resolve, reject) => {
                            const payload = [];
                            await asyncForEach(batch, async(item) => {
                                await asyncForEach(transformations, async(t) => {
                                    item = await t.transform.call(t, item)
                                        .catch((error) => {
                                            reject("Error transforming item: " + error);
                                            return;
                                        });
                                });
                                if (item !== {} && item) payload.push(item);
                            });
                            resolve(payload);
                        });
                    })
                    /* Load the batch */
                    .then(function(payload) {
                        log.info("Task : " + key + " : Batch Transformed : Payload size : " + payload.length);
                        return new Promise((resolve, reject) => {

                            /* If payload empty get the next batch */
                            if (payload.length === 0) resolve();

                            /* Load the batch */
                            load.batch(payload)
                                .then(function(msg) {
                                    log.info("Task : " + key + " : Batch loaded : res = " + msg);
                                    self.tasks[key]._itemsProcessed = (self.tasks[key]._itemsProcessed) ? self.tasks[key]._itemsProcessed += payload.length : payload.length;
                                    log.info("Task : " + key + " : Extracted / Processed : " + self.tasks[key]._itemsExtracted + " / " + self.tasks[key]._itemsProcessed);
                                    resolve();
                                })
                                .catch(function(error) {
                                    reject(new Error("Task : " + key + ' Error loading data:\n' + error));
                                });
                        });
                    })
                    /* Do the next batch */
                    .then(function() {
                        doEtlTask(self);
                    })
                    .catch(function(res) {
                        if (res !== 'complete') {
                            reject(new Error(res))
                        } else {
                            return new Promise((resolve, reject) => {
                                    log.info("Task : " + key + " : Loading completed");
                                    var endMsg;
                                    try {
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
                                        endMsg = "Task : " + key + " : Task completed in " + self.tasks[key].runTimeInSeconds + " seconds : " + self.tasks[key]._itemsExtracted + " Items extracted : " + self.tasks[key]._itemsProcessed + " Items processed";
                                        resolve(endMsg);
                                    } catch (error) {
                                        throw new Error("Task : " + key + " : Error on task end:\n" + error);
                                    };
                                }).then(function(msg) {
                                    resolve(msg);
                                })
                                .catch(function(error) {
                                    reject(error);
                                });
                        };
                    });
            })(this);
        }).then(function(res) {
            return res;
        })
        .catch(function(error) {
            throw error;
        });
};

function TaskManager(extractions, transformations, loads) {
    this.extractions = extractions;
    this.transformations = transformations;
    this.loads = loads;
    this.tasks = {};
};

TaskManager.prototype.newTask = function(task) {
    return new Promise((resolve, reject) => {
        this.tasks[task.ID] = task;
        _run.call(this, task.ID)
            .then(function(msg) {
                resolve(msg);
            })
            .catch(function(error) {
                reject(new Error("Error creating/running task:\n" + error));
            });
    });
};

TaskManager.prototype.killTask = function(id) {
    return new Promise((resolve, reject) => {
        try {
            delete this.tasks[id];
            log.info(`Task: '${id}' deleted!`);
            resolve();
        } catch (error) {
            reject(new Error('Unable to kill task ' + id));
        };
    });
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