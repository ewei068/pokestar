const { ObjectId } = require("mongodb");
const db = require("../../database/mongoHandler");
const trainerService = require("../trainer");
const { createMockPokemon } = require("../../__testing__/mocks/pokemon");
const { collectionNames } = require("../../config/databaseConfig");
const { trainOwnedPokemon, getOwnedTrainingContext } = require("../training");
const { registerTrainerEventListener } = require("../game/gameEvent");
const { trainerEventEnum } = require("../../enums/gameEnums");
const { achievementConfig } = require("../../config/questConfig");

jest.mock("../trainer", () => ({ ...jest.requireActual("../trainer"), getTrainer: jest.fn() }));
const mockGetTrainer = /** @type {jest.Mock} */ (trainerService.getTrainer);
const mockGetCollection = /** @type {jest.Mock} */ (db.getCollection);
const mockUpdate = /** @type {jest.Mock} */ (db.updateDocument);
const eventListener = jest.fn(async (args) => {
  const { progress } = await achievementConfig.evTrain.questListeners[0].listenerCallback(args);
  const quests = args.trainer.questData;
  quests.achievements.evTrain.progress += progress;
});
registerTrainerEventListener(trainerEventEnum.TRAINED_POKEMON, eventListener);
let trainer;
let stored;
let beforeWrite;
let failQuest;
const actor = { id: "owner" };
const matchesObserved = (filter, record) => Object.entries(filter).every(([key, value]) => {
  if (key === "_id") return record._id.equals(value);
  const current = key.split(".").reduce((result, part) => result?.[part], record);
  if (value && typeof value === "object") {
    if ("$exists" in value) return (current !== undefined) === value.$exists;
    if ("$eq" in value) return JSON.stringify(current) === JSON.stringify(value.$eq);
  }
  return current === value;
});

beforeEach(() => {
  jest.clearAllMocks();
  beforeWrite = () => {};
  failQuest = false;
  trainer = { userId: actor.id, user: { username: "Owner" }, level: 1, exp: 0, money: 100,
    locations: { 1: 1, 7: 1, 8: 1 }, backpack: { 0: { 0: 24 } }, party: { pokemonIds: [] },
    questData: { dailyQuests: {}, achievements: { evTrain: { stage: 0, progress: 0 } } } };
  stored = { ...createMockPokemon({ userId: actor.id }), _id: new ObjectId() };
  mockGetTrainer.mockImplementation(async () => ({ data: structuredClone(trainer), err: null }));
  mockGetCollection.mockResolvedValue({ findOne: jest.fn(async (filter) => matchesObserved(filter, stored) ? { ...stored, evs: [...stored.evs], ivs: [...stored.ivs], equipments: structuredClone(stored.equipments) } : null) });
  mockUpdate.mockImplementation(async (collection, filter, update) => {
    if (collection === collectionNames.USER_POKEMON) {
      beforeWrite();
      if (!matchesObserved(filter, stored)) return { modifiedCount: 0 };
      Object.assign(stored, update.$set);
    } else {
      if (failQuest) throw new Error("quest write unavailable");
      if (!matchesObserved(filter, trainer)) return { modifiedCount: 0 };
      for (const [path, value] of Object.entries(update.$set)) {
        const parts = path.split(".");
        const key = parts.pop();
        const target = parts.reduce((record, part) => record[part], trainer);
        target[key] = value;
      }
    }
    return { modifiedCount: 1 };
  });
});

test("context is pure and invalid owner/ID/location never writes or emits", async () => {
  const context = await getOwnedTrainingContext(actor, stored._id.toHexString());
  expect(context.locations).toHaveLength(9);
  expect(mockUpdate).not.toHaveBeenCalled();
  for (const id of ["bad", new ObjectId().toHexString()]) {
    await expect(trainOwnedPokemon(actor, id, "0")).rejects.toMatchObject({ code: "pokemon_not_found" });
  }
  for (const location of ["2", "9", "50", "invalid", undefined]) {
    await expect(trainOwnedPokemon(actor, stored._id.toHexString(), location)).rejects.toMatchObject({ code: "invalid_training_location" });
  }
  stored.userId = "other";
  await expect(trainOwnedPokemon(actor, stored._id.toHexString(), "0")).rejects.toMatchObject({ code: "pokemon_not_found" });
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(eventListener).not.toHaveBeenCalled();
});

test("web completion has no write/event while Discord still permits a single level-100 operation", async () => {
  stored.level = 100;
  const result = await trainOwnedPokemon(actor, stored._id.toHexString(), "0");
  expect(result).toMatchObject({ trained: false, gains: { exp: 0, evs: [0, 0, 0, 0, 0, 0] } });
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(eventListener).not.toHaveBeenCalled();
  const discord = await trainOwnedPokemon(actor, stored._id.toHexString(), "0", { stopWhenComplete: false });
  expect(discord).toMatchObject({ trained: true, gains: { exp: 35 } });
  expect(stored.exp).toBe(35);
  expect(eventListener).toHaveBeenCalledTimes(1);
  expect(mockUpdate).toHaveBeenCalledTimes(1); // Unchanged quest data needs no trainer write.
});

