/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * equipmentSwap.js Swap equipments.
 */

const { buildEquipmentSwapSend } = require("../../services/pokemon");

const equipmentSwap = async (interaction, data) => {
  const { send, err } = await buildEquipmentSwapSend({
    stateId: data.stateId,
    user: interaction.user,
    swap: true,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = equipmentSwap;
