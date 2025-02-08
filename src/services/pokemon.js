/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pokemon.js  builds all basic interactions involving pokemon and pokemon logic.
 */
const { logger } = require("../log");
const {
  updateDocument,
  deleteDocuments,
  QueryBuilder,
  countDocuments,
} = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { getOrSetDefault, idFrom, formatMoney } = require("../utils/utils");
const {
  natureConfig,
  pokemonConfig,
  MAX_TOTAL_EVS,
  MAX_SINGLE_EVS,
  rarities,
  rarityConfig,
} = require("../config/pokemonConfig");
const {
  expMultiplier,
  MAX_RELEASE,
  MAX_POKEMON,
} = require("../config/trainerConfig");
const {
  getPokemonExpNeeded,
  calculateEffectiveSpeed,
  calculateWorth,
  getAbilityOrder,
  getPokemonOrder,
  getPartyPokemonIds,
} = require("../utils/pokemonUtils");
const { locations, locationConfig } = require("../config/locationConfig");
const {
  buildSpeciesDexEmbed,
  buildPokemonListEmbed,
  DEPRECATEDbuildPokemonEmbed,
  buildEquipmentEmbed,
  buildEquipmentUpgradeEmbed,
  buildDexListEmbed,
  buildEquipmentSwapEmbed,
  buildEquipmentListEmbed,
} = require("../embeds/pokemonEmbeds");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { eventNames } = require("../config/eventConfig");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { getTrainer, updateTrainer, getTrainerFromId } = require("./trainer");
const { setState, getState } = require("./state");
const { buildYesNoActionRow } = require("../components/yesNoActionRow");
const {
  modifierConfig,
  modifierTypes,
  modifierSlotConfig,
  equipmentConfig,
  MAX_EQUIPMENT_LEVEL,
  levelUpCost,
  STAT_REROLL_COST,
  POKEDOLLAR_MULTIPLIER,
  SWAP_COST,
} = require("../config/equipmentConfig");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { getItems, removeItems } = require("../utils/trainerUtils");
const {
  backpackItemConfig,
  backpackItems,
} = require("../config/backpackConfig");
const { drawIterable, drawUniform } = require("../utils/gachaUtils");
const { partyAddRow } = require("../components/partyAddRow");
const { buildPokemonSelectRow } = require("../components/pokemonSelectRow");
const { buildEquipmentSelectRow } = require("../components/equipmentSelectRow");
const { stageNames } = require("../config/stageConfig");
const { emojis } = require("../enums/emojis");

// TODO: move this?
const PAGE_SIZE = 10;

/**
 * @param {WithId<Pokemon>} pokemon
 * @returns {Promise<{err: string?}>}
 */
const updatePokemon = async (pokemon) => {
  try {
    const res = await updateDocument(
      collectionNames.USER_POKEMON,
      { _id: idFrom(pokemon._id) },
      { $set: pokemon }
    );
    if (res.modifiedCount === 0) {
      return { err: "Failed to update Pokemon." };
    }
    return { err: null };
  } catch (err) {
    logger.error(err);
  }
};

/**
 * @param {string} userId
 * @param {{
 *  page?: number,
 *  pageSize?: number,
 *  filter?: any,
 *  sort?: any,
 *  allowNone?: boolean
 * }} listOptions
 * @returns {Promise<{data: WithId<Pokemon>[]?, lastPage?: boolean, err: string?}>}
 */
const listPokemons = async (userId, listOptions) => {
  // listOptions: { page, pageSize, filter, sort, allowNone }
  const filter = { userId, ...listOptions.filter };
  const pageSize = listOptions.pageSize || PAGE_SIZE;
  const page = listOptions.page || 1;
  const sort = listOptions.sort || null;
  const allowNone = listOptions.allowNone || false;

  // get pokemon with pagination
  try {
    const query = new QueryBuilder(collectionNames.LIST_POKEMON)
      .setFilter(filter)
      .setLimit(pageSize)
      .setPage(page - 1)
      .setSort(sort);

    const res = await query.find();
    if (res.length === 0 && !allowNone) {
      return {
        data: null,
        err: "No Pokemon found. Check your filter, or use `/gacha` to catch some Pokemon!",
      };
    }
    if (res.length > pageSize) {
      res.pop();
      return { data: res, lastPage: false, err: null };
    }
    return { data: res, lastPage: true, err: null };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error getting Pokemon." };
  }
};

/**
 * @param {Trainer} trainer
 * @param {(Parameters<typeof listPokemons>)[1]} listOptions
 */
const listPokemonsFromTrainer = async (trainer, listOptions) =>
  await listPokemons(trainer.userId, listOptions);

/**
 * @param {any} pokemon
 * @param {PokemonConfigData} speciesData
 * @returns {WithId<Pokemon>}
 */
const calculatePokemonStats = (pokemon, speciesData) => {
  // get nature, IVs, EVs, level, base stats, equips
  const { natureId, ivs, evs, level, equipments = {} } = pokemon;
  // copy base stats
  const baseStats = [...speciesData.baseStats];
  const nature = natureConfig[natureId].stats;

  const flatModifiers = [0, 0, 0, 0, 0, 0];
  const percentModifiers = [100, 100, 100, 100, 100, 100];
  // get equipment modifiers
  for (const equipment of Object.values(equipments)) {
    const { level: equipmentLevel = 1, slots = {} } = equipment;
    for (const [slotId, slot] of Object.entries(slots)) {
      const slotData = modifierSlotConfig[slotId];
      const modifierData = modifierConfig[slot.modifier];
      const { stat, type, min, max } = modifierData;

      const baseValue = (slot.quality / 100) * (max - min) + min;
      const value = Math.round(
        baseValue * (slotData.level ? equipmentLevel : 1)
      );
      if (type === modifierTypes.FLAT) {
        flatModifiers[stat] += value;
      } else if (type === modifierTypes.PERCENT) {
        percentModifiers[stat] += value;
      } else {
        baseStats[stat] += value;
      }
    }
  }

  // rarity stat bonus
  const { rarity } = speciesData;
  const statMultiplier = rarityConfig[rarity].statMultiplier || [
    1, 1, 1, 1, 1, 1,
  ];

  // calculate new stats
  const newStats = [];
  // stat calculations
  for (let i = 0; i < 6; i += 1) {
    // base calculations
    let stat =
      Math.floor(
        ((2 * baseStats[i] + ivs[i] + Math.floor(evs[i] / 4)) * level) / 100
      ) + 5;
    if (i === 0) {
      // hp special case
      stat =
        Math.floor(
          ((2 * baseStats[0] + ivs[0] + Math.floor(evs[0] / 4)) * level) / 100
        ) +
        level +
        10;
    }
    if (nature[i] > 0) {
      stat = Math.floor(stat * 1.1);
    } else if (nature[i] < 0) {
      stat = Math.floor(stat * 0.9);
    }

    // apply modifiers
    stat = Math.floor((stat * percentModifiers[i]) / 100);
    // account for pokemon level
    stat += Math.floor((flatModifiers[i] * level) / 100);

    // apply rarity multiplier
    stat = Math.floor(stat * statMultiplier[i]);

    newStats.push(stat);
  }

  // calculate new combat power
  // new calc: level * 3 + (3/4) * hp + atk + def + spa + spd + calculateEffectiveSpeed(spe)
  const newCombatPower = Math.floor(
    level * 3 +
      (3 / 4) * newStats[0] +
      newStats[1] +
      newStats[2] +
      newStats[3] +
      newStats[4] +
      calculateEffectiveSpeed(newStats[5])
  );

  pokemon.stats = newStats;
  pokemon.combatPower = newCombatPower;
  pokemon.ivTotal = ivs.reduce((a, b) => a + b, 0);

  return pokemon;
};