test("narrow Pokemon and quest writes preserve concurrent unrelated resources and signed quest progress", async () => {
  stored.level = 100;
  stored.evs = [11, 2, 0, 0, 0, 0];
  beforeWrite = () => {
    stored.name = "Renamed";
    stored.heldItemId = "new-item";
    stored.locked = true;
    trainer.money = 999;
    trainer.backpack[0][0] = 30;
    trainer.party.pokemonIds = ["another"];
  };
  const result = await trainOwnedPokemon(actor, stored._id.toHexString(), "8");
  expect(result.gains).toEqual({ exp: 140, evs: [-10, -2, 0, 0, 0, 0] });
  expect(result.warning).toBeUndefined();
  expect(stored).toMatchObject({ name: "Renamed", heldItemId: "new-item", locked: true, evs: [1, 0, 0, 0, 0, 0] });
  expect(trainer).toMatchObject({ money: 999, backpack: { 0: { 0: 30 } }, party: { pokemonIds: ["another"] }, questData: { achievements: { evTrain: { progress: 12 } } } });
  const [collection, filter, update] = mockUpdate.mock.calls[0];
  expect(collection).toBe(collectionNames.USER_POKEMON);
  expect(filter).toMatchObject({ userId: actor.id, exp: { $eq: 0 }, level: { $eq: 100 }, evs: { $eq: [11, 2, 0, 0, 0, 0] }, speciesId: { $eq: stored.speciesId }, natureId: { $eq: stored.natureId }, ivs: { $eq: stored.ivs }, equipments: { $eq: {} } });
  expect(Object.keys(update.$set).sort()).toEqual(["combatPower", "evs", "exp", "ivTotal", "level", "stats"]);
  expect(mockUpdate.mock.calls[1][2]).toEqual({ $set: { "questData.achievements.evTrain": { stage: 0, progress: 12 } } });
  expect(eventListener).toHaveBeenCalledTimes(1);
});

test.each(["exp", "level", "evs", "speciesId", "natureId", "ivs", "equipments", "userId"])("a concurrent %s change rejects before event", async (field) => {
  beforeWrite = () => {
    const values = { exp: 5, level: 51, evs: [1, 0, 0, 0, 0, 0], speciesId: "4", natureId: "2", ivs: [30, 31, 31, 31, 31, 31], equipments: { new: {} }, userId: "other" };
    stored[field] = values[field];
  };
  await expect(trainOwnedPokemon(actor, stored._id.toHexString(), "1")).rejects.toMatchObject({ code: "training_changed", status: 409 });
  expect(eventListener).not.toHaveBeenCalled();
  expect(mockUpdate).toHaveBeenCalledTimes(1);
});

test("event persistence failure confirms primary gains and warns without replaying", async () => {
  failQuest = true;
  const result = await trainOwnedPokemon(actor, stored._id.toHexString(), "1");
  expect(result).toMatchObject({ trained: true, gains: { exp: 52, evs: [4, 0, 0, 0, 0, 0] } });
  expect(result.warning).toContain("Training saved");
  expect(stored.exp).toBe(52);
  expect(eventListener).toHaveBeenCalledTimes(1);
  expect(mockUpdate.mock.calls.filter(([collection]) => collection === collectionNames.USER_POKEMON)).toHaveLength(1);
});

test("subsequent operations re-read trainer multipliers and location levels", async () => {
  const id = stored._id.toHexString();
  expect((await trainOwnedPokemon(actor, id, "1")).gains.exp).toBe(52);
  trainer.level = 4;
  trainer.hasCelebi = true;
  trainer.locations[1] = 2;
  expect((await trainOwnedPokemon(actor, id, "1")).gains).toEqual({ exp: 180, evs: [8, 0, 0, 0, 0, 0] });
});

test("a quest conflict preserves newer quest data and reports saved Pokemon progress", async () => {
  beforeWrite = () => { trainer.questData.achievements.evTrain.progress = 99; };
  const result = await trainOwnedPokemon(actor, stored._id.toHexString(), "1");
  expect(result.gains).toEqual({ exp: 52, evs: [4, 0, 0, 0, 0, 0] });
  expect(result.warning).toContain("quest progress");
  expect(trainer.questData.achievements.evTrain.progress).toBe(99);
  expect(stored.exp).toBe(52);
  expect(eventListener).toHaveBeenCalledTimes(1);
  expect(mockUpdate).toHaveBeenCalledTimes(2);
});
