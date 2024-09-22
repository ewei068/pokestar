/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * dungeonSelect.js Creates the pre-made dungeon that was selected.
 */
const { getState } = require("../../services/state");
const { buildDungeonSend } = require("../../services/battle");

/**
 * Creates the pre-made dungeon that was selected.
 * @param {*} interaction the select interaction by the user.
 * @param {*} data the data with the relevant state info from the interaction.
 * @returns
 */
const dungeonSelect = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // verify user is the same as the user who pressed the button
  if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  }

  const { send, err } = await buildDungeonSend({
    stateId: data.stateId,
    user: interaction.user,
    view: "dungeon",
    option: interaction.values[0],
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = dungeonSelect;
