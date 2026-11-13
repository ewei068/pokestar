jest.resetModules();
const { ObjectId } = require("mongodb");
const db = require("../../database/mongoHandler");
const trainerService = require("../trainer");
const { createMockPokemon } = require("../../__testing__/mocks/pokemon");
const { collectionNames } = require("../../config/databaseConfig");
const { backpackItems, backpackItemConfig } = require("../../config/backpackConfig");
const { equipmentConfig, equipmentTypes, modifierSlots } = require("../../config/equipmentConfig");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { calculatePokemonStats, buildEquipmentUpgradeSend } = require("../pokemon");
const { getState } = require("../state");
const { upgradeEquipmentLevel, rerollStatSlot } = require("../pokemonEquipment");
const { registerTrainerEventListener } = require("../game/gameEvent");
const { trainerEventEnum } = require("../../enums/gameEnums");
const { achievementConfig } = require("../../config/questConfig");

jest.mock("../trainer", () => ({ ...jest.requireActual("../trainer"), getTrainer: jest.fn() }));
jest.mock("../../utils/gachaUtils", () => ({ ...jest.requireActual("../../utils/gachaUtils"), drawIterable: jest.fn(), drawUniform: jest.fn() }));
jest.mock("../state", () => ({ getState: jest.fn() }));

const { drawIterable, drawUniform } = require("../../utils/gachaUtils");

const mockTrainer = jest.mocked(trainerService.getTrainer);
const mockWrite = /** @type {jest.Mock} */ (db.findAndUpdateDocument);
const mockUpdate = /** @type {jest.Mock} */ (db.updateDocument);
const mockCollection = /** @type {jest.Mock} */ (db.getCollection);
const actor = { id: "equipment-owner" };
const { POWER_BELT: type } = equipmentTypes;
const material = backpackItems.KNOWLEDGE_SHARD;
const { category } = backpackItemConfig[material];
let trainer;
let pokemon;
let beforeWrite;
let afterWrite;

const readPath = (record, path) => path.split(".").reduce((value, key) => value?.[key], record);
const matches = (record, filter) => Object.entries(filter).every(([key, condition]) => {
  if (key === "_id") return record._id.equals(condition);
  const value = readPath(record, key);
  if (condition && typeof condition === "object") {
    if ("$eq" in condition) return JSON.stringify(value) === JSON.stringify(condition.$eq);
    if ("$exists" in condition) return (value !== undefined) === condition.$exists;
  }
  return value === condition;
});
const apply = (record, patch) => {
  for (const [path, value] of Object.entries(patch.$set || {})) {
    const parts = path.split(".");
    const key = parts.pop();
    let target = record;
    for (const part of parts) { target[part] ||= {}; target = target[part]; }
    target[key] = structuredClone(value);
  }
};
const snapshotPokemon = () => ({ ...structuredClone(pokemon), _id: pokemon._id });
const id = () => pokemon._id.toHexString();
const observed = () => structuredClone(pokemon.equipments[type]);
const shards = () => trainer.backpack[category][material];
const upgrade = (expected = observed()) => upgradeEquipmentLevel(actor, id(), type, expected);
/**
 * @param {EquipmentModifierSlotEnum=} slot
 * @param {Equipment=} expected
 */
const reroll = (slot = modifierSlots.PRIMARY, expected = observed()) => rerollStatSlot(actor, id(), type, slot, expected);
const equipment = (equipmentType, level = 4) => ({ level, slots: Object.fromEntries(Object.entries(equipmentConfig[equipmentType].slots)
  .map(([slot, config], index) => [slot, { modifier: config.modifiers[0], quality: [75, 65, 42, 88, 23][index] }])) });
const progress = jest.fn(async (args) => {
  const quest = args.eventName === trainerEventEnum.UPGRADED_EQUIPMENT ? "upgradeEquipment" : "rerollEquipment";
  const result = await achievementConfig[quest].questListeners[0].listenerCallback(args);
  const entry = args.trainer.questData.achievements[quest];
  entry.progress += result.progress;
});
registerTrainerEventListener(trainerEventEnum.UPGRADED_EQUIPMENT, progress);
registerTrainerEventListener(trainerEventEnum.REROLLED_EQUIPMENT, progress);

