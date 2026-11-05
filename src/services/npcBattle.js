const { Battle } = require("../battle/engine/Battle");
const { BasicNPC } = require("../battle/engine/npcs");
const { npcConfig, difficultyConfig } = require("../config/npcConfig");
const { pokemonConfig } = require("../config/pokemonConfig");
const { backpackItemConfig } = require("../config/backpackConfig");
const { getTrainer } = require("./trainer");
const { validatePartyForBattle } = require("./party");

/**
 * @param {string} id
 * @param {boolean} ace
 */
const projectSpecies = (id, ace) => ({
  id, name: pokemonConfig[id].name, spriteUrl: pokemonConfig[id].sprite, ace,
});

/**
 * Catalog/progress reads use a lifecycle-normalized trainer and award no grant.
 * @param {Pick<Trainer, "defeatedNPCsToday">} trainer
 */
const projectNpcCatalog = (trainer) => Object.entries(npcConfig).map(([id, npc]) => {
  const difficulties = Object.entries(npc.difficulties).map(([difficulty, data]) => ({
    id: difficulty, name: difficultyConfig[difficulty].name,
    minLevel: data.minLevel, maxLevel: data.maxLevel + 1, count: data.numPokemon,
    species: [...new Set([data.aceId, ...data.pokemonIds])].map((speciesId) => projectSpecies(speciesId, speciesId === data.aceId)),
    dailyClaimed: Boolean(trainer.defeatedNPCsToday?.[id]?.includes(difficulty)),
    rewards: Object.values(data.dailyRewards?.backpack || {}).flatMap((category) =>
      Object.entries(category).map(([itemId, quantity]) => ({
        name: backpackItemConfig[itemId].name, quantity,
        icon: { "0": "poke-ball.png", "7": "mint.png", "8": "raid-pass.png" }[itemId] || null,
      }))),
  }));
  return { id, name: npc.name, displayName: ("displayName" in npc ? npc.displayName : npc.name).replaceAll("**", ""),
    spriteUrl: npc.sprite, catchphrase: npc.catchphrase,
    minLevel: Math.min(...difficulties.map((data) => data.minLevel)),
    maxLevel: Math.max(...difficulties.map((data) => data.maxLevel)), difficulties };
});

/**
 * Build from current server-owned data. Starting/presentation belong to callers.
 * @param {object} options
 * @param {import("./trainer").TrainerIdentity} options.user
 * @param {string} options.npcId
 * @param {string} options.difficulty
 * @param {object=} options.state Legacy Discord NPC action context.
 * @param {boolean=} options.refreshIdentity
 * @returns {Promise<{data: Battle | null, err: string | null, code?: string}>}
 */
const buildNpcBattle = async ({ user, npcId, difficulty, state = {}, refreshIdentity = true }) => {
  const npcData = Object.prototype.hasOwnProperty.call(npcConfig, npcId) ? npcConfig[npcId] : null;
  if (!npcData) return { data: null, err: "Invalid NPC!", code: "invalid_npc" };
  const settings = Object.prototype.hasOwnProperty.call(npcData.difficulties, difficulty) ? npcData.difficulties[difficulty] : null;
  if (!settings) return { data: null, err: `Difficulty doesn't exist for ${npcData.name}!`, code: "invalid_difficulty" };
  const current = await getTrainer(user, refreshIdentity);
  if (current.err || !current.data) return { data: null, err: current.err || "Trainer unavailable.", code: "trainer_unavailable" };
  const trainer = current.data;
  const party = await validatePartyForBattle(trainer);
  if (party.err) return { data: null, err: party.err, code: "invalid_party" };
  const npc = new BasicNPC(npcData, difficulty, state);
  npc.setPokemon(npcData, difficulty);
  const { autoBattleCost } = difficultyConfig[difficulty];
  const battle = new Battle({
    ...(settings.rewardMultipliers || difficultyConfig[difficulty].rewardMultipliers),
    dailyRewards: settings.dailyRewards, npcId, npcType: "pve", difficulty,
    canAuto: Boolean(trainer.hasDarkrai) && trainer.dreamCards >= autoBattleCost,
    autoBattleCost, shouldShowAutoBattle: Boolean(trainer.hasDarkrai),
  });
  battle.addTeam("NPC", true);
  battle.addTrainer(npc, npc.party.pokemons, "NPC", npc.party.rows, npc.party.cols);
  battle.addTeam("Player", false);
  battle.addTrainer(trainer, party.data, "Player");
  return { data: battle, err: null };
};

module.exports = { projectNpcCatalog, buildNpcBattle };
