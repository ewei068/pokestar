const { createMockBattle } = require("../../../__testing__/mocks/battle");
const { BattleStore } = require("../BattleStore");
const { restoreBattle } = require("../battleRecord");
const {
  createMockPokemonParty,
} = require("../../../__testing__/mocks/pokemon");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");

const createStore = () => new BattleStore(new MemoryBattleCollection());

describe("BattleStore", () => {
  it("recovers a battle from its stored setup and actions", async () => {
    const store = createStore();
    const { battle } = createMockBattle();
    const created = await store.create({ battle, mode: { type: "pve" } });

    expect(created.revision).toBe(0);
    expect(created.setup.initialParams.id).toBe(battle.id);
    expect(created.participantIds).toHaveLength(1);
    expect((await store.listActive(created.participantIds[0]))).toHaveLength(1);

    for (let revision = 0; revision < 3; revision += 1) {
      const record = await store.get(battle.id);
      const active = restoreBattle(record).activePokemon;
      const result = await store.submit({
        battleId: battle.id,
        actorUserId: active.userId,
        expectedRevision: revision,
        requestId: `turn-${revision}`,
        action: { action: "skipTurn" },
      });
      expect(result.accepted).toBe(true);
      expect(result.revision).toBe(revision + 1);
    }

    const stored = await store.get(battle.id);
    const recovered = restoreBattle(stored);
    expect(stored.actions).toHaveLength(3);
    expect(recovered.takeSnapshot()).toEqual(stored.view);
    expect(recovered.actions).toEqual(stored.actions.map((entry) => entry.action));
  });

  it("replays a seeded move outcome from a serialized starting party", async () => {
    const store = createStore();
    const { battle } = createMockBattle();
    await store.create({ battle });
    const source = battle.activePokemon;
    const move = Object.keys(source.moveIds)
      .map((moveId) => ({
        moveId,
        target: battle.getEligibleTargets(
          source,
          /** @type {MoveIdEnum} */ (moveId),
        )[0],
      }))
      .find(({ target }) => target);
    expect(move).toBeDefined();

    const result = await store.submit({
      battleId: battle.id,
      actorUserId: source.userId,
      expectedRevision: 0,
      requestId: "move-1",
      action: {
        action: "useMove",
        moveId: move.moveId,
        targetPokemonId: move.target.id,
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.update.events.some((event) => event.type === "moveStarted")).toBe(true);
    expect(restoreBattle(await store.get(battle.id)).takeSnapshot()).toEqual(result.view);
  });

  it("accepts one concurrent revision and returns the latest state to the loser", async () => {
    const store = createStore();
    const { battle } = createMockBattle();
    await store.create({ battle });
    const actorUserId = battle.activePokemon.userId;
    const request = (requestId) =>
      store.submit({
        battleId: battle.id,
        actorUserId,
        expectedRevision: 0,
        requestId,
        action: { action: "skipTurn" },
      });

    const outcomes = await Promise.all([request("discord"), request("web")]);

    expect(outcomes.filter((outcome) => outcome.accepted)).toHaveLength(1);
    expect(outcomes.filter((outcome) => !outcome.accepted)).toEqual([
      expect.objectContaining({ reason: "stale_revision", revision: 1 }),
    ]);
    expect((await store.get(battle.id)).actions).toHaveLength(1);
  });

  it("deduplicates a retried request without advancing twice", async () => {
    const store = createStore();
    const { battle } = createMockBattle();
    await store.create({ battle });
    const args = {
      battleId: battle.id,
      actorUserId: battle.activePokemon.userId,
      expectedRevision: 0,
      requestId: "same-request",
      action: { action: "skipTurn" },
    };

    const first = await store.submit(args);
    expect(first.update.actorUserId).toBe(args.actorUserId);
    expect(first.update.action).toEqual(args.action);
    const storedAfterFirst = await store.get(battle.id);
    expect(storedAfterFirst.actions[0].actorUserId).toBe(args.actorUserId);
    expect(storedAfterFirst.actions[0].action).toEqual(args.action);
    const retry = await store.submit(args);

    expect(first.accepted).toBe(true);
    expect(retry).toEqual(expect.objectContaining({ accepted: true, duplicate: true }));
    expect(retry.update).toEqual(first.update);
    expect((await store.get(battle.id)).revision).toBe(1);

    const conflict = await store.submit({
      ...args,
      action: { action: "useMove", moveId: "m1", targetPokemonId: "other" },
    });
    expect(conflict).toEqual(
      expect.objectContaining({
        accepted: false,
        reason: "request_id_conflict",
        revision: 1,
      }),
    );
  });

  it("rejects an invalid action with the stored view", async () => {
    const store = createStore();
    const { battle } = createMockBattle();
    const record = await store.create({ battle });

    const result = await store.submit({
      battleId: battle.id,
      actorUserId: battle.activePokemon.userId,
      expectedRevision: 0,
      requestId: "bad-move",
      action: { action: "useMove", moveId: "unknown", targetPokemonId: "unknown" },
    });

    expect(result).toEqual({
      accepted: false,
      reason: "invalid_action",
      revision: 0,
      view: record.view,
    });
    expect((await store.get(battle.id)).actions).toEqual([]);
  });

  it("refuses to replay a different ruleset", async () => {
    const store = createStore();
    const { battle } = createMockBattle();
    await store.create({ battle });
    const record = await store.get(battle.id);
    record.rulesetVersion += 1;

    expect(() => restoreBattle(record)).toThrow("Unsupported battle ruleset");
  });

  it("rejects callback-backed phases until a durable mode handler is supplied", async () => {
    const store = createStore();
    const { battle } = createMockBattle();
    battle.users[battle.userIds[0]].nextPhase = () => false;

    await expect(store.create({ battle })).rejects.toThrow(
      "Battle phase callbacks need a durable mode handler",
    );
  });

  it("closes an inactive battle at the earlier mode deadline without rewards", async () => {
    let now = new Date("2026-01-01T00:00:00.000Z");
    const store = new BattleStore(new MemoryBattleCollection(), { now: () => now });
    const { battle } = createMockBattle();
    const modeDeadlineAt = new Date(now.getTime() + 500);
    const created = await store.create({
      battle,
      idleTimeoutMs: 1000,
      modeDeadlineAt,
      resultRetentionMs: 2000,
    });
    expect(created.expiresAt).toEqual(modeDeadlineAt);

    now = new Date(now.getTime() + 600);
    const expired = await store.get(battle.id);
    expect(expired.status).toBe("expired");
    expect(expired.resultExpiresAt).toEqual(new Date(now.getTime() + 2000));
    expect(await store.listActive(created.participantIds[0])).toEqual([]);
    expect(
      await store.submit({
        battleId: battle.id,
        actorUserId: battle.activePokemon.userId,
        expectedRevision: 0,
        requestId: "late",
        action: { action: "skipTurn" },
      }),
    ).toEqual(
      expect.objectContaining({ accepted: false, reason: "battle_expired" }),
    );
  });

  it("extends inactivity expiry after an accepted action", async () => {
    let now = new Date("2026-01-01T00:00:00.000Z");
    const store = new BattleStore(new MemoryBattleCollection(), { now: () => now });
    const { battle } = createMockBattle();
    await store.create({ battle, idleTimeoutMs: 1000 });
    now = new Date(now.getTime() + 500);

    const result = await store.submit({
      battleId: battle.id,
      actorUserId: battle.activePokemon.userId,
      expectedRevision: 0,
      requestId: "before-timeout",
      action: { action: "skipTurn" },
    });

    expect(result.accepted).toBe(true);
    expect((await store.get(battle.id)).expiresAt).toEqual(
      new Date(now.getTime() + 1000),
    );
    now = new Date(now.getTime() + 600);
    expect((await store.get(battle.id)).status).toBe("active");
  });

  it("claims completed rewards once and starts result retention after processing", async () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const store = new BattleStore(new MemoryBattleCollection(), { now: () => now });
    const { battle, team2 } = createMockBattle({
      team1Party: createMockPokemonParty({ size: 1 }),
      team2Party: createMockPokemonParty({ size: 1 }),
    });
    team2.party.pokemons[0].remainingHp = 1;
    battle.parties.Team2.pokemons[0].hp = 1;
    await store.create({ battle, resultRetentionMs: 1000 });
    const source = battle.activePokemon;
    const target = battle.parties.Team2.pokemons[0];

    const result = await store.submit({
      battleId: battle.id,
      actorUserId: source.userId,
      expectedRevision: 0,
      requestId: "last-hit",
      action: { action: "useMove", moveId: "m33", targetPokemonId: target.id },
    });

    expect(result.accepted).toBe(true);
    const completed = await store.get(battle.id);
    expect(completed.status).toBe("completed");
    expect(completed.completionStatus).toBe("pending");
    expect(completed.resultExpiresAt).toBeNull();
    expect(await store.listActive(team2.trainer.userId)).toEqual([]);
    expect(restoreBattle(completed).ended).toBe(true);

    const claims = await Promise.all([
      store.claimCompletion(battle.id, "claim-a"),
      store.claimCompletion(battle.id, "claim-b"),
    ]);
    expect(claims).toEqual([true, false]);
    await expect(
      store.finishCompletion(battle.id, "claim-b", { summary: "wrong owner" }),
    ).rejects.toThrow("Lost completion claim");
    await store.finishCompletion(battle.id, "claim-a", { summary: "Done" });
    const applied = await store.get(battle.id);
    expect(applied.completionStatus).toBe("applied");
    expect(applied.completionSummary).toBe("Done");
    expect(applied.resultExpiresAt).toEqual(new Date(now.getTime() + 1000));
  });

  it("replays a phase transition from queued generated Pokémon", async () => {
    const store = createStore();
    const { battle, team2 } = createMockBattle({
      team1Party: createMockPokemonParty({ size: 1 }),
      team2Party: createMockPokemonParty({ size: 1 }),
    });
    team2.party.pokemons[0].remainingHp = 1;
    battle.parties.Team2.pokemons[0].hp = 1;
    const nextParty = createMockPokemonParty({ size: 1 });
    const npcUserId = team2.trainer.userId;
    battle.users[npcUserId].nextPhase = () => {
      throw new Error("The callback should not run");
    };
    battle.setPhaseQueue(npcUserId, [nextParty]);
    await store.create({ battle, mode: { type: "dungeon" } });
    const targetId = battle.parties.Team2.pokemons[0].id;

    const result = await store.submit({
      battleId: battle.id,
      actorUserId: battle.activePokemon.userId,
      expectedRevision: 0,
      requestId: "phase-hit",
      action: { action: "useMove", moveId: "m33", targetPokemonId: targetId },
    });

    expect(result.accepted).toBe(true);
    expect(result.update.events.some((event) => event.type === "phaseStarted")).toBe(true);
    const restored = restoreBattle(await store.get(battle.id));
    expect(restored.phaseIndices[npcUserId]).toBe(1);
    expect(restored.parties.Team2.pokemons[0].id).toBe(nextParty.pokemons[0]._id);
    expect(restored.takeSnapshot()).toEqual(result.view);
  });
});
