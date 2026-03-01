const { getMoveIds, getMove } = require("../moveRegistry");
const {
  moveIdEnum,
  battleEventEnum,
  heldItemIdEnum,
} = require("../../../enums/battleEnums");
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
  const DEFENSIVE_BUFFS = /** @type {EffectIdEnum[]} */ ([
    "defUp",
    "greaterDefUp",
    "spdUp",
    "greaterSpdUp",
  ]);
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
    expect(target).toHaveEffect(effectId);

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.BRICK_BREAK,
      targetPokemonId: target.id,
    });

    expect(target).not.toHaveEffect(effectId);
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

describe("Flame Ball", () => {
  const FIRE_SPECIES = pokemonIdEnum.CHARMANDER;
  const GROUND_SPECIES = pokemonIdEnum.DIGLETT;
  const NON_FIRE_GROUND_SPECIES = pokemonIdEnum.PIKACHU;

  it("should only boost combat readiness of a Fire or Ground type ally, not the user or non-Fire/Ground allies", () => {
    const { battle } = createMockBattle({
      autoStart: false,
      team1Party: createMockPokemonParty({
        size: 3,
        speciesIds: [FIRE_SPECIES, GROUND_SPECIES, NON_FIRE_GROUND_SPECIES],
      }),
      team2Party: createMockPokemonParty({
        size: 6,
        rows: 2,
        cols: 3,
      }),
    });

    const team1Pokemons = battle.parties.Team1.pokemons.filter(
      (p) => p !== null,
    );
    const [source, groundAlly] = team1Pokemons;

    source.combatReadiness = 100;
    battle.start();
    expect(battle.activePokemon).toBe(source);

    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.FLAME_BALL);

    const crGainedCallback = jest.fn(({ target }) => {
      expect(target).toBe(groundAlly);
    });
    battle.registerListenerFunction({
      eventName: battleEventEnum.AFTER_CR_GAINED,
      callback: crGainedCallback,
    });

    const target = useMoveOnValidTarget(battle, source, moveIdEnum.FLAME_BALL);
    expect(target).toBeDamaged();
    expect(crGainedCallback).toHaveBeenCalled();
  });
});

describe("Facade", () => {
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
    givePokemonMove(source, moveIdEnum.FACADE);
  });

  it("should deal damage without status", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.FACADE);
    expect(target).toBeDamaged();
  });

  it("should deal close to double damage when the user has a status condition", () => {
    const target = getValidTargetForMove(battle, source, moveIdEnum.FACADE);
    target.hp = VERY_HIGH_HP;
    target.maxHp = VERY_HIGH_HP;

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.FACADE,
      targetPokemonId: target.id,
    });

    const normalDamage = VERY_HIGH_HP - target.hp;
    expect(normalDamage).toBeGreaterThan(0);

    battle.initialParams.id = battle.id;
    const clone = battle.cloneAndReset();
    clone.start();

    const cloneSource = clone.activePokemon;
    cloneSource.acc = HIGH_ACCURACY;
    givePokemonMove(cloneSource, moveIdEnum.FACADE);

    const cloneTarget = clone.allPokemon[target.id];
    cloneTarget.hp = VERY_HIGH_HP;
    cloneTarget.maxHp = VERY_HIGH_HP;

    cloneSource.status = {
      statusId: statusConditions.POISON,
      source: cloneSource,
      turns: 0,
    };

    clone.performAction({
      action: "useMove",
      moveId: moveIdEnum.FACADE,
      targetPokemonId: cloneTarget.id,
    });

    const statusDamage = cloneTarget.maxHp - cloneTarget.hp;
    expect(statusDamage).toBe(normalDamage * 2);
  });
});

describe("Heal Order", () => {
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({
      autoStart: true,
      team1Party: createMockPokemonParty({ size: 2 }),
      team2Party: createMockPokemonParty({ size: 2 }),
    }));
    source = battle.activePokemon;
    givePokemonMove(source, moveIdEnum.HEAL_ORDER);
  });

  it("should heal a damaged ally to full HP", () => {
    const target = getValidTargetForMove(battle, source, moveIdEnum.HEAL_ORDER);
    target.hp = Math.ceil(target.maxHp * 0.6);

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.HEAL_ORDER,
      targetPokemonId: target.id,
    });

    expect(target).not.toBeDamaged();
  });
});

