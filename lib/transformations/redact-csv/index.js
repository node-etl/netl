'use strict';

async function REDACT_CSV() {
    const options = this;

    async function invoke(arr) {
        return arr;
    };

    return { invoke };
};

module.exports = {
    name: 'REDACT_CSV',
    exe: REDACT_CSV
};