const { getMoveIds, getMove } = require("../moveRegistry");
const { moveIdEnum } = require("../../../enums/battleEnums");
const { statusConditions } = require("../../../config/battleConfig");
const { pokemonIdEnum } = require("../../../enums/pokemonEnums");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  createMockPokemonParty,
} = require("../../../__testing__/mocks/pokemon");
const {
  HIGH_ACCURACY,
  givePokemonMove,
  useMoveOnValidTarget,
  describeStatusProbability,
  describeEffectProbability,
} = require("../../../__testing__/utils/battle");

describe("All Moves e2e", () => {
  const getTestCases = () =>
    getMoveIds({}).map((moveId) => [moveId, getMove(moveId).name]);

  it.each(getTestCases())(
    "move %s (%s) can execute on a valid target without error",
    // eslint-disable-next-line no-unused-vars
    (/** @type {MoveIdEnum} */ moveId, /** @type {string} */ _moveName) => {
      const { battle } = createMockBattle({ autoStart: true });

      const { activePokemon } = battle;
      expect(activePokemon).not.toBeNull();

      givePokemonMove(activePokemon, moveId);

      expect(() => {
        useMoveOnValidTarget(battle, activePokemon, moveId);
      }).not.toThrow();
    },
  );
});

// eslint-disable-next-line no-unused-vars
const DEFAULT_SPECIES = pokemonIdEnum.PIKACHU;
const BURNABLE_SPECIES = pokemonIdEnum.BULBASAUR;

describe("Fire Punch", () => {
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({
      autoStart: true,
      team1Party: createMockPokemonParty({ speciesIds: [BURNABLE_SPECIES] }),
      team2Party: createMockPokemonParty({ speciesIds: [BURNABLE_SPECIES] }),
    }));
    source = battle.activePokemon;
    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.FIRE_PUNCH);
  });

  afterEach(() => jest.restoreAllMocks());

  it("should deal damage", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.FIRE_PUNCH);
    expect(target).toBeDamaged();
  });

  describeStatusProbability({
    statusId: statusConditions.BURN,
    probability: 0.5,
    setup: () => {
      const target = useMoveOnValidTarget(
        battle,
        source,
        moveIdEnum.FIRE_PUNCH,
      );
      return { target };
    },
  });
});

describe("Confusion", () => {
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({ autoStart: true }));
    source = battle.activePokemon;
    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.CONFUSION);
  });

  afterEach(() => jest.restoreAllMocks());

  it("should deal damage", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.CONFUSION);
    expect(target).toBeDamaged();
  });

  describeEffectProbability({
    effectId: "confused",
    probability: 0.25,
    setup: () => {
      const target = useMoveOnValidTarget(battle, source, moveIdEnum.CONFUSION);
      return { target };
    },
  });
});
