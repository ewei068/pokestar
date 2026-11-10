const { ObjectId } = require("mongodb");
const { getCollection } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { pokemonConfig, natureConfig, typeConfig, rarities } = require("../config/pokemonConfig");
const { calculatePokemonStats, findOwnedPokemon, findOwnedPokemons, changeHeldItem, removeHeldItem } = require("./pokemon");
const { getTrainer, addExpAndMoneyTrainer } = require("./trainer");
const { canAddOrMovePokemonToParty, executePartyCommand } = require("./party");
const { projectTrainerProfile } = require("../web/trainerProfile");
const { getMoves } = require("../battle/data/moveRegistry");
const { getAbilities } = require("../battle/data/abilityRegistry");
const { getHeldItems } = require("../battle/data/heldItemRegistry");
const { getPokemonExpNeeded, getMoveIds, getEquipmentSlotValue } = require("../utils/pokemonUtils");
const { logger } = require("../log");
const { projectNpcCatalog, buildNpcBattle } = require("./npcBattle");
const { projectDungeonCatalog, projectTowerCatalog, startDungeon, startTower } = require("./playModes");
const { backpackCategoryConfig, backpackItemConfig, backpackCategories, backpackItems } = require("../config/backpackConfig");
const { getDurableBattleService, isDurableBattleEnabled } = require("./durableBattle");
const { TrainingError, getOwnedTrainingContext, trainOwnedPokemon } = require("./training");
const { getNatureChoices, changePokemonNature } = require("./pokemonNature");
const { eventConfig, eventNames } = require("../config/eventConfig");
const { equipmentConfig, modifierConfig, modifierSlotConfig, MAX_EQUIPMENT_LEVEL,
  levelUpCost, STAT_REROLL_COST, POKEDOLLAR_MULTIPLIER } = require("../config/equipmentConfig");
const { isEquipmentAvailable, upgradeEquipmentLevel, rerollStatSlot } = require("./pokemonEquipment");

class PlayerError extends Error {
  /**
   * @param {string} code
   * @param {number} status
   */
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

/**
 * @typedef {object} CollectionQuery
 * @property {number} page
 * @property {number} pageSize
 * @property {string} search
 * @property {string} sort
 * @property {string} order
 * @property {string=} rarity
 * @property {string=} type
 * @property {boolean=} shiny
 * @property {boolean=} inParty
 * @property {number} minIv
 */
/** @param {Record<string, unknown>} input @returns {CollectionQuery} */
const parseCollectionQuery = (input = {}) => {
  const allowed = ["page", "pageSize", "search", "sort", "order", "rarity", "type", "shiny", "inParty", "minIv"];
  if (!input || typeof input !== "object" || Array.isArray(input) ||
      Object.keys(input).some((key) => !allowed.includes(key)) ||
      Object.values(input).some((value) => !["string", "number", "boolean"].includes(typeof value))) {
    throw new PlayerError("invalid_collection_query");
  }
  const page = Number(input.page ?? 1);
  const pageSize = Number(input.pageSize ?? 24);
  const minIv = Number(input.minIv ?? 0);
  const search = String(input.search ?? "").trim();
  const sort = String(input.sort ?? "name");
  const order = String(input.order ?? "asc");
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000000 ||
      !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
      !Number.isFinite(minIv) || minIv < 0 || minIv > 100 || search.length > 80 ||
      !["name", "cp", "iv", "level", "recent"].includes(sort) || !["asc", "desc"].includes(order)) {
    throw new PlayerError("invalid_collection_query");
  }
  const rarity = input.rarity === undefined ? undefined : String(input.rarity);
  const type = input.type === undefined ? undefined : String(input.type);
  if ((rarity !== undefined && !Object.values(rarities).some((value) => value === rarity)) ||
      (type !== undefined && !Object.values(typeConfig).some((value) => value.name === type))) {
    throw new PlayerError("invalid_collection_query");
  }
  /** @param {unknown} value @returns {boolean | undefined} */
  const boolean = (value) => {
    if (value === undefined) return undefined;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    throw new PlayerError("invalid_collection_query");
  };
  return { page, pageSize, search, sort, order, rarity, type, shiny: boolean(input.shiny), inParty: boolean(input.inParty), minIv };
};

