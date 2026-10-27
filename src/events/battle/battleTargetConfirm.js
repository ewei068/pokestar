/**
 * @file
 * @author Elvis Wei
 *
 * battleTargetSelect.js Gets the relevant data for the target selection for the user and calculates the results of the choice.
 */
const {
  loadBattleContext,
  refreshBattleIfStale,
  submitBattleAction,
} = require("../../battle/discord/battleContext");
const { getStartTurnSend } = require("../../services/battle");
const {
  getCurrentTargetting,
  clearCurrentTargetting,
} = require("../../utils/battleUtils");

/**
 * @param {any} state
 * @returns {{ moveId?: MoveIdEnum, targetId?: string, err?: string }}
 */
const getMoveAndTargetIds = (state) => {
  const { currentMoveId, currentTargetId } = getCurrentTargetting(state);
  if (!currentMoveId) {
    return { err: "No move selected." };
  }

  if (!currentTargetId) {
    return { err: "No target selected." };
  }

  return { moveId: currentMoveId, targetId: currentTargetId };
};

/**
 * Gets the relevant data for the target selection for the user and calculates the results of the choice.
 * @param {import("discord.js").StringSelectMenuInteraction} interaction the choice selected by the user in response to being requested to choose a target.
 * @param {*} data the relevant data with the state information.
 */
const battleTargetSelect = async (interaction, data) => {
  // get state
  const context = await loadBattleContext(data, interaction);
  const state = context?.state;
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  if (await refreshBattleIfStale(context, interaction)) return;

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

  const { moveId, targetId, err } = getMoveAndTargetIds(state);
  if (err) {
    return { err };
  }

  const next = await submitBattleAction(context, interaction, {
    action: "useMove",
    moveId,
    targetPokemonId: targetId,
  });
  if (!next) return { err: "Battle unavailable." };
  const send = await getStartTurnSend(next.battle, next.stateId, next);
  clearCurrentTargetting(state);
  await interaction.update(send);
};

module.exports = battleTargetSelect;
