/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * battleNextTurnRow.js creates the next turn row for the players in the battle.
 */
const { buildButtonActionRow } = require("./buttonActionRow");
const { eventNames } = require("../config/eventConfig");

/**
 * Creates the next turn row for the players in the battle.
 * @param {*} stateId the Id of the current state of the battle
 * @returns ActionRowBuilder
 */
const buildNextTurnActionRow = (stateId) => {
  const rowData = {
    stateId,
    skipTurn: true,
  };

  const row = buildButtonActionRow(
    [
      {
        label: "Next Turn",
        disabled: false,
        data: rowData,
      },
    ],
    eventNames.BATTLE_TARGET_SELECT
  );

  return row;
};

module.exports = {
  buildNextTurnActionRow,
};
