const { buildButtonActionRow } = require('./buttonActionRow');
const { eventNames } = require('../config/eventConfig');

const buildNextTurnActionRow = (stateId) => {
    const rowData = {
        stateId: stateId,
        skipTurn: true,
    };

    const row = buildButtonActionRow([
        {
            label: "Next Turn",
            disabled: false,
            data: rowData,
        }],
        eventNames.BATTLE_TARGET_SELECT,
    );

    return row;
}

module.exports = {
    buildNextTurnActionRow
};