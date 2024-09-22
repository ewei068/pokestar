/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * equipmentSelect.js builds the menu for the selected equipment.
 */
const { getState } = require("../../services/state");
const { buildEquipmentUpgradeSend } = require("../../services/pokemon");

const equipmentSelect = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // if data has userId component, verify interaction was done by that user
  if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  }

  // get which select menu was used
  const { select } = data;
  if (!select) {
    return { err: "No select menu was used." };
  }

  // get which option was selected
  const option = interaction.values[0];
  if (!option) {
    return { err: "No option was selected." };
  }

  if (select === "equipment") {
    state.equipmentType = option;
  } else if (select === "slot") {
    state.slotId = option;
  } else {
    return { err: "Invalid select menu." };
  }

  const { send, err } = await buildEquipmentUpgradeSend({
    stateId: data.stateId,
    user: interaction.user,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = equipmentSelect;
