const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const {
  buildBattleEmbed,
  buildBattleMovesetEmbed,
  buildBattleTeamEmbed,
} = require("../../embeds/battleEmbeds");
const {
  buildSelectBattleMoveRow,
} = require("../../components/selectBattleMoveRow");
const {
  buildSelectBattleTargetRow,
} = require("../../components/selectBattleTargetRow");
const {
  buildBattleInfoActionRow,
} = require("../../components/battleInfoActionRow");
const {
  buildNextTurnActionRow,
} = require("../../components/battleNextTurnRow");
const { getTrainerFromId } = require("../../services/trainer");
const { getUserSelectedDevice } = require("../../utils/trainerUtils");
const { eventNames } = require("../../config/eventConfig");
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

/**
 * Keep legacy appearance; only component routing changes for durable records.
 * @param {Battle} battle
 * @param {string} battleId
 * @param {number} revision
 * @param {object} options
 */
const infoRow = (battle, battleId, revision, options = {}) => {
  const row = buildBattleInfoActionRow(battle, null, options);
  // Paid auto-battle still needs a durable command; never route it to mutable bot state.
  row.components = row.components.filter((button) => {
    const data = JSON.parse(button.data.custom_id);
    if (data.tab === "auto") return false;
    button.setCustomId(
      componentId(eventNames.DURABLE_BATTLE_INFO, {
        b: battleId,
        r: revision,
        t: data.tab,
        ...(data.index === undefined ? {} : { i: data.index }),
      }),
    );
    return true;
  });
  return row;
};

const readBattle = async (service, battleId, userId) => {
  const accessible = await service.get({ battleId, userId });
  if (!accessible.found) return null;
  const record = await service.store.get(battleId);
  return record ? { record, battle: restoreBattle(record) } : null;
};

const renderBattle = async (service, battleId, userId, selection = {}) => {
  const current = await readBattle(service, battleId, userId);
  if (!current)
    return { content: "Battle unavailable.", embeds: [], components: [] };
  const { record, battle } = current;
  const { data: trainer } = await getTrainerFromId(userId);
  const components = [];
  let moveId;
  let targetId;
  if (record.status === "active" && battle.activePokemon?.userId === userId) {
    const pokemon = battle.activePokemon;
    components.push(infoRow(battle, battleId, record.revision));
    if (pokemon.canMove()) {
      const requested = pokemon.moveIds[selection.moveId];
      const targets =
        requested &&
        requested.cooldown === 0 &&
        !requested.disabledCounter &&
        selection.revision === record.revision
          ? battle.getEligibleTargets(pokemon, selection.moveId)
          : [];
      if (targets.length) {
        moveId = selection.moveId;
        targetId = targets.find(
          (target) => target.id === selection.targetId,
        )?.id;
      }
      const moves = buildSelectBattleMoveRow(battle, null, moveId);
      moves.components[0].setCustomId(
        componentId(eventNames.DURABLE_BATTLE_MOVE, {
          b: battleId,
          r: record.revision,
        }),
      );
      components.push(moves);
      if (moveId) {
        // A revision-scoped move ordinal keeps IDs below Discord's 100-character limit.
        const moveIndex = Object.keys(pokemon.moveIds).indexOf(moveId);
        const targetsRow = buildSelectBattleTargetRow(
          battle,
          targets.slice(0, PAGE_SIZE),
          moveId,
          null,
          targetId,
        );
        targetsRow.components[0].setCustomId(
          componentId(eventNames.DURABLE_BATTLE_TARGET, {
            b: battleId,
            r: record.revision,
            m: moveIndex,
          }),
        );
        components.push(targetsRow);
        if (targetId && trainer?.settings?.showTargetIndicator !== false) {
          components.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  componentId(eventNames.DURABLE_BATTLE_CONFIRM, {
                    b: battleId,
                    r: record.revision,
                    m: moveIndex,
                    t: Object.keys(battle.allPokemon).indexOf(targetId),
                  }),
                )
                .setLabel("Confirm")
                .setEmoji("⚔️")
                .setStyle(ButtonStyle.Success),
            ),
          );
        }
      }
    } else {
      const next = buildNextTurnActionRow(null);
      next.components[0].setCustomId(
        componentId(eventNames.DURABLE_BATTLE_SKIP, {
          b: battleId,
          r: record.revision,
        }),
      );
      components.push(next);
    }
  } else components.push(refreshRow(battleId));

  const lastLog = record.actions.at(-1)?.log || [];
  return {
    content: [
      record.completionStatus === "failed"
        ? "Reward processing needs manual review. Your battle result is saved."
        : null,
      record.completionStatus === "processing"
        ? "Battle rewards are being processed."
        : null,
      record.completionSummary?.slice(0, 300),
      lastLog.slice(-8).join("\n").slice(0, 1500),
    ]
      .filter(Boolean)
      .join("\n"),
    embeds: [
      buildBattleEmbed(battle, {
        isMobile: getUserSelectedDevice({}, trainer?.settings) === "mobile",
        selectedMoveId: moveId,
        targetIndices: targetId
          ? battle.activePokemon.getTargetIndices(moveId, targetId)
          : null,
      }),
    ],
    components,
  };
};