describe("Defend Order", () => {
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({
      autoStart: true,
      team1Party: createMockPokemonParty({ size: 2 }),
      team2Party: createMockPokemonParty({ size: 2 }),
    }));
    source = battle.activePokemon;
    givePokemonMove(source, moveIdEnum.DEFEND_ORDER);
  });

  it("should apply defUp, spdUp, and a shield to the target", () => {
    const target = useMoveOnValidTarget(
      battle,
      source,
      moveIdEnum.DEFEND_ORDER,
    );

    expect(target).toHaveEffect("defUp");
    expect(target).toHaveEffect("spdUp");
    expect(target).toBeShielded();
  });
});

describe("Switcheroo", () => {
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
    givePokemonMove(source, moveIdEnum.SWITCHEROO);
  });

  it("should swap held items between the user and the target", () => {
    const target = getValidTargetForMove(battle, source, moveIdEnum.SWITCHEROO);

    source.removeHeldItem();
    target.removeHeldItem();

    source.setHeldItem(heldItemIdEnum.LEFTOVERS);
    source.applyHeldItem();
    target.setHeldItem(heldItemIdEnum.CHOICE_BAND);
    target.applyHeldItem();

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.SWITCHEROO,
      targetPokemonId: target.id,
    });

    expect(source).toHaveHeldItem(heldItemIdEnum.CHOICE_BAND);
    expect(target).toHaveHeldItem(heldItemIdEnum.LEFTOVERS);
  });
});

describe("Bug Bite", () => {
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
    givePokemonMove(source, moveIdEnum.BUG_BITE);
  });

  it("should deal damage, steal the target's buff, eat the target's berry to heal, and remove the target's item", () => {
    const target = getValidTargetForMove(battle, source, moveIdEnum.BUG_BITE);

    target.applyEffect("atkUp", 5, target);
    expect(target).toHaveEffect("atkUp");

    target.setHeldItem(heldItemIdEnum.SITRUS_BERRY);
    target.applyHeldItem();
    expect(target).toHaveHeldItem(heldItemIdEnum.SITRUS_BERRY);

    source.removeHeldItem();
    for (const effectId of Object.keys(source.effectIds)) {
      source.removeEffect(effectId);
    }

    source.hp = Math.floor(source.maxHp / 2);
    const sourceDamageBefore = source.maxHp - source.hp;

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.BUG_BITE,
      targetPokemonId: target.id,
    });

    expect(target).toBeDamaged();

    expect(source).toHaveEffect("atkUp");
    expect(target).not.toHaveEffect("atkUp");

    const sourceDamageAfter = source.maxHp - source.hp;
    expect(sourceDamageAfter).toBeLessThan(sourceDamageBefore);

    expect(target).not.toHaveHeldItem();
  });
});

describe("Triple Axel", () => {
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
    givePokemonMove(source, moveIdEnum.TRIPLE_AXEL);
  });

  it("should hit 3 times with each hit dealing more damage than the last", () => {
    const target = getValidTargetForMove(
      battle,
      source,
      moveIdEnum.TRIPLE_AXEL,
    );
    target.hp = VERY_HIGH_HP;
    target.maxHp = VERY_HIGH_HP;

    const takeDamageSpy = jest.spyOn(target, "takeDamage");

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.TRIPLE_AXEL,
      targetPokemonId: target.id,
    });

    expect(takeDamageSpy).toHaveBeenCalledTimes(3);
    const damages = /** @type {number[]} */ (
      takeDamageSpy.mock.calls.map((call) => call[0])
    );
    expect(damages[0]).toBeGreaterThan(0);
    expect(damages[1]).toBeGreaterThan(damages[0]);
    expect(damages[2]).toBeGreaterThan(damages[1]);
  });
});

