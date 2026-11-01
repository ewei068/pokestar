// Design fixtures only. No database, sessions, API calls or gameplay writes.
const fs = require('node:fs');
const path = require('node:path');
// Legacy catalog modules import services at load time. Block that database seam
// before loading the catalog; no credential or connection is needed for a study.
require.cache[require.resolve('../../../src/database/mongoHandler')] = {
  exports: new Proxy({}, { get: () => () => { throw new Error('Database access is forbidden in design fixture generation.'); } }),
};
const { pokemonConfig, typeConfig, natureConfig } = require('../../../src/config/pokemonConfig');
require('../../../src/battle/data/initialize').initialize(true);
const { getMove } = require('../../../src/battle/data/moveRegistry');
const { getAbility } = require('../../../src/battle/data/abilityRegistry');
const { getHeldItems } = require('../../../src/battle/data/heldItemRegistry');
const { getPokemonExpNeeded } = require('../../../src/utils/pokemonUtils');
const heldItem = Object.values(getHeldItems({})).find(item => item.name === 'Leftovers');
const ids = ['25', '143', '448', '282', '9', '6', '445', '384', '94', '133', '3', '131', '10', '151'];
const records = ids.map((id, index) => {
  const species = pokemonConfig[id];
  const abilityId = Object.keys(species.abilities)[0];
  const ability = getAbility(abilityId);
  const level = [41, 42, 45, 43, 44, 46, 52, 58, 39, 18, 37, 36, 12, 55][index];
  const low = getPokemonExpNeeded(level, species.growthRate);
  const next = getPokemonExpNeeded(level + 1, species.growthRate);
  return {
    id: `67a1234567890abcdef000${String(index).padStart(3, '0')}`,
    speciesId: id, speciesName: species.name, name: species.name,
    description: species.description, sprite: index === 6 ? species.shinySprite : species.sprite,
    types: species.type.map(type => typeConfig[type].name), rarity: species.rarity,
    level, expProgress: Math.round((next - low) * 0.37), expToNext: next - low,
    shiny: index === 6, locked: index < 6, inParty: index < 6,
    power: 1260 + index * 137, ivs: [31, 28, 26, 31, 24, 30], evs: [0, 0, 0, 152, 0, 96],
    // Illustrative build values; this study does not calculate gameplay stats.
    stats: [146, 78, 63, 112, 79, 119], nature: natureConfig[index === 12 ? 0 : 10],
    ability: { name: ability?.name || String(abilityId), description: ability?.description || 'Not yet implemented!' },
    heldItem: index === 0 && heldItem ? { name: heldItem.name, description: heldItem.description } : null,
    moves: species.moveIds.slice(0, 4).map(moveId => {
      const move = getMove(moveId);
      return { name: move.name, description: move.description, type: typeConfig[move.type]?.name,
        power: move.power, accuracy: move.accuracy, cooldown: move.cooldown, damageType: move.damageType };
    }),
    equipment: index === 0 ? [{ name: 'Power Lens', level: 4, modifiers: ['Base SpA +6', 'Speed +8'] }] : [],
    dateAcquired: 'Oct 21, 2026', originalOwner: '123456789012345678',
  };
});
fs.writeFileSync(path.join(__dirname, 'fixtures.js'), `// Generated from shared catalog. Owned values are illustrative.\nconst pokemonFixtures = ${JSON.stringify(records, null, 2)};\n`);
console.log(`Generated ${records.length} design fixtures from the shared catalog.`);
// Use the arena's real alpha-bound alignment in this plain-browser study.
const ts = require('typescript');
const spriteSource = fs.readFileSync(path.join(__dirname, '../../../web/src/battles/arena/spriteLayout.ts'), 'utf8');
const spriteModule = ts.transpileModule(spriteSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
fs.writeFileSync(path.join(__dirname, 'sprite-layout.js'),
  '// Generated from web/src/battles/arena/spriteLayout.ts by generate-fixtures.cjs.\n' + spriteModule);
