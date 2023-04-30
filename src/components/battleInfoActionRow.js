const { eventNames } = require('../config/eventConfig');
const { stageNames } = require('../config/stageConfig');
const { buildButtonActionRow } = require('./buttonActionRow');

const buildBattleInfoActionRow = (battle, stateId, selectionIndex=0) => {
    const infoRowData = {
        stateId: stateId
    }

    // TODO: this is probably confusing so refactor at some point
    let i = 0;
    const buttonConfigs = Object.keys(battle.teams).map(teamName => {
        i += 1;
        return {
            label: teamName,
            disabled: false,
            data: {
                ...infoRowData,
                selectionIndex: i - 1
            }
        }
    });
    buttonConfigs.push({
        label: 'Moves',
        disabled: false,
        data: {
            ...infoRowData,
            selectionIndex: i
        }
    });
    buttonConfigs.push({
        label: 'Hide',
        disabled: false,
        data: {
            ...infoRowData,
            selectionIndex: i + 1
        }
    });
    // on alpha only, push a debug button
    if (process.env.STAGE === stageNames.ALPHA) {
        buttonConfigs.push({
            label: 'Debug',
            disabled: false,
            data: {
                ...infoRowData,
                selectionIndex: i + 2
            }
        });
    }
    
    // disable selection index
    buttonConfigs[selectionIndex].disabled = true;

    const infoRow = buildButtonActionRow(buttonConfigs, eventNames.BATTLE_INFO);
    return infoRow;
}

module.exports = {
    buildBattleInfoActionRow
};