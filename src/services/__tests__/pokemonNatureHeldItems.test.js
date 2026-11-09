jest.resetModules();
const { ObjectId } = require("mongodb");
const db = require("../../database/mongoHandler");
const trainerService = require("../trainer");
const { createMockPokemon } = require("../../__testing__/mocks/pokemon");
const { collectionNames } = require("../../config/databaseConfig");
const { natureConfig, pokemonConfig } = require("../../config/pokemonConfig");
const { backpackItems, backpackCategories, backpackItemConfig } = require("../../config/backpackConfig");
const { modifierConfig, modifierSlotConfig } = require("../../config/equipmentConfig");
const { changeHeldItem, removeHeldItem, calculatePokemonStats, buildNatureSend } = require("../pokemon");
const { changePokemonNature, getNatureChoices } = require("../pokemonNature");

jest.mock("../trainer", () => ({ getTrainer: jest.fn() }));
jest.mock("../state", () => ({ getState: jest.fn() }));
jest.mock("../../embeds/pokemonEmbeds", () => ({ DEPRECATEDbuildPokemonEmbed: jest.fn() }));
const { getState } = require("../state");

const mockGetTrainer = /** @type {jest.Mock} */ (trainerService.getTrainer);
const mockGetCollection = /** @type {jest.Mock} */ (db.getCollection);
const mockWrite = /** @type {jest.Mock} */ (db.findAndUpdateDocument);
const mockGetState = jest.mocked(getState);
const actor = { id: "owner", username: "Owner", discriminator: "0", avatar: "" };
const mint = backpackItems.MINT;
const mintCategory = backpackItemConfig[mint].category;
const firstItem = backpackItems.LEFTOVERS;
const secondItem = backpackItems.CHOICE_BAND;
let trainer;
let pokemon;
let beforeWrite;
const readPath = (record, path) => path.split(".").reduce((value, key) => value?.[key], record);
const matches = (record, filter) => Object.entries(filter).every(([key, condition]) => {
  const value = readPath(record, key);
  if (key === "_id") return record._id.equals(condition);
  if (condition && typeof condition === "object") {
    if ("$eq" in condition) return JSON.stringify(value) === JSON.stringify(condition.$eq);
    if ("$exists" in condition) return (value !== undefined) === condition.$exists;
  }
  return value === condition;
});
const setPath = (record, path, value, unset = false) => {
  const parts = path.split(".");
  const last = parts.pop();
  let target = record;
  for (const key of parts) { target[key] ||= {}; target = target[key]; }
  if (unset) delete target[last];
  else target[last] = value;
};
const snapshotPokemon = () => ({ ...structuredClone(pokemon), _id: pokemon._id });
/**
 * @param {string} id
 * @param {string=} category
 */
const quantity = (id, category = backpackCategories.HELD_ITEMS) => trainer.backpack[category]?.[id] || 0;
const id = () => pokemon._id.toHexString();

beforeEach(() => {
  jest.clearAllMocks();
  beforeWrite = () => {};
  trainer = { userId: actor.id, money: 100, exp: 0, backpack: { [mintCategory]: { [mint]: 3 }, 3: { [firstItem]: 1, [secondItem]: 1 } }, party: { pokemonIds: [] } };
  pokemon = { ...createMockPokemon({ userId: actor.id }), _id: new ObjectId(), stats: [1, 2, 3, 4, 5, 6] };
  mockGetTrainer.mockImplementation(async () => ({ data: structuredClone(trainer) }));
  mockGetCollection.mockResolvedValue({ findOne: async (filter) => matches(pokemon, filter) ? snapshotPokemon() : null });
  mockWrite.mockImplementation(async (collection, filter, update) => {
    const record = collection === collectionNames.USERS ? trainer : pokemon;
    beforeWrite(collection, filter, update);
    if (!matches(record, filter)) return { value: null };
    for (const [path, value] of Object.entries(update.$set || {})) setPath(record, path, value);
    for (const [path, value] of Object.entries(update.$inc || {})) setPath(record, path, (readPath(record, path) || 0) + value);
    for (const path of Object.keys(update.$unset || {})) setPath(record, path, null, true);
    return { value: collection === collectionNames.USERS ? structuredClone(trainer) : snapshotPokemon() };
  });
});

