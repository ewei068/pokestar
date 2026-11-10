/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * equipmentUpgrade.js Builds the upgrade menu for the selected equipment and waits for interactions.
 */
const { getState } = require("../../services/state");
const { buildEquipmentUpgradeSend } = require("../../services/pokemon");
const { upgradeEquipmentLevel, rerollStatSlot } = require("../../services/pokemonEquipment");
const { equipmentConfig, modifierConfig, levelUpCost, STAT_REROLL_COST, POKEDOLLAR_MULTIPLIER } = require("../../config/equipmentConfig");
const { backpackItemConfig } = require("../../config/backpackConfig");
const { formatMoney } = require("../../utils/utils");

const equipmentUpgrade = async (interaction, data) => {
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

  const { button } = state;
  if (button !== "upgrade" && button !== "slot") {
    return { err: "Invalid button." };
  }

  if (!state.expectedEquipment || state.expectedEquipmentType !== state.equipmentType) {
    return { err: "This equipment selection has expired. Use `/equipment` again." };
  }
  const result = button === "upgrade"
    ? await upgradeEquipmentLevel(interaction.user, state.pokemonId, state.equipmentType, state.expectedEquipment)
    : await rerollStatSlot(interaction.user, state.pokemonId, state.equipmentType, state.slotId, state.expectedEquipment);
  if (result.err || !result.data) return { err: result.err || "Equipment change could not be confirmed." };
  const { pokemon, previousEquipment } = result.data;
  const equipment = pokemon.equipments[state.equipmentType];
  state.expectedEquipmentType = state.equipmentType;
  state.expectedEquipment = structuredClone(equipment);
  const materialCost = button === "upgrade" ? levelUpCost(previousEquipment.level) : STAT_REROLL_COST;
  const material = backpackItemConfig[equipmentConfig[state.equipmentType].material];
  const money = formatMoney(materialCost * POKEDOLLAR_MULTIPLIER);
  let followUpString = button === "upgrade"
    ? `Equipment upgraded to level ${equipment.level} for ${money} and ${material.emoji} x${materialCost}!`
    : `Stat slot ${state.slotId} rerolled to ${modifierConfig[equipment.slots[state.slotId].modifier].name} (${equipment.slots[state.slotId].quality}%) for ${money} and ${material.emoji} x${materialCost}!`;
  if (result.warning) followUpString += `\n${result.warning}`;
  let refreshed;
  try {
    refreshed = await buildEquipmentUpgradeSend({ stateId: data.stateId, user: interaction.user });
  } catch {
    // The paid operation is already confirmed, regardless of this read's outcome.
  }
  if (refreshed?.send && !refreshed.err) await interaction.update(refreshed.send);
  else {
    await interaction.update({ components: [] });
    followUpString += "\nEquipment saved, but the menu could not be refreshed. Refresh with `/equipment`.";
  }

  await interaction.followUp({
    content: followUpString,
    ephemeral: true,
  });
};

module.exports = equipmentUpgrade;
