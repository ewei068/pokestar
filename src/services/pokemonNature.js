const { natureConfig, pokemonConfig } = require("../config/pokemonConfig");
const { backpackItems } = require("../config/backpackConfig");
const { collectionNames } = require("../config/databaseConfig");
const { findAndUpdateDocument } = require("../database/mongoHandler");
const { getTrainer } = require("./trainer");
const { calculatePokemonStats, findOwnedPokemon } = require("./pokemon");
const { prepareBackpackChange, writeBackpackChange } = require("./backpack");

/**
 * @typedef {{data?: {trainer: WithId<Trainer>, pokemon: WithId<Pokemon>, changed: boolean}, err?: string, code?: string, status?: number}} PokemonNatureResult
 */

/**
 * Normalize only actual configured string/number identities, never coercible objects.
 * @param {unknown} id
 * @returns {string | null}
 */
const normalizeNatureId = (id) => {
  if (typeof id !== "string" && typeof id !== "number") return null;
  const key = String(id);
  return Object.prototype.hasOwnProperty.call(natureConfig, key) ? key : null;
};

/**
 * Canonical previews include the owned build's equipment and never persist.
 * @param {WithId<Pokemon>} pokemon
 * @returns {Array<{id: string, name: string, raisedStat: number | null, loweredStat: number | null, stats: number[]}>}
 */
const getNatureChoices = (pokemon) => Object.entries(natureConfig).map(([id, nature]) => {
  const raised = nature.stats.indexOf(1);
  const lowered = nature.stats.indexOf(-1);
  return { id, name: nature.name, raisedStat: raised < 0 ? null : raised,
    loweredStat: lowered < 0 ? null : lowered,
    stats: calculatePokemonStats({ ...pokemon, natureId: /** @type {NatureEnum} */ (id) }, pokemonConfig[pokemon.speciesId]).stats };
});

/**
 * One Mint buys a distinct nature. Participation grants belong to the adapter.
 * A thrown write may have applied, so it is never blindly reversed or retried.
 * @param {import("./trainer").TrainerIdentity} user
 * @param {string} pokemonId
 * @param {string | number} natureId
 * @param {string | number=} expectedNatureId
 * @returns {Promise<PokemonNatureResult>}
 */
const changePokemonNature = async (user, pokemonId, natureId, expectedNatureId) => {
  const selected = normalizeNatureId(natureId);
  if (selected === null) return { err: "Invalid nature selection.", code: "invalid_nature", status: 400 };
  if (typeof pokemonId !== "string" || !/^[a-f\d]{24}$/i.test(pokemonId)) {
    return { err: "Pokemon not found or Pokemon not owned by you.", code: "pokemon_not_found", status: 404 };
  }
  /** @type {WithId<Trainer>} */
  let trainer;
  /** @type {WithId<Pokemon> | null} */
  let pokemon;
  try {
    const result = await getTrainer(user, false);
    trainer = result.data;
    if (result.err || !trainer || trainer.userId !== user.id) return { err: result.err || "Error getting trainer.", code: "trainer_unavailable", status: 503 };
    pokemon = await findOwnedPokemon(user.id, pokemonId);
  } catch {
    return { err: "Could not load Pokemon. Refresh before trying again.", code: "pokemon_unavailable", status: 503 };
  }
  if (!pokemon) return { err: "Pokemon not found or Pokemon not owned by you.", code: "pokemon_not_found", status: 404 };
  const current = normalizeNatureId(pokemon.natureId);
  if (expectedNatureId !== undefined && (normalizeNatureId(expectedNatureId) === null || normalizeNatureId(expectedNatureId) !== current)) {
    return { err: "This Pokemon's nature changed. Refresh before trying again.", code: "nature_changed", status: 409 };
  }
  if (selected === current) return { data: { trainer, pokemon, changed: false } };
  const inventory = prepareBackpackChange(trainer, { [backpackItems.MINT]: -1 });
  if (!inventory) return { err: "You do not have a mint! Get them daily from `/pve palmer`.", code: "insufficient_mints", status: 400 };
  const candidate = calculatePokemonStats({ ...pokemon, natureId: /** @type {NatureEnum} */ (selected) }, pokemonConfig[pokemon.speciesId]);
  const filter = { userId: user.id, _id: pokemon._id };
  for (const field of ["exp", "level", "evs", "speciesId", "natureId", "ivs", "equipments"]) {
    filter[field] = pokemon[field] === undefined ? { $exists: false } : { $eq: pokemon[field] };
  }
  try {
    const savedTrainer = await writeBackpackChange(inventory);
    if (!savedTrainer) return { err: "Your Bag changed. Refresh before trying again.", code: "inventory_changed", status: 409 };
    const saved = await findAndUpdateDocument(collectionNames.USER_POKEMON, filter,
      { $set: { natureId: selected, stats: candidate.stats, combatPower: candidate.combatPower, ivTotal: candidate.ivTotal } },
      { upsert: false, returnDocument: "after" });
    if (saved.value) return { data: { trainer: savedTrainer, pokemon: /** @type {WithId<Pokemon>} */ (saved.value), changed: true } };
    if (await writeBackpackChange(inventory, true)) {
      return { err: "This Pokemon changed. Refresh before trying again.", code: "nature_changed", status: 409 };
    }
  } catch {
    // A lost response does not establish that either write failed.
  }
  return { err: "The change could not be confirmed. Refresh Pokemon and Bag before trying again.", code: "configuration_uncertain", status: 503 };
};

module.exports = { changePokemonNature, getNatureChoices };
