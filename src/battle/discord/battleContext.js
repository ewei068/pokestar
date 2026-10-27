const { getState, setState, updateState } = require("../../services/state");
const { getDurableBattleService } = require("../../services/durableBattle");
const { eventNames } = require("../../config/eventConfig");
const { restoreBattle } = require("../persistence/battleRecord");

// UUID bytes keep existing JSON component IDs within Discord's 100-character limit.
const encodeBattleStateId = (battleId, revision) => {
  const uuid = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(battleId);
  const encoded = Buffer.from(
    uuid ? battleId.replace(/-/g, "") : battleId,
    uuid ? "hex" : "utf8",
  ).toString("base64url");
  return `${uuid ? "b" : "bs"}:${encoded}:${revision.toString(36)}`;
};
const decodeBattleStateId = (stateId) => {
  const match = /^(b|bs):([\w-]+):([0-9a-z]+)$/.exec(stateId || "");
  if (!match) return null;
  const bytes = Buffer.from(match[2], "base64url");
  const revision = parseInt(match[3], 36);
  if (
    !Number.isSafeInteger(revision) ||
    (match[1] === "b" && bytes.length !== 16)
  )
    return null;
  const hex = bytes.toString("hex");
  const battleId =
    match[1] === "b"
      ? `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      : bytes.toString("utf8");
  return { battleId, revision };
};

const selectedValue = (message, eventName) => {
  for (const row of message?.components || [])
    for (const component of row.components) {
      const id = component.customId || component.data?.custom_id;
      if (!id || JSON.parse(id).eventName !== eventName) continue;
      const options = component.options || component.data?.options || [];
      const selected = options.find(
        (option) => (option.data || option).default,
      );
      return selected ? (selected.data || selected).value : null;
    }
  return null;
};

/**
 * Load fresh gameplay state, retaining only transient Discord context from the cache.
 * @param {object} data
 * @param {object} interaction
 * @param {object|null} serviceOverride
 */
const loadBattleContext = async (data, interaction, serviceOverride = null) => {
  const cached = data.stateId ? getState(data.stateId) : null;
  const locator = decodeBattleStateId(data.stateId);
  const battleId = locator?.battleId || data.b || cached?.durableBattleId;
  if (!battleId)
    return cached
      ? {
          state: cached,
          battle: cached.battle,
          stateId: data.stateId,
          durable: false,
          stale: false,
        }
      : null;
  const service = serviceOverride || (await getDurableBattleService());
  const current = await service.get({ battleId, userId: interaction.user.id });
  if (!current.found) return null;
  const record = await service.store.get(battleId);
  if (!record) return null;
  const expectedRevision = locator?.revision ?? data.r ?? record.revision;
  const stateId = encodeBattleStateId(battleId, record.revision);
  const previous = cached || getState(stateId) || {};
  const modeStateId = previous.modeStateId || (!locator ? data.stateId : null);
  const modeState = modeStateId ? getState(modeStateId) : null;
  const state = {
    ...modeState,
    ...previous,
    modeStateId,
    durableBattleId: battleId,
    battle: restoreBattle(record),
    currentMoveId: null,
    currentTargetId: null,
  };
  const auto = await service.getAutoAvailability(
    record,
    state.battle,
    interaction.user.id,
  );
  Object.assign(state.battle.autoData, {
    shouldShowAutoBattle: auto.visible,
    canAuto: auto.enabled,
  });
  // Selections belong to this message, not another message showing the same revision.
  state.currentMoveId =
    data.moveId ||
    selectedValue(interaction.message, eventNames.BATTLE_MOVE_SELECT);
  state.currentTargetId =
    data.targetId ||
    selectedValue(interaction.message, eventNames.BATTLE_TARGET_SELECT);
  // Keep only UI context between interactions, not a second cached engine state.
  const uiState = { ...state };
  delete uiState.battle;
  if (getState(stateId, false)) updateState(stateId, uiState);
  else setState(uiState, 600, stateId);
  return {
    state,
    battle: state.battle,
    stateId,
    durable: true,
    stale: expectedRevision !== record.revision,
    expectedRevision,
    record,
    service,
    userId: interaction.user.id,
  };
};

/**
 * Stale controls and retained results refresh without invoking a legacy mutating handler.
 * @param {object} context
 * @param {object} interaction
 */
const refreshBattleIfStale = async (context, interaction) => {
  if (
    (!context.durable && !context.battle.autoData.isAutoMode) ||
    (context.durable &&
      !context.stale &&
      context.record.status === "active" &&
      !context.record.autoCommit)
  )
    return false;
  // Resolve lazily: battle.js also uses the continuation renderer when starting a battle.
  // eslint-disable-next-line global-require
  const { getStartTurnSend } = require("../../services/battle");
  await interaction.update(
    await getStartTurnSend(context.battle, context.stateId, context),
  );
  return true;
};

const submitBattleAction = async (context, interaction, action) => {
  if (!context.durable) {
    context.battle.performAction(action);
    return context;
  }
  const outcome = await context.service.act({
    battleId: context.record._id,
    userId: interaction.user.id,
    expectedRevision: context.expectedRevision,
    requestId: interaction.id,
    action,
  });
  const latest = await loadBattleContext(
    { b: context.record._id, stateId: context.stateId },
    interaction,
    context.service,
  );
  if (latest) latest.rejection = outcome.accepted ? null : outcome.reason;
  return latest;
};

module.exports = {
  encodeBattleStateId,
  decodeBattleStateId,
  loadBattleContext,
  refreshBattleIfStale,
  submitBattleAction,
};
