const { eventNames } = require("../../config/eventConfig");
const { getDurableBattleService } = require("../../services/durableBattle");
const {
  renderBattleList,
  renderBattle,
  renderTargetSelection,
} = require("../../battle/discord/durableBattleMessages");

const durableBattle = async (interaction, data) => {
  const service = await getDurableBattleService();
  const userId = interaction.user.id;
  let send;
  switch (data.eventName) {
    case eventNames.DURABLE_BATTLE_PICK:
      send = await renderBattle(service, interaction.values[0], userId);
      break;
    case eventNames.DURABLE_BATTLE_PAGE:
      send = await renderBattleList(service, userId, data.p);
      break;
    case eventNames.DURABLE_BATTLE_REFRESH:
      send = await renderBattle(service, data.b, userId);
      break;
    case eventNames.DURABLE_BATTLE_MOVE:
      send = await renderTargetSelection(
        service,
        data.b,
        userId,
        data.r,
        interaction.values[0],
      );
      break;
    case eventNames.DURABLE_BATTLE_SKIP:
    case eventNames.DURABLE_BATTLE_TARGET: {
      const action =
        data.eventName === eventNames.DURABLE_BATTLE_SKIP
          ? { action: "skipTurn" }
          : {
              action: "useMove",
              moveId: data.m,
              targetPokemonId: interaction.values[0],
            };
      const outcome = await service.act({
        battleId: data.b,
        userId,
        expectedRevision: data.r,
        requestId: interaction.id,
        action,
      });
      send = await renderBattle(service, data.b, userId);
      if (!outcome.accepted && send.embeds?.length) {
        send.content = `Action was not accepted (${outcome.reason}). Refreshed to the current battle.\n${send.content}`;
      }
      break;
    }
    default:
      return { err: "Unknown battle action." };
  }
  await interaction.update(send);
  return null;
};

module.exports = durableBattle;
