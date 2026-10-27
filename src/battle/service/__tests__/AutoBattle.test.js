const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  createMockPokemonParty,
} = require("../../../__testing__/mocks/pokemon");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../persistence/BattleStore");
const { restoreBattle } = require("../../persistence/battleRecord");
const { BattleService } = require("../BattleService");
const { projectBattleRecord } = require("../battleWebView");

const attack = (battle) =>
  battle.isNpc(battle.activePokemon.userId)
    ? { action: "skipTurn" }
    : {
        action: "useMove",
        moveId: "m33",
        targetPokemonId: battle.parties.Team2.pokemons[0].id,
      };

const prepare = async ({ enemyHp = 1, ...options } = {}) => {
  const collection = new MemoryBattleCollection();
  const store = new BattleStore(collection);
  const autoCharge = jest.fn().mockResolvedValue({ paid: true });
  const onCompleted = jest.fn().mockResolvedValue("Rewards granted");
  const service = new BattleService(store, {
    npcAction: () => ({ action: "skipTurn" }),
    autoAction: attack,
    autoEligibility: async () => ({ visible: true, enabled: true }),
    autoCharge,
    onCompleted,
    yieldAuto: () => Promise.resolve(),
    ...options,
  });
  const { battle, team2 } = createMockBattle({
    team1Party: createMockPokemonParty({ size: 1 }),
    team2Party: createMockPokemonParty({ size: 1 }),
  });
  if (enemyHp !== null) {
    team2.party.pokemons[0].remainingHp = enemyHp;
    battle.parties.Team2.pokemons[0].hp = enemyHp;
  }
  Object.assign(battle.initialParams, { autoBattleCost: 2 });
  const started = await service.start({ battle, mode: { type: "pve" } });
  const record = await store.get(battle.id);
  const request = {
    battleId: battle.id,
    userId: record.participantIds[0],
    expectedRevision: started.revision,
    requestId: "auto-one",
  };
  return {
    service,
    store,
    collection,
    request,
    autoCharge,
    onCompleted,
    record,
  };
};

