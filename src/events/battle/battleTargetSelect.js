/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * battleTargetSelect.js Gets the relevant data for the target selection for the user and calculates the results of the choice.
 */
const { getState } = require("../../services/state");
const { getStartTurnSend } = require("../../services/battle");
const { logger } = require("../../log");
const { stageNames } = require("../../config/stageConfig");

/**
 * Gets the relevant data for the target selection for the user and calculates the results of the choice.
 * @param {*} interaction the choice selected by the user in response to being requested to choose a target.
 * @param {*} data the relevant data with the state information.
 * @returns
 */
const battleTargetSelect = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // get battle
  const { battle } = state;
  if (!battle) {
    return { err: "No battle data." };
  }

  // if npc turn, anyone in battle can press buttons
  if (battle.isNpc(battle.activePokemon.userId)) {
    if (!battle.userIds.includes(interaction.user.id)) {
      return { err: "You're not a participant in this battle." };
    }
  }
  // make sure it's the player's turn
  else if (battle.activePokemon.userId !== interaction.user.id) {
    return { err: "It's not your turn." };
  }

  // in alpha, measure execution time
  const start = Date.now();

  // if skip turn, skip turn
  if (data.skipTurn) {
    // if npc turn. have npc use move
    if (battle.isNpc(battle.activePokemon.userId)) {
      const { npc } = battle.users[battle.activePokemon.userId];
      npc.action(battle);
    } else {
      battle.activePokemon.skipTurn();
    }
  } else {
    // get move ID from data
    const { moveId } = data;
    if (!moveId) {
      return { err: "No move selected." };
    }

    // get target ID from interaction
    const targetId = interaction.values[0];
    if (!targetId) {
      return { err: "No target selected." };
    }

    // use move on target
    // TODO: do something with result?
    battle.activePokemon.useMove(moveId, targetId);
  }
  const send = await getStartTurnSend(battle, data.stateId);

  const end = Date.now();
  if (process.env.STAGE === stageNames.ALPHA) {
    logger.info(`Execution time: ${end - start} ms`);
  }

  await interaction.update(send);
};

module.exports = battleTargetSelect;
