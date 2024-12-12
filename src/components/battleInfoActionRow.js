/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * battleInfoActionRow.js creates the battle info action row for the players in the battle.
 */
const { eventNames } = require("../config/eventConfig");
const { buildButtonActionRow } = require("./buttonActionRow");

/**
 * build a row showing the battle action info
 * @param {*} battle the relevant battle for the information
 * @param {*} stateId the Id of the state the current battle is in.
 * @param {*} selectionIndex always 0.
 * @returns ActionRowBuilder
 */
const buildBattleInfoActionRow = (battle, stateId, selectionIndex = 0) => {
  const infoRowData = {
    stateId,
  };

  // TODO: this is probably confusing so refactor at some point
  let i = 0;
  const buttonConfigs = Object.keys(battle.teams).map((teamName) => {
    i += 1;
    return {
      label: teamName,
      disabled: false,
      emoji: battle.teams[teamName]?.emoji,
      data: {
        ...infoRowData,
        selectionIndex: i - 1,
      },
    };
  });
  // @ts-ignore
  buttonConfigs.push({
    label: "Moves",
    disabled: false,
    data: {
      ...infoRowData,
      selectionIndex: i,
    },
  });
  // @ts-ignore
  buttonConfigs.push({
    label: "Hide",
    disabled: false,
    data: {
      ...infoRowData,
      selectionIndex: i + 1,
    },
  });

  // @ts-ignore
  buttonConfigs.push({
    label: "Refresh",
    disabled: false,
    data: {
      ...infoRowData,
      selectionIndex: i + 2,
    },
  });

  // disable selection index
  buttonConfigs[selectionIndex].disabled = true;

  const infoRow = buildButtonActionRow(buttonConfigs, eventNames.BATTLE_INFO);
  return infoRow;
};

module.exports = {
  buildBattleInfoActionRow,
};