/**
 * @param {any} pokemon
 * @param {PokemonConfigData} speciesData
 * @returns {Pokemon}
 */
const calculatePokemonStatsNoEquip = (pokemon, speciesData) => {
  // copy pokemon
  const newPokemon = { ...pokemon };
  newPokemon.equipments = {};
  return calculatePokemonStats(newPokemon, speciesData);
};

/**
 * @param {WithId<Pokemon>} pokemon
 * @param {PokemonConfigData} speciesData
 * @param {boolean=} force
 * @returns {Promise<{data: WithId<Pokemon>?, err: string?}>}
 */
const calculateAndUpdatePokemonStats = async (
  pokemon,
  speciesData,
  force = false
) => {
  // get old stats and combat power
  const oldStats = getOrSetDefault(pokemon, "stats", [0, 0, 0, 0, 0, 0]);
  const oldCombatPower = getOrSetDefault(pokemon, "combatPower", 0);
  const oldIvTotal = getOrSetDefault(pokemon, "ivTotal", 0);

  // get updated pokemon
  pokemon = /** @type {WithId<Pokemon>} */ (
    calculatePokemonStats(pokemon, speciesData)
  );

  // check if old stats and combat power are the same
  if (
    force ||
    oldStats[0] !== pokemon.stats[0] ||
    oldStats[1] !== pokemon.stats[1] ||
    oldStats[2] !== pokemon.stats[2] ||
    oldStats[3] !== pokemon.stats[3] ||
    oldStats[4] !== pokemon.stats[4] ||
    oldStats[5] !== pokemon.stats[5] ||
    oldCombatPower !== pokemon.combatPower ||
    oldIvTotal !== pokemon.ivTotal
  ) {
    try {
      const res = await updateDocument(
        collectionNames.USER_POKEMON,
        { userId: pokemon.userId, _id: idFrom(pokemon._id) },
        { $set: pokemon }
      );
      if (res.modifiedCount === 0) {
        logger.warn(`Failed to update Pokemon ${pokemon._id}.`);
        return { data: null, err: "Error updating Pokemon." };
      }
    } catch (error) {
      logger.error(error);
      return { data: null, err: "Error updating Pokemon." };
    }
  }

  return { data: pokemon, err: null };
};

/**
 *
 * @param {string} userId
 * @param {string} pokemonId
 * @returns {Promise<{data: WithId<Pokemon>?, err: string?}>}
 */
const getPokemonFromUserId = async (userId, pokemonId) => {
  // find instance of pokemon in trainer's collection
  try {
    let id = null;
    try {
      id = idFrom(pokemonId);
    } catch (error) {
      return { data: null, err: "Invalid Pokemon ID." };
    }
    const query = new QueryBuilder(collectionNames.USER_POKEMON).setFilter({
      userId,
      _id: id,
    });

    const res = await query.findOne();

    if (!res) {
      return {
        data: null,
        err: "Pokemon not found or Pokemon not owned by you.",
      };
    }
    return await calculateAndUpdatePokemonStats(
      res,
      pokemonConfig[res.speciesId]
    );
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error getting Pokemon." };
  }
};

/**
 * @param {Trainer} trainer
 * @param {string} pokemonId
 * @returns {ReturnType<typeof getPokemonFromUserId>}
 */
const getPokemon = async (trainer, pokemonId) =>
  await getPokemonFromUserId(trainer.userId, pokemonId);

const getIdFromNameOrId = async (user, nameOrId, interaction, defer = true) => {
  if (defer) {
    await interaction.deferReply();
  }

  // if can get from `getPokemon`, return ID
  const pokemon = await getPokemonFromUserId(user.id, nameOrId);
  if (!pokemon.err) {
    return { data: pokemon.data._id.toString(), err: null };
  }

  // try to get pokemon from listPokemons, if one return ID, if multiple await a selection menu
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { data: null, err: trainer.err };
  }

  let selection;
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const listOptions = {
      filter: {
        // fuzzy search for value
        name: {
          $regex: RegExp(nameOrId),
          $options: "i",
        },
      },
      page,
    };
    const pokemons = await listPokemonsFromTrainer(trainer.data, listOptions);
    if (pokemons.err) {
      return { data: null, err: pokemons.err };
    }

    if (pokemons.data.length === 1) {
      return { data: pokemons.data[0]._id.toString(), err: null };
    }

    const pokemonEmbed = buildPokemonListEmbed(
      trainer.data.user.username,
      pokemons.data,
      page
    );
    // build pagination row
    const scrollRowData = {};
    const scrollActionRow = buildScrollActionRow(
      page,
      pokemons.lastPage,
      scrollRowData,
      eventNames.POKEMON_ID_SELECT
    );

    // build select row
    const selectRowData = {};
    const pokemonSelectRow = buildPokemonSelectRow(
      pokemons.data,
      selectRowData,
      eventNames.POKEMON_ID_SELECT
    );

    const response = await interaction.editReply({
      content: "Multiple Pokemon found; Select a Pokemon.",
      embeds: [pokemonEmbed],
      components: [scrollActionRow, pokemonSelectRow],
    });

    const collectorFilter = (i) => i.user.id === user.id;
    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60000,
      });
      if (confirmation.values) {
        [selection] = confirmation.values;
        await confirmation.update({
          content: "** **",
          embeds: [],
          components: [],
        });
        break;
      }
      confirmation.deferUpdate();

      const data = JSON.parse(confirmation.customId);
      page = data.page || 1;
    } catch (e) {
      await interaction.editReply({
        content: "ID not received within 1 minute, cancelling",
        components: [],
      });
    }
  }

  return { data: selection, err: null };
};

/**
 * @param {Trainer} trainer
 * @param {string[]} pokemonIds
 * @returns {Promise<{data: number?, err: string?}>}
 */
const releasePokemons = async (trainer, pokemonIds) => {
  // remove pokemon from trainer's collection
  try {
    const res = await deleteDocuments(collectionNames.USER_POKEMON, {
      userId: trainer.userId,
      _id: { $in: pokemonIds.map(idFrom) },
    });
    if (res.deletedCount === 0) {
      return { data: null, err: "No Pokemon found." };
    }
    logger.info(
      `${trainer.user.username} released ${res.deletedCount} Pokemon.`
    );
    return { data: res.deletedCount, err: null };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error releasing Pokemon." };
  }
};

