jest.mock("../trainer", () => ({ getTrainer: jest.fn() }));
jest.mock("../party", () => ({ validatePartyForBattle: jest.fn() }));

const { dungeonConfig, dungeons, battleTowerConfig, npcConfig } = require("../../config/npcConfig");
const { createMockTrainer } = require("../../__testing__/mocks/trainer");
const { captureBattleSetup } = require("../../battle/persistence/battleRecord");
const { getIdFromTowerStage } = require("../../utils/battleUtils");
const { getTrainer } = require("../trainer");
const { validatePartyForBattle } = require("../party");
const { projectDungeonCatalog, projectTowerCatalog, startDungeon, startTower } = require("../playModes");

const flatten = (dungeon) => {
  const bosses = new Set(dungeon.bosses.map(String));
  const species = [];
  for (const phase of Object.values(dungeon.difficulties)[0].phases) {
    for (const pokemon of phase.pokemons) {
      const id = String(pokemon.speciesId);
      if (!species.some((entry) => entry.id === id)) species.push({ id, boss: bosses.has(id) });
    }
  }
  return species.sort((left, right) => Number(right.boss) - Number(left.boss));
};

test("dungeon catalog follows the menu order, subtitles, and one boss-first species list", () => {
  const catalog = projectDungeonCatalog();
  expect(catalog.map((dungeon) => dungeon.id)).toEqual(Object.values(dungeons));
  expect(catalog[0]).toMatchObject({ id: "mindTemple", subtitle: { icon: "knowledge-shard.png", text: "Knowledge Shards" } });
  expect(catalog.at(-1)).toMatchObject({ id: "mountCoronet", subtitle: { icon: "star-piece.png", text: "Event: All Shards" } });
  const altar = catalog.find((dungeon) => dungeon.id === "spiritAltar");
  const difficulty = altar.difficulties[0];
  expect(difficulty.phases).toBeUndefined();
  expect(difficulty.species.map(({ id, boss }) => ({ id, boss }))).toEqual(flatten(dungeonConfig.spiritAltar));
  expect(difficulty.species.filter((species) => species.boss).map((species) => species.id)).toEqual(
    dungeonConfig.spiritAltar.bosses.map(String));
  expect(new Set(difficulty.species.map((species) => species.id)).size).toBe(difficulty.species.length);
  expect(altar.rewardString).toBeUndefined();
});

test("tower catalog shows generated fight levels and reward marks", () => {
  const catalog = projectTowerCatalog();
  const floor1 = catalog.floors.find((floor) => floor.stage === 1);
  const floor20 = catalog.floors.find((floor) => floor.stage === 20);
  const bugCatcher = npcConfig[battleTowerConfig[1].npcId].difficulties[battleTowerConfig[1].difficulty];
  expect(floor1).toMatchObject({ minLevel: bugCatcher.minLevel, maxLevel: bugCatcher.maxLevel + 1 });
  expect(floor1.minLevel).toBe(42);
  expect(floor1.maxLevel).toBe(52);
  expect(floor1).not.toMatchObject({ minLevel: battleTowerConfig[1].minLevel, maxLevel: battleTowerConfig[1].maxLevel + 1 });
  expect(floor1.rewards).toEqual(expect.arrayContaining([
    { kind: "money", quantity: 250, label: "₽250" },
    { kind: "item", id: "0", name: "Pokeball", quantity: 5, icon: "poke-ball.png" },
  ]));
  const palmer = npcConfig[battleTowerConfig[20].npcId].difficulties[battleTowerConfig[20].difficulty];
  expect(floor20).toMatchObject({ minLevel: 100, maxLevel: 120 });
  expect(floor20.minLevel).toBe(palmer.minLevel);
  expect(floor20.rewards).toEqual(expect.arrayContaining([
    { kind: "money", quantity: 10000, label: "₽10,000" },
    { kind: "item", id: "3", name: "Masterball", quantity: 4, icon: "master-ball.png" },
  ]));
  expect(floor20.rewards.find((reward) => reward.kind === "item" && reward.id === "3").icon).toBe("master-ball.png");
});

beforeEach(() => { jest.clearAllMocks(); });

const { mindTemple } = dungeonConfig;
const [mindDifficulty] = Object.keys(mindTemple.difficulties);

const readyParty = () => {
  const mock = createMockTrainer();
  mock.trainer.lastTowerStage = 6;
  /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({ data: mock.trainer });
  /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ data: mock.party.pokemons });
  return mock;
};