/** @param {string} userId @returns {Promise<WithId<Trainer>>} */
/**
 * Owned rows in category order, then catalog order. A quantity counts only in
 * the item's configured category.
 * @param {Record<string, any>} trainer
 */
const projectBag = (trainer) => {
  const backpack = trainer.backpack && typeof trainer.backpack === "object" ? trainer.backpack : {};
  /** @type {Record<string, [string, { name: string, description: string, category: string, icon?: string }][]>} */
  const byCategory = {};
  for (const [id, item] of Object.entries(backpackItemConfig)) {
    (byCategory[item.category] ||= []).push([id, item]);
  }
  const items = [];
  for (const category of Object.keys(backpackCategoryConfig)) {
    for (const [id, item] of byCategory[category] || []) {
      const bucket = backpack[category];
      const quantity = bucket && typeof bucket === "object" ? bucket[id] : undefined;
      if (!Number.isFinite(quantity) || quantity <= 0) continue;
      items.push({
        id, name: item.name, description: item.description, category,
        categoryName: backpackCategoryConfig[category].name, quantity,
        icon: Object.prototype.hasOwnProperty.call(item, "icon") ? item.icon : null,
      });
    }
  }
  return { items };
};

const requireTrainer = async (userId) => {
  const result = await getTrainer({ id: userId }, false);
  if (result.err || !result.data) throw new PlayerError("trainer_unavailable", 503);
  return result.data;
};

/**
 * @param {WithId<Pokemon>} stored
 * @param {Trainer} trainer
 */
const projectPokemon = (stored, trainer) => {
  const species = pokemonConfig[stored.speciesId];
  const pokemon = calculatePokemonStats({ ...stored }, species);
  return {
    id: stored._id.toString(), speciesId: stored.speciesId,
    name: stored.name || species.name, speciesName: species.name,
    level: stored.level, shiny: Boolean(stored.shiny), rarity: species.rarity,
    types: species.type.map((type) => typeConfig[type].name),
    combatPower: pokemon.combatPower,
    ivPercent: Math.round((pokemon.ivTotal / 186) * 10000) / 100,
    inParty: trainer.party.pokemonIds.includes(stored._id.toString()),
    spriteUrl: stored.shiny ? species.shinySprite : species.sprite,
    battleEligible: Boolean(species.battleEligible),
  };
};

/**
 * @param {WithId<Pokemon>} stored
 * @param {Trainer} trainer
 */
const projectPokemonDetail = (stored, trainer) => {
  const species = pokemonConfig[stored.speciesId];
  const pokemon = calculatePokemonStats({ ...stored }, species);
  const nature = natureConfig[stored.natureId];
  const moves = getMoves({});
  const moveIds = getMoveIds(stored) || [];
  const ability = getAbilities({})[stored.abilityId];
  const heldItem = getHeldItems({})[stored.heldItemId];
  const baseExp = getPokemonExpNeeded(stored.level, species.growthRate);
  return {
    ...projectPokemon(stored, trainer), stats: pokemon.stats, ivs: [...stored.ivs], evs: [...stored.evs],
    nature: { id: String(stored.natureId), name: nature.name, raisedStat: nature.stats.findIndex((value) => value > 0) < 0 ? null : nature.stats.findIndex((value) => value > 0),
      loweredStat: nature.stats.findIndex((value) => value < 0) < 0 ? null : nature.stats.findIndex((value) => value < 0) },
    exp: stored.level >= 100 ? null : { current: stored.exp - baseExp, required: getPokemonExpNeeded(stored.level + 1, species.growthRate) - baseExp },
    moveIds: [...moveIds],
    moves: moveIds.filter((id) => moves[id]).map((id) => {
      const move = moves[id];
      return { id, name: move.name, type: typeConfig[move.type].name, damageType: move.damageType,
        power: move.power, accuracy: move.accuracy, cooldown: move.cooldown, description: move.description };
    }),
    abilityId: stored.abilityId,
    ability: ability ? { name: ability.name, description: ability.description } : null,
    heldItemId: stored.heldItemId || null,
    heldItem: heldItem ? { name: heldItem.name, description: heldItem.description } : null,
  };
};