/**
 * @param {WithId<Pokemon>} pokemon
 * @param {PokemonIdEnum} evolutionSpeciesId
 * @returns {WithId<Pokemon>}
 */
const getEvolvedPokemon = (pokemon, evolutionSpeciesId) => {
  // get species data
  const speciesData = pokemonConfig[pokemon.speciesId];
  const evolutionSpeciesData = pokemonConfig[evolutionSpeciesId];

  // get evolution pokemon
  pokemon = calculatePokemonStats(pokemon, evolutionSpeciesData);
  pokemon.speciesId = evolutionSpeciesId;
  if (pokemon.name === speciesData.name) {
    pokemon.name = evolutionSpeciesData.name;
  }
  pokemon.rarity = evolutionSpeciesData.rarity;

  // calculate ability
  // if evolution has one ability, give that ability
  // else, use ability slots
  // 2 abilities => slot 1, 3
  // 3 abilities => slot 1, 2, 3
  // first convert abilities (map id => probability) into lists
  const abilities = getAbilityOrder(speciesData.abilities);
  const evolutionAbilities = getAbilityOrder(evolutionSpeciesData.abilities);
  if (evolutionAbilities.length === 1) {
    [pokemon.abilityId] = evolutionAbilities;
  } else {
    // get current ability slot
    let slot = 1;
    // @ts-ignore
    let index = abilities.indexOf(pokemon.abilityId);
    if (index === -1) {
      index = 0;
    }
    if (abilities.length === 2) {
      slot = index === 0 ? 1 : 3;
    } else if (abilities.length === 3) {
      slot = index + 1;
    }

    // use slot to get new ability
    if (evolutionAbilities.length === 2) {
      if (slot === 1 || slot === 2) {
        // eslint-disable-next-line prefer-destructuring
        pokemon.abilityId = evolutionAbilities[0];
      } else {
        // eslint-disable-next-line prefer-destructuring
        pokemon.abilityId = evolutionAbilities[1];
      }
    } else if (evolutionAbilities.length === 3) {
      pokemon.abilityId = evolutionAbilities[slot - 1];
    }
  }

  // update battle eligibility
  pokemon.battleEligible = evolutionSpeciesData.battleEligible;

  return pokemon;
};

/**
 * @param {WithId<Pokemon>} pokemon
 * @param {PokemonIdEnum} evolutionSpeciesId
 * @returns {Promise<{data: {pokemon: WithId<Pokemon>, species: string}?, err: string?}>}
 */
const evolvePokemon = async (pokemon, evolutionSpeciesId) => {
  // get evolved pokemon
  pokemon = getEvolvedPokemon(pokemon, evolutionSpeciesId);
  const evolutionSpeciesData = pokemonConfig[evolutionSpeciesId];

  // update pokemon
  try {
    const res = await updateDocument(
      collectionNames.USER_POKEMON,
      { userId: pokemon.userId, _id: idFrom(pokemon._id) },
      { $set: pokemon }
    );
    if (res.modifiedCount === 0) {
      logger.warn(`Failed to evolve Pokemon ${pokemon._id}.`);
      return { data: null, err: "Error evolving Pokemon." };
    }
    logger.info(`Evolved Pokemon ${pokemon._id}.`);
    return { data: { pokemon, species: evolutionSpeciesData.name }, err: null };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error evolving Pokemon." };
  }
};

/**
 * @param {Trainer} trainer
 * @param {WithId<Pokemon>} pokemon
 * @param {number} exp
 * @param {StatArray=} evs
 * @returns {Promise<{data: {exp: number, level: number, evs: number[]}, err: string?}>}
 */
const addPokemonExpAndEVs = async (
  trainer,
  pokemon,
  exp,
  evs = [0, 0, 0, 0, 0, 0]
) => {
  // get species data
  const speciesData = pokemonConfig[pokemon.speciesId];

  // add EVs
  const gainedEvs = [0, 0, 0, 0, 0, 0];
  if (!pokemon.evs) {
    pokemon.evs = [0, 0, 0, 0, 0, 0];
  }
  for (let i = 0; i < 6; i += 1) {
    const total = pokemon.evs.reduce((a, b) => a + b, 0);
    // check to see if pokemon has max total EVs
    if (total >= MAX_TOTAL_EVS && evs[i] > 0) {
      break;
    }

    // check to see if pokemon has max single EVs
    if (pokemon.evs[i] >= MAX_SINGLE_EVS && evs[i] > 0) {
      pokemon.evs[i] = MAX_SINGLE_EVS;
      continue;
    }
    // check for min evs
    if (pokemon.evs[i] <= 0 && evs[i] < 0) {
      pokemon.evs[i] = 0;
      continue;
    }

    // new evs to add = min(evs[i], remaining single, remainin total)
    let newEvs = Math.min(
      evs[i],
      MAX_SINGLE_EVS - pokemon.evs[i],
      MAX_TOTAL_EVS - total
    );
    if (pokemon.evs[i] + newEvs < 0) {
      newEvs = -pokemon.evs[i];
    }
    pokemon.evs[i] += newEvs;
    gainedEvs[i] = newEvs;
  }

  // calculate exp based on trainer level
  // multiply by 2 if trainer has celebi
  const mult = trainer.hasCelebi ? 2 : 1;
  exp = Math.max(Math.floor(exp * expMultiplier(trainer.level) * mult), 1);
  if (!pokemon.exp) {
    pokemon.exp = 0;
  }
  pokemon.exp += exp;

  // add exp to pokemon
  while (
    pokemon.exp >=
    getPokemonExpNeeded(pokemon.level + 1, speciesData.growthRate)
  ) {
    if (pokemon.level >= 100) {
      break;
    }
    pokemon.level += 1;
  }

  // calculate new stats
  pokemon = calculatePokemonStats(pokemon, speciesData);

  // update pokemon
  try {
    const res = await updateDocument(
      collectionNames.USER_POKEMON,
      { userId: trainer.userId, _id: idFrom(pokemon._id) },
      { $set: pokemon }
    );
    if (res.modifiedCount === 0) {
      logger.warn(`Failed to update Pokemon ${pokemon._id}.`);
      return { data: null, err: "Error updating Pokemon." };
    }
    // logger.info(`Level-up and update stats for Pokemon ${pokemon._id}.`);
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error updating Pokemon." };
  }

  const data = {
    exp,
    level: pokemon.level,
    evs: gainedEvs,
  };

  return { data, err: null };
};

/**
 *
 * @param {Trainer} trainer
 * @param {WithId<Pokemon>} pokemon
 * @param {LocationEnum} locationId
 * @returns {ReturnType<addPokemonExpAndEVs>}
 */
