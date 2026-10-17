// this is intentional to mutate discord message object
/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 *
 * battleInfo.js Grabs the battle info from the current state and updates the embeds with the relevant information.
 */
const {
  loadBattleContext,
  refreshBattleIfStale,
} = require("../../battle/discord/battleContext");

const {
  buildBattleInfoActionRow,
} = require("../../components/battleInfoActionRow");
const {
  buildBattleMovesetEmbed,
  buildBattleTeamEmbed,
} = require("../../embeds/battleEmbeds");
const { getStartTurnSend, startAuto } = require("../../services/battle");
const { stageNames } = require("../../config/stageConfig");
const { logger } = require("../../log");
/**
 * Grabs the battle info from the current state and updates the embeds with the relevant information.
 * @param {*} interaction the interaction from the trainer.
 * @param {*} data get the data from the interaction.
 * @returns {Promise<object|undefined>}
 */
const battleInfo = async (interaction, data) => {
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
  const { battle } = state;
  if (!battle) {
    return { err: "No battle data." };
  }
  const pokemon = battle.activePokemon;
  if (context.durable && data.tab === "refresh") {
    await interaction.update(await getStartTurnSend(battle, stateId, context));
    return { skipInteractionRewards: context.durable };
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

  const { tab, index } = data;
  if (tab === undefined) {
    return { err: "No button selected." };
  }

  const numTeams = Object.keys(battle.teams).length;

  // if data has teamId component, display pokemon on that team
  let nextTeamIndex = -1;
  if (tab === "teams") {
    nextTeamIndex = index + 1;
    if (nextTeamIndex < numTeams) {
      const teamName = Object.keys(battle.teams)[nextTeamIndex];

      // get team pokemon embed
      const teamPokemonEmbed = buildBattleTeamEmbed(battle, teamName);
      interaction.message.embeds[1] = teamPokemonEmbed;
    } else {
      // hide info embed
      nextTeamIndex = -1;
      interaction.message.embeds = [interaction.message.embeds[0]];
    }
  } else if (tab === "moves") {
    // else, display move data
    const moveEmbed = buildBattleMovesetEmbed(pokemon);
    interaction.message.embeds[1] = moveEmbed;
  } else if (tab === "hide") {
    // hide info embed
    interaction.message.embeds = [interaction.message.embeds[0]];
  } else if (tab === "refresh") {
    // in alpha, show debug
    if (process.env.STAGE === stageNames.ALPHA) {
      logger.info(battle);
    }
    // refresh battle display
    await interaction.update(await getStartTurnSend(battle, stateId, context));
    return { skipInteractionRewards: context.durable };
  } else if (tab === "auto") {
    if (context.durable) {
      await interaction.deferUpdate();
      const outcome = await context.service.auto({
        battleId: context.record._id,
        userId: interaction.user.id,
        expectedRevision: context.expectedRevision,
        requestId: interaction.id,
      });
      const latest = await loadBattleContext(
        { stateId },
        interaction,
        context.service,
      );
      if (!latest) {
        await interaction.editReply({
          content: "Battle unavailable.",
          embeds: [],
          components: [],
        });
        return { skipInteractionRewards: true };
      }
      latest.rejection = outcome.accepted ? null : outcome.reason;
      await interaction.editReply(
        await getStartTurnSend(latest.battle, latest.stateId, latest),
      );
      return { skipInteractionRewards: true };
    }
    return await startAuto({
      battle,
      stateId,
      interaction,
      user: interaction.user,
    });
  } else {
    return { err: "Invalid selection." };
  }

  // rebuild component
  const infoRow = buildBattleInfoActionRow(battle, stateId, {
    currentTab: tab,
    currentTeamIndex: nextTeamIndex,
  });
  interaction.message.components[0] = infoRow;

  await interaction.update({
    embeds: interaction.message.embeds,
    components: interaction.message.components,
  });
  return { skipInteractionRewards: context.durable };
};

module.exports = battleInfo;
