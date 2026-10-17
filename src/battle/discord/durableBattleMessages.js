const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const { eventNames } = require("../../config/eventConfig");
const { loadBattleContext } = require("./battleContext");

const PAGE_SIZE = 25;
const componentId = (eventName, data = {}) =>
  JSON.stringify({ eventName, ...data });

const renderBattleList = async (service, userId, page = 0) => {
  const battles = (await service.listActive(userId)).sort(
    (left, right) => right.updatedAt - left.updatedAt,
  );
  if (battles.length === 0) {
    return { content: "You have no ongoing battles.", components: [] };
  }

  const maxPage = Math.ceil(battles.length / PAGE_SIZE) - 1;
  const currentPage = Math.max(0, Math.min(page, maxPage));
  const visible = battles.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );
  const picker = new StringSelectMenuBuilder()
    .setCustomId(componentId(eventNames.DURABLE_BATTLE_PICK))
    .setPlaceholder("Choose a battle")
    .addOptions(
      visible.map((battle) => ({
        label: `${battle.mode.type || "Battle"} · Turn ${battle.view.turn}`,
        description: (
          Object.keys(battle.view.teams || {}).join(" vs ") || "Ongoing battle"
        ).slice(0, 100),
        value: battle.battleId,
      })),
    );
  const components = [new ActionRowBuilder().addComponents(picker)];
  if (maxPage > 0) {
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(
            componentId(eventNames.DURABLE_BATTLE_PAGE, { p: currentPage - 1 }),
          )
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId(
            componentId(eventNames.DURABLE_BATTLE_PAGE, { p: currentPage + 1 }),
          )
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === maxPage),
      ),
    );
  }
  return {
    content: `Your ongoing battles (${battles.length}) · Page ${currentPage + 1}/${maxPage + 1}`,
    components,
  };
};

// Continuation opens the same renderer and events used by live Discord battles.
const renderBattle = async (service, battleId, userId, { stateId } = {}) => {
  const context = await loadBattleContext(
    { b: battleId, stateId },
    { user: { id: userId } },
    service,
  );
  if (!context)
    return { content: "Battle unavailable.", embeds: [], components: [] };
  // eslint-disable-next-line global-require
  const { getStartTurnSend } = require("../../services/battle");
  return getStartTurnSend(context.battle, context.stateId, context);
};

module.exports = { renderBattleList, renderBattle };
