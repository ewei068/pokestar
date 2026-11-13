const { isDeepStrictEqual } = require("node:util");
const { pokemonConfig } = require("../config/pokemonConfig");
const { equipmentConfig, MAX_EQUIPMENT_LEVEL, levelUpCost, STAT_REROLL_COST, POKEDOLLAR_MULTIPLIER } = require("../config/equipmentConfig");
const { collectionNames } = require("../config/databaseConfig");
const { findAndUpdateDocument } = require("../database/mongoHandler");
const { drawIterable, drawUniform } = require("../utils/gachaUtils");
const { trainerEventEnum } = require("../enums/gameEnums");
const { getTrainer, emitTrainerEvent } = require("./trainer");
const { calculatePokemonStats, findOwnedPokemon } = require("./pokemon");
const { prepareBackpackChange, writeBackpackChange } = require("./backpack");

/**
 * @typedef {object} PokemonEquipmentChange
 * @property {WithId<Trainer>} trainer
 * @property {WithId<Pokemon>} pokemon
 * @property {true} changed
 * @property {Equipment} previousEquipment
 * @property {EquipmentTypeEnum} equipmentType
 * @property {EquipmentModifierSlotEnum=} slotId
 * @typedef {{data?: PokemonEquipmentChange, warning?: string, err?: string, code?: string, status?: number}} PokemonEquipmentResult
 */

/**
 * Validate persisted piece values before calculating or spending on them.
 * @param {Equipment} equipment
 * @param {EquipmentTypeEnum} equipmentType
 * @returns {boolean}
 */
const isEquipmentAvailable = (equipment, equipmentType) => Boolean(typeof equipmentType === "string"
  && Object.prototype.hasOwnProperty.call(equipmentConfig, equipmentType) && equipment && Number.isSafeInteger(equipment.level)
  && equipment.level >= 1 && equipment.level <= MAX_EQUIPMENT_LEVEL
  && equipment.slots && typeof equipment.slots === "object" && !Array.isArray(equipment.slots)
  && Object.keys(equipment.slots).length === Object.keys(equipmentConfig[equipmentType].slots).length
  && Object.entries(equipment.slots).every(([id, slot]) => {
    const configured = equipmentConfig[equipmentType].slots[id];
    return Object.prototype.hasOwnProperty.call(equipmentConfig[equipmentType].slots, id)
      && slot && typeof slot === "object" && configured.modifiers.includes(slot.modifier)
      && Number.isSafeInteger(slot.quality) && slot.quality >= 0 && slot.quality <= 100;
  }));

/**
 * A paid roll is successful even when it repeats the same modifier and quality.
 * Participation grants stay with adapters; quests follow confirmed persistence.
 * @param {import("./trainer").TrainerIdentity} user
 * @param {string} pokemonId
 * @param {EquipmentTypeEnum} equipmentType
 * @param {"upgrade" | "reroll"} kind
 * @param {EquipmentModifierSlotEnum | undefined} slotId
 * @param {Equipment | undefined} expectedEquipment
 * @returns {Promise<PokemonEquipmentResult>}
 */
