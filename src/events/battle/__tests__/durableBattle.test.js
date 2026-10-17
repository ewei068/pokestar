jest.mock("../../../services/trainer", () => ({
  getTrainerFromId: jest.fn().mockResolvedValue({ data: { settings: {} } }),
}));

jest.mock("../../../services/durableBattle", () => ({
  getDurableBattleService: jest.fn(),
}));

const { getDurableBattleService } = require("../../../services/durableBattle");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../../battle/persistence/BattleStore");
const { BattleService } = require("../../../battle/service/BattleService");
const { eventNames } = require("../../../config/eventConfig");
const durableBattle = require("../durableBattle");

const { getTrainerFromId } = require("../../../services/trainer");
const {
  renderBattle,
  renderBattleInfo,
} = require("../../../battle/discord/durableBattleMessages");
const { restoreBattle } = require("../../../battle/persistence/battleRecord");

const controls = (send) => send.components.flatMap((row) => row.components);
const controlFor = (send, eventName) =>
  controls(send).find(
    (component) => JSON.parse(component.data.custom_id).eventName === eventName,
  );
const interact = async (
  send,
  eventName,
  userId,
  values = [],
  id = "ui-step",
) => {
  const component = controlFor(send, eventName);
  expect(component).toBeDefined();
  const interaction = {
    id,
    user: { id: userId },
    values,
    message: send,
    update: jest.fn().mockResolvedValue(undefined),
  };
  await durableBattle(interaction, JSON.parse(component.data.custom_id));
  return interaction.update.mock.calls[0][0];
};
const prepare = async () => {
  const store = new BattleStore(new MemoryBattleCollection());
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
    service,
    battleId: battle.id,
    userId,
    moveId,
    targetId,
    start,
    send: await renderBattle(service, battle.id, userId),
  };
};