test("all configured previews preserve equipment and use the canonical calculator without persistence", () => {
  const slot = Object.keys(modifierSlotConfig)[0];
  pokemon.equipments = { 0: { level: 7, slots: { [slot]: { modifier: Object.keys(modifierConfig)[0], quality: 100 } } } };
  const before = snapshotPokemon();
  const choices = getNatureChoices(pokemon);
  expect(choices).toHaveLength(25);
  for (const choice of choices) {
    expect(choice.stats).toEqual(calculatePokemonStats({ ...pokemon, natureId: choice.id }, pokemonConfig[pokemon.speciesId]).stats);
    expect(choice).toMatchObject({ name: natureConfig[choice.id].name,
      raisedStat: natureConfig[choice.id].stats.indexOf(1) < 0 ? null : natureConfig[choice.id].stats.indexOf(1),
      loweredStat: natureConfig[choice.id].stats.indexOf(-1) < 0 ? null : natureConfig[choice.id].stats.indexOf(-1) });
  }
  expect(pokemon).toEqual(before);
  expect(db.findAndUpdateDocument).not.toHaveBeenCalled();
});

test("current choices and empty removal spend nothing, including numeric nature and no spare held copy", async () => {
  pokemon.natureId = 0;
  expect(await changePokemonNature(actor, id(), "0", 0)).toMatchObject({ data: { changed: false } });
  pokemon.heldItemId = firstItem;
  trainer.backpack[3][firstItem] = 0;
  expect(await changeHeldItem(actor, id(), firstItem, firstItem)).toMatchObject({ data: { changed: false } });
  delete pokemon.heldItemId;
  expect(await removeHeldItem(actor, id(), null)).toMatchObject({ data: { changed: false } });
  expect(db.findAndUpdateDocument).not.toHaveBeenCalled();
});

test("distinct neutral nature costs one Mint and leaves trainer participation fields untouched", async () => {
  pokemon.natureId = 0;
  const result = await changePokemonNature(actor, id(), 6, "0");
  expect(result).toMatchObject({ data: { changed: true, pokemon: { natureId: "6" } } });
  expect(quantity(mint, mintCategory)).toBe(2);
  expect(trainer).toMatchObject({ money: 100, exp: 0 });
  const [, filter, patch, options] = mockWrite.mock.calls[1];
  expect(filter.natureId).toEqual({ $eq: 0 });
  expect(Object.keys(patch.$set).sort()).toEqual(["combatPower", "ivTotal", "natureId", "stats"]);
  expect(options).toEqual({ upsert: false, returnDocument: "after" });
  expect(trainerService.getTrainer).toHaveBeenCalledWith(actor, false);
});

test("give, swap and removal transfer exact items without modifying stored stats", async () => {
  const stats = [...pokemon.stats];
  expect(await changeHeldItem(actor, id(), firstItem, null)).toMatchObject({ data: { changed: true } });
  expect(quantity(firstItem)).toBe(0);
  expect(await changeHeldItem(actor, id(), secondItem, firstItem)).toMatchObject({ data: { changed: true } });
  expect(quantity(firstItem)).toBe(1);
  expect(quantity(secondItem)).toBe(0);
  expect(await removeHeldItem(actor, id(), secondItem)).toMatchObject({ data: { changed: true } });
  expect(quantity(secondItem)).toBe(1);
  expect(pokemon.stats).toEqual(stats);
  for (const [collection, , patch, options] of mockWrite.mock.calls) {
    expect(options.upsert).toBe(false);
    if (collection === collectionNames.USER_POKEMON) expect(Object.keys(patch.$set)).toEqual(["heldItemId"]);
  }
});

test("invalid choices, owner, stock and stale target make no persistence calls", async () => {
  for (const nature of ["unknown", "__proto__", "01", NaN, {}, null]) expect((await changePokemonNature(actor, id(), /** @type {string | number} */ (nature))).err).toBeTruthy();
  for (const item of [mint, "unknown", "__proto__", null]) expect((await changeHeldItem(actor, id(), /** @type {HeldItemIdEnum} */ (item))).err).toBeTruthy();
  expect((await changeHeldItem(actor, "bad", firstItem)).status).toBe(404);
  expect((await changePokemonNature(actor, id(), "3", "2")).status).toBe(409);
  expect((await changeHeldItem(actor, id(), firstItem, secondItem)).status).toBe(409);
  trainer.backpack[3][firstItem] = 0;
  trainer.backpack[mintCategory][mint] = 0;
  expect((await changeHeldItem(actor, id(), firstItem)).err).toBeTruthy();
  expect((await changePokemonNature(actor, id(), "3")).err).toBeTruthy();
  pokemon.userId = "other";
  expect((await changePokemonNature(actor, id(), "3")).status).toBe(404);
  expect(db.findAndUpdateDocument).not.toHaveBeenCalled();
});