beforeEach(() => {
  jest.clearAllMocks();
  beforeWrite = () => {};
  afterWrite = () => {};
  trainer = { userId: actor.id, user: { username: "Owner" }, money: 5000, exp: 0,
    backpack: { [category]: { [material]: 20, [backpackItems.EMOTION_SHARD]: 7 } }, party: { pokemonIds: [] },
    questData: { achievements: { upgradeEquipment: { stage: 0, progress: 0 }, rerollEquipment: { stage: 0, progress: 0 } } } };
  pokemon = { ...createMockPokemon({ userId: actor.id }), _id: new ObjectId(), equipments: {
    [type]: equipment(type), [equipmentTypes.POWER_WEIGHT]: equipment(equipmentTypes.POWER_WEIGHT, 2),
  } };
  calculatePokemonStats(pokemon, pokemonConfig[pokemon.speciesId]);
  mockTrainer.mockImplementation(async () => ({ data: structuredClone(trainer), err: null }));
  mockCollection.mockResolvedValue({ findOne: async filter => matches(pokemon, filter) ? snapshotPokemon() : null });
  mockWrite.mockImplementation(async (collection, filter, patch) => {
    beforeWrite(collection, filter, patch);
    const record = collection === collectionNames.USERS ? trainer : pokemon;
    if (!matches(record, filter)) return { value: null };
    apply(record, patch);
    afterWrite(collection, filter, patch);
    return { value: collection === collectionNames.USERS ? structuredClone(trainer) : snapshotPokemon() };
  });
  mockUpdate.mockImplementation(async (collection, filter, patch) => {
    beforeWrite(collection, filter, patch);
    if (!matches(trainer, filter)) return { modifiedCount: 0 };
    apply(trainer, patch);
    afterWrite(collection, filter, patch);
    return { modifiedCount: 1 };
  });
  jest.mocked(drawIterable).mockImplementation(values => [values[0]]);
  jest.mocked(drawUniform).mockReturnValue([100]);
});

test("one level spends exact resources and persists canonical stats and one progression event", async () => {
  const previous = observed();
  const result = await upgrade();
  expect(result).toMatchObject({ data: { changed: true, previousEquipment: previous, equipmentType: type } });
  expect(pokemon.equipments[type].level).toBe(5);
  expect(pokemon.equipments[type].slots).toEqual(previous.slots);
  expect(trainer).toMatchObject({ money: 4000, exp: 0, questData: { achievements: { upgradeEquipment: { progress: 1 } } } });
  expect(shards()).toBe(15);
  expect(pokemon.stats).toEqual(calculatePokemonStats(snapshotPokemon(), pokemonConfig[pokemon.speciesId]).stats);
  expect(progress).toHaveBeenCalledTimes(1);
  expect(mockWrite).toHaveBeenCalledTimes(2);
  expect(Object.keys(mockWrite.mock.calls[1][2].$set).sort()).toEqual(["combatPower", `equipments.${type}`, "ivTotal", "stats"]);
  expect(drawIterable).not.toHaveBeenCalled();
});

test("level nine upgrades to ten with exact stock; level ten rejects upgrade but permits reroll", async () => {
  pokemon.equipments[type].level = 9;
  trainer.money = 2000;
  trainer.backpack[category][material] = 10;
  expect((await upgrade()).data.changed).toBe(true);
  expect(trainer.money).toBe(0);
  expect(shards()).toBe(0);
  expect((await upgrade()).code).toBe("equipment_max_level");
  trainer.money = 1000;
  trainer.backpack[category][material] = 5;
  expect((await reroll()).data.changed).toBe(true);
  expect(pokemon.equipments[type].level).toBe(10);
  expect(trainer.money).toBe(0);
  expect(shards()).toBe(0);
});

test.each([0, 100])("reroll quality %s replaces only the selected slot once", async quality => {
  const previous = observed();
  const nextModifier = equipmentConfig[type].slots.secondary.modifiers[1];
  jest.mocked(drawIterable).mockReturnValue([nextModifier]);
  jest.mocked(drawUniform).mockReturnValue([quality]);
  const result = await reroll(modifierSlots.SECONDARY);
  expect(result.data).toMatchObject({ previousEquipment: previous, slotId: modifierSlots.SECONDARY });
  expect(pokemon.equipments[type].slots.secondary).toEqual({ modifier: nextModifier, quality });
  expect(pokemon.equipments[type].slots.primary).toEqual(previous.slots.primary);
  expect(trainer.money).toBe(4000);
  expect(shards()).toBe(15);
  expect(drawIterable).toHaveBeenCalledTimes(1);
  expect(drawUniform).toHaveBeenCalledTimes(1);
  expect(progress).toHaveBeenCalledTimes(1);
});

test("an identical primary draw is a paid successful roll and progresses exactly once", async () => {
  const previous = observed();
  jest.mocked(drawUniform).mockReturnValue([75]);
  expect((await reroll()).data.changed).toBe(true);
  expect(pokemon.equipments[type]).toEqual(previous);
  expect(trainer.money).toBe(4000);
  expect(shards()).toBe(15);
  expect(trainer.questData.achievements.rerollEquipment.progress).toBe(1);
  expect(progress).toHaveBeenCalledTimes(1);
});