const changeEquipment = async (user, pokemonId, equipmentType, kind, slotId, expectedEquipment) => {
  if (typeof equipmentType !== "string" || !Object.prototype.hasOwnProperty.call(equipmentConfig, equipmentType)) {
    return { err: "Invalid equipment selection.", code: "invalid_equipment", status: 400 };
  }
  const configured = equipmentConfig[equipmentType];
  if (kind === "reroll" && (typeof slotId !== "string" || !Object.prototype.hasOwnProperty.call(configured.slots, slotId))) {
    return { err: "Invalid equipment slot.", code: "invalid_equipment_slot", status: 400 };
  }
  if (typeof pokemonId !== "string" || !/^[a-f\d]{24}$/i.test(pokemonId)) {
    return { err: "Pokemon not found or Pokemon not owned by you.", code: "pokemon_not_found", status: 404 };
  }
  /** @type {WithId<Trainer>} */
  let trainer;
  /** @type {WithId<Pokemon> | null} */
  let pokemon;
  try {
    const loaded = await getTrainer(user, false);
    trainer = loaded.data;
    if (loaded.err || !trainer || trainer.userId !== user.id) {
      return { err: loaded.err || "Error getting trainer.", code: "trainer_unavailable", status: 503 };
    }
    pokemon = await findOwnedPokemon(user.id, pokemonId);
  } catch {
    return { err: "Could not load Pokemon. Refresh before trying again.", code: "pokemon_unavailable", status: 503 };
  }
  if (!pokemon) return { err: "Pokemon not found or Pokemon not owned by you.", code: "pokemon_not_found", status: 404 };
  const equipment = pokemon.equipments?.[equipmentType];
  if (!isEquipmentAvailable(equipment, equipmentType) || (kind === "reroll" && !Object.prototype.hasOwnProperty.call(equipment.slots, slotId))) {
    return { err: "This equipment or slot is unavailable.", code: "equipment_unavailable", status: 400 };
  }
  if (expectedEquipment !== undefined && !isDeepStrictEqual(expectedEquipment, equipment)) {
    return { err: "This equipment changed. Refresh before trying again.", code: "equipment_changed", status: 409 };
  }
  if (kind === "upgrade" && equipment.level >= MAX_EQUIPMENT_LEVEL) {
    return { err: "This equipment is already at maximum level.", code: "equipment_max_level", status: 409 };
  }
  const materialCost = kind === "upgrade" ? levelUpCost(equipment.level) : STAT_REROLL_COST;
  const moneyCost = materialCost * POKEDOLLAR_MULTIPLIER;
  const inventory = prepareBackpackChange(trainer, { [configured.material]: -materialCost });
  if (!inventory || !Number.isSafeInteger(trainer.money) || trainer.money < moneyCost) {
    return { err: "You don't have enough money or Shards.", code: "insufficient_equipment_resources", status: 400 };
  }
  const remainingMoney = trainer.money - moneyCost;
  inventory.filter.money = { $eq: trainer.money };
  inventory.afterFilter.money = { $eq: remainingMoney };
  inventory.update.$set.money = remainingMoney;
  inventory.inverse.$set ||= {};
  inventory.inverse.$set.money = trainer.money;

  const previousEquipment = structuredClone(equipment);
  const nextEquipment = structuredClone(equipment);
  if (kind === "upgrade") nextEquipment.level += 1;
  else nextEquipment.slots[slotId] = {
    modifier: drawIterable([...configured.slots[slotId].modifiers], 1)[0],
    quality: drawUniform(0, 100, 1)[0],
  };
  /** @type {WithId<Pokemon>} */
  let candidate;
  try {
    candidate = calculatePokemonStats({ ...pokemon, equipments: { ...pokemon.equipments, [equipmentType]: nextEquipment } }, pokemonConfig[pokemon.speciesId]);
  } catch {
    return { err: "This Pokemon's equipment could not be calculated.", code: "equipment_unavailable", status: 503 };
  }
  const filter = { userId: user.id, _id: pokemon._id };
  for (const field of ["exp", "level", "evs", "speciesId", "natureId", "ivs", "equipments"]) {
    filter[field] = pokemon[field] === undefined ? { $exists: false } : { $eq: pokemon[field] };
  }
  try {
    const savedTrainer = await writeBackpackChange(inventory);
    if (!savedTrainer) return { err: "Your money or Shards changed. Refresh before trying again.", code: "equipment_resources_changed", status: 409 };
    const saved = await findAndUpdateDocument(collectionNames.USER_POKEMON, filter,
      { $set: { [`equipments.${equipmentType}`]: nextEquipment, stats: candidate.stats, combatPower: candidate.combatPower, ivTotal: candidate.ivTotal } },
      { upsert: false, returnDocument: "after" });
    if (saved.value) {
      const savedPokemon = /** @type {WithId<Pokemon>} */ (saved.value);
      const data = { trainer: savedTrainer, pokemon: savedPokemon, changed: /** @type {true} */ (true), previousEquipment, equipmentType,
        ...(kind === "reroll" ? { slotId } : {}) };
      try {
        const event = await emitTrainerEvent(kind === "upgrade" ? trainerEventEnum.UPGRADED_EQUIPMENT : trainerEventEnum.REROLLED_EQUIPMENT,
          { trainer: savedTrainer, equipment: savedPokemon.equipments[equipmentType] });
        if (!event?.err) return { data };
      } catch {
        // The equipment is already saved; a quest failure cannot undo or replay it.
      }
      return { data, warning: "Equipment saved, but quest progress could not be confirmed. Refresh before continuing." };
    }
    if (await writeBackpackChange(inventory, true)) {
      return { err: "This Pokemon changed. Refresh before trying again.", code: "equipment_changed", status: 409 };
    }
  } catch {
    // Neither a thrown debit nor a thrown Pokemon write establishes failure.
  }
  return { err: "The equipment change could not be confirmed. Refresh Pokemon and Bag before trying again.", code: "equipment_uncertain", status: 503 };
};

/**
 * @param {import("./trainer").TrainerIdentity} user
 * @param {string} pokemonId
 * @param {EquipmentTypeEnum} equipmentType
 * @param {Equipment=} expectedEquipment
 * @returns {Promise<PokemonEquipmentResult>}
 */
const upgradeEquipmentLevel = (user, pokemonId, equipmentType, expectedEquipment) =>
  changeEquipment(user, pokemonId, equipmentType, "upgrade", undefined, expectedEquipment);

/**
 * @param {import("./trainer").TrainerIdentity} user
 * @param {string} pokemonId
 * @param {EquipmentTypeEnum} equipmentType
 * @param {EquipmentModifierSlotEnum} slotId
 * @param {Equipment=} expectedEquipment
 * @returns {Promise<PokemonEquipmentResult>}
 */
const rerollStatSlot = (user, pokemonId, equipmentType, slotId, expectedEquipment) =>
  changeEquipment(user, pokemonId, equipmentType, "reroll", slotId, expectedEquipment);

module.exports = { isEquipmentAvailable, upgradeEquipmentLevel, rerollStatSlot };
