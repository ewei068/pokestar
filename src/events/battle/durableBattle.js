const { eventNames } = require("../../config/eventConfig");
const { getDurableBattleService } = require("../../services/durableBattle");
const {
  renderBattleList,
  renderBattle,
  renderTargetSelection,
  renderBattleInfo,
} = require("../../battle/discord/durableBattleMessages");

const { getTrainerFromId } = require("../../services/trainer");

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
    case eventNames.DURABLE_BATTLE_INFO:
      send = await renderBattleInfo(
        service,
        data.b,
        userId,
        data.r,
        data.t,
        data.i,
        interaction.message,
      );
      if (send.err) return send;
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
    case eventNames.DURABLE_BATTLE_TARGET:
    case eventNames.DURABLE_BATTLE_CONFIRM: {
      let action = { action: "skipTurn" };
      if (data.eventName !== eventNames.DURABLE_BATTLE_SKIP) {
        const current = await service.get({ battleId: data.b, userId });
        if (
          !current.found ||
          current.revision !== data.r ||
          current.status !== "active"
        ) {
          send = await renderBattle(service, data.b, userId);
          break;
        }
        const source = current.view.pokemon[current.view.activePokemonId];
        // New IDs carry revision-scoped ordinals; accept move IDs on older messages too.
        const moveId =
          typeof data.m === "number"
            ? Object.keys(source?.moveIds || {})[data.m]
            : data.m;
        const targetId =
          data.eventName === eventNames.DURABLE_BATTLE_CONFIRM
            ? Object.keys(current.view.pokemon)[data.t]
            : interaction.values[0];
        if (!moveId || !targetId) {
          send = await renderBattle(service, data.b, userId);
          break;
        }
        if (data.eventName === eventNames.DURABLE_BATTLE_TARGET) {
          const { data: trainer } = await getTrainerFromId(userId);
          if (trainer?.settings?.showTargetIndicator !== false) {
            send = await renderTargetSelection(
              service,
              data.b,
              userId,
              data.r,
              moveId,
              targetId,
            );
            break;
          }
        }
        action = { action: "useMove", moveId, targetPokemonId: targetId };
      }
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