const trainPokemon = async (trainer, pokemon, locationId) => {
  const locationData = locationConfig[locationId];

  // get trainer location level
  const locationLevel = trainer.locations[locationId];

  let exp = 2;
  let evs = /** @type {StatArray} */ ([0, 0, 0, 0, 0, 0]);
  // get exp and evs based on location
  if (!locationLevel) {
    // if home (no location), continue
    if (locationId !== locations.HOME)
      return {
        data: null,
        err: "You don't own that location! View your locations with `/locations`, and buy more at the `/pokemart`!",
      };
  } else {
    const levelConfig = locationData.levelConfig[locationLevel];
    // get exp and evs based on location
    exp = levelConfig.exp;
    evs = levelConfig.evs;
  }

  // add exp and evs
  return await addPokemonExpAndEVs(trainer, pokemon, exp, evs);
};

/**
 *
 * @param {Trainer} trainer
 * @param {Pokemon} pokemon
 * @param {EquipmentTypeEnum} equipmentType
 * @param {boolean=} upgrade Whether the equipment's level should be upgraded
 * @param {boolean=} slot Whether the equipment's slot should be rerolled
 * @returns {boolean}
 */
const canUpgradeEquipment = (
  trainer,
  pokemon,
  equipmentType,
  upgrade = false,
  slot = false
) => {
  const equipment = pokemon.equipments[equipmentType];
  if (!equipment) {
    return false;
  }
  const equipmentData = equipmentConfig[equipmentType];
  const { material } = equipmentData;
  if (upgrade) {
    // check level
    if (equipment.level >= MAX_EQUIPMENT_LEVEL) {
      return false;
    }

    // check cost
    const moneyCost = levelUpCost(equipment.level) * POKEDOLLAR_MULTIPLIER;
    if (trainer.money < moneyCost) {
      return false;
    }

    // check material
    const materialCost = levelUpCost(equipment.level);
    if (getItems(trainer, material) < materialCost) {
      return false;
    }
  } else if (slot) {
    // check cost
    const moneyCost = STAT_REROLL_COST * POKEDOLLAR_MULTIPLIER;
    if (trainer.money < moneyCost) {
      return false;
    }

    // check material
    const materialCost = STAT_REROLL_COST;
    if (getItems(trainer, material) < materialCost) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

/**
 * @param {WithId<Trainer>} trainer
 * @param {WithId<Pokemon>} pokemon
 * @param {EquipmentTypeEnum} equipmentType
 * @returns {Promise<{data: string?, err: string?}>}
 */
const upgradeEquipmentLevel = async (trainer, pokemon, equipmentType) => {
  const equipment = pokemon.equipments[equipmentType];
  if (!equipment) {
    return { data: null, err: "Error upgrading equipment." };
  }
  if (!canUpgradeEquipment(trainer, pokemon, equipmentType, true)) {
    return { data: null, err: "You can't upgrade that equipment right now!" };
  }
  const equipmentData = equipmentConfig[equipmentType];
  const { material } = equipmentData;
  const materialData = backpackItemConfig[material];

  // withdraw cost from trainer
  const moneyCost = levelUpCost(equipment.level) * POKEDOLLAR_MULTIPLIER;
  const materialCost = levelUpCost(equipment.level);
  removeItems(trainer, material, materialCost);
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { _id: idFrom(trainer._id) },
      { $inc: { money: -moneyCost }, $set: { backpack: trainer.backpack } }
    );
    if (res.modifiedCount === 0) {
      logger.warn(`Failed to update trainer ${trainer._id} money.`);
      return { data: null, err: "Error upgrading equipment." };
    }
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error upgrading equipment." };
  }

  // update equipment
  equipment.level += 1;
  const { err } = await calculateAndUpdatePokemonStats(
    pokemon,
    pokemonConfig[pokemon.speciesId],
    true
  );
  if (err) {
    return { data: null, err };
  }
  return {
    data: `Equipment upgraded to level ${equipment.level} for ${formatMoney(
      moneyCost
    )} and ${materialData.emoji} x${materialCost}!`,
    err: null,
  };
};

/**
 * @param {WithId<Pokemon>} pokemon
 * @returns  {Promise<{data?: string?, err: string?}>}
 */
const toggleLock = async (pokemon) => {
  pokemon.locked = !pokemon.locked;
  try {
    const res = await updateDocument(
      collectionNames.USER_POKEMON,
      { _id: idFrom(pokemon._id) },
      { $set: { locked: pokemon.locked } }
    );
    if (res.modifiedCount === 0) {
      logger.warn(`Failed to update Pokemon ${pokemon._id}.`);
      return { data: null, err: "Error locking Pokemon." };
    }
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error locking Pokemon." };
  }

  return { err: null };
};

/**
 *
 * @param {WithId<Trainer>} trainer
 * @param {WithId<Pokemon>} pokemon
 * @param {EquipmentTypeEnum} equipmentType
 * @param {EquipmentModifierSlotEnum} slotId
 * @returns
 */
const rerollStatSlot = async (trainer, pokemon, equipmentType, slotId) => {
  const equipment = pokemon.equipments[equipmentType];
  if (!equipment) {
    return { data: null, err: "Error rerolling stat slot." };
  }
  if (!canUpgradeEquipment(trainer, pokemon, equipmentType, false, true)) {
    return { data: null, err: "You can't reroll that stat slot right now!" };
  }
  const equipmentData = equipmentConfig[equipmentType];
  const { material } = equipmentData;
  const materialData = backpackItemConfig[material];
  const slotData = equipmentData.slots[slotId];

  // withdraw cost from trainer
  const moneyCost = STAT_REROLL_COST * POKEDOLLAR_MULTIPLIER;
  const materialCost = STAT_REROLL_COST;
  removeItems(trainer, material, materialCost);
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { _id: idFrom(trainer._id) },
      { $inc: { money: -moneyCost }, $set: { backpack: trainer.backpack } }
    );
    if (res.modifiedCount === 0) {
      logger.warn(`Failed to update trainer ${trainer._id} money.`);
      return { data: null, err: "Error rerolling stat slot." };
    }
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error rerolling stat slot." };
  }

  // update equipment
  equipment.slots[slotId] = {
    modifier: drawIterable(slotData.modifiers, 1)[0],
    quality: drawUniform(0, 100, 1)[0],
  };
  const slot = equipment.slots[slotId];

  const { err } = await calculateAndUpdatePokemonStats(
    pokemon,
    pokemonConfig[pokemon.speciesId],
    true
  );
  if (err) {
    return { data: null, err };
  }
  return {
    data: `Stat slot ${slotId} rerolled to ${
      modifierConfig[slot.modifier].name
    } (${slot.quality}%) for ${formatMoney(moneyCost)} and ${
      materialData.emoji
    } x${materialCost}!`,
    err: null,
  };
};

// to be used in mongo aggregate or other
/**
 * @param {PokemonConfigData} pokemonConfigData
 * @param {Pokemon} pokemon
 */
function getBattleEligible(pokemonConfigData, pokemon) {
  return !!pokemonConfigData[pokemon.speciesId].battleEligible;
}

