'use strict';
const tools = require('../tools');
const log = tools.log;

function _run(key) {
    return new Promise(function(resolve4, reject4) {
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
            /* Extraction */
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
            } catch (error) {
                throw new Error("Unable to load extraction module:\n" + error.stack);
            };
            /* Transformations */
            try {
                transformations = Ts.map(function(t, i, ts) {
                    return this.transformations[t.Name].call(t);
                }.bind(this));
            } catch (error) {
                throw new Error("Unable to load transformation modules:\n" + error.stack);
            };
            /* Load */
            try {
                load = this.loads[L.Name].call(L);
            } catch (error) {
                throw new Error("Unable to load load module:\n" + error.stack);
            };
        } catch (error) {
            throw new Error("Unexpected error:\n" + error);
        };
        // Generate and handle batches
        var batch = null;
        (function doEtlTask(self) {
            return new Promise(function(resolve3, reject3) {
                var payload = [];

                /* Get the next batch */
                try {
                    batch = batches.next();
                } catch (error) {
                    throw new Error("Task : " + key + " : Error extracting data:\n" + error.stack);
                };

                /* If batch has data */
                if (!batch.done) {
                    batch = batch.value;
                    self.tasks[key]._itemsExtracted += batch.length;

                    /* Transform items in batch */
                    (function getBatchItem(i) {
                        return new Promise(function(resolve2, reject2) {
                            if (i < batch.length) {
                                var item = batch[i];

                                /* Do all transformations on each item */
                                (function transformItem(j) {
                                    return new Promise(function(resolve1, reject1) {
                                        if (item && j < transformations.length) {
                                            const t = transformations[j];
                                            transformations[j].transform.call(t, item)
                                                .then(function(transformedItem) {
                                                    item = transformedItem;
                                                    j++;
                                                    resolve1(transformItem(j));
                                                })
                                                .catch(function(error) {
                                                    reject1(new Error("Task : " + key + ` : Error doing transformation on ${JSON.stringify(item)}:\n` + error));
                                                });
                                        } else {
                                            if (item !== {} && item) payload.push(item);
                                            i++;
                                            resolve2(getBatchItem(i));
                                        };
                                    });
                                })(0).catch(function(error) {
                                    reject2(new Error("Task : " + key + ` : Error transforming item ${JSON.stringify(item)} in batch ${i}:\n` + error));
                                });

                            } else {
                                /* All items transformed */
                                log.info("Task : " + key + " : Batch Transformed : Payload size : " + payload.length);

                                // Load extracted batch
                                load.batch(payload)
                                    .then(function(msg) {
                                        log.info("Task : " + key + " : Batch loaded : res = " + msg);
                                        self.tasks[key]._itemsProcessed = (self.tasks[key]._itemsProcessed) ? self.tasks[key]._itemsProcessed += payload.length : payload.length;
                                        log.info("Task : " + key + " : Extracted / Processed : " + self.tasks[key]._itemsExtracted + " / " + self.tasks[key]._itemsProcessed);
                                        resolve3(doEtlTask(self));
                                    })
                                    .catch(function(error) {
                                        reject2(new Error("Task : " + key + ' Error loading data:\n' + error));
                                    });
                            };
                        });
                    })(0).catch(function(error) {
                        reject3(new Error(error));
                    });

                } else {
                    /* Batch doesn't have data: all batches loaded */
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

                    } catch (error) {
                        reject3(new Error("Task : " + key + " : Error on task end:\n" + error));
                    };
                    resolve4(endMsg);
                };
            });
        })(this).catch(function(error) {
            reject4(new Error("Error processing batches:\n" + error))
        })
    }.bind(this));
};

function TaskManager(extractions, transformations, loads) {
    this.extractions = extractions;
    this.transformations = transformations;
    this.loads = loads;
    this.tasks = {};
};

TaskManager.prototype.newTask = function(task) {
    return new Promise(function(resolve, reject) {
        this.tasks[task.ID] = task;
        _run.call(this, task.ID)
            .then(function(msg) {
                resolve(msg);
            })
            .catch(function(error) {
                reject(new Error("Error creating/running task:\n" + error));
            });
    }.bind(this));
};

TaskManager.prototype.killTask = function(id, callback) {
    log.info('kill method not implemented yet');
    callback();
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