describe("durable Discord battle actions", () => {
  beforeEach(() =>
    getTrainerFromId.mockResolvedValue({ data: { settings: {} } }),
  );

  it("keeps move/target controls together, previews without acting, then confirms the exact action", async () => {
    const { store, service, battleId, userId, moveId, targetId, start, send } =
      await prepare();
    const act = jest.spyOn(service, "act");
    const selected = await interact(
      send,
      eventNames.DURABLE_BATTLE_MOVE,
      userId,
      [moveId],
    );
    expect(
      controls(selected).filter((component) => component.data.type === 3),
    ).toHaveLength(2);
    const preview = await interact(
      selected,
      eventNames.DURABLE_BATTLE_TARGET,
      userId,
      [targetId],
    );
    expect(
      controlFor(preview, eventNames.DURABLE_BATTLE_CONFIRM),
    ).toBeDefined();
    expect(act).not.toHaveBeenCalled();
    expect((await store.get(battleId)).revision).toBe(start.revision);
    const confirm = controlFor(preview, eventNames.DURABLE_BATTLE_CONFIRM);
    expect(confirm.data.custom_id.length).toBeLessThanOrEqual(100);
    const confirmed = await interact(
      preview,
      eventNames.DURABLE_BATTLE_CONFIRM,
      userId,
      [],
      "confirmed-action",
    );
    expect(act).toHaveBeenCalledWith(
      expect.objectContaining({
        battleId,
        userId,
        expectedRevision: start.revision,
        requestId: "confirmed-action",
        action: { action: "useMove", moveId, targetPokemonId: targetId },
      }),
    );
    expect((await store.get(battleId)).revision).toBeGreaterThan(
      start.revision,
    );
    expect(
      controlFor(confirmed, eventNames.DURABLE_BATTLE_CONFIRM),
    ).toBeUndefined();
  });

  it("honors disabled target confirmation and accepts move IDs on older messages", async () => {
    getTrainerFromId.mockResolvedValue({
      data: { settings: { showTargetIndicator: false } },
    });
    const { store, service, battleId, userId, moveId, targetId, start } =
      await prepare();
    const act = jest.spyOn(service, "act");
    await durableBattle(
      {
        id: "old-target",
        user: { id: userId },
        values: [targetId],
        update: jest.fn(),
      },
      {
        eventName: eventNames.DURABLE_BATTLE_TARGET,
        b: battleId,
        r: start.revision,
        m: moveId,
      },
    );
    expect(act).toHaveBeenCalledWith(
      expect.objectContaining({
        action: { action: "useMove", moveId, targetPokemonId: targetId },
      }),
    );
    expect((await store.get(battleId)).revision).toBeGreaterThan(
      start.revision,
    );
  });

  it("refreshes stale confirmations without reinterpreting their move/target ordinals", async () => {
    const { store, service, battleId, userId, moveId, targetId, start, send } =
      await prepare();
    const selected = await interact(
      send,
      eventNames.DURABLE_BATTLE_MOVE,
      userId,
      [moveId],
    );
    const preview = await interact(
      selected,
      eventNames.DURABLE_BATTLE_TARGET,
      userId,
      [targetId],
    );
    await service.act({
      battleId,
      userId,
      expectedRevision: start.revision,
      requestId: "web-action",
      action: { action: "skipTurn" },
    });
    const { revision } = await store.get(battleId);
    const act = jest.spyOn(service, "act");
    const refreshed = await interact(
      preview,
      eventNames.DURABLE_BATTLE_CONFIRM,
      userId,
    );
    expect(act).not.toHaveBeenCalled();
    expect((await store.get(battleId)).revision).toBe(revision);
    expect(
      controlFor(refreshed, eventNames.DURABLE_BATTLE_CONFIRM),
    ).toBeUndefined();
  });

  it("keeps the selected move/target and battle preview while opening and hiding info tabs", async () => {
    const { service, battleId, userId, moveId, targetId, start, send } =
      await prepare();
    const selected = await interact(
      send,
      eventNames.DURABLE_BATTLE_MOVE,
      userId,
      [moveId],
    );
    const preview = await interact(
      selected,
      eventNames.DURABLE_BATTLE_TARGET,
      userId,
      [targetId],
    );
    const moves = await renderBattleInfo(
      service,
      battleId,
      userId,
      start.revision,
      "moves",
      undefined,
      preview,
    );
    expect(moves.embeds).toHaveLength(2);
    expect(moves.embeds[0]).toBe(preview.embeds[0]);
    expect(moves.components.slice(1)).toEqual(preview.components.slice(1));
    const changedMove = await interact(
      moves,
      eventNames.DURABLE_BATTLE_MOVE,
      userId,
      [moveId],
    );
    expect(changedMove.embeds[1]).toBe(moves.embeds[1]);
    const changedTarget = await interact(
      changedMove,
      eventNames.DURABLE_BATTLE_TARGET,
      userId,
      [targetId],
    );
    expect(changedTarget.embeds[1]).toBe(moves.embeds[1]);
    expect(
      controlFor(changedTarget, eventNames.DURABLE_BATTLE_CONFIRM),
    ).toBeDefined();

    const hidden = await renderBattleInfo(
      service,
      battleId,
      userId,
      start.revision,
      "hide",
      undefined,
      moves,
    );
    expect(hidden.embeds).toHaveLength(1);
    const teams = await renderBattleInfo(
      service,
      battleId,
      userId,
      start.revision,
      "teams",
      -1,
      preview,
    );
    expect(teams.embeds).toHaveLength(2);
    expect(teams.components.slice(1)).toEqual(preview.components.slice(1));
  });
  it("submits an action and refreshes stale components to the latest revision", async () => {
    const store = new BattleStore(new MemoryBattleCollection());
    const service = new BattleService(store, {
      npcAction: () => ({ action: "skipTurn" }),
    });
    getDurableBattleService.mockResolvedValue(service);
    const { battle } = createMockBattle();
    const started = await service.start({ battle });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    const interaction = {
      id: "discord-interaction-1",
      user: { id: userId },
      update: jest.fn().mockResolvedValue(undefined),
    };
    const data = {
      eventName: eventNames.DURABLE_BATTLE_SKIP,
      b: battle.id,
      r: started.revision,
    };

    await durableBattle(interaction, data);

    const current = await store.get(battle.id);
    expect(current.revision).toBeGreaterThan(started.revision);
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ embeds: expect.any(Array) }),
    );

    const staleInteraction = {
      ...interaction,
      id: "discord-interaction-2",
      update: jest.fn().mockResolvedValue(undefined),
    };
    await durableBattle(staleInteraction, data);

    expect((await store.get(battle.id)).revision).toBe(current.revision);
    expect(staleInteraction.update.mock.calls[0][0].content).toContain(
      "Action was not accepted (stale_revision)",
    );
  });
});
