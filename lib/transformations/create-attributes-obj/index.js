'use strict';
/**
 * Configuration example:
 * {
 *     "Name": "CREATE_ATTRIBUTES_OBJ",
 *     "newAttributes": [
 *         ["type_", "courseGrade"]
 *     ],
 *     "afterTaskRunCBs": []
 * },
 */
function CREATE_ATTRIBUTES_OBJ() {
    const t = this;

    function transform(obj, callback) {
        var result;
        if (obj === {} || !obj) {
            result = null;
        } else {
            const transformedObj = JSON.parse(JSON.stringify(obj));
            t.newAttributes.forEach(function(attr) {
                // Throw error if key already exists
                if (transformedObj.hasOwnProperty(attr[0])) {
                    throw new Error(`This new property is not allowed! (${attr[0]})`);
                };
                transformedObj[attr[0]] = attr[1]
            });
            result = transformedObj;
        };
        callback(result);
    };

    return {
        transform: transform
    };
};

module.exports = {
    name: 'CREATE_ATTRIBUTES_OBJ',
    exe: CREATE_ATTRIBUTES_OBJ
};