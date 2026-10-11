const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const { buildBattleEmbed } = require("../../embeds/battleEmbeds");
const { eventNames } = require("../../config/eventConfig");
const { getMove } = require("../data/moveRegistry");
const { restoreBattle } = require("../persistence/battleRecord");

const PAGE_SIZE = 25;
const componentId = (eventName, data = {}) =>
  JSON.stringify({ eventName, ...data });

const refreshRow = (battleId) =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(
        componentId(eventNames.DURABLE_BATTLE_REFRESH, { b: battleId }),
      )
      .setLabel("Refresh")
      .setStyle(ButtonStyle.Secondary),
  );

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
        description: battle.battleId,
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

const renderBattle = async (service, battleId, userId) => {
  const accessible = await service.get({ battleId, userId });
  if (!accessible.found) {
    return { content: "Battle unavailable.", embeds: [], components: [] };
  }
  const record = await service.store.get(battleId);
  const battle = restoreBattle(record);
  const components = [];
  if (record.status === "active" && battle.activePokemon?.userId === userId) {
    const pokemon = battle.activePokemon;
    if (pokemon.canMove()) {
      const options = Object.keys(pokemon.moveIds)
        .filter(
          (moveId) =>
            pokemon.moveIds[moveId].cooldown === 0 &&
            !pokemon.moveIds[moveId].disabledCounter &&
            battle.getEligibleTargets(
              pokemon,
              /** @type {MoveIdEnum} */ (moveId),
            ).length > 0,
        )
        .map((moveId) => ({
          label: getMove(/** @type {MoveIdEnum} */ (moveId)).name,
          value: moveId,
        }));
      if (options.length > 0) {
        components.push(
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(
                componentId(eventNames.DURABLE_BATTLE_MOVE, {
                  b: battleId,
                  r: record.revision,
                }),
              )
              .setPlaceholder("Choose a move")
              .addOptions(options),
          ),
        );
      }
    }
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(
            componentId(eventNames.DURABLE_BATTLE_SKIP, {
              b: battleId,
              r: record.revision,
            }),
          )
          .setLabel("Skip turn")
          .setStyle(ButtonStyle.Secondary),
      ),
    );
  }
  components.push(refreshRow(battleId));

  const lastLog = record.actions.at(-1)?.log || [];
  const logText = lastLog.slice(-8).join("\n");
  return {
    content: [
      `Battle ${battleId} · ${record.status} · Revision ${record.revision}`,
      record.completionStatus === "failed"
        ? "Reward processing needs manual review. Your battle result is saved."
        : null,
      record.completionStatus === "processing"
        ? "Battle rewards are being processed."
        : null,
      record.completionSummary?.slice(0, 300),
      logText.slice(0, 1500),
    ]
      .filter(Boolean)
      .join("\n"),
    embeds: [buildBattleEmbed(battle)],
    components,
  };
};

const renderTargetSelection = async (service, battleId, userId, revision, moveId) => {
  const accessible = await service.get({ battleId, userId });
  if (!accessible.found || accessible.revision !== revision) {
    return renderBattle(service, battleId, userId);
  }
  const battle = restoreBattle(await service.store.get(battleId));
  if (battle.activePokemon?.userId !== userId) {
    return renderBattle(service, battleId, userId);
  }
  const pokemon = battle.activePokemon;
  if (!pokemon.moveIds[moveId] || pokemon.moveIds[moveId].cooldown > 0) {
    return renderBattle(service, battleId, userId);
  }
  const targets = battle.getEligibleTargets(pokemon, moveId);
  if (targets.length === 0) {
    return renderBattle(service, battleId, userId);
  }
  const selector = new StringSelectMenuBuilder()
    .setCustomId(
      componentId(eventNames.DURABLE_BATTLE_TARGET, {
        b: battleId,
        r: revision,
        m: moveId,
      }),
    )
    .setPlaceholder("Choose a target")
    .addOptions(
      targets.slice(0, PAGE_SIZE).map((target) => ({
        label: `${target.name} · ${target.teamName} ${target.position}`,
        value: target.id,
      })),
    );
  return {
    content: `Choose a target for ${getMove(moveId).name}.`,
    embeds: [buildBattleEmbed(battle, { selectedMoveId: moveId })],
    components: [new ActionRowBuilder().addComponents(selector), refreshRow(battleId)],
  };
};

module.exports = {
  renderBattleList,
  renderBattle,
  renderTargetSelection,
};