describe("Solar Blade", () => {
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
    givePokemonMove(source, moveIdEnum.SOLAR_BLADE);
  });

  it("should apply absorbLight and not deal damage on the first turn", () => {
    const target = getValidTargetForMove(
      battle,
      source,
      moveIdEnum.SOLAR_BLADE,
    );

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.SOLAR_BLADE,
      targetPokemonId: target.id,
    });

    expect(source).toHaveEffect("absorbLight");
    expect(target).not.toBeDamaged();
    expect(source.moveIds[moveIdEnum.SOLAR_BLADE].cooldown).toBe(0);
  });

  it("should deal damage and remove absorbLight on the second turn", () => {
    const target = getValidTargetForMove(
      battle,
      source,
      moveIdEnum.SOLAR_BLADE,
    );

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.SOLAR_BLADE,
      targetPokemonId: target.id,
    });
    expect(source).toHaveEffect("absorbLight");

    source.combatReadiness = 100;
    battle.nextTurn();

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.SOLAR_BLADE,
      targetPokemonId: target.id,
    });

    expect(source).not.toHaveEffect("absorbLight");
    expect(target).toBeDamaged();
  });
});

describe("Mystical Power", () => {
  const setupMysticalPower = (sourceSpeciesId) => {
    const { battle } = createMockBattle({
      autoStart: false,
      team1Party: createMockPokemonParty({
        size: 3,
        speciesIds: [
          sourceSpeciesId,
          ALWAYS_HITTABLE_SPECIES,
          ALWAYS_HITTABLE_SPECIES,
        ],
      }),
      team2Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
    });

    const team1Pokemons = battle.parties.Team1.pokemons.filter(
      (p) => p !== null,
    );
    const [source, ...allies] = team1Pokemons;

    source.combatReadiness = 100;
    battle.start();
    expect(battle.activePokemon).toBe(source);

    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.MYSTICAL_POWER);

    return { battle, source, allies };
  };

  it("should deal damage", () => {
    const { battle, source } = setupMysticalPower(pokemonIdEnum.UXIE);
    const target = useMoveOnValidTarget(
      battle,
      source,
      moveIdEnum.MYSTICAL_POWER,
    );
    expect(target).toBeDamaged();
  });

  it("should apply defUp and spdUp to all allies when used by Uxie", () => {
    const { battle, source, allies } = setupMysticalPower(pokemonIdEnum.UXIE);
    useMoveOnValidTarget(battle, source, moveIdEnum.MYSTICAL_POWER);

    for (const ally of [source, ...allies]) {
      expect(ally).toHaveEffect("defUp");
      expect(ally).toHaveEffect("spdUp");
    }
  });

  it("should apply regeneration to all allies when used by Mesprit", () => {
    const { battle, source, allies } = setupMysticalPower(
      pokemonIdEnum.MESPRIT,
    );
    useMoveOnValidTarget(battle, source, moveIdEnum.MYSTICAL_POWER);

    for (const ally of [source, ...allies]) {
      expect(ally).toHaveEffect("regeneration");
    }
  });

  it("should apply atkUp and spaUp to all allies when used by Azelf", () => {
    const { battle, source, allies } = setupMysticalPower(pokemonIdEnum.AZELF);
    useMoveOnValidTarget(battle, source, moveIdEnum.MYSTICAL_POWER);

    for (const ally of [source, ...allies]) {
      expect(ally).toHaveEffect("atkUp");
      expect(ally).toHaveEffect("spaUp");
    }
  });

  it("should not apply any effects to allies when used by a non-lake guardian", () => {
    const { battle, source, allies } = setupMysticalPower(
      ALWAYS_HITTABLE_SPECIES,
    );
    useMoveOnValidTarget(battle, source, moveIdEnum.MYSTICAL_POWER);

    for (const ally of allies) {
      expect(ally).not.toHaveEffect("defUp");
      expect(ally).not.toHaveEffect("spdUp");
      expect(ally).not.toHaveEffect("regeneration");
      expect(ally).not.toHaveEffect("atkUp");
      expect(ally).not.toHaveEffect("spaUp");
    }
  });
});

