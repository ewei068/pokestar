const { ObjectId } = require("mongodb");
const { createMockPokemon } = require("../../__testing__/mocks/pokemon");
const { addPokemonExpAndEVs, trainPokemon } = require("../pokemon");
const { getPokemonExpNeeded } = require("../../utils/pokemonUtils");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { locationConfig } = require("../../config/locationConfig");
const { updateDocument } = require("../../database/mongoHandler");

const makePokemon = (overrides = {}) => /** @type {WithId<Pokemon>} */ (/** @type {unknown} */ ({ ...createMockPokemon({ userId: "owner" }), _id: new ObjectId(), ...overrides }));
const makeTrainer = (overrides = {}) => /** @type {WithId<Trainer>} */ ({ userId: "owner", level: 1, locations: {}, ...overrides });
beforeEach(() => { jest.clearAllMocks(); });

test("legacy EXP multiplication, floor, Celebi and minimum", async () => {
  const cases = /** @type {Array<[number, boolean, number, number]>} */ ([[1, false, 2, 35], [4, true, 4.5, 180], [2, false, 3, 55], [1, false, 0, 1]]);
  for (const [level, hasCelebi, base, expected] of cases) {
    const pokemon = makePokemon();
    const result = await addPokemonExpAndEVs(makeTrainer({ level, hasCelebi }), pokemon, base);
    expect(result.data.exp).toBe(expected);
    expect(pokemon.exp).toBe(expected);
  }
});

test("legacy clamps preserve stat order, partial total and signed berry reductions", async () => {
  const cases = /** @type {Array<[StatArray, StatArray, StatArray]>} */ ([
    [[251, 250, 0, 0, 0, 0], [12, 12, 12, 0, 0, 0], [1, 2, 6, 0, 0, 0]],
    [[252, 252, 6, 0, 0, 0], [4, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
    [[252, 10, 1, 0, 5, 2], [-10, -10, -10, -10, -10, -10], [-10, -10, -1, 0, -5, -2]],
  ]);
  for (const [evs, gains, expected] of cases) {
    const pokemon = makePokemon({ evs: [...evs] });
    const result = await addPokemonExpAndEVs(makeTrainer(), pokemon, 2, gains);
    expect(result.data.evs).toEqual(expected);
    expect(pokemon.evs).toEqual(evs.map((value, index) => value + expected[index]));
  }
});

test("legacy growth threshold and level 100 stored EXP remain intact", async () => {
  const pokemon = makePokemon({ level: 99 });
  const threshold = getPokemonExpNeeded(100, pokemonConfig[pokemon.speciesId].growthRate);
  pokemon.exp = threshold - 10;
  const result = await addPokemonExpAndEVs(makeTrainer(), pokemon, 2);
  expect(result.data).toMatchObject({ exp: 35, level: 100 });
  expect(pokemon.stats).toHaveLength(6);
  const cp = pokemon.combatPower;
  await addPokemonExpAndEVs(makeTrainer(), pokemon, 2);
  expect(pokemon.exp).toBe(threshold + 60);
  expect(pokemon.combatPower).toBe(cp);
});

test("legacy free Home and configured facilities use configured yields", async () => {
  const trainer = makeTrainer();
  expect((await trainPokemon(trainer, makePokemon(), "0")).data.exp).toBe(35);
  for (const id of ["0", "1", "2", "3", "4", "5", "6", "7", "8"]) {
    for (const [level, config] of Object.entries(locationConfig[id].levelConfig)) {
      const result = await trainPokemon(makeTrainer({ locations: { [id]: Number(level) } }), makePokemon(), /** @type {LocationEnum} */ (id));
      expect(result.data.exp).toBe(Math.floor(config.exp * 17.5));
      expect(result.data.evs).toEqual(config.evs.map((value) => Math.max(value, 0)));
    }
  }
  expect(updateDocument).toHaveBeenCalled();
});

const { calculateTrainingProgress, previewTraining, projectTrainingLocations } = require("../../utils/trainingUtils");

test("pure calculation matches characterized writes and leaves every input unchanged", async () => {
  const trainer = makeTrainer({ locations: { 1: 3 }, level: 4, hasCelebi: true });
  const pokemon = makePokemon({ evs: [251, 250, 0, 0, 0, 0] });
  const inputEvs = /** @type {StatArray} */ ([12, 12, 12, 0, 0, 0]);
  const before = { trainer: structuredClone(trainer), pokemon: { ...pokemon, evs: [...pokemon.evs] }, inputEvs: [...inputEvs], config: JSON.stringify(locationConfig) };
  const preview = calculateTrainingProgress(trainer, pokemon, 4.5, inputEvs);
  expect(trainer).toEqual(before.trainer);
  expect(pokemon).toEqual(before.pokemon);
  expect(inputEvs).toEqual(before.inputEvs);
  const applied = await addPokemonExpAndEVs(trainer, pokemon, 4.5, inputEvs);
  expect(applied.data).toEqual({ ...preview.gains, level: preview.level });
  expect(pokemon.evs).toEqual(preview.evs);
  expect(JSON.stringify(locationConfig)).toBe(before.config);
});

test("eligibility separates useful EXP from stored level-100 EXP, including Berry EVs", () => {
  const trainer = makeTrainer({ locations: { 1: 1, 7: 1, 8: 1 } });
  const pokemon = makePokemon({ level: 100, evs: [252, 252, 6, 0, 0, 0] });
  expect(previewTraining(trainer, pokemon, "0")).toMatchObject({ canTrain: false, gains: { exp: 35 } });
  expect(previewTraining(trainer, pokemon, "1").canTrain).toBe(false);
  expect(previewTraining(trainer, pokemon, "7")).toMatchObject({ canTrain: true, gains: { evs: [-1, -1, -1, 0, 0, 0] } });
  expect(previewTraining(trainer, { ...pokemon, evs: [0, 0, 0, 0, 0, 0] }, "8").canTrain).toBe(false);
  expect(previewTraining(trainer, { ...pokemon, evs: [251, 0, 0, 0, 0, 0] }, "1")).toMatchObject({ canTrain: true, gains: { evs: [1, 0, 0, 0, 0, 0] } });
  expect(previewTraining(trainer, { ...pokemon, level: 99 }, "1").canTrain).toBe(true);
  const locations = projectTrainingLocations(trainer, pokemon);
  expect(locations.map((location) => location.id)).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8"]);
  expect(locations[0]).toMatchObject({ owned: true, level: 0 });
  expect(locations[2]).toMatchObject({ owned: false, canTrain: false, nextGains: { exp: 0, evs: [0, 0, 0, 0, 0, 0] } });
  for (const id of ["9", "50", "__proto__", "invalid", undefined]) expect(previewTraining(trainer, pokemon, id)).toBeNull();
});