test("invalid inputs, missing equipment or slot and stale expectation never draw or write", async () => {
  for (const invalid of ["__proto__", "unknown", {}, null, 1]) {
    expect((await upgradeEquipmentLevel(actor, id(), /** @type {EquipmentTypeEnum} */ (invalid), observed())).status).toBe(400);
    expect((await rerollStatSlot(actor, id(), type, /** @type {EquipmentModifierSlotEnum} */ (invalid), observed())).status).toBe(400);
  }
  expect((await upgradeEquipmentLevel(actor, "bad", type)).status).toBe(404);
  expect((await upgrade({ ...observed(), level: 3 })).status).toBe(409);
  delete pokemon.equipments[type].slots.substat3;
  expect((await reroll(modifierSlots.SUBSTAT3)).status).toBe(400);
  delete pokemon.equipments[type];
  expect((await upgradeEquipmentLevel(actor, id(), type)).status).toBe(400);
  expect(mockWrite).not.toHaveBeenCalled();
  expect(drawIterable).not.toHaveBeenCalled();
  expect(progress).not.toHaveBeenCalled();
});

test.each(["empty", "incomplete"])("%s persisted slots cannot buy a level or draw a reroll", async condition => {
  if (condition === "empty") pokemon.equipments[type].slots = {};
  else delete pokemon.equipments[type].slots.substat3;
  expect((await upgrade()).code).toBe("equipment_unavailable");
  expect((await reroll()).code).toBe("equipment_unavailable");
  expect(trainer.money).toBe(5000);
  expect(shards()).toBe(20);
  expect(mockWrite).not.toHaveBeenCalled();
  expect(drawIterable).not.toHaveBeenCalled();
});

test("fresh identity and owner validation reject foreign Pokémon and trainer mismatches", async () => {
  pokemon.userId = "other";
  expect((await upgrade()).status).toBe(404);
  pokemon.userId = actor.id;
  trainer.userId = "other";
  expect((await upgrade()).status).toBe(503);
  expect(mockWrite).not.toHaveBeenCalled();
  expect(mockTrainer).toHaveBeenCalledWith(actor, false);
});

test.each(["money", "shards", "invalid-money", "invalid-shards"])("%s shortage or invalid stock rejects before drawing", async condition => {
  if (condition === "money") trainer.money = 999;
  if (condition === "shards") trainer.backpack[category][material] = 4;
  if (condition === "invalid-money") trainer.money = Infinity;
  if (condition === "invalid-shards") trainer.backpack[category][material] = 5.5;
  expect((await reroll()).status).toBe(400);
  expect(mockWrite).not.toHaveBeenCalled();
  expect(drawIterable).not.toHaveBeenCalled();
});

test.each(["money", "shards"])("a concurrent %s write prevents the entire resource debit", async field => {
  beforeWrite = collection => {
    if (collection === collectionNames.USERS) {
      if (field === "money") trainer.money = 4999;
      else trainer.backpack[category][material] = 19;
    }
  };
  expect((await upgrade()).status).toBe(409);
  expect(pokemon.equipments[type].level).toBe(4);
  expect(trainer.money).toBe(field === "money" ? 4999 : 5000);
  expect(shards()).toBe(field === "shards" ? 19 : 20);
  expect(progress).not.toHaveBeenCalled();
});

test.each(["exp", "level", "evs", "speciesId", "natureId", "ivs", "equipments", "userId"])("a concurrent %s change rejects the build and restores resources once", async field => {
  const values = { exp: 99, level: 51, evs: [1, 0, 0, 0, 0, 0], speciesId: "4", natureId: "2", ivs: [1, 1, 1, 1, 1, 1],
    equipments: { ...pokemon.equipments, [equipmentTypes.POWER_WEIGHT]: equipment(equipmentTypes.POWER_WEIGHT, 3) }, userId: "other" };
  beforeWrite = collection => { if (collection === collectionNames.USER_POKEMON) pokemon[field] = values[field]; };
  expect((await upgrade()).status).toBe(409);
  expect(pokemon[field]).toEqual(values[field]);
  expect(trainer.money).toBe(5000);
  expect(shards()).toBe(20);
  expect(mockWrite).toHaveBeenCalledTimes(3);
  expect(progress).not.toHaveBeenCalled();
});

