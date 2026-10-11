const { createMockBattle } = require("../../../__testing__/mocks/battle");
const { BattleStore } = require("../BattleStore");
const { restoreBattle } = require("../battleRecord");

class MemoryCollection {
  constructor() {
    this.documents = new Map();
  }

  async insertOne(document) {
    if (this.documents.has(document._id)) throw new Error("duplicate battle ID");
    this.documents.set(document._id, structuredClone(document));
    return { insertedId: document._id };
  }

  async findOne({ _id }) {
    const document = this.documents.get(_id);
    return document ? structuredClone(document) : null;
  }

  find({ participantIds, status }) {
    return {
      toArray: async () =>
        [...this.documents.values()]
          .filter(
            (document) =>
              document.participantIds.includes(participantIds) &&
              document.status === status,
          )
          .map((document) => structuredClone(document)),
    };
  }

  async updateOne(filter, update) {
    const document = this.documents.get(filter._id);
    if (
      !document ||
      document.revision !== filter.revision ||
      document.status !== filter.status
    ) {
      return { modifiedCount: 0 };
    }
    Object.assign(document, structuredClone(update.$set));
    document.actions.push(structuredClone(update.$push.actions));
    return { modifiedCount: 1 };
  }
}

const createStore = () => new BattleStore(new MemoryCollection());

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
});
