/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * selectBattleTargetRow.js Creates the option to select the target for an attack in battle.
 */
const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { eventNames } = require("../config/eventConfig");
const { getFullUsername } = require("../utils/trainerUtils");
const { pokemonConfig } = require("../config/pokemonConfig");

/**
 * Creates the option to select the target for an attack in battle.
 * @param {*} battle the current battle.
 * @param {*} eligibleTargets the targets the user's pokemon's attack can hit.
 * @param {*} moveId the move Id of the attack.
 * @param {*} stateId the Id of the current state.
 * @param {*} selectedTargetId the Id of the target selected. starts as null
 * @returns ActionRowBuilder
 */
const buildSelectBattleTargetRow = (
  battle,
  eligibleTargets,
  moveId,
  stateId,
  selectedTargetId = null
) => {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(
      JSON.stringify({
        eventName: eventNames.BATTLE_TARGET_SELECT,
        stateId,
        moveId,
      })
    )
    .setPlaceholder("Select a target")
    .addOptions(
      eligibleTargets.map((target) => {
        const user = battle.users[target.userId];
        const speciesData = pokemonConfig[target.speciesId];

        return {
          label: `[${getFullUsername(user)}] [${target.position}] ${
            target.name
          }`,
          value: `${target.id}`,
          emoji: speciesData.emoji,
          default: selectedTargetId === target.id,
        };
      })
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  return actionRow;
};

module.exports = {
  buildSelectBattleTargetRow,
};