test("concurrent last-item observations cannot both debit the same quantity", async () => {
  const results = await Promise.all([changeHeldItem(actor, id(), firstItem, null), changeHeldItem(actor, id(), firstItem, null)]);
  expect(results.filter((result) => result.data?.changed)).toHaveLength(1);
  expect(results.filter((result) => result.status === 409)).toHaveLength(1);
  expect(quantity(firstItem)).toBe(0);
});

test.each(["exp", "level", "evs", "speciesId", "natureId", "ivs", "equipments", "userId"])("a newer %s prevents nature overwrite and returns the observed Mint once", async (field) => {
  const values = { exp: 99, level: 51, evs: [1, 0, 0, 0, 0, 0], speciesId: "4", natureId: "2", ivs: [1, 1, 1, 1, 1, 1], equipments: { 1: {} }, userId: "other" };
  beforeWrite = (collection) => { if (collection === collectionNames.USER_POKEMON) pokemon[field] = values[field]; };
  expect(await changePokemonNature(actor, id(), "3", "1")).toMatchObject({ status: 409 });
  expect(pokemon[field]).toEqual(values[field]);
  expect(quantity(mint, mintCategory)).toBe(3);
  expect(db.findAndUpdateDocument).toHaveBeenCalledTimes(3);
});

test("narrow writes preserve unrelated concurrent trainer and Pokemon fields", async () => {
  beforeWrite = (collection) => {
    if (collection === collectionNames.USER_POKEMON) {
      pokemon.name = "New name"; pokemon.heldItemId = secondItem;
      trainer.money = 999; trainer.party.pokemonIds = ["other"];
    }
  };
  await changePokemonNature(actor, id(), "3", "1");
  expect(pokemon).toMatchObject({ name: "New name", heldItemId: secondItem, natureId: "3" });
  expect(trainer).toMatchObject({ money: 999, party: { pokemonIds: ["other"] } });
});

test("definitive held rejection restores missing inventory paths exactly once", async () => {
  pokemon.heldItemId = firstItem;
  delete trainer.backpack[3][firstItem];
  beforeWrite = (collection) => { if (collection === collectionNames.USER_POKEMON) pokemon.heldItemId = "h201"; };
  expect(await changeHeldItem(actor, id(), secondItem, firstItem)).toMatchObject({ status: 409 });
  expect(trainer.backpack[3][firstItem]).toBeUndefined();
  expect(quantity(secondItem)).toBe(1);
  expect(db.findAndUpdateDocument).toHaveBeenCalledTimes(3);
  expect(mockWrite.mock.calls[0][1][`backpack.3.${firstItem}`]).toEqual({ $exists: false });
  expect(mockWrite.mock.calls[2][1][`backpack.3.${firstItem}`]).toEqual({ $eq: 1 });
});

test.each(["conflict", "throw"])("failed inverse (%s) reports uncertainty without overwriting new inventory", async (failure) => {
  beforeWrite = (collection) => {
    if (collection === collectionNames.USER_POKEMON) { pokemon.heldItemId = secondItem; trainer.backpack[3][firstItem] = 7; }
    if (mockWrite.mock.calls.length === 3 && failure === "throw") throw new Error("inverse connection lost");
  };
  expect(await changeHeldItem(actor, id(), firstItem, null)).toMatchObject({ code: "configuration_uncertain", status: 503 });
  expect(quantity(firstItem)).toBe(7);
  expect(db.findAndUpdateDocument).toHaveBeenCalledTimes(3);
});

test.each([collectionNames.USERS, collectionNames.USER_POKEMON])("an ambiguous %s write is never blindly reversed or replayed", async (failedCollection) => {
  beforeWrite = (collection) => { if (collection === failedCollection) throw new Error("response lost"); };
  expect(await changePokemonNature(actor, id(), "3", "1")).toMatchObject({ code: "configuration_uncertain", status: 503 });
  expect(db.findAndUpdateDocument).toHaveBeenCalledTimes(failedCollection === collectionNames.USERS ? 1 : 2);
});


test("Discord preview binds the original nature before previewing and retains it on later renders", async () => {
  pokemon.natureId = 0;
  const state = { pokemonId: id(), natureId: "3" };
  mockGetState.mockReturnValue(state);
  await buildNatureSend({ stateId: "state", user: actor });
  expect(state.expectedNatureId).toBe(0);
  expect(pokemon.natureId).toBe(0);
  pokemon.natureId = "6";
  state.natureId = "5";
  await buildNatureSend({ stateId: "state", user: actor });
  expect(state.expectedNatureId).toBe(0);
  expect(db.findAndUpdateDocument).not.toHaveBeenCalled();
});
