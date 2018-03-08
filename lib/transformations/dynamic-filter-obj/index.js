'use strict';
const request = require('request');
/**
 * Configuration example:
 * {
 *     "Name": "DYNAMIC_FILTER",
 *     "Filter-type": "CouchDB-view",
 *     "Use-cache": true,
 *     "uri": "<view URI>",
 *     "FilterOn": ["field1", "field2"] // These fields should be available on value in the view
 *  },
 */
function DYNAMIC_FILTER_OBJ() {
    const t = this;
    const filterType = this["Filter-type"];
    const useCache = this["Use-cache"];
    var filterCached = false;
    var cachedFilters;
    const uri = this.uri;
    const FilterOn = this.FilterOn

    /**
     * Makes HTTP request to CouchDB
     * @param {Function} callback
     */
    function fetchFromCouchView(callback) {
        request(uri, function(err, res, body) {
            callback(body);
        });
    };

    function applyFilter(obj, callback) {
        var includeObj = false;
        Object.keys(cachedFilters).forEach(function(filter) {
            const allowedVals = cachedFilters[filter];
            var objKeyVal = obj[filter];
            if (allowedVals.indexOf(objKeyVal) >= 0) includeObj = true;
        });
        const result = (includeObj) ? obj : null;
        callback(result);
    };

    function transform(obj) {
        return new Promise(function(fulfill, reject) {
            switch (filterType) {
                case 'CouchDB-view':
                    if (!filterCached) {
                        fetchFromCouchView(function(res) {
                            try {
                                const filters = {};
                                const json = JSON.parse(res);
                                const rows = json.rows;
                                if (!rows) throw new Error("No items found in dynamic filter transformation");
                                rows.forEach(function(row) {
                                    const val = row.value;
                                    FilterOn.forEach(function(key) {
                                        filters[key] = filters[key] || [];
                                        if (val[key] && filters[key].indexOf(val[key] < 0)) filters[key].push(val[key]);
                                    });
                                });
                                if (useCache) filterCached = true;
                                cachedFilters = filters;
                                applyFilter(obj, fulfill);
                            } catch (error) {
                                throw new Error("DYNAMIC_FILTER_OBJ: " + error.stack);
                            };
                        });
                    } else {
                        applyFilter(obj, fulfill);
                    };
                    break;

                default:
                    break;
            };
        });
    };

    return {
        transform: transform
    };
};

module.exports = {
    name: 'DYNAMIC_FILTER_OBJ',
    exe: DYNAMIC_FILTER_OBJ
};