test("a dungeon start always creates another battle with its phases and rewards", async () => {
  readyParty();
  const start = jest.fn()
    .mockResolvedValueOnce({ battleId: "dungeon-1" })
    .mockResolvedValueOnce({ battleId: "dungeon-2" });
  const first = await startDungeon({ userId: "trainer", dungeonId: "mindTemple", difficulty: mindDifficulty, start });
  const second = await startDungeon({ userId: "trainer", dungeonId: "mindTemple", difficulty: mindDifficulty, start });
  expect(first.battleId).toBe("dungeon-1");
  expect(second.battleId).toBe("dungeon-2");
  const { battle, mode } = start.mock.calls[0][0];
  expect(mode).toEqual({ type: "dungeon", dungeonId: "mindTemple", difficulty: mindDifficulty });
  expect(battle.rewards).toEqual(mindTemple.difficulties[mindDifficulty].rewards);
  expect(battle.rewardString).toBe(mindTemple.difficulties[mindDifficulty].rewardString || null);
  expect(battle.dailyRewards).toBeNull();
  expect(battle.npcType).toBe("dungeon");
  expect(battle.autoData).toMatchObject({ canAuto: false, shouldShowAutoBattle: false });
  expect(Object.values(captureBattleSetup(battle).phaseQueues)[0]).toHaveLength(
    mindTemple.difficulties[mindDifficulty].phases.length - 1);
});

test("party failures create no dungeon battle", async () => {
  readyParty();
  const start = jest.fn();
  for (const err of ["No Pokemon in party.", "Duplicate Pokemon.", "This Pokemon cannot battle."]) {
    /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValueOnce({ data: null, err });
    await expect(startDungeon({ userId: "trainer", dungeonId: "mindTemple", difficulty: mindDifficulty, start }))
      .resolves.toMatchObject({ code: "invalid_party", battleId: null });
  }
  expect(start).not.toHaveBeenCalled();
});

test("unknown dungeons and difficulties create nothing", async () => {
  readyParty();
  const start = jest.fn();
  await expect(startDungeon({ userId: "trainer", dungeonId: "missing", difficulty: mindDifficulty, start }))
    .resolves.toMatchObject({ code: "invalid_dungeon" });
  await expect(startDungeon({ userId: "trainer", dungeonId: "mindTemple", difficulty: "missing", start }))
    .resolves.toMatchObject({ code: "invalid_difficulty" });
  expect(validatePartyForBattle).not.toHaveBeenCalled();
  expect(start).not.toHaveBeenCalled();
});

test("the current tower floor returns the newest active battle and does not insert", async () => {
  readyParty();
  /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ data: null, err: "No Pokemon in party." });
  const records = [
    { _id: "older", updatedAt: "2026-11-01T00:00:00.000Z", mode: { type: "tower", stage: 7 } },
    { _id: "newer", updatedAt: "2026-11-02T00:00:00.000Z", mode: { type: "tower", stage: 7 } },
  ];
  const start = jest.fn();
  const result = await startTower({ userId: "trainer", stage: 7, listActive: async () => records, start });
  expect(result).toMatchObject({ battleId: "newer", err: null });
  expect(start).not.toHaveBeenCalled();
  expect(validatePartyForBattle).not.toHaveBeenCalled();
  expect(records).toHaveLength(2);
});

test("a current tower floor with no battle inserts that floor without daily rewards", async () => {
  readyParty();
  const start = jest.fn().mockResolvedValue({ battleId: "tower-7" });
  const result = await startTower({ userId: "trainer", stage: 7, listActive: async () => [], start });
  expect(result.battleId).toBe("tower-7");
  const { battle, mode } = start.mock.calls[0][0];
  expect(mode).toEqual({ type: "tower", stage: 7 });
  expect(battle.npcId).toBe(getIdFromTowerStage(7));
  expect(battle.npcType).toBe("battleTower");
  expect(battle.winCallback).toBeNull();
  expect(battle.dailyRewards).toBeNull();
  expect(battle.autoData).toMatchObject({ canAuto: false, shouldShowAutoBattle: false });
});

test("a floor that is not next is rejected before the party is checked", async () => {
  const mock = readyParty();
  const start = jest.fn();
  await expect(startTower({ userId: "trainer", stage: 8, listActive: async () => [], start }))
    .resolves.toMatchObject({ code: "tower_not_current" });
  mock.trainer.lastTowerStage = 20;
  await expect(startTower({ userId: "trainer", stage: 20, listActive: async () => [], start }))
    .resolves.toMatchObject({ code: "tower_not_current" });
  await expect(startTower({ userId: "trainer", stage: 21, listActive: async () => [], start }))
    .resolves.toMatchObject({ code: "invalid_stage" });
  expect(validatePartyForBattle).not.toHaveBeenCalled();
  expect(start).not.toHaveBeenCalled();
});
