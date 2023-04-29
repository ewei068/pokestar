const { eventNames } = require('../config/eventConfig');
const { buildButtonActionRow } = require('./buttonActionRow');

const buildBattleInfoActionRow = (battle, stateId, team=null) => {
    const infoRowData = {
        stateId: stateId
    }
    const buttonConfigs = Object.keys(battle.teams).map(teamName => {
        return {
            label: teamName,
            disabled: (team && teamName === team) ? true : false,
            data: {
                ...infoRowData,
                teamName: teamName
            }
        }
    });
    buttonConfigs.push({
        label: 'Moves',
        disabled: team === null ? true : false,
        data: infoRowData
    });
    const infoRow = buildButtonActionRow(buttonConfigs, eventNames.BATTLE_INFO);
    return infoRow;
}

module.exports = {
    buildBattleInfoActionRow
};