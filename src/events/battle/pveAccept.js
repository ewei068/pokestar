/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pveAccept.js calls buildPveSend from the interaction from the user to start a pve battle.
 */
const { getState } = require("../../services/state");
const { buildPveSend } = require("../../services/battle");

/**
 * calls buildPveSend from the interaction from the user to start a pve battle.
 * @param {*} interaction the selection of the accept button from the pve embed.
 * @param {*} data the relevant data for the state information from the pve embed.
 * @returns
 */
const pveAccept = async (interaction, data) => {
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
  state.difficulty = data.difficulty;

  const { send, err } = await buildPveSend({
    stateId: data.stateId,
    user: interaction.user,
    view: "battle",
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = pveAccept;