/**
 * Sets the battle eligibility of all pokemon owned by the trainer.
 * Use aggregation pipeline to get all pokemon owned by the trainer,
 * then looks up the Pokemon by species id to get the battle eligibility.
 * @param {*} trainer
 */
const setBattleEligible = async (trainer) => {
  const aggregation = [
    { $match: { userId: trainer.userId } },
    {
      $addFields: {
        battleEligible: {
          $function: {
            body: getBattleEligible.toString(),
            args: [pokemonConfig, "$$ROOT"],
            lang: "js",
          },
        },
      },
    },
    {
      $merge: {
        into: collectionNames.USER_POKEMON,
        on: "_id",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    },
  ];

  try {
    const query = new QueryBuilder(collectionNames.USER_POKEMON).setAggregate(
      aggregation
    );
    await query.aggregate();
    logger.info(
      `Set battle eligibility for all Pokemon owned by ${trainer.userId}.`
    );
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error setting battle eligibility." };
  }

  return { data: null, err: null };
};

const buildPokemonAllInfoSend = async ({
  userId = null,
  pokemonId = null,
} = {}) => {
  const send = {
    content: pokemonId,
    embeds: [],
    components: [],
  };

  // get pokemon
  const pokemon = await getPokemonFromUserId(userId, pokemonId);
  if (pokemon.err) {
    return { embed: null, err: pokemon.err };
  }

  // get trainer
  const trainer = await getTrainerFromId(userId);
  if (trainer.err) {
    return { embed: null, err: trainer.err };
  }

  // build pokemon embed
  const embed = DEPRECATEDbuildPokemonEmbed(trainer.data, pokemon.data, "all");
  send.embeds.push(embed);

  return { send, err: null };
};

/**
 * @param {object} param0
 * @param {object?=} param0.user
 * @param {string?=} param0.pokemonId
 * @param {string?=} param0.tab
 * @param {string?=} param0.action
 */
const buildPokemonInfoSend = async ({
  user = null,
  pokemonId = null,
  tab = "info",
  action = null,
} = {}) => {
  const send = {
    content: pokemonId,
    embeds: [],
    components: [],
  };

  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { embed: null, err: trainer.err };
  }

  // get pokemon
  const pokemon = await getPokemon(trainer.data, pokemonId);
  if (pokemon.err) {
    return { embed: null, err: pokemon.err };
  }
  const pokemonNoEquip = calculatePokemonStatsNoEquip(
    pokemon.data,
    pokemonConfig[pokemon.data.speciesId]
  );

  if (action === "lock") {
    const { err } = await toggleLock(pokemon.data);
    if (err) {
      return { embed: null, err };
    }
  }

  // build pokemon embed
  const embed = DEPRECATEDbuildPokemonEmbed(
    trainer.data,
    pokemon.data,
    tab,
    pokemonNoEquip,
    pokemon.data.originalOwner
  );
  send.embeds.push(embed);

  // build tab selection
  const buttonConfigs = [
    {
      label: "Info",
      disabled: tab === "info",
      data: { id: pokemonId, tab: "info" },
      emoji: "ℹ️",
    },
    {
      label: "Battle Info",
      disabled: tab === "battle",
      data: { id: pokemonId, tab: "battle" },
      emoji: "⚔️",
    },
    {
      label: "Equipment",
      disabled: tab === "equipment",
      data: { id: pokemonId, tab: "equipment" },
      emoji: emojis.POWER_WEIGHT,
    },
  ];
  const tabActionRow = buildButtonActionRow(
    buttonConfigs,
    eventNames.POKEMON_INFO_BUTTON
  );
  send.components.push(tabActionRow);

  // build action selection
  const actionButtonConfigs = [
    {
      label: pokemon.data.locked ? "Unlock" : "Lock",
      disabled: false,
      data: { id: pokemonId, action: "lock" },
      emoji: pokemon.data.locked ? "🔓" : "🔒",
    },
    {
      label: "Add to Party",
      disabled: false,
      data: { id: pokemonId, action: "add" },
      emoji: "➕",
    },
    {
      label: "Train",
      disabled: false,
      data: { id: pokemonId, action: "train" },
      emoji: "🏋️",
    },
  ];
  const actionActionRow = buildButtonActionRow(
    actionButtonConfigs,
    eventNames.POKEMON_ACTION_BUTTON
  );
  send.components.push(actionActionRow);

  if (action === "add") {
    const partySelectRow = partyAddRow(
      pokemonId,
      trainer.data.party.pokemonIds.length
    );
    send.components.push(partySelectRow);
  }

  return { send, err: null };
};

