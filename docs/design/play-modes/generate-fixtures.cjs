// Design fixtures only. Prevent the legacy catalog from opening a database.
const fs = require('node:fs');
const path = require('path');
require.cache[require.resolve('../../../src/database/mongoHandler')] = {
  exports: new Proxy({}, { get: () => () => { throw new Error('Database access is forbidden in this study.'); } }),
};
const { dungeonConfig, dungeons, battleTowerConfig, npcConfig, difficultyConfig } = require('../../../src/config/npcConfig');
const { pokemonConfig } = require('../../../src/config/pokemonConfig');
const { backpackItemConfig } = require('../../../src/config/backpackConfig');

const icons = {
  '0': 'poke-ball.png', '4': 'knowledge-shard.png', '5': 'emotion-shard.png',
  '6': 'willpower-shard.png', '7': 'mint.png', '8': 'raid-pass.png',
};
const plain = value => String(value || '').replace(/<a?:[^:]+:\d+>/g, '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const pokemon = id => {
  const data = pokemonConfig[id];
  if (!data) return { id: String(id), name: `Pokémon ${id}`, sprite: '' };
  return { id: String(id), name: data.name, sprite: data.sprite || '' };
};
const rewardItems = rewards => {
  const items = [];
  if (rewards?.money) items.push({ kind: 'money', count: rewards.money, name: 'Money' });
  for (const category of Object.values(rewards?.backpack || {})) {
    for (const [id, count] of Object.entries(category)) {
      items.push({ kind: 'item', id, count, name: backpackItemConfig[id]?.name || id, icon: icons[id] || null });
    }
  }
  return items;
};
const roster = (phases, bosses) => {
  const seen = new Map();
  const levels = [];
  for (const phase of phases) {
    for (const member of phase.pokemons) {
      const id = String(member.speciesId);
      levels.push(member.level);
      const current = seen.get(id) || { ...pokemon(id), boss: false };
      if (bosses.has(id)) current.boss = true;
      seen.set(id, current);
    }
  }
  const species = [...seen.values()].sort((a, b) => Number(b.boss) - Number(a.boss));
  return { species, minLevel: Math.min(...levels), maxLevel: Math.max(...levels) };
};

const dungeonIds = Object.values(dungeons).filter(id => dungeonConfig[id]);
const dungeonFixtures = dungeonIds.map(id => {
  const dungeon = dungeonConfig[id];
  const bosses = new Set((dungeon.bosses || []).map(String));
  return {
    id,
    name: dungeon.name,
    displayName: plain(dungeon.displayName || dungeon.name),
    emoji: dungeon.emoji || '',
    sprite: dungeon.sprite || '',
    description: plain(dungeon.description),
    subtitle: dungeon.subtitle || null,
    bosses: [...bosses].map(pokemon),
    difficulties: Object.entries(dungeon.difficulties).map(([difficultyId, data]) => {
      const fight = roster(data.phases, bosses);
      return {
        id: difficultyId,
        name: difficultyConfig[difficultyId].name,
        minLevel: fight.minLevel,
        maxLevel: fight.maxLevel,
        species: fight.species,
        rewards: rewardItems(data.rewards),
        completionNote: data.rewardString ? plain(data.rewardString) : null,
      };
    }),
  };
});

const floorFixtures = Object.keys(battleTowerConfig).map(Number).sort((a, b) => a - b).map(stage => {
  const floor = battleTowerConfig[stage];
  const npc = npcConfig[floor.npcId];
  const fight = npc.difficulties[floor.difficulty];
  const pool = [...new Map(fight.pokemonIds.map(id => [String(id), pokemon(id)])).values()];
  return {
    stage,
    npcId: floor.npcId,
    name: npc.name,
    sprite: npc.sprite || '',
    emoji: npc.emoji || '',
    catchphrase: plain(npc.catchphrase),
    difficultyId: floor.difficulty,
    difficultyName: difficultyConfig[floor.difficulty].name,
    captionMin: floor.minLevel,
    captionMax: floor.maxLevel + 1,
    fightMin: fight.minLevel,
    fightMax: fight.maxLevel + 1,
    count: fight.numPokemon,
    ace: pokemon(fight.aceId),
    pool,
    rewards: rewardItems(floor.rewards),
  };
});

const mismatches = floorFixtures.filter(floor => floor.captionMin !== floor.fightMin || floor.captionMax !== floor.fightMax);
const output = `// Generated from dungeonConfig and battleTowerConfig. Player progress is illustrative.\nconst playModeFixtures = ${JSON.stringify({ dungeons: dungeonFixtures, floors: floorFixtures }, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, 'fixtures.js'), output);
console.log(`Dungeons: ${dungeonFixtures.map(dungeon => `${dungeon.displayName} · ${dungeon.subtitle?.text || 'no subtitle'}`).join(' | ')}`);
console.log(`Floors: ${floorFixtures.length}. Caption/fight mismatches: ${mismatches.length}.`);
if (mismatches.length) console.log(mismatches.slice(0, 8).map(floor => `#${floor.stage} ${floor.name} caption ${floor.captionMin}-${floor.captionMax} fight ${floor.fightMin}-${floor.fightMax}`).join('\n'));
