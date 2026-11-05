const { ObjectId } = require("mongodb");
const { getCollection } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { pokemonConfig, natureConfig, typeConfig, rarities } = require("../config/pokemonConfig");
const { calculatePokemonStats, findOwnedPokemon, findOwnedPokemons } = require("./pokemon");
const { getTrainer, addExpAndMoneyTrainer } = require("./trainer");
const { canAddOrMovePokemonToParty, executePartyCommand } = require("./party");
const { projectTrainerProfile } = require("../web/trainerProfile");
const { getMoves } = require("../battle/data/moveRegistry");
const { getAbilities } = require("../battle/data/abilityRegistry");
const { getHeldItems } = require("../battle/data/heldItemRegistry");
const { getPokemonExpNeeded, getMoveIds } = require("../utils/pokemonUtils");
const { logger } = require("../log");
const { projectNpcCatalog, buildNpcBattle } = require("./npcBattle");
const { projectDungeonCatalog, projectTowerCatalog, startDungeon, startTower } = require("./playModes");
const { getDurableBattleService, isDurableBattleEnabled } = require("./durableBattle");

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
    nature: { name: nature.name, raisedStat: nature.stats.findIndex((value) => value > 0) < 0 ? null : nature.stats.findIndex((value) => value > 0),
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
  return { collection, detail, party, profile, npcs, dungeons, tower, interact };
};

module.exports = { createPlayerService, parseCollectionQuery, projectPokemon, projectPokemonDetail, projectPartyTargets, PlayerError };