test("unrelated concurrent fields survive resource, Pokémon and quest writes", async () => {
  beforeWrite = (collection, filter) => {
    if (collection === collectionNames.USERS && !filter.money) trainer.money = 3333;
    trainer.backpack[category][backpackItems.EMOTION_SHARD] = 99;
    trainer.party.pokemonIds = ["new-party"];
    pokemon.name = "Renamed";
    pokemon.heldItemId = "h197";
    pokemon.locked = true;
  };
  expect((await upgrade()).warning).toBeUndefined();
  expect(trainer).toMatchObject({ money: 3333, party: { pokemonIds: ["new-party"] } });
  expect(trainer.backpack[category][backpackItems.EMOTION_SHARD]).toBe(99);
  expect(pokemon).toMatchObject({ name: "Renamed", heldItemId: "h197", locked: true });
});

test("failed inverse does not overwrite a newer resource value and reports uncertainty", async () => {
  beforeWrite = collection => {
    if (collection === collectionNames.USER_POKEMON) { pokemon.level = 51; trainer.money = 3999; }
  };
  expect(await upgrade()).toMatchObject({ code: "equipment_uncertain", status: 503 });
  expect(trainer.money).toBe(3999);
  expect(shards()).toBe(15);
  expect(mockWrite).toHaveBeenCalledTimes(3);
});

test("a thrown inverse reports uncertainty without a second compensation attempt", async () => {
  beforeWrite = collection => {
    if (collection === collectionNames.USER_POKEMON) pokemon.level = 51;
    if (mockWrite.mock.calls.length === 3) throw new Error("inverse response unavailable");
  };
  expect(await upgrade()).toMatchObject({ code: "equipment_uncertain", status: 503 });
  expect(mockWrite).toHaveBeenCalledTimes(3);
  expect(trainer.money).toBe(4000);
  expect(shards()).toBe(15);
});

test.each([collectionNames.USERS, collectionNames.USER_POKEMON])("applied-but-lost %s response is never refunded or replayed", async failedCollection => {
  afterWrite = collection => { if (collection === failedCollection) throw new Error("lost response"); };
  expect(await upgrade()).toMatchObject({ code: "equipment_uncertain", status: 503 });
  expect(trainer.money).toBe(4000);
  expect(shards()).toBe(15);
  expect(mockWrite).toHaveBeenCalledTimes(failedCollection === collectionNames.USERS ? 1 : 2);
  expect(progress).not.toHaveBeenCalled();
});

test("concurrent observed last-stock spends cannot both succeed", async () => {
  trainer.money = 1000;
  trainer.backpack[category][material] = 5;
  const results = await Promise.all([reroll(), reroll()]);
  expect(results.filter(result => result.data?.changed)).toHaveLength(1);
  expect(results.filter(result => result.status === 409)).toHaveLength(1);
  expect(trainer.money).toBe(0);
  expect(shards()).toBe(0);
  expect(progress).toHaveBeenCalledTimes(1);
});

test.each(["throw", "conflict"])("quest %s warns while preserving the saved equipment and debit", async failure => {
  beforeWrite = (collection, filter) => {
    if (collection === collectionNames.USERS && !filter.money) {
      if (failure === "throw") throw new Error("quest unavailable");
      trainer.questData.achievements.upgradeEquipment.progress = 99;
    }
  };
  const result = await upgrade();
  expect(result.data.changed).toBe(true);
  expect(result.warning).toContain("quest progress");
  expect(pokemon.equipments[type].level).toBe(5);
  expect(trainer.money).toBe(4000);
  expect(shards()).toBe(15);
  expect(progress).toHaveBeenCalledTimes(1);
  expect(mockWrite).toHaveBeenCalledTimes(2);
});

test("Discord preview binds the shown piece, retains its expectation, and rebinds for another type", async () => {
  /** @type {{pokemonId: string, equipmentType: EquipmentTypeEnum, button: string, slotId: EquipmentModifierSlotEnum, expectedEquipmentType?: EquipmentTypeEnum, expectedEquipment?: Equipment}} */
  const state = { pokemonId: id(), equipmentType: type, button: "upgrade", slotId: modifierSlots.PRIMARY };
  jest.mocked(getState).mockReturnValue(state);
  const first = observed();
  expect((await buildEquipmentUpgradeSend({ stateId: "equipment-state", user: actor })).err).toBeNull();
  expect(state).toMatchObject({ expectedEquipmentType: type, expectedEquipment: first });
  pokemon.equipments[type].level = 5;
  await buildEquipmentUpgradeSend({ stateId: "equipment-state", user: actor });
  expect(state.expectedEquipment).toEqual(first);
  state.equipmentType = equipmentTypes.POWER_WEIGHT;
  await buildEquipmentUpgradeSend({ stateId: "equipment-state", user: actor });
  expect(state).toMatchObject({ expectedEquipmentType: equipmentTypes.POWER_WEIGHT, expectedEquipment: pokemon.equipments[equipmentTypes.POWER_WEIGHT] });
  expect(mockWrite).not.toHaveBeenCalled();
});