const renderTargetSelection = async (
  service,
  battleId,
  userId,
  revision,
  moveId,
  targetId = null,
  message = null,
) => {
  const send = await renderBattle(service, battleId, userId, {
    revision,
    moveId,
    targetId,
  });
  const [oldRow] = message?.components || [];
  const oldButton = oldRow?.components?.[0];
  const newButton = send.components[0]?.components?.[0];
  const oldId = oldButton?.customId || oldButton?.data?.custom_id;
  const newId = newButton?.customId || newButton?.data?.custom_id;
  const previous = oldId ? JSON.parse(oldId) : null;
  const latest = newId ? JSON.parse(newId) : null;
  if (
    previous?.eventName === eventNames.DURABLE_BATTLE_INFO &&
    latest?.eventName === eventNames.DURABLE_BATTLE_INFO &&
    previous.b === latest.b &&
    previous.r === latest.r &&
    latest.r === revision
  ) {
    send.embeds.push(...message.embeds.slice(1, 2));
    send.components[0] = oldRow;
  }
  return send;
};

/**
 * Info tabs preserve the move, target, preview and confirmation on the message.
 * @param {object} service
 * @param {string} battleId
 * @param {string} userId
 * @param {number} revision
 * @param {string} tab
 * @param {number} index
 * @param {object} message
 */
const renderBattleInfo = async (
  service,
  battleId,
  userId,
  revision,
  tab,
  index,
  message,
) => {
  const current = await readBattle(service, battleId, userId);
  if (
    !current ||
    current.record.revision !== revision ||
    current.record.status !== "active"
  ) {
    return renderBattle(service, battleId, userId);
  }
  const { battle } = current;
  if (battle.activePokemon?.userId !== userId)
    return { err: "It's not your turn." };
  if (tab === "refresh") return renderBattle(service, battleId, userId);
  let nextTeamIndex = -1;
  const embeds = [message.embeds[0]];
  if (tab === "teams") {
    nextTeamIndex = (index ?? -1) + 1;
    const name = Object.keys(battle.teams)[nextTeamIndex];
    if (name) embeds.push(buildBattleTeamEmbed(battle, name));
    else nextTeamIndex = -1;
  } else if (tab === "moves")
    embeds.push(buildBattleMovesetEmbed(battle.activePokemon));
  else if (tab !== "hide") return { err: "Invalid selection." };
  return {
    embeds,
    components: [
      infoRow(battle, battleId, revision, {
        currentTab: tab,
        currentTeamIndex: nextTeamIndex,
      }),
      ...message.components.slice(1),
    ],
  };
};

module.exports = {
  renderBattleList,
  renderBattle,
  renderTargetSelection,
  renderBattleInfo,
};
