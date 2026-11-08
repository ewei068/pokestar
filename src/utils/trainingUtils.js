const { MAX_TOTAL_EVS, MAX_SINGLE_EVS, pokemonConfig } = require("../config/pokemonConfig");
const { expMultiplier } = require("../config/trainerConfig");
const { locations, locationConfig } = require("../config/locationConfig");
const { getPokemonExpNeeded } = require("./pokemonUtils");

const TRAINING_LOCATION_IDS = Object.freeze([
  locations.HOME, locations.RESTAURANT, locations.GYM, locations.DOJO,
  locations.TEMPLE, locations.SCHOOL, locations.TRACK,
  locations.BERRY_BUSH, locations.BERRY_FARM,
]);

/**
 * Canonical progression math. The ordered clamps intentionally match the bot.
 * @param {Trainer} trainer
 * @param {Pokemon} pokemon
 * @param {number} baseExp
 * @param {StatArray} requestedEvs
 * @returns {{exp: number, evs: StatArray, level: number, gains: {exp: number, evs: StatArray}}}
 */
const calculateTrainingProgress = (trainer, pokemon, baseExp, requestedEvs) => {
  const evs = /** @type {StatArray} */ ([...(pokemon.evs || [0, 0, 0, 0, 0, 0])]);
  const gainedEvs = /** @type {StatArray} */ ([0, 0, 0, 0, 0, 0]);
  for (let i = 0; i < 6; i += 1) {
    const total = evs.reduce((a, b) => a + b, 0);
    if (total >= MAX_TOTAL_EVS && requestedEvs[i] > 0) break;
    if (evs[i] >= MAX_SINGLE_EVS && requestedEvs[i] > 0) {
      evs[i] = MAX_SINGLE_EVS;
      continue;
    }
    if (evs[i] <= 0 && requestedEvs[i] < 0) {
      evs[i] = 0;
      continue;
    }
    let delta = Math.min(requestedEvs[i], MAX_SINGLE_EVS - evs[i], MAX_TOTAL_EVS - total);
    if (evs[i] + delta < 0) delta = -evs[i];
    evs[i] += delta;
    gainedEvs[i] = delta;
  }
  const exp = Math.max(Math.floor(baseExp * expMultiplier(trainer.level) * (trainer.hasCelebi ? 2 : 1)), 1);
  const totalExp = (pokemon.exp || 0) + exp;
  let { level } = pokemon;
  const { growthRate } = pokemonConfig[pokemon.speciesId];
  while (totalExp >= getPokemonExpNeeded(level + 1, growthRate)) {
    if (level >= 100) break;
    level += 1;
  }
  return { exp: totalExp, evs, level, gains: { exp, evs: gainedEvs } };
};

/**
 * Null means the location is unsupported, unowned or has no configured level.
 * @param {Trainer} trainer
 * @param {string} locationId
 * @returns {{exp: number, evs: StatArray} | null}
 */
const getTrainingYield = (trainer, locationId) => {
  if (!TRAINING_LOCATION_IDS.some((id) => id === locationId)) return null;
  const level = trainer.locations?.[locationId] || 0;
  if (!level && locationId !== locations.HOME) return null;
  const config = level ? locationConfig[locationId].levelConfig[level] : { exp: 2, evs: /** @type {StatArray} */ ([0, 0, 0, 0, 0, 0]) };
  return config || null;
};

/**
 * @param {Trainer} trainer
 * @param {Pokemon} pokemon
 * @param {string} locationId
 * @returns {(ReturnType<typeof calculateTrainingProgress> & {canTrain: boolean}) | null}
 */
const previewTraining = (trainer, pokemon, locationId) => {
  const config = getTrainingYield(trainer, locationId);
  if (!config) return null;
  const result = calculateTrainingProgress(trainer, pokemon, config.exp, config.evs);
  return { ...result, canTrain: pokemon.level < 100 || result.gains.evs.some((delta) => delta !== 0) };
};

/**
 * @param {Trainer} trainer
 * @param {Pokemon} pokemon
 * @returns {Array<{id: LocationEnum, name: string, emoji: string, level: number, owned: boolean, nextGains: {exp: number, evs: StatArray}, canTrain: boolean}>}
 */
const projectTrainingLocations = (trainer, pokemon) => TRAINING_LOCATION_IDS.map((id) => {
  const preview = previewTraining(trainer, pokemon, id);
  return {
    id, name: locationConfig[id].name, emoji: locationConfig[id].emoji,
    level: trainer.locations?.[id] || 0, owned: Boolean(preview),
    nextGains: preview?.gains || { exp: 0, evs: /** @type {StatArray} */ ([0, 0, 0, 0, 0, 0]) },
    canTrain: Boolean(preview?.canTrain),
  };
});

module.exports = { calculateTrainingProgress, getTrainingYield, previewTraining, projectTrainingLocations };
