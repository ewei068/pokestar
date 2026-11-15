const { ObjectId } = require("mongodb");
const db = require("../../database/mongoHandler");
const { collectionNames } = require("../../config/databaseConfig");
const { createMockPokemon } = require("../../__testing__/mocks/pokemon");
const { getMoveIds } = require("../../utils/pokemonUtils");
const { trainerEventEnum } = require("../../enums/gameEnums");
const { getTrainer, emitTrainerEvent } = require("../trainer");
const { getTransformChoices, getTransformVersion, changePokemonSpecies } = require("../pokemonTransform");

jest.mock("../trainer", () => ({ getTrainer: jest.fn(), emitTrainerEvent: jest.fn() }));

const actor = { id: "owner" };
const trainer = { _id: new ObjectId(), userId: actor.id, money: 5000 };
const id = new ObjectId();
let pokemon;
const writes = /** @type {jest.Mock} */ (db.findAndUpdateDocument);
const mockGetCollection = /** @type {jest.Mock} */ (db.getCollection);
const loadTrainer = /** @type {jest.Mock} */ (getTrainer);
const choose = (kind, targetSpeciesId, expectedVersion = getTransformVersion(pokemon)) =>
  changePokemonSpecies(actor, id.toHexString(), { kind, targetSpeciesId, expectedVersion });

beforeEach(() => {
  jest.resetAllMocks();
  pokemon = { ...createMockPokemon({ userId: actor.id }), speciesId: "133",
    _id: id, name: "Mochi", level: 25, abilityId: "50", natureId: "0", moveIds: ["m98"] };
  loadTrainer.mockResolvedValue({ data: trainer });
  mockGetCollection.mockResolvedValue({
    findOne: async filter => filter.userId === pokemon.userId && filter._id.equals(id) ? { ...pokemon } : null,
  });
  writes.mockImplementation(async (collection, _filter, update) => collection === collectionNames.USERS
    ? { value: { ...trainer, money: trainer.money + update.$inc.money } }
    : { value: { ...pokemon, ...update.$set } });
  jest.mocked(emitTrainerEvent).mockResolvedValue({});
});

test("configured evolutions stay visible below their required level", () => {
  pokemon.level = 24;
  expect(getTransformChoices(pokemon.speciesId)).toHaveLength(7);
  expect(getTransformChoices(pokemon.speciesId)[0]).toEqual({ kind: "evolve", targetSpeciesId: "134", requiredLevel: 25, cost: 0 });
});

test("evolution preserves identity, nickname and custom moves, with progress after the narrow save", async () => {
  const result = await choose("evolve", "134");
  expect(result.data.pokemon).toMatchObject({ _id: id, name: "Mochi", level: 25,
    speciesId: "134", abilityId: "11", moveIds: ["m98"] });
  expect(writes.mock.calls[0][1]).toMatchObject({ _id: id, userId: actor.id, level: { $eq: 25 },
    speciesId: { $eq: "133" }, moveIds: { $eq: ["m98"] } });
  expect(Object.keys(writes.mock.calls[0][2].$set).sort()).toEqual(
    ["abilityId", "battleEligible", "combatPower", "ivTotal", "name", "rarity", "speciesId", "stats"]);
  expect(writes).toHaveBeenCalledTimes(1);
  expect(emitTrainerEvent).toHaveBeenCalledWith(trainerEventEnum.EVOLVED_POKEMON,
    { trainer, pokemon: result.data.pokemon });
  expect(writes.mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(emitTrainerEvent).mock.invocationCallOrder[0]);
});

test("rejects a foreign, stale, ineligible or unrelated target before writing", async () => {
  pokemon.userId = "other";
  expect((await choose("evolve", "134")).code).toBe("pokemon_not_found");
  pokemon.userId = actor.id;
  const version = getTransformVersion(pokemon);
  pokemon.level -= 1;
  expect((await choose("evolve", "134", version)).code).toBe("transformation_changed");
  expect((await choose("evolve", "134")).code).toBe("evolution_level_required");
  expect((await choose("evolve", "6")).code).toBe("invalid_transformation_target");
  expect(writes).not.toHaveBeenCalled();
});

const setRotom = () => {
  pokemon = { ...pokemon, speciesId: "479", name: "Rotom", abilityId: "26", moveIds: undefined };
};

test("charges the configured form price and uses the new default move set", async () => {
  setRotom();
  expect((await choose("form", "479")).code).toBe("invalid_transformation_target");
  loadTrainer.mockResolvedValueOnce({ data: { ...trainer, money: 2499 } });
  expect((await choose("form", "10009")).code).toBe("insufficient_form_money");
  expect(writes).not.toHaveBeenCalled();
  const result = await choose("form", "10009");
  expect(result.data).toMatchObject({ trainer: { money: 2500 }, pokemon: { speciesId: "10009", name: "Rotom-Wash" } });
  expect(getMoveIds(result.data.pokemon)).toContain("m56");
  expect(writes.mock.calls[0].slice(0, 3)).toEqual([collectionNames.USERS,
    { _id: trainer._id, userId: actor.id, money: { $eq: 5000 } }, { $inc: { money: -2500 } }]);
  expect(emitTrainerEvent).not.toHaveBeenCalled();
});

test.each([false, true])("form write failure (ambiguous=%s) compensates only a definitive miss", async ambiguous => {
  setRotom();
  writes.mockResolvedValueOnce({ value: { ...trainer, money: 2500 } });
  if (ambiguous) writes.mockRejectedValueOnce(new Error("socket closed"));
  else writes.mockResolvedValueOnce({ value: null });
  const result = await choose("form", "10009");
  expect(result.code).toBe(ambiguous ? "transformation_uncertain" : "transformation_changed");
  expect(writes).toHaveBeenCalledTimes(ambiguous ? 2 : 3);
  if (!ambiguous) expect(writes.mock.calls[2].slice(0, 3)).toEqual([collectionNames.USERS,
    { _id: trainer._id, userId: actor.id }, { $inc: { money: 2500 } }]);
});

test("a failed evolution quest update reports a saved result and never retries the write", async () => {
  jest.mocked(emitTrainerEvent).mockResolvedValueOnce({ err: "quest changed" });
  const result = await choose("evolve", "134");
  expect(result.data.pokemon.speciesId).toBe("134");
  expect(result.warning).toBeTruthy();
  expect(writes).toHaveBeenCalledTimes(1);
});
