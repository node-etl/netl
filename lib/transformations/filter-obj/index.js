'use strict';
/**
 * Configuration looks like this:
 * filterOn: {"key1"; [<list of allowed values>], "key2": [...], ...}
 * filtering can either be done on objects or arrays since
 * arrays 'keys' are treated as indexes
 */
function FILTER_OBJ() {
    const t = this;
    const filterOn = t.filterOn;

    function transform(obj) {
        return new Promise(function(fulfill, reject) {
            try {
                var includeThisObj = true;
                Object.keys(filterOn).forEach(function(key) {
                    if (filterOn[key].indexOf(obj[key]) < 0) {
                        includeThisObj = false;
                    }
                });
                const result = (includeThisObj) ? obj : null;
                fulfill(result);
            } catch (error) {
                throw new Error("FILTER_OBJ: " + error.stack);
            };
        });
    };

    return {
        transform: transform
    };
};

module.exports = {
    name: 'FILTER_OBJ',
    exe: FILTER_OBJ
};