describe("Encore", () => {
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
    givePokemonMove(source, moveIdEnum.ENCORE);
  });

  it("should reset the cooldown of a move on cooldown and disable all other moves", () => {
    const target = getValidTargetForMove(battle, source, moveIdEnum.ENCORE);
    const targetMoveIds = Object.keys(target.moveIds);
    expect(targetMoveIds.length).toBeGreaterThanOrEqual(2);

    const cooldownMoveId = targetMoveIds[0];
    target.moveIds[cooldownMoveId].cooldown = 3;

    for (let i = 1; i < targetMoveIds.length; i += 1) {
      target.moveIds[targetMoveIds[i]].cooldown = 0;
    }

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.ENCORE,
      targetPokemonId: target.id,
    });

    expect(target.moveIds[cooldownMoveId].cooldown).toBe(0);

    for (let i = 1; i < targetMoveIds.length; i += 1) {
      expect(target.moveIds[targetMoveIds[i]].disabledCounter).toBeGreaterThan(
        0,
      );
    }
  });
});

describe("Transform", () => {
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
    givePokemonMove(source, moveIdEnum.TRANSFORM);
  });

  it("should transform into the target and gain 50% combat readiness", () => {
    const target = getValidTargetForMove(battle, source, moveIdEnum.TRANSFORM);
    const originalSpeciesId = source.speciesId;
    expect(originalSpeciesId).not.toBe(target.speciesId);

    const boostCrSpy = jest.spyOn(source, "boostCombatReadiness");

    battle.performAction({
      action: "useMove",
      moveId: moveIdEnum.TRANSFORM,
      targetPokemonId: target.id,
    });

    expect(source.speciesId).toBe(target.speciesId);
    expect(boostCrSpy).toHaveBeenCalledWith(source, 50);
  });

  it("should not transform when targeting a boss Pokemon", () => {
    const BOSS_SPECIES = pokemonIdEnum.TEMPLE_GUARDIAN_CLOYSTER;
    const { battle: bossBattle } = createMockBattle({
      autoStart: false,
      team1Party: createMockPokemonParty({
        size: 1,
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
      team2Party: createMockPokemonParty({
        size: 1,
        speciesIds: [BOSS_SPECIES],
      }),
    });

    const bossSource = bossBattle.parties.Team1.pokemons.find(
      (p) => p !== null,
    );
    bossSource.combatReadiness = 100;
    bossBattle.start();
    expect(bossBattle.activePokemon).toBe(bossSource);

    givePokemonMove(bossSource, moveIdEnum.TRANSFORM);

    const bossTarget = getValidTargetForMove(
      bossBattle,
      bossSource,
      moveIdEnum.TRANSFORM,
    );
    const originalSpeciesId = bossSource.speciesId;

    bossBattle.performAction({
      action: "useMove",
      moveId: moveIdEnum.TRANSFORM,
      targetPokemonId: bossTarget.id,
    });

    expect(bossSource.speciesId).toBe(originalSpeciesId);
  });
});

