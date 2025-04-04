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
 * @param {Battle} battle the relevant battle for the information
 * @param {*} stateId the Id of the state the current battle is in.
 * @param {object} options
 * @param {string=} options.currentTab the name of the current selection
 * @param {number=} options.currentTeamIndex the index of the current team
 * @returns ActionRowBuilder
 */
const buildBattleInfoActionRow = (
  battle,
  stateId,
  { currentTab, currentTeamIndex = -1 }
) => {
  const infoRowData = {
    stateId,
  };

  const buttonConfigs = [];
  const currentTeamName =
    currentTeamIndex === -1
      ? null
      : Object.keys(battle.teams)[currentTeamIndex];
  const currentTeam = battle.teams[currentTeamName];
  buttonConfigs.push({
    label: currentTeamName ?? "Teams",
    disabled: false,
    emoji: currentTeam?.emoji ?? undefined,
    data: {
      ...infoRowData,
      tab: "teams",
      index: currentTeamIndex,
    },
  });
  if (currentTab !== "moves") {
    // @ts-ignore
    buttonConfigs.push({
      label: "Moves",
      disabled: false,
      emoji: "⚔️",
      data: {
        ...infoRowData,
        tab: "moves",
      },
    });
  } else {
    // @ts-ignore
    buttonConfigs.push({
      label: "Hide",
      disabled: false,
      emoji: "⬇️",
      data: {
        ...infoRowData,
        tab: "hide",
      },
    });
  }

  // @ts-ignore
  buttonConfigs.push({
    label: "Refresh",
    disabled: false,
    emoji: "🔄",
    data: {
      ...infoRowData,
      tab: "refresh",
    },
  });

  const infoRow = buildButtonActionRow(buttonConfigs, eventNames.BATTLE_INFO);
  return infoRow;
};

module.exports = {
  buildBattleInfoActionRow,
};
