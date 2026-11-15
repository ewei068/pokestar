// Generate projections from the real transform rules. The study has no database.
const path = require("node:path");
const source = (file) => path.join(__dirname, "../../../src", file);

require.cache[require.resolve(source("database/mongoHandler"))] = {
  exports: new Proxy({}, {
    get: (_, key) => () => { throw new Error(`Study attempted database operation ${key}`); },
  }),
};

const { initialize } = require(source("battle/data/initialize"));
const { getAbility } = require(source("battle/data/abilityRegistry"));
const { getMove } = require(source("battle/data/moveRegistry"));
const { pokemonConfig, typeConfig } = require(source("config/pokemonConfig"));
const { calculatePokemonStats, transformPokemon } = require(source("services/pokemon"));
const { getAbilityOrder, getMoveIds } = require(source("utils/pokemonUtils"));
const { getTransformChoices } = require(source("services/pokemonTransform"));

initialize(true);

function project(pokemon) {
  const species = pokemonConfig[pokemon.speciesId];
  return {
    id: pokemon.speciesId,
    species: species.name,
    name: pokemon.name,
    level: pokemon.level,
    sprite: pokemon.shiny ? species.shinySprite : species.sprite,
    types: species.type.map(id => typeConfig[id].name),
    stats: pokemon.stats,
    power: pokemon.combatPower,
    ability: getAbility(pokemon.abilityId)?.name,
    moves: getMoveIds(pokemon).map(id => getMove(id).name),
  };
}

function buildFixture(speciesId, level, name, options = {}) {
  const species = pokemonConfig[speciesId];
  const original = calculatePokemonStats({
    _id: "study-owned-pokemon",
    speciesId, level, name: name ?? species.name,
    natureId: "0", abilityId: getAbilityOrder(species.abilities)[0],
    ivs: [31, 28, 26, 31, 24, 30], evs: [0, 0, 0, 152, 0, 96],
    ...options,
  }, species);
  const seen = new Set();

  function visit(pokemon) {
    if (seen.has(pokemon.speciesId)) return;
    seen.add(pokemon.speciesId);
    const entries = getTransformChoices(pokemon.speciesId).map(choice => ({
      id: choice.targetSpeciesId, level: choice.requiredLevel, cost: choice.cost, kind: choice.kind,
    }));
    const transforms = entries.map(({ id }) => transformPokemon({ ...pokemon }, id));
    builds[pokemon.speciesId] = {
      current: project(pokemon),
      choices: entries.map((entry, index) => ({ ...entry, target: project(transforms[index]) })),
    };
    transforms.forEach(visit);
  }

  const builds = {};
  visit(original);
  return { start: speciesId, builds };
}

const eevee = buildFixture("133", 30);
const rotom = buildFixture("479", 40);
module.exports = {
  eevee,
  rotom,
  "return-form": buildFixture("10009", 40, "Circuit"),
  locked: buildFixture("5", 33),
  empty: buildFixture("6", 38),
  poor: { ...rotom, money: 1200 },
  slow: eevee,
  stale: rotom,
  unknown: rotom,
  failed: rotom,
  loading: eevee,
  "load-error": eevee,
  long: buildFixture("479", 40, "Professor Sparkplug the Magnificent", { shiny: true, moveIds: ["m268", "m247", "m435", "m87"] }),
};
