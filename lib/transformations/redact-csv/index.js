'use strict';

async function REDACT_CSV() {
    const options = this;

    async function invoke(obj) {
        return "testing";
    };

    return { invoke };
};

module.exports = {
    name: 'REDACT_CSV',
    exe: REDACT_CSV
};