/**
 * Web projection composed from Pokemon nature and held-item domain capabilities.
 * @param {WithId<Pokemon>} pokemon
 * @param {WithId<Trainer>} trainer
 * @param {ReturnType<typeof projectBag>["items"]=} items
 */
const projectBuild = (pokemon, trainer, items = projectBag(trainer).items) => ({ pokemon: projectPokemonDetail(pokemon, trainer), natures: getNatureChoices(pokemon),
    heldItems: items.filter(item => item.category === backpackCategories.HELD_ITEMS),
    mintQuantity: items.find(item => item.id === backpackItems.MINT)?.quantity || 0, mintCost: 1 });

/**
 * @typedef {{money: number, shards: number}} EquipmentSpend
 * @typedef {{id: EquipmentTypeEnum, name: string, icon: string, primaryStat: number,
 * materialId: BackpackItemEnum, slots: Record<string, EquipmentModifierEnum[]>}} EquipmentTypeView
 * @typedef {{id: EquipmentModifierEnum, name: string, description: string,
 * type: EquipmentModifierTypeEnum, stat: number, min: number, max: number}} EquipmentModifierView
 * @typedef {{maxLevel: number, moneyPerShard: number, rerollCost: EquipmentSpend,
 * types: EquipmentTypeView[], slots: Array<{id: EquipmentModifierSlotEnum, name: string, scalesWithLevel: boolean}>,
 * modifiers: EquipmentModifierView[]}} EquipmentCatalog
 * @typedef {{id: EquipmentTypeEnum, level: number, expectedEquipment: Equipment,
 * slots: Array<{id: EquipmentModifierSlotEnum, modifier: EquipmentModifierEnum, quality: number, value: number, nextValue: number}>,
 * upgradeCost: EquipmentSpend | null}} EquipmentPieceView
 * @typedef {{pokemon: ReturnType<typeof projectPokemonDetail>, money: number,
 * pieces: EquipmentPieceView[], materials: ReturnType<typeof projectBag>["items"], catalog: EquipmentCatalog,
 * trainer: ReturnType<typeof projectTrainerProfile>}} PokemonEquipmentContext
 * @typedef {PokemonEquipmentContext & {items: ReturnType<typeof projectBag>["items"], changed: boolean,
 * change: {kind: "upgrade" | "reroll", equipmentType: EquipmentTypeEnum, previousEquipment: Equipment,
 * slotId?: EquipmentModifierSlotEnum}, warning?: string}} PokemonEquipmentViewResult
 */

/** @returns {EquipmentCatalog} */
const projectEquipmentCatalog = () => ({
  maxLevel: MAX_EQUIPMENT_LEVEL, moneyPerShard: POKEDOLLAR_MULTIPLIER,
  rerollCost: { money: STAT_REROLL_COST * POKEDOLLAR_MULTIPLIER, shards: STAT_REROLL_COST },
  types: Object.entries(equipmentConfig).map(([typeId, type]) => ({ id: /** @type {EquipmentTypeEnum} */ (typeId),
    name: type.name, icon: `${typeId.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}.png`,
    primaryStat: modifierConfig[type.slots.primary.modifiers[0]].stat, materialId: type.material,
    slots: Object.fromEntries(Object.entries(type.slots).map(([slotId, slot]) => [slotId, [...slot.modifiers]])) })),
  slots: Object.entries(modifierSlotConfig).map(([slotId, slot]) => ({ id: /** @type {EquipmentModifierSlotEnum} */ (slotId),
    name: slot.name, scalesWithLevel: slot.level })),
  modifiers: Object.entries(modifierConfig).map(([modifierId, modifier]) => ({ id: /** @type {EquipmentModifierEnum} */ (modifierId), ...modifier })),
});

