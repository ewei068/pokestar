jest.mock("../../../services/trainer", () => ({
  getTrainerFromId: jest.fn().mockResolvedValue({ data: { settings: {} } }),
  getTrainer: jest.fn().mockResolvedValue({ data: { settings: {} } }),
}));
jest.mock("../../../services/durableBattle", () => ({
  getDurableBattleService: jest.fn(),
}));

const { getDurableBattleService } = require("../../../services/durableBattle");
const { getTrainer, getTrainerFromId } = require("../../../services/trainer");
const {
  createMockPokemonParty,
} = require("../../../__testing__/mocks/pokemon");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../../battle/persistence/BattleStore");
const { BattleService } = require("../../../battle/service/BattleService");
const { restoreBattle } = require("../../../battle/persistence/battleRecord");
const {
  renderBattle,
} = require("../../../battle/discord/durableBattleMessages");
const {
  loadBattleContext,
  decodeBattleStateId,
  encodeBattleStateId,
} = require("../../../battle/discord/battleContext");
const { getState, setState, deleteState } = require("../../../services/state");
const { eventNames } = require("../../../config/eventConfig");
const moveSelect = require("../battleMoveSelect");
const targetSelect = require("../battleTargetSelect");
const targetConfirm = require("../battleTargetConfirm");
const battleInfo = require("../battleInfo");

const handlers = {
  [eventNames.BATTLE_MOVE_SELECT]: moveSelect,
  [eventNames.BATTLE_TARGET_SELECT]: targetSelect,
  [eventNames.BATTLE_TARGET_CONFIRM]: targetConfirm,
  [eventNames.BATTLE_INFO]: battleInfo,
};
const controls = (send) => send.components.flatMap((row) => row.components);
const dataOf = (component) => JSON.parse(component.data.custom_id);
const controlFor = (send, name) =>
  controls(send).find((component) => dataOf(component).eventName === name);
