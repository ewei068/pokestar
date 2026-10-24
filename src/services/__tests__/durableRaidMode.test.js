const { raidConfig } = require("../../config/npcConfig");
const { createMockTrainer } = require("../../__testing__/mocks/trainer");
const { captureBattleSetup } = require("../../battle/persistence/battleRecord");
const { generateRandomPokemon } = require("../gacha");
const { createRaidBattle, applyDurableRaidCompletion } = require("../raid");
const { isDurableRaidEnabled } = require("../durableBattle");

describe("durable raid mode", () => {
  it("requires a separate raid opt-in", () => {
    const priorBattles = process.env.DURABLE_BATTLES_ENABLED;
    const priorRaids = process.env.DURABLE_RAIDS_ENABLED;
    try {
      process.env.DURABLE_BATTLES_ENABLED = "true";
      process.env.DURABLE_RAIDS_ENABLED = "false";
      expect(isDurableRaidEnabled()).toBe(false);
      process.env.DURABLE_RAIDS_ENABLED = "true";
      expect(isDurableRaidEnabled()).toBe(true);
    } finally {
      if (priorBattles === undefined) delete process.env.DURABLE_BATTLES_ENABLED;
      else process.env.DURABLE_BATTLES_ENABLED = priorBattles;
      if (priorRaids === undefined) delete process.env.DURABLE_RAIDS_ENABLED;
      else process.env.DURABLE_RAIDS_ENABLED = priorRaids;
    }
  });

  it("captures an active raid's starting HP and instance ID without callbacks", () => {
    const [raidId, raidData] = Object.entries(raidConfig)[0];
    const difficulty = Object.keys(raidData.difficulties)[0];
    const bossData = raidData.difficulties[difficulty].pokemons.find(
      (pokemon) => pokemon.speciesId === raidData.boss,
    );
    const generatedBoss = generateRandomPokemon("raid-npc", raidData.boss, bossData.level);
    const boss = {
      ...generatedBoss,
      _id: "boss-1",
      remainingHp: generatedBoss.stats[0],
    };
    const raid = {
      raidId,
      difficulty,
      raidUserId: "raid-npc",
      boss,
    };
    const trainer = createMockTrainer();
    const state = { raidInstanceId: "raid-1" };

    const { battle, mode } = createRaidBattle({
      raid,
      state,
      user: trainer.trainer.user,
      trainer: trainer.trainer,
      party: trainer.party.pokemons,
      durable: true,
    });

    expect(mode).toEqual({
      type: "raid",
      raidInstanceId: "raid-1",
      participantId: trainer.trainer.userId,
      startingHp: boss.remainingHp,
    });
    expect(battle.winCallback).toBeNull();
    expect(battle.loseCallback).toBeNull();
    expect(() => captureBattleSetup(battle)).not.toThrow();
  });

  it("rejects a completion descriptor for a missing participant", async () => {
    await expect(
      applyDurableRaidCompletion(
        /** @type {Battle} */ (/** @type {unknown} */ ({ users: {}, log: [] })),
        { participantId: "missing", raidInstanceId: "raid-1", startingHp: 1 },
      ),
    ).rejects.toThrow("Stored raid participant is missing");
  });
});
