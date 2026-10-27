const { createMockBattle } = require("../../../__testing__/mocks/battle");
const { moveIdEnum, battleEventEnum, effectIdEnum } = require("../../../enums/battleEnums");
const {
  getValidTargetForMove,
  givePokemonMove,
} = require("../../../__testing__/utils/battle");

describe("Battle action outcomes", () => {
  it("observes weather set, refresh and clear in action order", () => {
    const { battle } = createMockBattle({ autoStart: true, enableReplay: true });
    battle.registerListenerFunction({ eventName: battleEventEnum.AFTER_SKIP_TURN, callback: () => {
      battle.createWeather("Rain", battle.activePokemon);
      battle.weather.duration = 1;
      battle.createWeather("Rain", battle.activePokemon);
      battle.clearWeather();
    } });
    const outcome = battle.performAction({ action: "skipTurn" });
    const changes = outcome.events.filter(event => event.type === "weatherChanged");
    expect(changes).toHaveLength(3);
    expect(changes.map(event => [event.weatherId, event.previousWeatherId])).toEqual([
      ["Rain", null], ["Rain", "Rain"], [null, "Rain"],
    ]);
    expect(changes[0].duration).toBeGreaterThan(1);
    expect(changes[2].duration).toBe(0);
    expect(outcome.snapshot.weather.weatherId).toBe(null);
  });

  it("observes actual capped readiness boosts and drains, including suppressed rule callbacks", () => {
    const { battle } = createMockBattle({ autoStart: true, enableReplay: true });
    const pokemon = battle.activePokemon;
    battle.registerListenerFunction({ eventName: battleEventEnum.AFTER_SKIP_TURN, callback: () => {
      pokemon.combatReadiness = 95;
      pokemon.boostCombatReadiness(pokemon, 20, false);
      pokemon.boostCombatReadiness(pokemon, 20, false); // No change at the cap.
      pokemon.reduceCombatReadiness(pokemon, 150);
    } });
    const outcome = battle.performAction({ action: "skipTurn" });
    expect(outcome.events.filter(event => event.type === "combatReadinessChanged")).toEqual([
      expect.objectContaining({ pokemonId: pokemon.id, sourcePokemonId: pokemon.id,
        previousCombatReadiness: 95, combatReadiness: 100, amount: 5 }),
      expect.objectContaining({ previousCombatReadiness: 100, combatReadiness: 0, amount: -100 }),
    ]);
  });

  it("rejects actions before the battle starts", () => {
    const { battle } = createMockBattle({ enableReplay: true });
    const before = battle.takeSnapshot();

    expect(battle.performAction({ action: "skipTurn" })).toEqual({
      accepted: false,
      reason: "battle_inactive",
      events: [],
      snapshot: before,
    });
    expect(battle.actions).toEqual([]);
  });

  it("rejects invalid moves and targets without advancing or recording an action", () => {
    const { battle } = createMockBattle({
      autoStart: true,
      enableReplay: true,
    });
    const before = battle.takeSnapshot();
    const log = [...battle.log];
    const [moveId] = Object.keys(battle.activePokemon.moveIds);

    for (const action of [
      { action: "useMove", moveId: "missing-move", targetPokemonId: "missing" },
      { action: "useMove", moveId, targetPokemonId: "missing" },
      { action: "missing" },
      null,
    ]) {
      expect(battle.performAction(action)).toEqual({
        accepted: false,
        reason: "invalid_action",
        events: [],
        snapshot: before,
      });
      expect(battle.takeSnapshot()).toEqual(before);
      expect(battle.log).toEqual(log);
      expect(battle.actions).toEqual([]);
    }
  });

  it("returns the resulting state and records a copy of an accepted action", () => {
    const { battle } = createMockBattle({
      autoStart: true,
      enableReplay: true,
    });
    const payload = { action: "skipTurn" };
    const actorId = battle.activePokemon.id;

    const outcome = battle.performAction(payload);

    expect(outcome).toEqual({
      accepted: true,
      log: [...battle.log],
      events: [
        {
          sequence: 0,
          type: "actionStarted",
          pokemonId: actorId,
          action: "skipTurn",
        },
        {
          sequence: 1,
          type: "turnStarted",
          turn: battle.turn,
          pokemonId: battle.activePokemon.id,
        },
      ],
      snapshot: battle.takeSnapshot(),
    });
    expect(JSON.parse(JSON.stringify(outcome))).toEqual(outcome);
    expect(battle.actions).toEqual([{ action: "skipTurn" }]);
    payload.action = "useMove";
    expect(battle.actions).toEqual([{ action: "skipTurn" }]);
  });

  it("preserves a generated battle ID as the replay seed", () => {
    const { battle } = createMockBattle({ enableReplay: true });
    const clone = battle.cloneAndReset();

    expect(clone.id).toBe(battle.id);
    expect(clone.initialParams.id).toBe(battle.id);

    battle.start();
    clone.start();
    expect(clone.takeSnapshot()).toEqual(battle.takeSnapshot());

    const action = { action: "skipTurn" };
    expect(battle.performAction(action).accepted).toBe(true);
    expect(clone.performAction(action).accepted).toBe(true);
    expect(clone.takeSnapshot()).toEqual(battle.takeSnapshot());
  });

  it("returns ordered move and HP events for each target of an area attack", () => {
    const { battle } = createMockBattle({ autoStart: true });
    const source = battle.activePokemon;
    const moveId = moveIdEnum.SURF;
    givePokemonMove(source, moveId);
    source.acc = 9999;
    const target = getValidTargetForMove(battle, source, moveId);

    const outcome = battle.performAction({
      action: "useMove",
      moveId,
      targetPokemonId: target.id,
    });

    expect(outcome.accepted).toBe(true);
    const moveEvent = outcome.events.find((event) => event.type === "moveStarted");
    expect(moveEvent).toEqual(
      expect.objectContaining({
        pokemonId: source.id,
        moveId,
        primaryTargetId: target.id,
        targetIds: expect.arrayContaining([target.id]),
      }),
    );
    expect(moveEvent.targetIds.length).toBeGreaterThan(1);
    const targetParty = battle.parties[target.teamName];
    expect(moveEvent.patternTiles).toHaveLength(targetParty.rows * targetParty.cols);
    expect(moveEvent.patternTiles).toContainEqual({
      teamName: target.teamName,
      position: target.position,
    });
    expect(moveEvent.patternTiles).toEqual(expect.arrayContaining(
      moveEvent.targetIds.map((id) => ({
        teamName: battle.allPokemon[id].teamName,
        position: battle.allPokemon[id].position,
      })),
    ));
    const hpEvents = outcome.events.filter((event) => event.type === "hpChanged");
    expect(hpEvents.length).toBeGreaterThan(1);
    expect(hpEvents.every((event) => event.sequence > moveEvent.sequence)).toBe(true);
    expect(outcome.events.map((event) => event.sequence)).toEqual(
      outcome.events.map((_, index) => index),
    );
    expect(JSON.parse(JSON.stringify(outcome.events))).toEqual(outcome.events);
  });

  it("previews expanded and random patterns without choosing a random target", () => {
    const { battle } = createMockBattle({ autoStart: true });
    const source = battle.activePokemon;
    const target = getValidTargetForMove(battle, source, moveIdEnum.FIRE_PUNCH);
    const single = source.getMoveTargetPreview(moveIdEnum.FIRE_PUNCH, target);
    expect(single.patternTiles).toEqual([{
      teamName: target.teamName, position: target.position,
    }]);

    source.effectIds[effectIdEnum.SPATIAL_BLESSING] = { duration: 1 };
    const expanded = source.getMoveTargetPreview(moveIdEnum.FIRE_PUNCH, target);
    expect(expanded.patternTiles.length).toBeGreaterThan(1);
    expect(expanded.patternTiles).toContainEqual({
      teamName: target.teamName, position: target.position,
    });
    expect(expanded.emptyTileTargets.length).toBeGreaterThan(0);

    const random = source.getMoveTargetPreview(moveIdEnum.TRI_ATTACK, target);
    expect(random.random).toBe(true);
    expect(random.emptyTileTargets).toEqual([]);
    expect(random.patternTiles).toEqual(expect.arrayContaining(
      random.affectedPokemonIds.map((id) => ({
        teamName: battle.allPokemon[id].teamName,
        position: battle.allPokemon[id].position,
      })),
    ));
  });

  it("keeps reactive healing before damage in the same action timeline", () => {
    const { battle } = createMockBattle({ autoStart: true });
    const source = battle.activePokemon;
    const moveId = moveIdEnum.FIRE_PUNCH;
    givePokemonMove(source, moveId);
    source.acc = 9999;
    const target = getValidTargetForMove(battle, source, moveId);
    target.hp -= 30;
    battle.eventHandler.registerListener(battleEventEnum.BEFORE_MOVE_EXECUTE, {
      execute: (_initialArgs, args) => {
        args.primaryTarget.takeHeal(10, source, {});
      },
    });

    const outcome = battle.performAction({
      action: "useMove",
      moveId,
      targetPokemonId: target.id,
    });

    expect(outcome.accepted).toBe(true);
    const moveIndex = outcome.events.findIndex((event) => event.type === "moveStarted");
    const healIndex = outcome.events.findIndex((event) => event.type === "hpChanged" && event.amount > 0);
    const damageIndex = outcome.events.findIndex((event) => event.type === "hpChanged" && event.amount < 0);
    expect(moveIndex).toBeGreaterThanOrEqual(0);
    expect(healIndex).toBeGreaterThan(moveIndex);
    expect(damageIndex).toBeGreaterThan(healIndex);
    expect(outcome.events[damageIndex].hp).toBe(target.hp);
  });

  it("consumes a turn safely when a rule removes the chosen move", () => {
    const { battle } = createMockBattle({ autoStart: true });
    const source = battle.activePokemon;
    const moveId = moveIdEnum.FIRE_PUNCH;
    givePokemonMove(source, moveId);
    const target = getValidTargetForMove(battle, source, moveId);
    battle.eventHandler.registerListener(battleEventEnum.BEFORE_MOVE, {
      execute: () => {
        delete source.moveIds[moveId];
      },
    });

    const outcome = battle.performAction({
      action: "useMove",
      moveId,
      targetPokemonId: target.id,
    });

    expect(outcome.accepted).toBe(true);
    expect(outcome.events.some((event) => event.type === "actionBlocked")).toBe(true);
    expect(outcome.events.some((event) => event.type === "moveStarted")).toBe(false);
    expect(battle.turn).toBe(1);
  });
});
