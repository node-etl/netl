'use strict';
async function FILTER_OBJ() {
    const t = this;
    const filterOn = t.filterOn;

    function invoke(obj) {
        return new Promise(function(resolve, reject) {
            setImmediate(() => {
                try {
                    var includeThisObj = true;
                    Object.keys(filterOn).forEach(function(key) {
                        if (filterOn[key].indexOf(obj[key]) < 0) {
                            includeThisObj = false;
                        };
                    });
                    const result = (includeThisObj) ? obj : null;
                    return resolve(result);
                } catch (error) {
                    reject(new Error("FILTER_OBJ: " + error.stack));
                };
            });
        });
    };

    return new Promise(async(resolve, reject) => {
        setImmediate(() => {
            try {
                return resolve({
                    invoke: invoke
                });
            } catch (error) {
                return reject(new Error("Unable to load module"));
            };
        });
    });
};

module.exports = {
    name: 'FILTER_OBJ',
    exe: FILTER_OBJ
};