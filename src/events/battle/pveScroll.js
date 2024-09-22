/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pveScroll.js Get the relevant information for creating the scroll selection embed for pve.
 */
const { getState } = require("../../services/state");
const { buildPveSend } = require("../../services/battle");

/**
 *  Get the relevant information for creating the scroll selection embed for pve.
 * @param {*} interaction the interaction from the user to change the scroll menu page (assumption)
 * @param {*} data the relevant data with the state info for the interaction.
 * @returns
 */
const pveScroll = async (interaction, data) => {
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

  const { send, err } = await buildPveSend({
    stateId: data.stateId,
    user: interaction.user,
    view: "list",
    option: null,
    page: data.page,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = pveScroll;
