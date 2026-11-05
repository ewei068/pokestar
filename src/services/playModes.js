const { dungeonConfig, dungeons, battleTowerConfig, npcConfig, difficultyConfig } = require("../config/npcConfig");
const { pokemonConfig } = require("../config/pokemonConfig");
const { backpackItemConfig } = require("../config/backpackConfig");
const { formatMoney } = require("../utils/utils");

const itemIcons = {
  0: "poke-ball.png",
  3: "master-ball.png",
  4: "knowledge-shard.png",
  5: "emotion-shard.png",
  6: "willpower-shard.png",
  7: "mint.png",
  8: "raid-pass.png",
};

/**
 * @param {string} id
 * @param {boolean} boss
 */
const projectSpecies = (id, boss) => ({
  id, name: pokemonConfig[id].name, spriteUrl: pokemonConfig[id].sprite, boss,
});

/**
 * @param {{ money?: number, backpack?: Record<string, Record<string, number>> }=} rewards
 */
const projectRewards = (rewards = {}) => {
  const rows = [];
  if (rewards.money) rows.push({ kind: "money", quantity: rewards.money, label: formatMoney(rewards.money) });
  for (const category of Object.values(rewards.backpack || {})) {
    for (const [itemId, quantity] of Object.entries(category)) {
      rows.push({
        kind: "item", id: itemId, name: backpackItemConfig[itemId].name, quantity,
        icon: itemIcons[itemId] || null,
      });
    }
  }
  return rows;
};

/**
 * One species list per difficulty. Bosses come first. Phases stay inside the battle.
 */
const projectDungeonCatalog = () => Object.values(dungeons).filter((id) => dungeonConfig[id]).map((id) => {
  const dungeon = dungeonConfig[id];
  const bosses = new Set(dungeon.bosses.map(String));
  const difficulties = Object.entries(dungeon.difficulties).map(([difficultyId, data]) => {
    const species = [];
    const levels = [];
    for (const phase of data.phases || []) {
      for (const pokemon of phase.pokemons) {
        const speciesId = String(pokemon.speciesId);
        levels.push(pokemon.level);
        if (!species.some((entry) => entry.id === speciesId)) species.push(projectSpecies(speciesId, bosses.has(speciesId)));
      }
    }
    species.sort((left, right) => Number(right.boss) - Number(left.boss));
    return {
      id: difficultyId, name: difficultyConfig[difficultyId].name,
      minLevel: Math.min(...levels), maxLevel: Math.max(...levels), species,
      rewards: projectRewards(data.rewards),
    };
  });
  return {
    id, name: dungeon.name,
    displayName: (dungeon.displayName || dungeon.name).replaceAll("**", ""),
    description: dungeon.description, spriteUrl: dungeon.sprite, subtitle: dungeon.subtitle || null,
    difficulties,
  };
});

/**
 * Floor levels come from the linked NPC difficulty, not the tower caption.
 */
const projectTowerCatalog = () => ({
  floors: Object.entries(battleTowerConfig).map(([stage, floor]) => {
    const npc = npcConfig[floor.npcId];
    const data = npc.difficulties[floor.difficulty];
    const species = [...new Set([data.aceId, ...data.pokemonIds])].map((id) => projectSpecies(String(id), String(id) === String(data.aceId)));
    return {
      stage: Number(stage), npcId: floor.npcId, npcName: npc.name, spriteUrl: npc.sprite,
      difficulty: floor.difficulty, difficultyName: difficultyConfig[floor.difficulty].name,
      minLevel: data.minLevel, maxLevel: data.maxLevel + 1, species,
      rewards: projectRewards(floor.rewards),
    };
  }).sort((left, right) => left.stage - right.stage),
});

module.exports = { projectDungeonCatalog, projectTowerCatalog };
