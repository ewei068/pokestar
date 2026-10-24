const { getDurableBattleService } = require("../../services/durableBattle");
const {
  renderBattleList,
  renderBattle,
} = require("../../battle/discord/durableBattleMessages");

const getSend = async (userId, battleId = null) => {
  const service = await getDurableBattleService();
  return battleId
    ? renderBattle(service, battleId, userId)
    : renderBattleList(service, userId);
};

const messageCommand = async (incomingMessage) => {
  const battleId = incomingMessage.content.split(" ")[1] || null;
  const send = await getSend(incomingMessage.author.id, battleId);
  await incomingMessage.channel.send(send);
};

const slashCommand = async (interaction) => {
  const battleId = interaction.options.getString("battleid");
  const send = await getSend(interaction.user.id, battleId);
  await interaction.reply(send);
};

module.exports = { message: messageCommand, slash: slashCommand };
