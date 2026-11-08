const { getTrainer } = require("./trainer");
const { findOwnedPokemon, trainPokemon } = require("./pokemon");
const { previewTraining, projectTrainingLocations } = require("../utils/trainingUtils");

/**
 * @typedef {object} OwnedTrainingContext
 * @property {WithId<Trainer>} trainer
 * @property {WithId<Pokemon>} pokemon
 * @property {ReturnType<typeof projectTrainingLocations>} locations
 * @typedef {OwnedTrainingContext & {trained: boolean, gains: {exp: number, evs: StatArray}, previousLevel?: number, warning?: string}} OwnedTrainingResult
 */

class TrainingError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number=} status
   */
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * Fresh owned state is shared by both surfaces; projections stay with callers.
 * @param {Parameters<typeof getTrainer>[0]} user
 * @param {string} pokemonId
 * @param {boolean=} refreshIdentity
 * @returns {Promise<OwnedTrainingContext>}
 */
const getOwnedTrainingContext = async (user, pokemonId, refreshIdentity = false) => {
  if (typeof pokemonId !== "string" || !/^[a-f\d]{24}$/i.test(pokemonId)) {
    throw new TrainingError("pokemon_not_found", "Pokemon not found or Pokemon not owned by you.", 404);
  }
  const result = await getTrainer(user, refreshIdentity);
  if (result.err || !result.data) throw new TrainingError("trainer_unavailable", result.err || "Error getting trainer.", 503);
  const trainer = result.data;
  const pokemon = await findOwnedPokemon(trainer.userId, pokemonId);
  if (!pokemon) throw new TrainingError("pokemon_not_found", "Pokemon not found or Pokemon not owned by you.", 404);
  return { trainer, pokemon, locations: projectTrainingLocations(trainer, pokemon) };
};

/**
 * One operation, never retried. Discord permits its legacy level-100 command.
 * Participation rewards belong to the Discord handler or HTTP caller, once.
 * @param {Parameters<typeof getTrainer>[0]} user
 * @param {string} pokemonId
 * @param {string} locationId
 * @param {{stopWhenComplete?: boolean, refreshIdentity?: boolean}=} options
 * @returns {Promise<OwnedTrainingResult>}
 */
const trainOwnedPokemon = async (user, pokemonId, locationId, options = {}) => {
  const context = await getOwnedTrainingContext(user, pokemonId, options.refreshIdentity);
  const { trainer, pokemon } = context;
  const preview = previewTraining(trainer, pokemon, locationId);
  if (!preview) throw new TrainingError("invalid_training_location", "You don't own that location! View your locations with `/locations`, and buy more at the `/pokemart`!");
  if (options.stopWhenComplete !== false && !preview.canTrain) {
    return { ...context, trained: false, gains: { exp: 0, evs: [0, 0, 0, 0, 0, 0] } };
  }
  const previousLevel = pokemon.level;
  const result = await trainPokemon(trainer, pokemon, /** @type {LocationEnum} */ (locationId));
  if (result.err || !result.data) throw new TrainingError("training_changed", result.err || "Training could not be saved. Refresh before trying again.", 409);
  return { trainer, pokemon, locations: projectTrainingLocations(trainer, pokemon), previousLevel,
    trained: true, gains: { exp: result.data.exp, evs: result.data.evs },
    ...(result.warning ? { warning: result.warning } : {}) };
};

module.exports = { TrainingError, getOwnedTrainingContext, trainOwnedPokemon };