/**
 * Equipment display is composed from domain availability and canonical config.
 * No new equipment is synthesized by this read.
 * @param {WithId<Pokemon>} pokemon
 * @param {WithId<Trainer>} trainer
 * @returns {PokemonEquipmentContext}
 */
const projectEquipment = (pokemon, trainer) => {
  const catalog = projectEquipmentCatalog();
  /** @type {EquipmentPieceView[]} */
  const pieces = [];
  for (const type of catalog.types) {
    const equipment = pokemon.equipments?.[type.id];
    if (!isEquipmentAvailable(equipment, type.id)) continue;
    const shards = levelUpCost(equipment.level);
    pieces.push({ id: type.id, level: equipment.level, expectedEquipment: structuredClone(equipment),
      upgradeCost: equipment.level >= MAX_EQUIPMENT_LEVEL ? null : { money: shards * POKEDOLLAR_MULTIPLIER, shards },
      slots: catalog.slots.map(slot => ({ id: slot.id, modifier: equipment.slots[slot.id].modifier,
        quality: equipment.slots[slot.id].quality, value: getEquipmentSlotValue(slot.id, equipment.slots[slot.id], equipment.level),
        nextValue: getEquipmentSlotValue(slot.id, equipment.slots[slot.id], Math.min(MAX_EQUIPMENT_LEVEL, equipment.level + 1)) })) });
  }
  const materials = [...new Set(catalog.types.map(type => type.materialId))].map(id => {
    const item = backpackItemConfig[id];
    const quantity = trainer.backpack?.[item.category]?.[id];
    return { id, name: item.name, description: item.description, category: item.category,
      categoryName: backpackCategoryConfig[item.category].name,
      quantity: Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 0, icon: item.icon || null };
  });
  return { pokemon: projectPokemonDetail(pokemon, trainer), money: trainer.money, pieces, materials, catalog,
    trainer: projectTrainerProfile(trainer) };
};

/** @param {PartyInfo} party */
const projectPartyTargets = (party) => {
  /** @type {Record<string, Array<{kind: string, reason?: string}>>} */
  const targets = {};
  for (const candidate of ["new", ...party.pokemonIds.filter(Boolean)]) {
    targets[candidate] = party.pokemonIds.map((occupant, index) => {
      const result = canAddOrMovePokemonToParty(party, candidate, index);
      if (result.err) return { kind: "disabled", reason: result.err };
      if (candidate === "new") return { kind: occupant ? "replace" : "add" };
      return { kind: occupant ? "swap" : "move" };
    });
  }
  return targets;
};

