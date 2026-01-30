const { getMoveIds, getMove } = require("../moveRegistry");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  getValidTargetForMove,
  givePokemonMove,
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

      const target = getValidTargetForMove(battle, activePokemon, moveId);
      expect(target).not.toBeNull();

      expect(() => {
        activePokemon.useMove(moveId, target.id);
      }).not.toThrow();
    },
  );
});
