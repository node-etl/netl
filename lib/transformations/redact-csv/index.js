'use strict';
var includes = require('lodash.includes');

async function REDACT_CSV() {
    const t = this;
    const rIs = t.redactionByColIndex;
    const conditions = t.redactionByConditions;

    async function invoke(arr) {
        var newRow = arr.map((field, i) => {
            return (rIs[i]) ? rIs[i] : field;
        });
        conditions.forEach((rule) => {
            // Condition to check
            const condition = rule.condition;
            const conditionColI = condition.colIndex;
            const conditionType = condition.type;
            const conditionValues = condition.values;

            // Replacement value
            const value = rule.value;
            const valueColI = value.colIndex;
            const valueReplacement = value.replacement;

            switch (conditionType) {
                case "equality":
                    if (conditionValues.indexOf(newRow[conditionColI]) >= 0) newRow[valueColI] = valueReplacement;
                    break;
                default:
                    break;
            }
        });
        return newRow;
    };

    return { invoke };
};

module.exports = {
    name: 'REDACT_CSV',
    exe: REDACT_CSV
};