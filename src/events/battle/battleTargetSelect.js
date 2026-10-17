/**
 * @file
 * @author Elvis Wei
 *
 * battleTargetSelect.js Gets the relevant data for the target selection for the user and calculates the results of the choice.
 */
const { ButtonStyle, ActionRowBuilder } = require("discord.js");
const {
  loadBattleContext,
  refreshBattleIfStale,
  submitBattleAction,
} = require("../../battle/discord/battleContext");
const { getStartTurnSend } = require("../../services/battle");
const { logger } = require("../../log");
const { stageNames } = require("../../config/stageConfig");
const { setCurrentTargetting } = require("../../utils/battleUtils");
const {
  buildSelectBattleTargetRow,
} = require("../../components/selectBattleTargetRow");
const { buildSingleButton } = require("../../components/singleButton");
const { eventNames } = require("../../config/eventConfig");
const { buildBattleEmbed } = require("../../embeds/battleEmbeds");
const { getTrainer } = require("../../services/trainer");
const { getUserSelectedDevice } = require("../../utils/trainerUtils");

/**
 * @param {any} interaction
 * @param {any} data
 * @returns {{ moveId?: MoveIdEnum, targetId?: string, err?: string }}
 */
const getMoveAndTargetIds = (interaction, data) => {
  const { moveId } = data;
  if (!moveId) {
    return { err: "No move selected." };
  }

  const targetId = interaction.values[0];
  if (!targetId) {
    return { err: "No target selected." };
  }

  return { moveId, targetId };
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

  if (await refreshBattleIfStale(context, interaction))
    return { skipInteractionRewards: true };
  const { stateId } = context;

  // get battle
  const { battle } = /** @type {{ battle: Battle }} */ (state);
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

  const { data: trainer } = await getTrainer(interaction.user);

  // in alpha, measure execution time
  const start = Date.now();

  // if skip turn, skip turn
  if (data.skipTurn || trainer?.settings?.showTargetIndicator === false) {
    let next = context;
    if (
      data.skipTurn &&
      !context.durable &&
      battle.isNpc(battle.activePokemon.userId)
    ) {
      const npc = state.npcs[battle.activePokemon.userId];
      if (!npc) {
        logger.error(`No NPC found for user ${battle.activePokemon.userId}`);
        battle.performAction({ action: "skipTurn" });
      } else npc.action(battle);
    } else {
      let action = { action: "skipTurn" };
      if (!data.skipTurn) {
        const { moveId, targetId, err } = getMoveAndTargetIds(
          interaction,
          data,
        );
        if (err) return { err };
        action = { action: "useMove", moveId, targetPokemonId: targetId };
      }
      next = await submitBattleAction(context, interaction, action);
      if (!next) return { err: "Battle unavailable." };
    }
    const send = await getStartTurnSend(next.battle, next.stateId, next);

    const end = Date.now();
    if (process.env.STAGE === stageNames.ALPHA) {
      logger.info(`Execution time: ${end - start} ms`);
    }

    await interaction.update(send);
    return { skipInteractionRewards: context.durable };
  }

  const { moveId, targetId, err } = getMoveAndTargetIds(interaction, data);
  if (err) {
    return { err };
  }

  // find valid targets for move
  const targets = battle.getEligibleTargets(battle.activePokemon, moveId);
  // if no targets, return error
  if (!targets.some((target) => target.id === targetId)) {
    return { err: "No eligible targets! Choose another move." };
  }

  // save current targets
  setCurrentTargetting(state, moveId, targetId);

  // TODO: change if position of menu changes
  // if components length > 3, pop all components except first two
  while (interaction.message.components.length > 3) {
    interaction.message.components.pop();
  }

  // pop target select menu and override default target
  interaction.message.components.pop();
  const targetSelectMenu = buildSelectBattleTargetRow(
    battle,
    targets,
    moveId,
    stateId,
    targetId,
  );

  // build target confirmation button
  const confirmButton = buildSingleButton(
    "Confirm",
    "⚔️",
    {
      stateId,
    },
    ButtonStyle.Success,
    false,
    eventNames.BATTLE_TARGET_CONFIRM,
  );
  const confirmButtonActionRow = new ActionRowBuilder().addComponents(
    confirmButton,
  );

  // pop first embed and rebuild with target indices and up next indicator
  interaction.message.embeds.shift();
  const targetIndices = battle.activePokemon.getTargetIndices(moveId, targetId);

  // update message
  await interaction.update({
    embeds: [
      buildBattleEmbed(battle, {
        targetIndices,
        isMobile:
          getUserSelectedDevice(interaction.user, trainer?.settings) ===
          "mobile",
        selectedMoveId: moveId,
      }),
      ...interaction.message.embeds,
    ],
    components: interaction.message.components
      // @ts-ignore
      .concat(targetSelectMenu)
      // @ts-ignore
      .concat(confirmButtonActionRow),
  });
  return { skipInteractionRewards: context.durable };
};

module.exports = battleTargetSelect;
