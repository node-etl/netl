'use strict';
/**
 * Configuration example:
 * {
 *   "Name": "FILTER_OBJ_ATTRIBUTES",
 *   "allowedAttributes": [
 *       "type_", "RegAcadYear", "anonIDnew", "Course", "Percent"
 *   ],
 *   "afterTaskRunCBs": []
 * } 
 */
function FILTER_OBJ_ATTRIBUTES() {
    const t = this;
    var allowedAttributes = t.allowedAttributes;

    function transform(obj) {
        return new Promise(function(fulfill, reject) {
            try {
                var newDoc = {};
                for (var attr in obj) {
                    if (!obj.hasOwnProperty(attr)) continue;
                    if (allowedAttributes.includes(attr)) newDoc[attr] = obj[attr];
                };
                const result = (Object.keys(newDoc).length !== 0) ? newDoc : null;
                fulfill(result);
            } catch (error) {
                throw new Error("FILTER_OBJ_ATTRIBUTES: " + error.stack);
            };
        });
    };

    return {
        transform: transform
    };
};

module.exports = {
    name: 'FILTER_OBJ_ATTRIBUTES',
    exe: FILTER_OBJ_ATTRIBUTES
};