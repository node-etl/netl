'use strict';
async function FILTER_OBJ_ATTRIBUTES() {
    const t = this;
    var allowedAttributes = t.allowedAttributes;

    function transform(obj) {
        return new Promise(function(resolve, reject) {
            setImmediate(() => {
                try {
                    var newDoc = {};
                    for (var attr in obj) {
                        if (!obj.hasOwnProperty(attr)) continue;
                        if (allowedAttributes.includes(attr)) newDoc[attr] = obj[attr];
                    };
                    const result = (Object.keys(newDoc).length !== 0) ? newDoc : null;
                    return resolve(result);
                } catch (error) {
                    reject(new Error("FILTER_OBJ_ATTRIBUTES: " + error.stack));
                };
            })
        });
    };

    return new Promise(async(resolve, reject) => {
        setImmediate(() => {
            try {
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
    name: 'FILTER_OBJ_ATTRIBUTES',
    exe: FILTER_OBJ_ATTRIBUTES
};