const interact = async (
  send,
  name,
  userId,
  values = [],
  id = "step",
  extra = {},
) => {
  const component = controlFor(send, name);
  expect(component).toBeDefined();
  const interaction = {
    id,
    user: { id: userId },
    values,
    message: {
      ...send,
      embeds: [...send.embeds],
      components: [...send.components],
    },
    update: jest.fn().mockResolvedValue(undefined),
  };
  const result = await handlers[name](interaction, {
    ...dataOf(component),
    ...extra,
  });
  expect(result?.err).toBeUndefined();
  expect(result?.skipInteractionRewards).toBe(true);
  return { ...send, ...interaction.update.mock.calls[0][0] };
};
const prepare = async () => {
  const collection = new MemoryBattleCollection();
  const store = new BattleStore(collection);
  const service = new BattleService(store, {
    npcAction: () => ({ action: "skipTurn" }),
  });
  getDurableBattleService.mockResolvedValue(service);
  const { battle } = createMockBattle();
  const start = await service.start({ battle });
  const restored = restoreBattle(await store.get(battle.id));
  const { userId } = restored.activePokemon;
  const moveId = Object.keys(restored.activePokemon.moveIds).find(
    (id) => restored.getEligibleTargets(restored.activePokemon, id).length,
  );
  const targetId = restored.getEligibleTargets(
    restored.activePokemon,
    moveId,
  )[0].id;
  return {
    store,
    collection,
    service,
    battleId: battle.id,
    userId,
    moveId,
    targetId,
    start,
    send: await renderBattle(service, battle.id, userId),
  };
};
const settings = (value) => {
  getTrainer.mockResolvedValue({ data: { settings: value } });
  getTrainerFromId.mockResolvedValue({ data: { settings: value } });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  settings({});
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("existing Discord handlers with Mongo-backed battle state", () => {
  it("uses original events and keeps move/target/confirmation on the same message", async () => {
    const { service, store, battleId, userId, moveId, targetId, start, send } =
      await prepare();
    const act = jest.spyOn(service, "act");
    expect(
      controls(send).every((c) => dataOf(c).eventName.startsWith("battle")),
    ).toBe(true);
    const selected = await interact(
      send,
      eventNames.BATTLE_MOVE_SELECT,
      userId,
      [moveId],
    );
    expect(controls(selected).filter((c) => c.data.type === 3)).toHaveLength(2);
    const preview = await interact(
      selected,
      eventNames.BATTLE_TARGET_SELECT,
      userId,
      [targetId],
    );
    expect(controlFor(preview, eventNames.BATTLE_TARGET_CONFIRM)).toBeDefined();
    expect(act).not.toHaveBeenCalled();
    expect((await store.get(battleId)).revision).toBe(start.revision);
    for (const row of preview.components)
      for (const c of row.components)
        expect(c.toJSON().custom_id.length).toBeLessThanOrEqual(100);
    const confirmed = await interact(
      preview,
      eventNames.BATTLE_TARGET_CONFIRM,
      userId,
      [],
      "confirm-once",
    );
    expect(act).toHaveBeenCalledWith(
      expect.objectContaining({
        battleId,
        userId,
        expectedRevision: start.revision,
        requestId: "confirm-once",
        action: { action: "useMove", moveId, targetPokemonId: targetId },
      }),
    );
    expect((await store.get(battleId)).revision).toBeGreaterThan(
      start.revision,
    );
    expect(
      controlFor(confirmed, eventNames.BATTLE_TARGET_CONFIRM),
    ).toBeUndefined();
  });

  it("recovers confirmation from its message after local state is lost", async () => {
    const { service, store, battleId, userId, moveId, targetId, send } =
      await prepare();
    const selected = await interact(
      send,
      eventNames.BATTLE_MOVE_SELECT,
      userId,
      [moveId],
    );
    const preview = await interact(
      selected,
      eventNames.BATTLE_TARGET_SELECT,
      userId,
      [targetId],
    );
    const token = dataOf(
      controlFor(preview, eventNames.BATTLE_TARGET_CONFIRM),
    ).stateId;
    deleteState(token);
    const act = jest.spyOn(service, "act");
    await interact(
      preview,
      eventNames.BATTLE_TARGET_CONFIRM,
      userId,
      [],
      "restart-confirm",
    );
    expect(act).toHaveBeenCalledWith(
      expect.objectContaining({
        action: { action: "useMove", moveId, targetPokemonId: targetId },
      }),
    );
    expect(
      (await store.get(battleId)).actions.some(
        (a) => a.requestId === "restart-confirm",
      ),
    ).toBe(true);
  });

  it("reloads Mongo while cached state exists and rejects stale selections before mutation", async () => {
    const { service, store, battleId, userId, moveId, targetId, start, send } =
      await prepare();
    const selected = await interact(
      send,
      eventNames.BATTLE_MOVE_SELECT,
      userId,
      [moveId],
    );
    const preview = await interact(
      selected,
      eventNames.BATTLE_TARGET_SELECT,
      userId,
      [targetId],
    );
    const token = dataOf(
      controlFor(preview, eventNames.BATTLE_TARGET_CONFIRM),
    ).stateId;
    expect(getState(token)).toBeTruthy();
    expect(getState(token).battle).toBeUndefined();
    await service.act({
      battleId,
      userId,
      expectedRevision: start.revision,
      requestId: "web",
      action: { action: "skipTurn" },
    });
    const { revision } = await store.get(battleId);
    const act = jest.spyOn(service, "act");
    const refreshed = await interact(
      preview,
      eventNames.BATTLE_TARGET_CONFIRM,
      userId,
    );
    expect(act).not.toHaveBeenCalled();
    expect((await store.get(battleId)).revision).toBe(revision);
    expect(
      decodeBattleStateId(dataOf(controls(refreshed)[0]).stateId).revision,
    ).toBe(revision);
    expect(
      controlFor(refreshed, eventNames.BATTLE_TARGET_CONFIRM),
    ).toBeUndefined();
  });

  it("isolates selections between messages showing the same revision", async () => {
    const { userId, moveId, targetId, send } = await prepare();
    const selected = await interact(
      send,
      eventNames.BATTLE_MOVE_SELECT,
      userId,
      [moveId],
    );
    const preview = await interact(
      selected,
      eventNames.BATTLE_TARGET_SELECT,
      userId,
      [targetId],
    );
    const context = await loadBattleContext(
      dataOf(controlFor(preview, eventNames.BATTLE_TARGET_CONFIRM)),
      { user: { id: userId }, message: send },
    );
    expect(context.state.currentMoveId).toBeNull();
    expect(context.state.currentTargetId).toBeNull();
  });

  it("honors immediate target actions and preserves info while changing selections", async () => {
    const { service, userId, moveId, targetId, send } = await prepare();
    const selected = await interact(
      send,
      eventNames.BATTLE_MOVE_SELECT,
      userId,
      [moveId],
    );
    const info = await interact(
      selected,
      eventNames.BATTLE_INFO,
      userId,
      [],
      "moves-info",
      { tab: "moves" },
    );
    expect(info.embeds).toHaveLength(2);
    const chosen = await interact(info, eventNames.BATTLE_MOVE_SELECT, userId, [
      moveId,
    ]);
    expect(chosen.embeds[1]).toBe(info.embeds[1]);
    settings({ showTargetIndicator: false });
    const act = jest.spyOn(service, "act");
    await interact(
      chosen,
      eventNames.BATTLE_TARGET_SELECT,
      userId,
      [targetId],
      "instant",
    );
    expect(act).toHaveBeenCalledWith(
      expect.objectContaining({
        action: { action: "useMove", moveId, targetPokemonId: targetId },
      }),
    );
  });

  it("authorizes reads even when a battle is already cached", async () => {
    const { send } = await prepare();
    const token = dataOf(controls(send)[0]).stateId;
    expect(getState(token)).toBeTruthy();
    expect(getState(token).battle).toBeUndefined();
    expect(
      await loadBattleContext({ stateId: token }, { user: { id: "stranger" } }),
    ).toBeNull();
  });

  it("retains late-added mode UI context without treating it as battle authority", async () => {
    const { service, battleId, userId } = await prepare();
    const modeState = { durableBattleId: battleId, difficulty: "easy" };
    setState(modeState, 600, "start-context");
    const opened = await renderBattle(service, battleId, userId, {
      stateId: "start-context",
    });
    modeState.endBattleComponents = ["mode-replay-placeholder"];
    const context = await loadBattleContext(dataOf(controls(opened)[0]), {
      user: { id: userId },
    });
    expect(context.state.endBattleComponents).toEqual(
      modeState.endBattleComponents,
    );
    expect(context.state.battle).not.toBe(modeState.battle);
  });

  it("keeps the non-durable path in memory and expired legacy state fails normally", async () => {
    const { battle } = createMockBattle({ autoStart: true });
    while (battle.isNpc(battle.activePokemon.userId))
      battle.performAction({ action: "skipTurn" });
    const state = { battle };
    setState(state, 600, "legacy");
    const context = await loadBattleContext(
      { stateId: "legacy" },
      { user: { id: battle.activePokemon.userId } },
    );
    expect(context.state).toBe(state);
    expect(context.durable).toBe(false);
    expect(
      await loadBattleContext(
        { stateId: "missing-legacy" },
        { user: { id: "user" } },
      ),
    ).toBeNull();
  });

  it("renders expired battles read-only and does not invoke an action", async () => {
    const { collection, service, battleId, userId, moveId, send } =
      await prepare();
    collection.documents.get(battleId).expiresAt = new Date(Date.now() - 1);
    const act = jest.spyOn(service, "act");
    const updated = await interact(
      send,
      eventNames.BATTLE_MOVE_SELECT,
      userId,
      [moveId],
    );
    expect(controls(updated).map((c) => c.data.label)).toEqual(["Refresh"]);
    expect(act).not.toHaveBeenCalled();
  });

  it("renders finished results without running legacy rewards again", async () => {
    const onCompleted = jest.fn().mockResolvedValue("Rewards applied once");
    const store = new BattleStore(new MemoryBattleCollection());
    const service = new BattleService(store, {
      onCompleted,
      npcAction: () => ({ action: "skipTurn" }),
    });
    getDurableBattleService.mockResolvedValue(service);
    const { battle, team2 } = createMockBattle({
      team1Party: createMockPokemonParty({ size: 1 }),
      team2Party: createMockPokemonParty({ size: 1 }),
    });
    team2.party.pokemons[0].remainingHp = 1;
    battle.parties.Team2.pokemons[0].hp = 1;
    const start = await service.start({ battle });
    const { userId } = battle.activePokemon;
    await service.act({
      battleId: battle.id,
      userId,
      expectedRevision: start.revision,
      requestId: "finish",
      action: {
        action: "useMove",
        moveId: "m33",
        targetPokemonId: battle.parties.Team2.pokemons[0].id,
      },
    });
    getTrainer.mockClear();
    const result = await renderBattle(service, battle.id, userId);
    expect(result.content).toContain("Rewards applied once");
    expect(controls(result).map((c) => c.data.label)).toEqual(["Refresh"]);
    await renderBattle(service, battle.id, userId);
    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(getTrainer).not.toHaveBeenCalled();
  });

  it("round-trips both normal UUIDs and short test IDs without requiring a state lookup", () => {
    for (const id of ["abcdef12-3456-4789-8abc-0123456789ab", "test-battle"]) {
      expect(decodeBattleStateId(encodeBattleStateId(id, 356))).toEqual({
        battleId: id,
        revision: 356,
      });
    }
    expect(decodeBattleStateId("old-short-state")).toBeNull();
  });
});
