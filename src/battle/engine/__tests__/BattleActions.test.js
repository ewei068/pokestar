const { createMockBattle } = require("../../../__testing__/mocks/battle");

describe("Battle action outcomes", () => {
  it("rejects actions before the battle starts", () => {
    const { battle } = createMockBattle({ enableReplay: true });
    const before = battle.takeSnapshot();

    expect(battle.performAction({ action: "skipTurn" })).toEqual({
      accepted: false,
      reason: "battle_inactive",
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

    const outcome = battle.performAction(payload);

    expect(outcome).toEqual({
      accepted: true,
      log: [...battle.log],
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
});
