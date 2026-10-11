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

const makeService = (options = {}) => {
  const store = new BattleStore(new MemoryBattleCollection());
  return { store, service: new BattleService(store, options) };
};

describe("BattleService", () => {
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
});
