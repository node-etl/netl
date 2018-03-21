'use strict';
async function CREATE_ATTRIBUTES_OBJ() {
    const t = this;

    function transform(obj) {
        return new Promise(function(resolve, reject) {
            setImmediate(() => {
                try {
                    var result;
                    if (obj === {} || !obj) {
                        result = null;
                    } else {
                        const transformedObj = JSON.parse(JSON.stringify(obj));
                        t.newAttributes.forEach(function(attr) {
                            // Throw error if key already exists
                            if (transformedObj.hasOwnProperty(attr[0])) {
                                return reject(new Error(`CREATE_ATTRIBUTES_OBJ: New property is not allowed! (${attr[0]})`));
                            };
                            transformedObj[attr[0]] = attr[1];
                        });
                        result = transformedObj;
                    };
                    return resolve(result);
                } catch (error) {
                    return reject(Error("CREATE_ATTRIBUTES_OBJ: " + error.stack));
                };
            });
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
    name: 'CREATE_ATTRIBUTES_OBJ',
    exe: CREATE_ATTRIBUTES_OBJ
};