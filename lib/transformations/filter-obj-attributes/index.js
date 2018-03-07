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

    function transform(doc, callback) {
        var newDoc = {};
        for (var attr in doc) {
            if (!doc.hasOwnProperty(attr)) continue;
            if (allowedAttributes.includes(attr)) newDoc[attr] = doc[attr];
        };
        const result = (Object.keys(newDoc).length !== 0) ? newDoc : null;
        callback(result);
    };

    return {
        transform: transform
    };
};

module.exports = {
    name: 'FILTER_OBJ_ATTRIBUTES',
    exe: FILTER_OBJ_ATTRIBUTES
};