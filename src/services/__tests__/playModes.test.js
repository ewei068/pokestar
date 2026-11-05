const { dungeonConfig, dungeons, battleTowerConfig, npcConfig, difficultyConfig } = require("../../config/npcConfig");
const { projectDungeonCatalog, projectTowerCatalog } = require("../playModes");

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
  const palmer = npcConfig[battleTowerConfig[20].npcId].difficulties[difficultyConfig.veryHard ? "veryHard" : battleTowerConfig[20].difficulty];
  expect(floor20).toMatchObject({ minLevel: 100, maxLevel: 120 });
  expect(floor20.minLevel).toBe(palmer.minLevel);
  expect(floor20.rewards).toEqual(expect.arrayContaining([
    { kind: "money", quantity: 10000, label: "₽10,000" },
    { kind: "item", id: "3", name: "Masterball", quantity: 4, icon: "master-ball.png" },
  ]));
  expect(floor20.rewards.find((reward) => reward.kind === "item" && reward.id === "3").icon).toBe("master-ball.png");
});
