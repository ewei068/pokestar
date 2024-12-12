/**
 * @file
 * @author Elvis Wei
 *
 * battleMoveSelect.js Gets the relevant information from the user interaction and sets up for target selection.
 */
const {
  buildSelectBattleMoveRow,
} = require("../../components/selectBattleMoveRow");
const {
  buildSelectBattleTargetRow,
} = require("../../components/selectBattleTargetRow");
const { buildBattleEmbed } = require("../../embeds/battleEmbeds");
const { getState } = require("../../services/state");
const { getTrainer } = require("../../services/trainer");
const { getUserSelectedDevice } = require("../../utils/trainerUtils");

/**
 * Gets the relevant information from the user interaction and sets up for target selection.
 * @param {*} interaction the interaction from the trainer, move selected.
 * @param {*} data used to get the state. data from the interaction.
 */
const battleMoveSelect = async (interaction, data) => {
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
  const pokemon = battle.activePokemon;

  // make sure it's the player's turn
  if (battle.activePokemon.userId !== interaction.user.id) {
    return { err: "It's not your turn." };
  }

  // get move
  const moveId = interaction.values[0];

  // validate move: make sure move is in pokemon's moveset
  if (pokemon.moveIds[moveId] === undefined) {
    return { err: "Invalid move." };
  }
  // validate cooldown
  if (pokemon.moveIds[moveId].cooldown > 0) {
    return { err: "Move is on cooldown." };
  }
  // validate disabled
  if (pokemon.moveIds[moveId].disabled) {
    return { err: "Move is disabled." };
  }

  // find valid targets for move
  const targets = battle.getEligibleTargets(pokemon, moveId);

  // if no targets, return error
  if (targets.length === 0) {
    return { err: "No eligible targets! Choose another move." };
  }

  const { data: trainer } = await getTrainer(interaction.user);

  // build selection menu of eligible targets
  const targetSelectMenu = buildSelectBattleTargetRow(
    battle,
    targets,
    moveId,
    data.stateId
  );

  // TODO: change if position of menu changes
  // if components length > 2, pop all components except first two
  while (interaction.message.components.length > 2) {
    interaction.message.components.pop();
  }

  // pop move select menu and set default move
  interaction.message.components.pop();
  const moveSelectMenu = buildSelectBattleMoveRow(battle, data.stateId, moveId);

  // pop first embed
  interaction.message.embeds.shift();

  // update message
  await interaction.update({
    embeds: [
      buildBattleEmbed(battle, {
        isMobile:
          getUserSelectedDevice(interaction.user, trainer?.settings) ===
          "mobile",
        selectedMoveId: moveId,
      }),
      ...interaction.message.embeds,
    ],
    components: interaction.message.components
      .concat(moveSelectMenu)
      .concat(targetSelectMenu),
  });
};

module.exports = battleMoveSelect;
