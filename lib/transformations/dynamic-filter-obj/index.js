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
async function DYNAMIC_FILTER_OBJ() {
    const t = this;
    const filterType = this["Filter-type"];
    const useCache = this["Use-cache"];
    var cachedFilters;
    const uri = this.uri;
    const FilterOn = this.FilterOn

    async function fetchFromCouchView() {
        return new Promise((resolve, reject) => {
            request(uri, function(err, res, body) {
                try {
                    const filters = {};
                    const json = JSON.parse(body);
                    const rows = json.rows;
                    if (!rows) throw new Error("No items found in dynamic filter transformation");
                    rows.forEach(function(row) {
                        const val = row.value;
                        FilterOn.forEach(function(key) {
                            filters[key] = filters[key] || [];
                            if (val[key] && filters[key].indexOf(val[key] < 0)) filters[key].push(val[key]);
                        });
                    });
                    return resolve(filters);
                } catch (error) {
                    return reject(new Error("Error retrieving view result from CouchDB for dynamic filter"));
                };
            });
        });
    };

    function transform(obj) {
        return new Promise((resolve, reject) => {
            try {
                /* Catch null objects (when they have been filtered) */
                if (!obj) resolve(null);

                /* Otherwise apply filter */
                switch (filterType) {
                    case 'CouchDB-view':
                        var includeObj = false;
                        Object.keys(cachedFilters).forEach((filter) => {
                            const allowedVals = cachedFilters[filter];
                            var objKeyVal = obj[filter];
                            if (allowedVals.indexOf(objKeyVal) >= 0) includeObj = true;
                        });
                        const result = (includeObj) ? obj : null;
                        return resolve(result);
                        break;

                    default:
                        break;
                };
            } catch (error) {
                reject(error);
            };
        });
    };

    return new Promise(async(resolve, reject) => {
        setImmediate(async() => {
            try {
                cachedFilters = await fetchFromCouchView();
                return resolve({
                    transform: transform
                });
            } catch (error) {
                return reject(new Error("Unable to load transformation module"));
            };
        });
    });
};

module.exports = {
    name: 'DYNAMIC_FILTER_OBJ',
    exe: DYNAMIC_FILTER_OBJ
};