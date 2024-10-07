/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * selectBattleMoveRow.js Creates the action row for selecting a move during a battle.
 */
const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { eventNames } = require("../config/eventConfig");
const { getMove } = require("../battleEngine/data/moveService");
const { typeConfig } = require("../config/pokemonConfig");

/**
 * Creates the action row for selecting a move during a battle.
 * @param {*} battle the battle that is occurring.
 * @param {*} stateId the current state of the battle
 * @param {*} selectedMoveId the Id of the move selected. starts as null
 * @returns ActionRowBuilder
 */
const buildSelectBattleMoveRow = (battle, stateId, selectedMoveId = null) => {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(
      JSON.stringify({
        eventName: eventNames.BATTLE_MOVE_SELECT,
        stateId,
      })
    )
    .setPlaceholder("Select a move")
    .addOptions(
      Object.keys(battle.activePokemon.moveIds).map((moveId) => {
        // TODO: remove moves on cooldown?
        const moveData = getMove(moveId);
        const { cooldown } = battle.activePokemon.moveIds[moveId];
        const cdString = cooldown > 0 ? `[COOLDOWN ${cooldown}] ` : "";
        const { disabled } = battle.activePokemon.moveIds[moveId];
        const disabledString = disabled ? "[DISABLED] " : "";
        return {
          label: `${disabledString}${cdString} ${moveData.name}`,
          value: `${moveId}`,
          emoji: typeConfig[moveData.type].emoji,
          default: selectedMoveId === moveId,
        };
      })
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  return actionRow;
};

module.exports = {
  buildSelectBattleMoveRow,
};