describe("optimistic Auto battle", () => {
  it("commits a replayable action/event batch, charges once, and completes once across restart/retries", async () => {
    const { service, store, request, autoCharge, onCompleted } =
      await prepare();
    expect(await service.auto(request)).toEqual({
      accepted: true,
      duplicate: false,
    });
    const completed = await store.get(request.battleId);
    expect(completed.status).toBe("completed");
    expect(completed.completionStatus).toBe("applied");
    expect(autoCharge).toHaveBeenCalledTimes(1);
    expect(autoCharge).toHaveBeenCalledWith({
      userId: request.userId,
      cost: 2,
    });
    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(completed.actions.at(-1).revision).toBe(completed.revision);
    expect(
      completed.actions.some((entry) =>
        entry.events.some((event) => event.type === "moveStarted"),
      ),
    ).toBe(true);
    expect(restoreBattle(completed).takeSnapshot()).toEqual(completed.view);
    expect(
      projectBattleRecord(completed, request.userId, request.expectedRevision)
        .updates.length,
    ).toBeGreaterThan(0);
    const restarted = new BattleService(store, { onCompleted, autoCharge });
    expect(await restarted.auto(request)).toEqual({
      accepted: true,
      duplicate: true,
    });
    expect(autoCharge).toHaveBeenCalledTimes(1);
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it("preserves intermediate revisions and NPC actions in a multi-turn Auto replay", async () => {
    const { service, store, request } = await prepare({ enemyHp: null });
    expect(await service.auto(request)).toMatchObject({ accepted: true });
    const record = await store.get(request.battleId);
    const batch = record.actions.filter(
      (entry) => entry.revision > request.expectedRevision,
    );
    expect(batch.length).toBeGreaterThan(1);
    expect(batch.some((entry) => entry.actorUserId !== request.userId)).toBe(
      true,
    );
    expect(batch.map((entry) => entry.revision)).toEqual(
      batch.map((_, index) => request.expectedRevision + index + 1),
    );
    expect(restoreBattle(record).takeSnapshot()).toEqual(record.view);
    const response = projectBattleRecord(
      record,
      request.userId,
      request.expectedRevision,
    );
    expect(response.updates.slice(0, -1).every((update) => update.view)).toBe(
      true,
    );
  });

  it("yields to other event-loop work before running the simulation", async () => {
    const { service, request } = await prepare();
    service.yieldAuto = undefined;
    let heartbeat = false;
    service.autoAction = (battle) => {
      expect(heartbeat).toBe(true);
      return attack(battle);
    };
    const running = service.auto(request);
    setImmediate(() => {
      heartbeat = true;
    });
    expect(await running).toMatchObject({ accepted: true });
  });

  it("discards a simulation without charging if a manual action wins", async () => {
    const fixture = await prepare();
    const { service, store, request, autoCharge, onCompleted } = fixture;
    let advanced = false;
    service.yieldAuto = async () => {
      if (advanced) return;
      advanced = true;
      expect(
        await service.act({
          ...request,
          requestId: "manual",
          action: { action: "skipTurn" },
        }),
      ).toMatchObject({ accepted: true });
    };
    expect(await service.auto(request)).toMatchObject({
      accepted: false,
      reason: "stale_revision",
    });
    const record = await store.get(request.battleId);
    expect(record.actions.some((entry) => entry.requestId === "manual")).toBe(
      true,
    );
    expect(record.autoResult).toBeUndefined();
    expect(autoCharge).not.toHaveBeenCalled();
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("excludes a second Auto and an already-running manual write during payment", async () => {
    const { service, store, collection, request, autoCharge } = await prepare();
    const originalUpdate = collection.updateOne.bind(collection);
    let continueManual;
    const manualWait = new Promise((resolve) => {
      continueManual = resolve;
    });
    let manualReached;
    const manualReady = new Promise((resolve) => {
      manualReached = resolve;
    });
    collection.updateOne = async (filter, update) => {
      if (update.$push?.actions?.requestId === "manual-race") {
        manualReached();
        await manualWait;
      }
      return originalUpdate(filter, update);
    };
    const manual = store.submit({
      ...request,
      actorUserId: request.userId,
      requestId: "manual-race",
      action: { action: "skipTurn" },
    });
    await manualReady;
    autoCharge.mockImplementation(async () => {
      continueManual();
      expect(await manual).toMatchObject({
        accepted: false,
        reason: "auto_in_progress",
      });
      expect(
        await service.auto({ ...request, requestId: "auto-two" }),
      ).toMatchObject({ accepted: false, reason: "auto_in_progress" });
      const pending = await store.get(request.battleId);
      expect(
        projectBattleRecord(pending, request.userId).availableActions,
      ).toEqual({ canSkip: false, moves: [] });
      return { paid: true };
    });
    expect(await service.auto(request)).toMatchObject({ accepted: true });
    expect(autoCharge).toHaveBeenCalledTimes(1);
  });

  it("discards the result and releases the claim if the conditional debit fails", async () => {
    const { service, store, request, autoCharge, onCompleted, record } =
      await prepare();
    autoCharge.mockResolvedValue({
      paid: false,
      reason: "auto_payment_failed",
    });
    expect(await service.auto(request)).toMatchObject({
      accepted: false,
      reason: "auto_payment_failed",
    });
    const after = await store.get(request.battleId);
    expect(after.view).toEqual(record.view);
    expect(after.actions).toEqual(record.actions);
    expect(after.revision).toBe(record.revision);
    expect(after.autoCommit).toBeNull();
    expect(after.autoResult).toBeUndefined();
    expect(onCompleted).not.toHaveBeenCalled();
    // The battle remains playable after a known payment rejection.
    expect(
      await service.act({
        ...request,
        requestId: "after-failed-payment",
        action: { action: "skipTurn" },
      }),
    ).toMatchObject({ accepted: true });
  });

  it("retains an uncertain payment claim across restart instead of charging again", async () => {
    const { service, store, request, autoCharge, onCompleted, record } =
      await prepare();
    autoCharge.mockRejectedValue(new Error("payment connection lost"));
    expect(await service.auto(request)).toMatchObject({
      accepted: false,
      reason: "auto_requires_review",
    });
    const pending = await store.get(request.battleId);
    expect(pending.view).toEqual(record.view);
    expect(pending.autoCommit.error).toContain("payment connection lost");
    store.now = () => new Date(record.expiresAt.getTime() + 1000);
    const restarted = new BattleService(store, { autoCharge });
    expect(await restarted.auto(request)).toMatchObject({
      accepted: false,
      reason: "auto_in_progress",
    });
    expect((await store.get(request.battleId)).status).toBe("active");
    expect(autoCharge).toHaveBeenCalledTimes(1);
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("retains the claim if the final battle write fails after successful payment", async () => {
    const { service, store, collection, request, autoCharge, onCompleted } =
      await prepare();
    const original = collection.updateOne.bind(collection);
    collection.updateOne = (filter, update) => {
      if (update.$push?.actions?.$each)
        throw new Error("final write unavailable");
      return original(filter, update);
    };
    expect(await service.auto(request)).toMatchObject({
      accepted: false,
      reason: "auto_requires_review",
    });
    expect((await store.get(request.battleId)).autoCommit.error).toContain(
      "final write unavailable",
    );
    expect(await service.auto(request)).toMatchObject({
      accepted: false,
      reason: "auto_in_progress",
    });
    expect(autoCharge).toHaveBeenCalledTimes(1);
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("does not charge if the battle expires during simulation", async () => {
    const { service, store, request, autoCharge, record } = await prepare();
    service.yieldAuto = async () => {
      store.now = () => new Date(record.expiresAt.getTime() + 1);
    };
    expect(await service.auto(request)).toMatchObject({ accepted: false });
    expect((await store.get(request.battleId)).status).toBe("expired");
    expect(autoCharge).not.toHaveBeenCalled();
  });

  it("bounds unfinished simulations without changing or charging the battle", async () => {
    const { service, store, request, autoCharge, record } = await prepare({
      maxAutoActions: 3,
      autoAction: () => ({ action: "skipTurn" }),
    });
    expect(await service.auto(request)).toMatchObject({
      accepted: false,
      reason: "auto_action_limit",
    });
    expect((await store.get(request.battleId)).actions).toEqual(record.actions);
    expect(autoCharge).not.toHaveBeenCalled();
  });

  it("rejects unauthorized, stale, locked, and PvP requests before simulation/payment", async () => {
    const choose = jest.fn(attack);
    const { service, store, collection, request, autoCharge } = await prepare({
      autoAction: choose,
    });
    expect(
      await service.auto({ ...request, userId: "stranger" }),
    ).toMatchObject({ reason: "battle_not_found" });
    expect(
      await service.auto({ ...request, expectedRevision: -1 }),
    ).toMatchObject({ reason: "stale_revision" });
    service.autoEligibility = async () => ({
      visible: false,
      enabled: false,
      reason: "auto_not_unlocked",
    });
    expect(await service.auto(request)).toMatchObject({
      reason: "auto_not_unlocked",
    });
    collection.documents.get(request.battleId).setup.initialParams.isPvp = true;
    expect(await service.auto(request)).toMatchObject({
      reason: "auto_unsupported",
    });
    expect(choose).not.toHaveBeenCalled();
    expect(autoCharge).not.toHaveBeenCalled();
    expect((await store.get(request.battleId)).autoResult).toBeUndefined();
  });
});
