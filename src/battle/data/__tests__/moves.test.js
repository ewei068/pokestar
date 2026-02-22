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
  getValidTargetForMove,
  givePokemonMove,
  useMoveOnValidTarget,
  describeStatusProbability,
  describeEffectProbability,
} = require("../../../__testing__/utils/battle");

afterEach(() => jest.restoreAllMocks());

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
const ALWAYS_HITTABLE_SPECIES = pokemonIdEnum.ARCEUS_FIGHTING;
const BURNABLE_SPECIES = pokemonIdEnum.BULBASAUR;
const VERY_HIGH_HP = 99999;

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
    givePokemonMove(source, moveIdEnum.FIRE_PUNCH);
  });

  it("should deal damage", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.FIRE_PUNCH);
    expect(target).toBeDamaged();
  });

  describeStatusProbability({
    statusId: statusConditions.BURN,
    probability: 0.5,
    setup: (rngValue) => {
      battle.rng = jest.fn().mockReturnValue(rngValue);
      source.acc = HIGH_ACCURACY;
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
    givePokemonMove(source, moveIdEnum.CONFUSION);
  });

  it("should deal damage", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.CONFUSION);
    expect(target).toBeDamaged();
  });

  describeEffectProbability({
    effectId: "confused",
    probability: 0.25,
    setup: (rngValue) => {
      battle.rng = jest.fn().mockReturnValue(rngValue);
      source.acc = HIGH_ACCURACY;
      const target = useMoveOnValidTarget(battle, source, moveIdEnum.CONFUSION);
      return { target };
    },
  });
});

describe("Brick Break", () => {
  const DEFENSIVE_BUFFS = ["defUp", "greaterDefUp", "spdUp", "greaterSpdUp"];
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({
      autoStart: true,
      team1Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
      team2Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
    }));
    source = battle.activePokemon;
    givePokemonMove(source, moveIdEnum.BRICK_BREAK);
  });

  it("should deal damage", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.BRICK_BREAK);
    expect(target).toBeDamaged();
  });

  it.each(DEFENSIVE_BUFFS)("should remove %s from the target", (effectId) => {
    source.acc = HIGH_ACCURACY;
    const target = getValidTargetForMove(
      battle,
      source,
      moveIdEnum.BRICK_BREAK,
    );
    target.applyEffect(effectId, 5, target);
    expect(target.effectIds[effectId]).toBeDefined();

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.BRICK_BREAK,
      targetPokemonId: target.id,
    });

    expect(target.effectIds[effectId]).toBeUndefined();
  });
});

describe("Wood Hammer", () => {
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({
      autoStart: true,
      team1Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
      team2Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
    }));
    source = battle.activePokemon;
    givePokemonMove(source, moveIdEnum.WOOD_HAMMER);
  });

  it("should deal damage to the target and recoil damage to the user", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.WOOD_HAMMER);

    expect(target).toBeDamaged();
    expect(source).toBeDamaged();
  });
});

describe("Aqua Impact", () => {
  const WATER_SPECIES = pokemonIdEnum.SQUIRTLE;
  const NON_WATER_DARK_SPECIES = pokemonIdEnum.PIKACHU;

  it("should deal true damage proportional to the highest ally Water/Dark non-HP stat", () => {
    const { battle } = createMockBattle({
      autoStart: false,
      team1Party: createMockPokemonParty({
        size: 3,
        speciesIds: [WATER_SPECIES, WATER_SPECIES, NON_WATER_DARK_SPECIES],
      }),
      team2Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
    });

    const team1Pokemons = battle.parties.Team1.pokemons.filter(
      (p) => p !== null,
    );
    const [source, waterAlly, nonWaterAlly] = team1Pokemons;
    const target = battle.parties.Team2.pokemons.find((p) => p !== null);

    // should not pull any of these stats
    source.bspe = 1e6;
    waterAlly.hp = 1e6;
    waterAlly.maxHp = 1e6;
    nonWaterAlly.batk = 1e6;

    // should pull this stat
    waterAlly.batk = 1e5;

    target.hp = 1e7;
    target.maxHp = 1e7;

    battle.start();
    expect(battle.activePokemon).toBe(source);

    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.AQUA_IMPACT);
    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.AQUA_IMPACT,
      targetPokemonId: target.id,
    });

    expect(target).toBeDamagedBy(
      expect.toBeGreaterThanOrEqual(Math.floor(1e5 * 0.05)),
    );
    expect(target).toBeDamagedBy(expect.toBeLessThan(Math.floor(1e6 * 0.05)));
  });
});

describe("Night Slash", () => {
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({
      autoStart: true,
      team1Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
      team2Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
    }));
    source = battle.activePokemon;
    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.NIGHT_SLASH);
  });

  it("should deal damage including at least 5% atk true damage to primary target", () => {
    const target = getValidTargetForMove(
      battle,
      source,
      moveIdEnum.NIGHT_SLASH,
    );
    target.hp = VERY_HIGH_HP;
    target.maxHp = VERY_HIGH_HP;

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.NIGHT_SLASH,
      targetPokemonId: target.id,
    });

    const expectedMinTrueDamage = Math.floor(source.getStat("atk") * 0.05);
    expect(target).toBeDamagedBy(
      expect.toBeGreaterThanOrEqual(expectedMinTrueDamage),
    );
  });
});
