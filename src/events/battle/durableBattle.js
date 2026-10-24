const { eventNames } = require("../../config/eventConfig");
const { getDurableBattleService } = require("../../services/durableBattle");
const {
  renderBattleList,
  renderBattle,
} = require("../../battle/discord/durableBattleMessages");

// Picker/page events belong to /continue-battle. Old durable action IDs only upgrade the UI.
const durableBattle = async (interaction, data) => {
  if (data.u && data.u !== interaction.user.id) {
    return { err: "This battle list belongs to another trainer. Use /continue-battle to open your own." };
  }
  const service = await getDurableBattleService();
  const userId = interaction.user.id;
  let send;
  if (data.eventName === eventNames.DURABLE_BATTLE_PICK) {
    send = await renderBattle(service, interaction.values[0], userId);
  } else if (data.eventName === eventNames.DURABLE_BATTLE_PAGE) {
    send = await renderBattleList(service, userId, data.p);
  } else {
    send = await renderBattle(service, data.b, userId);
    if (send.embeds?.length)
      send.content = `Battle controls updated. Choose your action again.\n${send.content}`;
  }
  await interaction.update(send);
  return null;
};
module.exports = durableBattle;
