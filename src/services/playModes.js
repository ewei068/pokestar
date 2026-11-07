const { Battle } = require("../battle/engine/Battle");
const { DungeonNPC, TowerNPC } = require("../battle/engine/npcs");
const { dungeonConfig, dungeons, battleTowerConfig, npcConfig, difficultyConfig } = require("../config/npcConfig");
const { pokemonConfig } = require("../config/pokemonConfig");
const { backpackItemConfig } = require("../config/backpackConfig");
const { formatMoney } = require("../utils/utils");
const { getIdFromTowerStage } = require("../utils/battleUtils");
const { getTrainer } = require("./trainer");
const { validatePartyForBattle } = require("./party");

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
      const item = backpackItemConfig[itemId];
      rows.push({
        kind: "item", id: itemId, name: item.name, quantity,
        icon: "icon" in item ? item.icon : null,
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
    displayName: ("displayName" in dungeon ? dungeon.displayName : dungeon.name).replaceAll("**", ""),
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

/**
 * @param {string} code
 * @param {string} err
 */
const rejected = (code, err) => ({ battleId: null, err, code });

/**
 * @param {string} userId
 */
const loadTrainer = async (userId) => {
  const current = await getTrainer({ id: userId }, false);
  if (current.err || !current.data) return null;
  return current.data;
};

/**
 * Always inserts. A rematch is another battle.
 * @param {object} options
 * @param {string} options.userId
 * @param {string} options.dungeonId
 * @param {string} options.difficulty
 * @param {(input: { battle: Battle, mode: { type: "dungeon", dungeonId: string, difficulty: string } }) => Promise<{ battleId: string }>} options.start
 */
const startDungeon = async ({ userId, dungeonId, difficulty, start }) => {
  const dungeon = Object.prototype.hasOwnProperty.call(dungeonConfig, dungeonId) ? dungeonConfig[dungeonId] : null;
  if (!dungeon) return rejected("invalid_dungeon", "Invalid Dungeon!");
  const settings = Object.prototype.hasOwnProperty.call(dungeon.difficulties, difficulty) ? dungeon.difficulties[difficulty] : null;
  if (!settings) return rejected("invalid_difficulty", `Difficulty doesn't exist for ${dungeon.name}!`);
  const trainer = await loadTrainer(userId);
  if (!trainer) return rejected("trainer_unavailable", "Trainer unavailable.");
  const party = await validatePartyForBattle(trainer);
  if (party.err) return rejected("invalid_party", party.err);
  const npc = new DungeonNPC(dungeon, difficulty, {});
  npc.setPokemon();
  const battle = new Battle({
    ...(settings.rewardMultipliers || difficultyConfig[difficulty].rewardMultipliers),
    rewards: settings.rewards, rewardString: settings.rewardString, npcId: dungeonId, difficulty, npcType: "dungeon",
  });
  battle.addTeam("Dungeon", true);
  battle.addTrainer(npc, npc.party.pokemons, "Dungeon", npc.party.rows, npc.party.cols);
  battle.addTeam("Player", false);
  battle.addTrainer(trainer, party.data, "Player");
  battle.setPhaseQueue(npc.userId, npc.getRemainingPhaseParties());
  const started = await start({ battle, mode: { type: "dungeon", dungeonId, difficulty } });
  return { battleId: started.battleId, err: null };
};

/**
 * Newer updatedAt wins. An equal time uses the greater battle id.
 * listActive publishes battleId, not the stored _id.
 * @param {Array<{ battleId: string, updatedAt: string | Date, mode?: { type?: string, stage?: number } }>} records
 * @param {number} stage
 */
const newestTowerBattle = (records, stage) => records
  .filter((record) => record.mode?.type === "tower" && record.mode.stage === stage)
  .sort((left, right) => {
    const newer = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    return newer || String(right.battleId).localeCompare(String(left.battleId));
  })[0] || null;

/**
 * Returns the newest active battle for the next floor. Other floors create nothing.
 * @param {object} options
 * @param {string} options.userId
 * @param {number} options.stage
 * @param {(userId: string) => Promise<Array<{ battleId: string, updatedAt: string | Date, mode?: { type?: string, stage?: number } }>>} options.listActive
 * @param {(input: { battle: Battle, mode: { type: "tower", stage: number } }) => Promise<{ battleId: string }>} options.start
 */
const startTower = async ({ userId, stage, listActive, start }) => {
  if (!Object.prototype.hasOwnProperty.call(battleTowerConfig, stage)) return rejected("invalid_stage", "Invalid Battle Tower stage!");
  const trainer = await loadTrainer(userId);
  if (!trainer) return rejected("trainer_unavailable", "Trainer unavailable.");
  if (trainer.lastTowerStage + 1 !== stage) return rejected("tower_not_current", "You must complete the previous stage first!");
  const existing = newestTowerBattle(await listActive(userId), stage);
  if (existing) return { battleId: existing.battleId, err: null };
  const party = await validatePartyForBattle(trainer);
  if (party.err) return rejected("invalid_party", party.err);
  const floor = battleTowerConfig[stage];
  const settings = npcConfig[floor.npcId].difficulties[floor.difficulty];
  const npc = new TowerNPC(floor, floor.difficulty, {});
  npc.setPokemon(floor, floor.difficulty);
  const battle = new Battle({
    ...(settings.rewardMultipliers || difficultyConfig[floor.difficulty].rewardMultipliers),
    npcId: getIdFromTowerStage(stage), difficulty: floor.difficulty, winCallback: null, npcType: "battleTower",
  });
  battle.addTeam("Battle Tower", true);
  battle.addTrainer(npc, npc.party.pokemons, "Battle Tower", npc.party.rows, npc.party.cols);
  battle.addTeam("Player", false);
  battle.addTrainer(trainer, party.data, "Player");
  const started = await start({ battle, mode: { type: "tower", stage } });
  return { battleId: started.battleId, err: null };
};

module.exports = { projectDungeonCatalog, projectTowerCatalog, startDungeon, startTower };
