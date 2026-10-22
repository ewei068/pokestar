const { pokemonIdEnum } = require("../../../enums/pokemonEnums");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  createMockPokemonParty,
} = require("../../../__testing__/mocks/pokemon");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../persistence/BattleStore");
const { BattleService } = require("../BattleService");
const { restoreBattle } = require("../../persistence/battleRecord");
const { battleStateId } = require("../battleStateCursor");
const { BattleWebService } = require("../BattleWebService");

const makeService = (options = {}) => {
  const store = new BattleStore(new MemoryBattleCollection());
  return { store, service: new BattleService(store, options) };
};

describe("BattleService", () => {
  it.each(["act", "read"])("persists forced skips through %s until a player can choose again", async (entry) => {
    const { service, store } = makeService({ npcAction: () => ({ action: "skipTurn" }) });
    const party = createMockPokemonParty({ size: 1 });
    party.pokemons[0].moveIds = ["m182"];
    const { battle } = createMockBattle({ team1Party: party,
      team2Party: createMockPokemonParty({ size: 1 }) });
    const started = await service.start({ battle });
    const { userId } = battle.activePokemon;
    const request = { battleId: battle.id, expectedRevision: started.revision,
      requestId: "protect", action: { action: "useMove", moveId: "m182",
        targetPokemonId: battle.activePokemon.id } };
    if (entry === "act") {
      expect((await service.act({ ...request, userId })).accepted).toBe(true);
    } else {
      await store.submit({ ...request, actorUserId: userId });
      expect((await store.get(battle.id)).needsAutomaticTurn).toBe(true);
      await store.markAutomaticTurnsSettled(battle.id, started.revision);
      expect((await store.get(battle.id)).needsAutomaticTurn).toBe(true);
      const afterStateId = battleStateId(await store.get(battle.id));
      const web = new BattleWebService(service);
      await Promise.all([web.get({ battleId: battle.id, userId, afterStateId }),
        web.get({ battleId: battle.id, userId, afterStateId })]);
    }
    const record = await store.get(battle.id);
    expect(record.needsAutomaticTurn).toBe(false);
    const forced = record.actions.filter(action => action.actorUserId === userId && action.action.action === "skipTurn");
    expect(forced.length).toBeGreaterThan(0);
    expect(new Set(record.actions.map(action => action.revision)).size).toBe(record.actions.length);
    const restored = restoreBattle(record);
    expect(restored.activePokemon.userId).toBe(userId);
    expect(restored.activePokemon.canMove()).toBe(true);
  });

  const finishOneHitBattle = async (service) => {
    const { battle, team2 } = createMockBattle({
      team1Party: createMockPokemonParty({ size: 1 }),
      team2Party: createMockPokemonParty({ size: 1 }),
    });
    team2.party.pokemons[0].remainingHp = 1;
    battle.parties.Team2.pokemons[0].hp = 1;
    const started = await service.start({ battle, mode: { type: "pve" } });
    const result = await service.act({
      battleId: battle.id,
      userId: battle.activePokemon.userId,
      expectedRevision: started.revision,
      requestId: "finishing-hit",
      action: {
        action: "useMove",
        moveId: "m33",
        targetPokemonId: battle.parties.Team2.pokemons[0].id,
      },
    });
    expect(result.accepted).toBe(true);
    expect(result.status).toBe("completed");
    return { battle, result };
  };

  it("claims completion once across duplicate actions and subsequent reads", async () => {
    const onCompleted = jest.fn().mockResolvedValue("Rewards applied");
    const { service, store } = makeService({ onCompleted });
    const { battle } = await finishOneHitBattle(service);
    const record = await store.get(battle.id);
    expect(record.completionStatus).toBe("applied");
    expect(record.completionSummary).toBe("Rewards applied");

    await service.act({
      battleId: battle.id,
      userId: battle.activePokemon.userId,
      expectedRevision: 0,
      requestId: "finishing-hit",
      action: {
        action: "useMove",
        moveId: "m33",
        targetPokemonId: battle.parties.Team2.pokemons[0].id,
      },
    });
    await service.get({ battleId: battle.id, userId: battle.activePokemon.userId });
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it("records a failed completion for manual reconciliation", async () => {
    const onCompleted = jest.fn().mockRejectedValue(new Error("reward write failed"));
    const { service, store } = makeService({ onCompleted });
    const { battle } = await finishOneHitBattle(service);
    const record = await store.get(battle.id);
    expect(record.completionStatus).toBe("failed");
    expect(record.completionError).toContain("reward write failed");
    await service.get({ battleId: battle.id, userId: battle.activePokemon.userId });
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it("does not replay an interrupted reward claim after service restart", async () => {
    const { service, store } = makeService();
    const { battle } = await finishOneHitBattle(service);
    expect(await store.claimCompletion(battle.id, "interrupted-claim")).toBe(true);

    const onCompleted = jest.fn();
    const restarted = new BattleService(store, { onCompleted });
    const view = await restarted.get({
      battleId: battle.id,
      userId: battle.activePokemon.userId,
    });
    expect(view.completionStatus).toBe("processing");
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("continues the same battle through a fresh service instance", async () => {
    const collection = new MemoryBattleCollection();
    const npcAction = () => ({ action: "skipTurn" });
    const firstService = new BattleService(new BattleStore(collection), { npcAction });
    const { battle } = createMockBattle({
      team1Party: createMockPokemonParty({ size: 1 }),
      team2Party: createMockPokemonParty({ size: 1 }),
    });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    const started = await firstService.start({ battle, mode: { type: "pve" } });
    const firstAction = await firstService.act({
      battleId: battle.id,
      userId,
      expectedRevision: started.revision,
      requestId: "before-restart",
      action: { action: "skipTurn" },
    });
    expect(firstAction.accepted).toBe(true);

    const resumedService = new BattleService(new BattleStore(collection), { npcAction });
    const listed = await resumedService.listActive(userId);
    const resumed = await resumedService.get({
      battleId: battle.id,
      userId,
      sinceRevision: started.revision,
    });
    expect(listed[0].battleId).toBe(battle.id);
    expect(resumed.revision).toBe(firstAction.revision);
    expect(resumed.updates).toEqual(firstAction.updates);

    const nextAction = await resumedService.act({
      battleId: battle.id,
      userId,
      expectedRevision: resumed.revision,
      requestId: "after-restart",
      action: { action: "skipTurn" },
    });
    expect(nextAction.accepted).toBe(true);
    expect(nextAction.revision).toBeGreaterThan(resumed.revision);
    expect((await resumedService.store.get(battle.id)).actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ requestId: "before-restart" }),
        expect.objectContaining({ requestId: "after-restart" }),
      ]),
    );
  });

  it("lists only a participant's active battles and hides setup from reads", async () => {
    const { service } = makeService({ npcAction: () => ({ action: "skipTurn" }) });
    const { battle } = createMockBattle();
    const record = await service.start({ battle, mode: { type: "pve" } });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));

    expect(await service.listActive(userId)).toEqual([
      expect.objectContaining({ battleId: battle.id, mode: { type: "pve" } }),
    ]);
    expect(await service.listActive("stranger")).toEqual([]);
    expect(await service.get({ battleId: battle.id, userId: "stranger" })).toEqual({
      found: false,
    });
    const view = await service.get({ battleId: battle.id, userId });
    expect(view.found).toBe(true);
    expect(view.view).toEqual(record.view);
    expect(view.setup).toBeUndefined();
  });

  it("resolves NPC turns into later ordered updates after a player action", async () => {
    const { service } = makeService({ npcAction: () => ({ action: "skipTurn" }) });
    const { battle } = createMockBattle({
      team1Party: createMockPokemonParty({
        size: 1,
        speciesIds: [pokemonIdEnum.BULBASAUR],
      }),
      team2Party: createMockPokemonParty({
        size: 1,
        speciesIds: [pokemonIdEnum.BULBASAUR],
      }),
    });
    const record = await service.start({ battle, mode: { type: "pve" } });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    expect(battle.activePokemon.userId).toBe(userId);

    const result = await service.act({
      battleId: battle.id,
      userId,
      expectedRevision: record.revision,
      requestId: "player-action",
      action: { action: "skipTurn" },
    });

    expect(result.accepted).toBe(true);
    expect(result.updates[0].actorUserId).toBe(userId);
    expect(result.updates.some((update) => update.requestId.startsWith("npc:"))).toBe(true);
    expect(result.updates.map((update) => update.revision)).toEqual(
      result.updates.map((_, index) => index + record.revision + 1),
    );
    const reread = await service.get({
      battleId: battle.id,
      userId,
      sinceRevision: record.revision,
    });
    expect(reread.updates).toEqual(result.updates);
    expect(reread.view).toEqual(result.view);
  });

  it("advances an NPC opening turn before returning the battle", async () => {
    const { service } = makeService({ npcAction: () => ({ action: "skipTurn" }) });
    const { battle } = createMockBattle({
      team1Party: createMockPokemonParty({
        size: 1,
        speciesIds: [pokemonIdEnum.BULBASAUR],
      }),
      team2Party: createMockPokemonParty({
        size: 1,
        speciesIds: [pokemonIdEnum.PIKACHU],
      }),
    });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));

    const started = await service.start({ battle });

    expect(started.revision).toBeGreaterThan(0);
    expect(started.view.activePokemonId).toBeTruthy();
    const current = await service.get({ battleId: battle.id, userId, sinceRevision: 0 });
    expect(current.updates.every((update) => update.requestId.startsWith("npc:"))).toBe(true);
  });

  it("returns the latest state for a stale participant action", async () => {
    const { service } = makeService({ npcAction: () => ({ action: "skipTurn" }) });
    const { battle } = createMockBattle();
    const record = await service.start({ battle });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));

    const first = await service.act({
      battleId: battle.id,
      userId,
      expectedRevision: record.revision,
      requestId: "first",
      action: { action: "skipTurn" },
    });
    const stale = await service.act({
      battleId: battle.id,
      userId,
      expectedRevision: record.revision,
      requestId: "stale",
      action: { action: "skipTurn" },
    });

    expect(first.accepted).toBe(true);
    expect(stale).toEqual(
      expect.objectContaining({
        accepted: false,
        reason: "stale_revision",
        revision: first.revision,
        view: first.view,
      }),
    );
    expect(
      await service.act({
        battleId: battle.id,
        userId: "stranger",
        expectedRevision: first.revision,
        requestId: "unauthorized",
        action: { action: "skipTurn" },
      }),
    ).toEqual({ accepted: false, reason: "battle_not_found" });
  });

  it("keeps an expired result readable only during its retention window", async () => {
    let now = new Date("2026-01-01T00:00:00.000Z");
    const store = new BattleStore(new MemoryBattleCollection(), { now: () => now });
    const service = new BattleService(store);
    const { battle } = createMockBattle();
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    await service.start({
      battle,
      idleTimeoutMs: 500,
      resultRetentionMs: 1000,
    });

    now = new Date(now.getTime() + 600);
    const expired = await service.get({ battleId: battle.id, userId });
    expect(expired).toEqual(expect.objectContaining({ found: true, status: "expired" }));
    expect(await service.listActive(userId)).toEqual([]);

    now = new Date(now.getTime() + 1001);
    expect(await service.get({ battleId: battle.id, userId })).toEqual({
      found: false,
    });
  });
});
