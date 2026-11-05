// Design fixtures only. Prevent the legacy catalog from opening a database.
const fs = require('node:fs');
const path = require('node:path');
require.cache[require.resolve('../../../src/database/mongoHandler')] = {
  exports: new Proxy({}, { get: () => () => { throw new Error('Database access is forbidden in this study.'); } }),
};
const { npcConfig, difficultyConfig } = require('../../../src/config/npcConfig');
const { pokemonConfig } = require('../../../src/config/pokemonConfig');
const { backpackItemConfig } = require('../../../src/config/backpackConfig');
const pokemon = id => ({ id, name: pokemonConfig[id].name, sprite: pokemonConfig[id].sprite });
const trainers = Object.entries(npcConfig).map(([id, npc]) => ({
  id, name: npc.name, displayName: (npc.displayName || npc.name).replaceAll('**', ''),
  sprite: npc.sprite, catchphrase: npc.catchphrase,
  difficulties: Object.entries(npc.difficulties).map(([id, data]) => ({
    id, name: difficultyConfig[id].name, minLevel: data.minLevel, maxLevel: data.maxLevel,
    count: data.numPokemon, ace: pokemon(data.aceId), pool: data.pokemonIds.map(pokemon),
    multipliers: data.rewardMultipliers || difficultyConfig[id].rewardMultipliers,
    dailyRewards: data.dailyRewards || null,
    dailyRewardLabels: Object.values(data.dailyRewards?.backpack || {}).flatMap(category =>
      Object.entries(category).map(([id, count]) => `${count} ${backpackItemConfig[id]?.name || id}${count > 1 ? 's' : ''}`)),
    rewardItems: Object.values(data.dailyRewards?.backpack || {}).flatMap(category =>
      Object.entries(category).map(([id, count]) => ({ id, count, name: backpackItemConfig[id]?.name || id,
        icon: { '0': 'poke-ball.png', '7': 'mint.png', '8': 'raid-pass.png' }[id] || null }))),
  })),
}));
fs.writeFileSync(path.join(__dirname, 'fixtures.js'),
  '// Shared NPC catalog; player progress and party are illustrative. Regenerate after catalog edits.\nconst npcFixtures = ' + JSON.stringify(trainers, null, 2) + ';\n');
console.log(`Generated ${trainers.length} NPC design fixtures without database access.`);
