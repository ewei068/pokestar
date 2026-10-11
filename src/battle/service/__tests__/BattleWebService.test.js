const { createMockBattle } = require("../../../__testing__/mocks/battle");
const { createMockTrainer } = require("../../../__testing__/mocks/trainer");
const { createMockPokemonParty } = require("../../../__testing__/mocks/pokemon");
const { MemoryBattleCollection } = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../persistence/BattleStore");
const { BattleService } = require("../BattleService");
const { BattleWebService } = require("../BattleWebService");

const makeBattle = () => {
  const team1Party = createMockPokemonParty({ size: 2 });
  team1Party.pokemons[0].shiny = true;
  const team2Party = createMockPokemonParty({ size: 2 });
  const team2Trainer = createMockTrainer({ party: team2Party });
  const { battle, team1 } = createMockBattle({
    team1Party,
    team2Trainer,
  });
  battle.teams.Team2.isNpc = false;
  return { battle, user1: team1.trainer.userId, user2: team2Trainer.trainer.userId };
};

describe("BattleWebService", () => {
  it("returns legal moves and targets only to the active participant", async () => {
    const service = new BattleService(new BattleStore(new MemoryBattleCollection()));
    const web = new BattleWebService(service);
    const { battle, user1, user2 } = makeBattle();
    await service.start({ battle, mode: { type: "pvp", secret: "server-only" } });

    const { userId: activeUser } = battle.activePokemon;
    const otherUser = activeUser === user1 ? user2 : user1;
    const active = await web.get({ battleId: battle.id, userId: activeUser });
    const other = await web.get({ battleId: battle.id, userId: otherUser });
    const activePokemon = active.view.pokemon[active.view.activePokemonId];
    const opponent = Object.values(active.view.pokemon)
      .find((pokemon) => pokemon.teamName !== activePokemon.teamName);

    expect(active.isMyTurn).toBe(true);
    expect(active.availableActions.canSkip).toBe(true);
    expect(active.availableActions.moves.length).toBeGreaterThan(0);
    for (const move of active.availableActions.moves) {
      expect(activePokemon.moveIds[move.moveId]).toBeDefined();
      expect(move.targetPokemonIds.length).toBeGreaterThan(0);
    }
    expect(other.isMyTurn).toBe(false);
    expect(other.availableActions).toEqual({ canSkip: false, moves: [] });
    expect(opponent.moveIds).toBeUndefined();
    expect(opponent.abilityId).toBeUndefined();
    expect(opponent.heldItemId).toBeUndefined();
    expect(opponent.allStatData).toBeUndefined();
    expect(active.mode).toEqual({ type: "pvp" });
    expect(active.myTeamNames).toContain(activePokemon.teamName);
    expect(active.view.teams.Team1).toEqual({ rows: 3, cols: 4 });
    expect(Object.values(active.view.pokemon).some((pokemon) => pokemon.shiny)).toBe(true);
    expect(await web.get({ battleId: battle.id, userId: "stranger" })).toEqual({ found: false });
    expect(await web.listActive("stranger")).toEqual([]);
  });

  it("projects ordered action updates and the latest state on a stale submission", async () => {
    const service = new BattleService(new BattleStore(new MemoryBattleCollection()));
    const web = new BattleWebService(service);
    const { battle } = makeBattle();
    await service.start({ battle });
    const { userId } = battle.activePokemon;
    const current = await web.get({ battleId: battle.id, userId });

    const first = await web.act({
      battleId: battle.id,
      userId,
      expectedRevision: current.revision,
      requestId: "web-first",
      action: { action: "skipTurn" },
    });
    expect(first.accepted).toBe(true);
    expect(first.updates).toHaveLength(1);
    expect(first.updates[0].revision).toBe(current.revision + 1);
    expect(first.updates[0].events[0].type).toBe("actionStarted");
    expect(first.updates[0].requestId).toBeUndefined();
    expect(first.updates[0].actorUserId).toBeUndefined();

    const stale = await web.act({
      battleId: battle.id,
      userId,
      expectedRevision: current.revision,
      requestId: "web-stale",
      action: { action: "skipTurn" },
    });
    expect(stale).toEqual(expect.objectContaining({
      accepted: false,
      reason: "stale_revision",
      revision: first.revision,
    }));
    expect(stale.updates).toEqual(first.updates);
    expect(stale.view).toEqual(first.view);
    expect(await web.act({
      battleId: battle.id,
      userId: "stranger",
      expectedRevision: first.revision,
      requestId: "stranger",
      action: { action: "skipTurn" },
    })).toEqual({ accepted: false, reason: "battle_not_found" });
  });
});
