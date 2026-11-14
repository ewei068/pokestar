const { createHash } = require("node:crypto");
const { pokemonConfig } = require("../config/pokemonConfig");
const { collectionNames } = require("../config/databaseConfig");
const { findAndUpdateDocument } = require("../database/mongoHandler");
const { trainerEventEnum } = require("../enums/gameEnums");
const { getAvailableForms, getFormChangeCost } = require("../utils/pokemonUtils");
const { findOwnedPokemon, transformPokemon } = require("./pokemon");
const { getTrainer, emitTrainerEvent } = require("./trainer");

/**
 * @typedef {{kind: "evolve", targetSpeciesId: PokemonIdEnum, requiredLevel: number, cost: 0} |
 *   {kind: "form", targetSpeciesId: PokemonIdEnum, cost: number}} PokemonTransformChoice
 * @typedef {{kind: PokemonTransformChoice["kind"], targetSpeciesId: string, expectedVersion: string}} PokemonTransformRequest
 * @typedef {{trainer: WithId<Trainer>, pokemon: WithId<Pokemon>, previousName: string, targetSpeciesId: PokemonIdEnum}} PokemonTransformChange
 * @typedef {{data?: PokemonTransformChange, warning?: string, err?: string, code?: string, status?: number}} PokemonTransformResult
 */

/** @type {readonly (keyof Pokemon)[]} */
const previewFields = ["speciesId", "name", "level", "natureId", "abilityId", "ivs", "evs", "equipments", "moveIds", "shiny"];
const writeOptions = /** @type {const} */ ({ upsert: false, returnDocument: "after" });

/**
 * @param {PokemonIdEnum} speciesId
 * @returns {PokemonTransformChoice[]}
 */
const getTransformChoices = speciesId => {
  /** @type {PokemonTransformChoice[]} */
  const choices = [];
  for (const evolution of pokemonConfig[speciesId].evolution || []) {
    if (evolution.level && Object.prototype.hasOwnProperty.call(pokemonConfig, evolution.id)) {
      choices.push({ kind: "evolve", targetSpeciesId: /** @type {PokemonIdEnum} */ (evolution.id), requiredLevel: evolution.level, cost: 0 });
    }
  }
  for (const targetSpeciesId of getAvailableForms(speciesId)) {
    choices.push({ kind: "form", targetSpeciesId, cost: getFormChangeCost(speciesId) });
  }
  return choices;
};

/**
 * The confirmation compares the observed preview inputs and terms. The Mongo
 * filter then guards the same stored fields through the actual write.
 * @param {Pokemon} pokemon
 * @returns {string}
 */
const getTransformVersion = pokemon => createHash("sha256")
  .update(JSON.stringify([previewFields.map(field => pokemon[field]), getTransformChoices(pokemon.speciesId)]))
  .digest("hex");

/**
 * Shared owned transformation. Only a definite no-match can compensate a
 * known debit. Ambiguous writes return a refreshable outcome without replay.
 * @param {import("./trainer").TrainerIdentity} user
 * @param {string} id
 * @param {PokemonTransformRequest} input
 * @returns {Promise<PokemonTransformResult>}
 */
const changePokemonSpecies = async (user, id, input) => {
  if (!input || !["evolve", "form"].includes(input.kind) || typeof input.targetSpeciesId !== "string"
      || typeof input.expectedVersion !== "string" || !/^[0-9a-f]{64}$/.test(input.expectedVersion)) {
    return { err: "Invalid Pokémon change.", code: "invalid_transformation_request", status: 400 };
  }

  /** @type {WithId<Pokemon> | null} */
  let pokemon;
  /** @type {WithId<Trainer>} */
  let trainer;
  try {
    pokemon = await findOwnedPokemon(user.id, id);
    if (!pokemon) return { err: "Pokémon not found in your collection.", code: "pokemon_not_found", status: 404 };
    const loaded = await getTrainer(user, false);
    trainer = loaded.data;
    if (loaded.err || !trainer || trainer.userId !== user.id) throw new Error("trainer_unavailable");
  } catch {
    return { err: "Couldn't load this Pokémon.", code: "transformation_unavailable", status: 503 };
  }

  const stale = { err: "This Pokémon changed. Refresh and choose again.", code: "transformation_changed", status: 409 };
  if (getTransformVersion(pokemon) !== input.expectedVersion) return stale;
  const choice = getTransformChoices(pokemon.speciesId)
    .find(option => option.kind === input.kind && option.targetSpeciesId === input.targetSpeciesId);
  if (!choice) return { err: "This Pokémon can't change into that species or form.", code: "invalid_transformation_target", status: 400 };
  if (choice.kind === "evolve" && pokemon.level < choice.requiredLevel) {
    return { err: `Reach Lv. ${choice.requiredLevel} to evolve.`, code: "evolution_level_required", status: 400 };
  }
  const { cost, targetSpeciesId } = choice;
  if (cost && (!Number.isSafeInteger(trainer.money) || trainer.money < cost)) {
    return { err: "You don't have enough money to change form.", code: "insufficient_form_money", status: 409 };
  }

  const candidate = transformPokemon({ ...pokemon }, targetSpeciesId);
  const { speciesId, name, rarity, abilityId, battleEligible, stats, combatPower, ivTotal } = candidate;
  const filter = { _id: pokemon._id, userId: user.id };
  for (const field of previewFields) {
    filter[field] = pokemon[field] === undefined ? { $exists: false } : { $eq: pokemon[field] };
  }
  const trainerFilter = { _id: trainer._id, userId: user.id };

  /** @type {WithId<Pokemon>} */
  let savedPokemon;
  try {
    if (cost) {
      const debit = await findAndUpdateDocument(collectionNames.USERS, { ...trainerFilter, money: { $eq: trainer.money } },
        { $inc: { money: -cost } }, writeOptions);
      if (!debit.value) return { err: "Your money changed. Refresh and choose again.", code: "form_money_changed", status: 409 };
      trainer = /** @type {WithId<Trainer>} */ (debit.value);
    }

    const saved = await findAndUpdateDocument(collectionNames.USER_POKEMON, filter,
      { $set: { speciesId, name, rarity, abilityId, battleEligible, stats, combatPower, ivTotal } }, writeOptions);
    savedPokemon = /** @type {WithId<Pokemon>} */ (saved.value);
    if (!savedPokemon) {
      if (!cost) return stale;
      const refund = await findAndUpdateDocument(collectionNames.USERS, trainerFilter, { $inc: { money: cost } }, writeOptions);
      if (refund.value) return stale;
      throw new Error("form_refund_unconfirmed");
    }
  } catch {
    return { err: "Couldn't confirm the change. Refresh your Pokémon and money before trying again.",
      code: "transformation_uncertain", status: 503 };
  }

  const data = { trainer, pokemon: savedPokemon, previousName: pokemon.name, targetSpeciesId };
  if (choice.kind === "evolve") {
    try {
      const progress = await emitTrainerEvent(trainerEventEnum.EVOLVED_POKEMON, { trainer, pokemon: savedPokemon });
      if (!progress.err) return { data };
    } catch {
      // The Pokémon has already been saved.
    }
    return { data, warning: "Evolution saved, but quest progress could not be confirmed." };
  }
  return { data };
};

module.exports = { getTransformChoices, getTransformVersion, changePokemonSpecies };