const getPokemonOwnershipStats = async (speciesId) => {
  try {
    const totalOwnershipAgg = [
      { $match: { speciesId } },
      {
        $group: {
          _id: "$speciesId",
          count: { $sum: 1 },
          shinyCount: { $sum: { $cond: [{ $eq: ["$shiny", true] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          shinyCount: 1,
        },
      },
    ];

    const uniqueOwnershipAgg = [
      { $match: { speciesId } },
      {
        $group: {
          _id: "$speciesId",
          users: { $addToSet: "$userId" },
          shinyUsers: {
            $addToSet: { $cond: [{ $eq: ["$shiny", true] }, "$userId", null] },
          },
        },
      },
      // if null in shinyUsers, remove it
      {
        $addFields: {
          shinyUsers: {
            $cond: {
              if: { $in: [null, "$shinyUsers"] },
              then: { $setDifference: ["$shinyUsers", [null]] },
              else: "$shinyUsers",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          users: { $size: "$users" },
          shinyUsers: { $size: "$shinyUsers" },
        },
      },
    ];

    const query = new QueryBuilder(collectionNames.USER_POKEMON).setAggregate(
      totalOwnershipAgg
    );
    let res = await query.aggregate();
    if (res.length === 0) {
      res = [
        {
          count: 0,
          shinyCount: 0,
        },
      ];
    }

    const query2 = new QueryBuilder(collectionNames.USER_POKEMON).setAggregate(
      uniqueOwnershipAgg
    );
    let res2 = await query2.aggregate();
    if (res2.length === 0) {
      res2 = [
        {
          users: 0,
          shinyUsers: 0,
        },
      ];
    }

    return {
      data: {
        totalOwnership: res,
        uniqueOwnership: res2,
      },
      err: null,
    };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error getting ownership stats." };
  }
};

const buildPokedexSend = async ({
  id = "1",
  tab = "info",
  view = "list",
  page = 1,
} = {}) => {
  const send = {
    embeds: [],
    components: [],
  };
  const allIds = getPokemonOrder();

  if (view === "list") {
    if (page < 1 || page > Math.ceil(allIds.length / 10)) {
      return { send: null, err: "Invalid page number." };
    }

    const start = (page - 1) * 10;
    const end = start + 10;
    const ids = allIds.slice(start, end);

    const embed = buildDexListEmbed(ids, page);
    send.embeds.push(embed);

    const scrollData = {};
    const scrollActionRow = buildScrollActionRow(
      page,
      page === Math.ceil(allIds.length / 10),
      scrollData,
      eventNames.POKEDEX_LIST_BUTTON
    );
    send.components.push(scrollActionRow);

    const selectData = {};
    const selectActionRow = buildIdConfigSelectRow(
      ids,
      pokemonConfig,
      "Select a Pokemon to view",
      selectData,
      eventNames.POKEDEX_BUTTON
    );
    send.components.push(selectActionRow);
  } else if (view === "species") {
    if (pokemonConfig[id] === undefined) {
      // if ID undefined, check all species for name match
      const selectedSpeciesId = allIds.find(
        (speciesId) =>
          pokemonConfig[speciesId].name.toLowerCase() === id.toLowerCase()
      );
      if (selectedSpeciesId) {
        id = selectedSpeciesId;
      } else {
        return {
          send: null,
          err: "Invalid Pokemon species or Pokemon not added yet!",
        };
      }
    }

    const speciesData = pokemonConfig[id];
    const ownershipData = await getPokemonOwnershipStats(id);
    if (ownershipData.err) {
      return { send: null, err: ownershipData.err };
    }
    const embed = buildSpeciesDexEmbed(
      id,
      speciesData,
      tab,
      ownershipData.data
    );
    send.embeds.push(embed);

    const index = allIds.indexOf(id);

    // build tab selection
    const buttonConfigs = [
      {
        label: "Info",
        disabled: tab === "info",
        data: {
          page: index + 1,
          tab: "info",
        },
      },
      {
        label: "Growth",
        disabled: tab === "growth",
        data: {
          page: index + 1,
          tab: "growth",
        },
      },
      {
        label: "Moves",
        disabled: tab === "moves",
        data: {
          page: index + 1,
          tab: "moves",
        },
      },
      {
        label: "Abilities",
        disabled: tab === "abilities",
        data: {
          page: index + 1,
          tab: "abilities",
        },
      },
      {
        label: "Rarity",
        disabled: tab === "rarity",
        data: {
          page: index + 1,
          tab: "rarity",
        },
      },
    ];
    const tabActionRow = buildButtonActionRow(
      buttonConfigs,
      eventNames.POKEDEX_BUTTON
    );
    send.components.push(tabActionRow);

    // build scroll row
    const scrollData = {
      tab,
    };
    const scrollActionRow = buildScrollActionRow(
      // page = index of id + 1
      index + 1,
      index >= allIds.length - 1,
      scrollData,
      eventNames.POKEDEX_BUTTON
    );
    send.components.push(scrollActionRow);

    // build return button
    const returnButtonData = {
      // page = index of id / 10 + 1
      page: Math.floor(index / 10) + 1,
    };
    const returnButtonConfig = [
      {
        label: "Return",
        disabled: false,
        data: returnButtonData,
      },
    ];
    const returnActionRow = buildButtonActionRow(
      returnButtonConfig,
      eventNames.POKEDEX_LIST_BUTTON
    );
    send.components.push(returnActionRow);
  }

  return { send, err: null };
};

/**
 *
 * @param {WithId<Trainer>} trainer
 * @param {string[]} pokemonIds
 * @returns {Promise<{toRelease?: { data: WithId<Pokemon>[] } , err: string?}>}
 */
const canRelease = async (trainer, pokemonIds) => {
  // get pokemon to release
  const toRelease = await listPokemonsFromTrainer(trainer, {
    page: 1,
    filter: { _id: { $in: pokemonIds.map(idFrom) } },
    allowNone: true,
  });
  if (toRelease.err) {
    return { err: toRelease.err };
  }
  if (toRelease.data.length !== pokemonIds.length) {
    return {
      err: `You don't have all the Pokemon you want to release or trade!`,
    };
  }

  // see if any pokemon are mythical
  for (const pokemon of toRelease.data) {
    if (
      pokemon.rarity === rarities.MYTHICAL &&
      process.env.STAGE !== stageNames.ALPHA
    ) {
      return {
        err: `You can't release or trade ${pokemon.name} (${pokemon._id}) because it's mythical!`,
      };
    }
  }

  // see if any pokemon are locked
  for (const pokemon of toRelease.data) {
    if (pokemon.locked) {
      return {
        err: `You can't release or trade ${pokemon.name} (${pokemon._id}) because it's locked!`,
      };
    }
  }

  // see if any pokemon are in a team
  const partyUniqueIds = getPartyPokemonIds(trainer);
  for (const pokemon of toRelease.data) {
    if (partyUniqueIds.includes(pokemon._id.toString())) {
      return {
        err: `You can't release or trade ${pokemon.name} (${pokemon._id}) because it's in one of your parties!`,
      };
    }
  }

  return { toRelease, err: null };
};

const canSwap = async (trainer, equipmentType) => {
  // see if has enough money
  if (trainer.money < SWAP_COST * POKEDOLLAR_MULTIPLIER) {
    return { err: "You don't have enough money to swap your equipment!" };
  }

  // see if trainer has enough materials
  const equipmentData = equipmentConfig[equipmentType];
  const { material } = equipmentData;
  const materialData = backpackItemConfig[material];
  if (getItems(trainer, material) < SWAP_COST) {
    return {
      err: `You don't have enough ${materialData.name} to swap your equipment!`,
    };
  }

  return { err: null };
};

const buildReleaseSend = async (user, pokemonIds) => {
  // check if pokemonIds has too many ids
  if (pokemonIds.length > MAX_RELEASE || pokemonIds.length < 1) {
    return {
      err: `You can only release up to ${MAX_RELEASE} pokemons at a time!`,
    };
  }

  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }

  const checkRelease = await canRelease(trainer.data, pokemonIds);
  if (checkRelease.err) {
    return { err: checkRelease.err };
  }
  const { toRelease } = checkRelease;

  // calculate total worth of pokemon
  const totalWorth = calculateWorth(toRelease.data, null);

  // build list embed
  const embed = buildPokemonListEmbed(
    trainer.data.user.username,
    toRelease.data,
    1
  );

  // build confirmation prompt
  const stateId = setState({ userId: user.id, pokemonIds }, 150);
  const releaseData = {
    stateId,
  };
  const actionRow = buildYesNoActionRow(
    releaseData,
    eventNames.POKEMON_RELEASE,
    true
  );

  const send = {
    content: `Do you really want to release the following Pokemon for ${formatMoney(
      totalWorth
    )}?`,
    embeds: [embed],
    components: [actionRow],
  };

  return { send, err: null };
};

const buildEquipmentSend = async ({ stateId = null, user = null } = {}) => {
  const state = getState(stateId);

  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  let pokemon = await getPokemon(trainer, state.pokemonId);
  if (pokemon.err) {
    return { err: pokemon.err };
  }
  pokemon = pokemon.data;

  // embed info
  const oldPokemon = calculatePokemonStatsNoEquip(
    pokemon,
    pokemonConfig[pokemon.speciesId]
  );
  const equipmentEmbed = buildEquipmentEmbed(pokemon, oldPokemon);

  // equipment selection row
  const selectData = {
    stateId,
    select: "equipment",
  };
  const selectActionRow = buildIdConfigSelectRow(
    Object.keys(pokemon.equipments),
    equipmentConfig,
    "Select equipment to upgrade",
    selectData,
    eventNames.EQUIPMENT_SELECT,
    false
  );

  const send = {
    embeds: [equipmentEmbed],
    components: [selectActionRow],
  };

  return { send, err: null };
};

const buildEquipmentUpgradeSend = async ({
  stateId = null,
  user = null,
} = {}) => {
  const state = getState(stateId);

  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  let pokemon = await getPokemon(trainer, state.pokemonId);
  if (pokemon.err) {
    return { err: pokemon.err };
  }
  pokemon = pokemon.data;

  const { equipmentType } = state;
  const equipment = pokemon.equipments[equipmentType];
  if (!equipment) {
    return { err: `Pokemon doesn't have ${equipmentType} equipment!` };
  }

  const { button } = state;
  const { slotId } = state;
  const slotData = modifierSlotConfig[slotId];

  const send = {
    embeds: [],
    components: [],
  };

  // embed
  const embed = buildEquipmentUpgradeEmbed(
    trainer,
    pokemon,
    equipmentType,
    equipment,
    button === "upgrade",
    button === "slot" && slotId
  );
  send.embeds.push(embed);

  // upgrade select buttons
  const buttonData = {
    stateId,
  };
  const buttonConfigs = [
    {
      label: "Upgrade",
      disabled:
        button === "upgrade" ||
        !canUpgradeEquipment(trainer, pokemon, equipmentType, true),
      data: {
        ...buttonData,
        button: "upgrade",
      },
    },
    {
      label: "Reroll",
      disabled:
        button === "slot" ||
        !canUpgradeEquipment(trainer, pokemon, equipmentType, false, true),
      data: {
        ...buttonData,
        button: "slot",
      },
    },
    {
      label: "Info",
      disabled: false,
      data: {
        ...buttonData,
        button: "info",
      },
    },
  ];
  const buttonActionRow = buildButtonActionRow(
    buttonConfigs,
    eventNames.EQUIPMENT_BUTTON
  );
  send.components.push(buttonActionRow);

  if (button === "slot") {
    const rerollData = {
      stateId,
      select: "slot",
    };
    const rerollSelectRow = buildIdConfigSelectRow(
      Object.keys(equipment.slots),
      modifierSlotConfig,
      "Select stat slot to reroll",
      rerollData,
      eventNames.EQUIPMENT_SELECT,
      false,
      [],
      slotId
    );
    send.components.push(rerollSelectRow);
  }

  // if button is upgrade or slot, add upgrade confirm button
  if (button === "upgrade" || button === "slot") {
    const upgradeData = {
      stateId,
    };
    const upgradeButtonConfigs = [
      {
        label:
          button === "upgrade" ? "Confirm Upgrade" : `Reroll ${slotData.name}`,
        disabled: !canUpgradeEquipment(
          trainer,
          pokemon,
          equipmentType,
          button === "upgrade",
          button === "slot"
        ),
        data: {
          ...upgradeData,
        },
      },
    ];
    const upgradeActionRow = buildButtonActionRow(
      upgradeButtonConfigs,
      eventNames.EQUIPMENT_UPGRADE
    );
    send.components.push(upgradeActionRow);
  }

  // back button
  const backButtonConfigs = [
    {
      label: "Return",
      disabled: false,
      data: {
        ...buttonData,
        button: "back",
      },
    },
  ];
  const backButtonActionRow = buildButtonActionRow(
    backButtonConfigs,
    eventNames.EQUIPMENT_BUTTON
  );
  send.components.push(backButtonActionRow);

  return { send, err: null };
};

const onEquipmentScroll = ({ stateId = null, data = {} } = {}) => {
  const state = getState(stateId);

  const page = data.page || 1;
  if (page < 1) {
    return { err: "Invalid page number!" };
  }
  state.page = page;

  return {};
};

const EQUIPMENT_LIST_PAGE_SIZE = 10;
const buildEquipmentListSend = async ({ stateId = null, user = null } = {}) => {
  const state = getState(stateId);

  const page = state.page || 1;
  if (page < 1) {
    return { err: "Invalid page number!" };
  }

  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }

  // build agg pipeline based on state
  const aggPipeline = [
    {
      $match: {
        userId: user.id,
        equipmentType: state.equipmentType || { $exists: true },
        locked:
          state.locked === true || state.locked === false
            ? state.locked
            : { $exists: true },
      },
    },
  ];
  // if state.stat, add stat to agg pipeline sort
  if (state.stat) {
    const includeLevel = state.includeLevel
      ? "equipmentStats"
      : "equipmentStatsWithoutLevel";
    aggPipeline.push({
      $sort: {
        [`${includeLevel}.${state.stat}`]: -1,
        _id: 1,
      },
    });
  }
  // paginate
  aggPipeline.push({ $skip: (page - 1) * EQUIPMENT_LIST_PAGE_SIZE });
  // + 1 to see if there is a next page
  aggPipeline.push({ $limit: EQUIPMENT_LIST_PAGE_SIZE + 1 });

  // get equipment
  let equipments;
  try {
    const query = new QueryBuilder(collectionNames.EQUIPMENT).setAggregate(
      aggPipeline
    );

    equipments = await query.aggregate();
    if (equipments.length === 0) {
      return { err: "No equipment found!" };
    }
  } catch (e) {
    logger.error(e);
    return { err: "Failed to get equipment!" };
  }
  let lastPage = true;
  if (equipments.length > EQUIPMENT_LIST_PAGE_SIZE) {
    lastPage = false;
    equipments.pop();
  }

  const send = {
    embeds: [],
    components: [],
  };

  const embed = buildEquipmentListEmbed(trainer.data, equipments, page);
  send.embeds.push(embed);

  // scroll buttons
  const scrollRowData = {
    stateId,
  };
  const scrollActionRow = buildScrollActionRow(
    page,
    lastPage,
    scrollRowData,
    eventNames.EQUIPMENT_SCROLL
  );
  send.components.push(scrollActionRow);

  // eq select row
  const selectRowData = {
    stateId,
  };
  const equipmentSelectActionRow = buildEquipmentSelectRow(
    equipments,
    selectRowData,
    eventNames.EQUIPMENT_LIST_SELECT
  );
  send.components.push(equipmentSelectActionRow);

  // pokemon select row
  // filter pokemon data and remove duplicates
  const pokemons = equipments.map((e) => ({
    _id: e._id,
    name: e.name,
    speciesId: e.speciesId,
  }));
  const uniquePokemons = pokemons.filter(
    (p, i) =>
      pokemons.findIndex((p2) => p2._id.toString() === p._id.toString()) === i
  );
  const pokemonSelectActionRow = buildPokemonSelectRow(
    uniquePokemons,
    selectRowData,
    eventNames.POKEMON_LIST_SELECT
  );
  send.components.push(pokemonSelectActionRow);

  return { send, err: null };
};

const buildEquipmentSwapSend = async ({
  stateId = null,
  user = null,
  swap = false,
} = {}) => {
  const state = getState(stateId);

  // if state pokemonid and pokemonid 2 are the same, return error
  if (state.pokemonId === state.pokemonId2) {
    return { err: "Cannot swap equipment with itself!" };
  }

  // if equipmentId not part of ids, return error
  const { equipmentType } = state;
  const ids = Object.keys(equipmentConfig);
  if (!ids.includes(equipmentType)) {
    return { err: "Invalid equipment type!" };
  }
  const { material } = equipmentConfig[equipmentType];
  const materialData = backpackItemConfig[material];

  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  let pokemon = await getPokemon(trainer, state.pokemonId);
  if (pokemon.err) {
    return { err: pokemon.err };
  }
  pokemon = pokemon.data;

  let pokemon2 = await getPokemon(trainer, state.pokemonId2);
  if (pokemon2.err) {
    return { err: pokemon2.err };
  }
  pokemon2 = pokemon2.data;

  // embed info
  const equipmentEmbed = buildEquipmentSwapEmbed(
    trainer,
    pokemon,
    pokemon2,
    equipmentType
  );

  if (swap) {
    const canSwapResult = await canSwap(trainer, equipmentType);
    if (canSwapResult.err) {
      return { err: canSwapResult.err };
    }

    // swap equipment
    const temp = pokemon.equipments[equipmentType];
    pokemon.equipments[equipmentType] = pokemon2.equipments[equipmentType];
    pokemon2.equipments[equipmentType] = temp;

    // reduce trainer money and materials
    trainer.money -= SWAP_COST * POKEDOLLAR_MULTIPLIER;
    removeItems(trainer, material, SWAP_COST);
    const updateRes = await updateTrainer(trainer);
    if (updateRes.err) {
      return { err: updateRes.err };
    }

    // save pokemon
    const pokemonUpdate = await calculateAndUpdatePokemonStats(
      pokemon,
      pokemonConfig[pokemon.speciesId],
      true
    );
    if (pokemonUpdate.err) {
      return { err: pokemonUpdate.err };
    }
    await calculateAndUpdatePokemonStats(
      pokemon2,
      pokemonConfig[pokemon2.speciesId],
      true
    );
    // TODO: why don't we check for error here lol

    return {
      send: {
        content: "Swap complete!",
        embeds: [equipmentEmbed],
        components: [],
      },
      err: null,
    };
  }
  // equipment swap button
  const swapData = {
    stateId,
  };
  const swapButtonConfigs = [
    {
      label: "Confirm Swap",
      disabled: (await canSwap(trainer, equipmentType)).err !== null,
      data: {
        ...swapData,
      },
      emoji: materialData.emoji,
    },
  ];
  const swapActionRow = buildButtonActionRow(
    swapButtonConfigs,
    eventNames.EQUIPMENT_SWAP
  );

  const send = {
    embeds: [equipmentEmbed],
    components: [swapActionRow],
  };

  return { send, err: null };
};

const buildNatureSend = async ({ stateId = null, user = null } = {}) => {
  const state = getState(stateId);

  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  let pokemon = await getPokemon(trainer, state.pokemonId);
  if (pokemon.err) {
    return { err: pokemon.err };
  }
  pokemon = pokemon.data;

  const { natureId } = state;
  const natureData = natureConfig[natureId];
  // if nature exists, change pokemon nature for display
  if (natureData) {
    pokemon.natureId = natureId;
    pokemon = calculatePokemonStats(pokemon, pokemonConfig[pokemon.speciesId]);
  }

  const send = {
    content: `You have ${getItems(trainer, backpackItems.MINT)} ${
      backpackItemConfig[backpackItems.MINT].emoji
    }.`,
    embeds: [],
    components: [],
  };

  // embed
  const embed = DEPRECATEDbuildPokemonEmbed(trainer, pokemon, "info");
  send.embeds.push(embed);

  // nature select row
  const selectData = {
    stateId,
  };
  const selectActionRow = buildIdConfigSelectRow(
    Object.keys(natureConfig),
    natureConfig,
    "Select Nature to change to",
    selectData,
    eventNames.NATURE_SELECT,
    false,
    ["description"],
    pokemon.natureId
  );
  send.components.push(selectActionRow);

  // if nature exists, add confirm button
  if (natureData) {
    const confirmData = {
      stateId,
    };
    const confirmButtonConfigs = [
      {
        label: `Confirm: ${natureData.name}`,
        disabled: false,
        data: confirmData,
        emoji: backpackItemConfig[backpackItems.MINT].emoji,
      },
    ];
    const confirmActionRow = buildButtonActionRow(
      confirmButtonConfigs,
      eventNames.NATURE_CONFIRM
    );
    send.components.push(confirmActionRow);
  }

  return { send, err: null };
};

/**
 * @param {WithId<Trainer>} trainer
 * @param {number} quantity
 * @returns {Promise<{numPokemon?: number, err?: string}>}
 */
const checkNumPokemon = async (trainer, quantity = 0) => {
  let pokemonLimit = MAX_POKEMON;
  // if trainer has computer lab locations, increase pokemon limit
  const labLevel = trainer.locations[locations.COMPUTER_LAB];
  if (labLevel) {
    pokemonLimit =
      locationConfig[locations.COMPUTER_LAB].levelConfig[labLevel].storage;
  }

  // check for max pokemon
  try {
    const numPokemon = await countDocuments(collectionNames.USER_POKEMON, {
      userId: trainer.userId,
    });
    if (
      numPokemon + quantity > pokemonLimit &&
      process.env.STAGE !== stageNames.ALPHA
    ) {
      return {
        numPokemon: numPokemon + quantity,
        err: "Max pokemon reached! Use `/release` or `/list` to release some pokemon, or get more storage by purchasing the Computer Lab location in the `/pokemart`!",
      };
    }
    return { numPokemon, err: null };
  } catch (error) {
    logger.error(error);
    return { err: "Error checking max Pokemon." };
  }
};

module.exports = {
  updatePokemon,
  listPokemons,
  listPokemonsFromTrainer,
  getPokemon,
  getPokemonFromUserId,
  getEvolvedPokemon,
  evolvePokemon,
  calculatePokemonStatsNoEquip,
  calculatePokemonStats,
  calculateAndUpdatePokemonStats,
  getIdFromNameOrId,
  releasePokemons,
  canRelease,
  addPokemonExpAndEVs,
  trainPokemon,
  setBattleEligible,
  getBattleEligible,
  canUpgradeEquipment,
  upgradeEquipmentLevel,
  rerollStatSlot,
  getPokemonOwnershipStats,
  checkNumPokemon,
  buildPokemonInfoSend,
  buildPokemonAllInfoSend,
  buildPokedexSend,
  buildReleaseSend,
  buildEquipmentSend,
  buildEquipmentUpgradeSend,
  onEquipmentScroll,
  buildEquipmentListSend,
  buildEquipmentSwapSend,
  buildNatureSend,
};
