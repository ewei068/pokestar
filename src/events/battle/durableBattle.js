const { eventNames } = require("../../config/eventConfig");
const { getDurableBattleService } = require("../../services/durableBattle");
const {
  renderBattleList,
  renderBattle,
} = require("../../battle/discord/durableBattleMessages");

// Picker/page events belong to /continue-battle.
const durableBattle = async (interaction, data) => {
  if (data.u && data.u !== interaction.user.id) {
    return { err: "This battle list belongs to another trainer. Use /continue-battle to open your own." };
  }
  const service = await getDurableBattleService();
  const userId = interaction.user.id;
  let send;
  if (data.eventName === eventNames.DURABLE_BATTLE_PICK) {
    send = await renderBattle(service, interaction.values[0], userId);
  } else {
    send = await renderBattleList(service, userId, data.p);
  }
  await interaction.update(send);
  return null;
};
module.exports = durableBattle;
