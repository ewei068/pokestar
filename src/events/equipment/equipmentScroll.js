/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * equipmentScroll.js Scroll through equipments.
 */

const {
  buildEquipmentListSend,
  onEquipmentScroll,
} = require("../../services/pokemon");
const { getState } = require("../../services/state");

const equipmentScroll = async (interaction, data) => {
  await interaction.deferUpdate();
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.editReply({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // verify user is the same as the user who pressed the button
  if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  }

  const actionRes = onEquipmentScroll({
    stateId: data.stateId,
    data,
  });
  if (actionRes.err) {
    return { err: actionRes.err };
  }

  const { send, err } = await buildEquipmentListSend({
    stateId: data.stateId,
    user: interaction.user,
  });
  if (err) {
    return { err };
  }
  await interaction.editReply(send);
};

module.exports = equipmentScroll;