/** Owned reads and explicit interactions. Discord keeps its existing grant policy. */
const createPlayerService = () => {
  /**
   * @param {string} userId
   * @param {Record<string, unknown>=} input
   */
  const collection = async (userId, input = {}) => {
    const query = parseCollectionQuery(input);
    const trainer = await requireTrainer(userId);
    // Current account capacity is 500. Compute before sorting so historical stored
    // CP cannot misorder results. API pages are bounded; account scans are not capped.
    const records = await findOwnedPokemons(userId);
    const items = records.map((pokemon) => projectPokemon(pokemon, trainer)).filter((pokemon) =>
      (!query.search || `${pokemon.name} ${pokemon.speciesName}`.toLowerCase().includes(query.search.toLowerCase())) &&
      (query.rarity === undefined || pokemon.rarity === query.rarity) &&
      (query.type === undefined || pokemon.types.includes(query.type)) &&
      (query.shiny === undefined || pokemon.shiny === query.shiny) &&
      (query.inParty === undefined || pokemon.inParty === query.inParty) && pokemon.ivPercent >= query.minIv);
    items.sort((a, b) => {
      let comparison;
      if (query.sort === "name") comparison = a.name.localeCompare(b.name);
      else if (query.sort === "recent") comparison = a.id.localeCompare(b.id);
      else if (query.sort === "cp") comparison = a.combatPower - b.combatPower;
      else if (query.sort === "iv") comparison = a.ivPercent - b.ivPercent;
      else comparison = a.level - b.level;
      return (query.order === "desc" ? -comparison : comparison) || a.id.localeCompare(b.id);
    });
    return { items: items.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
      page: query.page, pageSize: query.pageSize, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / query.pageSize)) };
  };
  /**
   * @param {string} userId
   * @param {string} id
   */
  const detail = async (userId, id) => {
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) throw new PlayerError("pokemon_not_found", 404);
    const trainer = await requireTrainer(userId);
    const pokemon = await findOwnedPokemon(userId, id);
    if (!pokemon) throw new PlayerError("pokemon_not_found", 404);
    return { pokemon: projectPokemonDetail(pokemon, trainer) };
  };
  /**
   * @param {string} userId
   * @param {string} id
   */
  const training = async (userId, id) => {
    try {
      const context = await getOwnedTrainingContext({ id: userId }, id);
      return { pokemon: projectPokemonDetail(context.pokemon, context.trainer), locations: context.locations };
    } catch (error) {
      if (error instanceof TrainingError) throw new PlayerError(error.code, error.status);
      throw error;
    }
  };
  /**
   * @param {string} userId
   * @param {string} id
   * @param {Record<string, unknown>} input
   */
  const train = async (userId, id, input) => {
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        Object.keys(input).length !== 1 || !Object.prototype.hasOwnProperty.call(input, "locationId") || typeof input.locationId !== "string") {
      throw new PlayerError("invalid_training_request");
    }
    let result;
    try {
      result = await trainOwnedPokemon({ id: userId }, id, input.locationId);
    } catch (error) {
      if (error instanceof TrainingError) throw new PlayerError(error.code, error.status);
      throw error;
    }
    let context = /** @type {import("./training").OwnedTrainingContext} */ (result);
    let { warning } = result;
    if (result.trained) {
      // This command's policy replaces the generic interaction grant. A saved
      // Pokemon operation is never replayed when a later effect/read fails.
      try {
        // Discord command configuration needs STAGE; load it only for this grant.
        // eslint-disable-next-line global-require
        const { commandConfig } = require("../config/commandConfig");
        const grant = await addExpAndMoneyTrainer(await requireTrainer(userId), commandConfig.train.exp, commandConfig.train.money);
        if (grant.err) throw new Error(grant.err);
      } catch (error) {
        logger.warn("Player training grant failed", error);
        warning = "Training saved, but participation rewards could not be confirmed. Refresh before training again.";
      }
      try {
        context = await getOwnedTrainingContext({ id: userId }, id);
      } catch (error) {
        logger.warn("Player training refresh failed", error);
        warning = "Training saved, but refreshed state could not be confirmed. Refresh before training again.";
      }
    }
    return { pokemon: projectPokemonDetail(context.pokemon, context.trainer), locations: context.locations,
      trainer: projectTrainerProfile(context.trainer), trained: result.trained, gains: result.gains,
      ...(warning ? { warning } : {}) };
  };
  /**
   * @param {string} userId
   * @param {string} id
   */
  const build = async (userId, id) => {
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) throw new PlayerError("pokemon_not_found", 404);
    const trainer = await requireTrainer(userId);
    const pokemon = await findOwnedPokemon(userId, id);
    if (!pokemon) throw new PlayerError("pokemon_not_found", 404);
    return projectBuild(pokemon, trainer);
  };
  /**
   * The domain change is not replayed when a later grant/read fails.
   * @param {string} userId
   * @param {import("./pokemonNature").PokemonNatureResult} result
   * @param {{exp: number, money: number}} grant
   */
  const finishBuildChange = async (userId, result, grant) => {
    if (result.err || !result.data) throw new PlayerError(result.code || "build_change_failed", result.status || 400);
    let { trainer, pokemon } = result.data;
    const { changed } = result.data;
    let warning;
    if (changed) {
      try {
        const awarded = await addExpAndMoneyTrainer(await requireTrainer(userId), grant.exp, grant.money);
        if (awarded.err) throw new Error(awarded.err);
      } catch (error) {
        logger.warn("Pokemon build participation grant failed", error);
        warning = "Change saved, but participation rewards could not be confirmed. Refresh Pokemon and Bag.";
      }
      try {
        trainer = await requireTrainer(userId);
        const refreshed = await findOwnedPokemon(userId, pokemon._id.toString());
        if (!refreshed) throw new Error("pokemon_not_found");
        pokemon = refreshed;
      } catch (error) {
        logger.warn("Pokemon build refresh failed", error);
        warning = "Change saved, but refreshed state could not be confirmed. Refresh Pokemon and Bag.";
      }
    }
    const { items } = projectBag(trainer);
    return { ...projectBuild(pokemon, trainer, items), items, trainer: projectTrainerProfile(trainer),
      changed, ...(warning ? { warning } : {}) };
  };
  /**
   * @param {string} userId
   * @param {string} id
   * @param {Record<string, unknown>} input
   */
  const changeNature = async (userId, id, input) => {
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== 2 ||
        typeof input.natureId !== "string" || typeof input.expectedNatureId !== "string" ||
        Object.keys(input).some(key => !["natureId", "expectedNatureId"].includes(key))) throw new PlayerError("invalid_nature_request");
    const result = await changePokemonNature({ id: userId }, id, input.natureId, input.expectedNatureId);
    const { exp, money } = eventConfig[eventNames.NATURE_CONFIRM];
    return finishBuildChange(userId, result, { exp, money });
  };
  /**
   * @param {string} userId
   * @param {string} id
   * @param {Record<string, unknown>} input
   */
  const changeHeld = async (userId, id, input) => {
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== 2 ||
        !(input.heldItemId === null || typeof input.heldItemId === "string") ||
        !(input.expectedHeldItemId === null || typeof input.expectedHeldItemId === "string") ||
        Object.keys(input).some(key => !["heldItemId", "expectedHeldItemId"].includes(key))) throw new PlayerError("invalid_held_item_request");
    const { heldItemId, expectedHeldItemId } = /** @type {{heldItemId: HeldItemIdEnum | null, expectedHeldItemId: HeldItemIdEnum | null}} */ (input);
    const result = heldItemId === null
      ? await removeHeldItem({ id: userId }, id, expectedHeldItemId)
      : await changeHeldItem({ id: userId }, id, heldItemId, expectedHeldItemId);
    return finishBuildChange(userId, result, { exp: 5, money: 10 });
  };

  /**
   * @param {string} userId
   * @param {string} id
   * @returns {Promise<PokemonEquipmentContext>}
   */
  const equipment = async (userId, id) => {
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) throw new PlayerError("pokemon_not_found", 404);
    const trainer = await requireTrainer(userId);
    const pokemon = await findOwnedPokemon(userId, id);
    if (!pokemon) throw new PlayerError("pokemon_not_found", 404);
    return projectEquipment(pokemon, trainer);
  };

  /**
   * Confirmed equipment changes are never replayed for failed later effects.
   * @param {string} userId
   * @param {import("./pokemonEquipment").PokemonEquipmentResult} result
   * @param {"upgrade" | "reroll"} kind
   * @returns {Promise<PokemonEquipmentViewResult>}
   */
  const finishEquipmentChange = async (userId, result, kind) => {
    if (result.err || !result.data) throw new PlayerError(result.code || "equipment_change_failed", result.status || 400);
    let { trainer, pokemon } = result.data;
    const warnings = result.warning ? [result.warning] : [];
    const policy = eventConfig[eventNames.EQUIPMENT_UPGRADE];
    try {
      const awarded = await addExpAndMoneyTrainer(await requireTrainer(userId), policy.exp || 0, policy.money || 0);
      if (awarded.err) throw new Error(awarded.err);
    } catch (error) {
      logger.warn("Equipment participation grant failed", error);
      warnings.push("Equipment saved, but participation rewards could not be confirmed. Refresh Pokemon and Bag.");
    }
    try {
      trainer = await requireTrainer(userId);
      const refreshed = await findOwnedPokemon(userId, pokemon._id.toString());
      if (!refreshed) throw new Error("pokemon_not_found");
      pokemon = refreshed;
    } catch (error) {
      logger.warn("Equipment refresh failed", error);
      warnings.push("Equipment saved, but refreshed state could not be confirmed. Refresh Pokemon and Bag.");
    }
    return { ...projectEquipment(pokemon, trainer), items: projectBag(trainer).items, changed: result.data.changed,
      change: { kind, equipmentType: result.data.equipmentType, previousEquipment: result.data.previousEquipment,
        ...(result.data.slotId ? { slotId: result.data.slotId } : {}) },
      ...(warnings.length ? { warning: warnings.join(" ") } : {}) };
  };

  /**
   * @param {string} userId
   * @param {string} id
   * @param {Record<string, unknown>} input
   * @param {"upgrade" | "reroll"} kind
   * @returns {Promise<PokemonEquipmentViewResult>}
   */
  const changeEquipment = async (userId, id, input, kind) => {
    const fields = kind === "upgrade" ? ["equipmentType", "expectedEquipment"] : ["equipmentType", "expectedEquipment", "slotId"];
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== fields.length
      || Object.keys(input).some(key => !fields.includes(key)) || typeof input.equipmentType !== "string"
      || !input.expectedEquipment || typeof input.expectedEquipment !== "object" || Array.isArray(input.expectedEquipment)
      || (kind === "reroll" && typeof input.slotId !== "string")) throw new PlayerError("invalid_equipment_request");
    const type = /** @type {EquipmentTypeEnum} */ (input.equipmentType);
    const expected = /** @type {Equipment} */ (input.expectedEquipment);
    const result = kind === "upgrade" ? await upgradeEquipmentLevel({ id: userId }, id, type, expected)
      : await rerollStatSlot({ id: userId }, id, type, /** @type {EquipmentModifierSlotEnum} */ (input.slotId), expected);
    return finishEquipmentChange(userId, result, kind);
  };
  /** @param {string} userId */
  const party = async (userId) => {
    const trainer = await requireTrainer(userId);
    const store = await getCollection(collectionNames.USER_POKEMON);
    const ids = trainer.party.pokemonIds.filter(Boolean).filter((id) => /^[a-f\d]{24}$/i.test(id));
    const records = /** @type {WithId<Pokemon>[]} */ (await store.find({ userId, _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray());
    const summaries = new Map(records.map((pokemon) => [pokemon._id.toString(), projectPokemon(pokemon, trainer)]));
    return { party: { rows: trainer.party.rows, cols: trainer.party.cols, capacity: 6,
      slots: trainer.party.pokemonIds.map((id) => summaries.get(id) || null), targets: projectPartyTargets(trainer.party) } };
  };
  /** @param {string} userId */
  const npcs = async (userId) => ({ npcs: projectNpcCatalog(await requireTrainer(userId)) });
  const dungeons = async (userId) => {
    await requireTrainer(userId);
    return { dungeons: projectDungeonCatalog() };
  };
  const tower = async (userId) => {
    const trainer = await requireTrainer(userId);
    return { ...projectTowerCatalog(), lastTowerStage: trainer.lastTowerStage };
  };
  /** @param {string} userId */
  const profile = async (userId) => ({ trainer: projectTrainerProfile(await requireTrainer(userId)) });
  /** @param {string} userId */
  const bag = async (userId) => projectBag(await requireTrainer(userId));
  /**
   * @param {string} userId
   * @param {Record<string, any>} input
   */
  const interact = async (userId, input) => {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new PlayerError("invalid_interaction");
    let result;
    if (input.kind === "collection" && Object.keys(input).every((key) => ["kind", "query"].includes(key))) {
      result = await collection(userId, input.query);
    } else if (input.kind === "inspect" && Object.keys(input).every((key) => ["kind", "pokemonId"].includes(key))) {
      result = await detail(userId, input.pokemonId);
    } else if (["party.place", "party.remove"].includes(input.kind) &&
        Object.keys(input).every((key) => ["kind", "pokemonId", "index", "expectedOccupant"].includes(key)) &&
        Object.prototype.hasOwnProperty.call(input, "expectedOccupant")) {
      const command = await executePartyCommand({ id: userId }, { kind: input.kind, pokemonId: input.pokemonId, index: input.index, expectedOccupant: input.expectedOccupant });
      if (command.err) throw new PlayerError(command.code || "invalid_party_command", command.code === "party_changed" ? 409 : 400);
      result = await party(userId);
    } else if (input.kind === "npc.start" && typeof input.npcId === "string" && typeof input.difficulty === "string" &&
        Object.keys(input).every((key) => ["kind", "npcId", "difficulty"].includes(key))) {
      if (!isDurableBattleEnabled()) throw new PlayerError("battle_unavailable", 503);
      const prepared = await buildNpcBattle({ user: { id: userId }, npcId: input.npcId, difficulty: input.difficulty, refreshIdentity: false });
      if (prepared.err) throw new PlayerError(prepared.code, prepared.code === "trainer_unavailable" ? 503 : 400);
      const started = await (await getDurableBattleService()).start({ battle: prepared.data,
        mode: { type: "pve", npcId: input.npcId, difficulty: input.difficulty } });
      result = { battleId: started.battleId };
    } else if (input.kind === "dungeon.start" && typeof input.dungeonId === "string" && typeof input.difficulty === "string" &&
        Object.keys(input).every((key) => ["kind", "dungeonId", "difficulty"].includes(key))) {
      if (!isDurableBattleEnabled()) throw new PlayerError("battle_unavailable", 503);
      const durable = await getDurableBattleService();
      const started = await startDungeon({ userId, dungeonId: input.dungeonId, difficulty: input.difficulty, start: (battle) => durable.start(battle) });
      if (started.err) throw new PlayerError(started.code, started.code === "trainer_unavailable" ? 503 : 400);
      result = { battleId: started.battleId };
    } else if (input.kind === "tower.start" && Number.isInteger(input.stage) &&
        Object.keys(input).every((key) => ["kind", "stage"].includes(key))) {
      if (!isDurableBattleEnabled()) throw new PlayerError("battle_unavailable", 503);
      const durable = await getDurableBattleService();
      const started = await startTower({
        userId, stage: input.stage, listActive: (id) => durable.listActive(id), start: (battle) => durable.start(battle),
      });
      if (started.err) throw new PlayerError(started.code, started.code === "trainer_unavailable" ? 503 : 400);
      result = { battleId: started.battleId };
    } else throw new PlayerError("invalid_interaction");
    // Participation rewards are best effort. Never replay a completed command
    // because its grant failed; duplicates across separate requests are accepted.
    try {
      const grant = await addExpAndMoneyTrainer(await requireTrainer(userId), 5, 10);
      if (grant.err) logger.warn("Player interaction grant failed", grant.err);
    } catch (error) { logger.warn("Player interaction grant failed", error); }
    return { ...result, ...await profile(userId) };
  };
  return { collection, detail, training, train, build, changeNature, changeHeldItem: changeHeld, equipment,
    /**
     * @param {string} userId
     * @param {string} id
     * @param {Record<string, unknown>} input
     * @returns {Promise<PokemonEquipmentViewResult>}
     */
    upgradeEquipment: (userId, id, input) => changeEquipment(userId, id, input, "upgrade"),
    /**
     * @param {string} userId
     * @param {string} id
     * @param {Record<string, unknown>} input
     * @returns {Promise<PokemonEquipmentViewResult>}
     */
    rerollEquipment: (userId, id, input) => changeEquipment(userId, id, input, "reroll"),
    party, profile, npcs, dungeons, tower, bag, interact };
};

module.exports = { createPlayerService, parseCollectionQuery, projectPokemon, projectPokemonDetail, projectPartyTargets, PlayerError };