describe("Spacial Rend", () => {
  const setupSpacialRend = (sourceSpeciesId) => {
    const { battle } = createMockBattle({
      autoStart: false,
      team1Party: createMockPokemonParty({
        size: 4,
        speciesIds: [
          sourceSpeciesId,
          ALWAYS_HITTABLE_SPECIES,
          ALWAYS_HITTABLE_SPECIES,
          ALWAYS_HITTABLE_SPECIES,
        ],
      }),
      team2Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
    });

    const team1Pokemons = battle.parties.Team1.pokemons.filter(
      (p) => p !== null,
    );
    const [source, adjacentAlly, ...nonAdjacentAllies] = team1Pokemons;

    source.combatReadiness = 100;
    battle.start();
    expect(battle.activePokemon).toBe(source);

    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.SPACIAL_REND);

    return { battle, source, adjacentAlly, nonAdjacentAllies };
  };

  it("should deal damage and apply spatial blessing to adjacent allies", () => {
    const { battle, source, adjacentAlly, nonAdjacentAllies } =
      setupSpacialRend(ALWAYS_HITTABLE_SPECIES);
    const target = useMoveOnValidTarget(
      battle,
      source,
      moveIdEnum.SPACIAL_REND,
    );

    expect(target).toBeDamaged();
    expect(adjacentAlly).toHaveEffect("spatialBlessing");
    for (const ally of nonAdjacentAllies) {
      expect(ally).not.toHaveEffect("spatialBlessing");
    }
  });

  it("should apply spatial blessing to all allies including non-adjacent when used by Palkia Origin", () => {
    const { battle, source, adjacentAlly, nonAdjacentAllies } =
      setupSpacialRend(pokemonIdEnum.PALKIA_ORIGIN);
    useMoveOnValidTarget(battle, source, moveIdEnum.SPACIAL_REND);

    expect(adjacentAlly).toHaveEffect("spatialBlessing");
    for (const ally of nonAdjacentAllies) {
      expect(ally).toHaveEffect("spatialBlessing");
    }
  });
});

describe("Roar of Time", () => {
  const setupRoarOfTime = (sourceSpeciesId) => {
    const { battle } = createMockBattle({
      autoStart: false,
      team1Party: createMockPokemonParty({
        size: 3,
        speciesIds: [
          ALWAYS_HITTABLE_SPECIES,
          sourceSpeciesId,
          ALWAYS_HITTABLE_SPECIES,
        ],
      }),
      team2Party: createMockPokemonParty({
        speciesIds: [ALWAYS_HITTABLE_SPECIES],
      }),
    });

    const team1Pokemons = battle.parties.Team1.pokemons.filter(
      (p) => p !== null,
    );
    const [ally1, source, ally2] = team1Pokemons;

    source.combatReadiness = 100;
    battle.start();
    expect(battle.activePokemon).toBe(source);

    source.acc = HIGH_ACCURACY;
    givePokemonMove(source, moveIdEnum.ROAR_OF_TIME);

    return { battle, source, allies: [ally1, ally2] };
  };

  it("should deal damage", () => {
    const { battle, source } = setupRoarOfTime(pokemonIdEnum.DIALGA);
    const target = useMoveOnValidTarget(
      battle,
      source,
      moveIdEnum.ROAR_OF_TIME,
    );
    expect(target).toBeDamaged();
  });

  it("should reduce the highest cooldown move for adjacent allies", () => {
    const { battle, source, allies } = setupRoarOfTime(pokemonIdEnum.DIALGA);

    for (const ally of allies) {
      const allyMoveIds = Object.keys(ally.moveIds);
      ally.moveIds[allyMoveIds[0]].cooldown = 5;
      if (allyMoveIds[1]) {
        ally.moveIds[allyMoveIds[1]].cooldown = 3;
      }
    }

    useMoveOnValidTarget(battle, source, moveIdEnum.ROAR_OF_TIME);

    for (const ally of allies) {
      const allyMoveIds = Object.keys(ally.moveIds);
      expect(ally.moveIds[allyMoveIds[0]].cooldown).toBe(0);
      if (allyMoveIds[1]) {
        expect(ally.moveIds[allyMoveIds[1]].cooldown).toBeGreaterThan(0);
      }
    }
  });

  it("should apply recharge effect when used by Dialga", () => {
    const { battle, source } = setupRoarOfTime(pokemonIdEnum.DIALGA);
    useMoveOnValidTarget(battle, source, moveIdEnum.ROAR_OF_TIME);
    expect(source).toHaveEffect("recharge");
  });

  it("should not apply recharge effect when used by Dialga Origin", () => {
    const { battle, source } = setupRoarOfTime(pokemonIdEnum.DIALGA_ORIGIN);
    useMoveOnValidTarget(battle, source, moveIdEnum.ROAR_OF_TIME);
    expect(source).not.toHaveEffect("recharge");
  });
});
