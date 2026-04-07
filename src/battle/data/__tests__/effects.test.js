const { getEffectIds, getEffect } = require("../effectRegistry");
const { createMockBattle } = require("../../../__testing__/mocks/battle");

describe("All Effects e2e", () => {
  const getTestCases = () =>
    getEffectIds({}).map((effectId) => [effectId, getEffect(effectId).name]);

  it.each(getTestCases())(
    "effect %s (%s) can be applied and removed without error",
    (
      /** @type {EffectIdEnum} */ effectId,
      // eslint-disable-next-line no-unused-vars
      /** @type {string} */ _effectName,
    ) => {
      const { battle } = createMockBattle({
        autoStart: true,
      });

      const nonFaintedPokemon = Object.values(battle.allPokemon).find(
        (pokemon) => !pokemon.isFainted,
      );
      expect(nonFaintedPokemon).toBeDefined();

      expect(() => {
        nonFaintedPokemon.applyEffect(effectId, 3, nonFaintedPokemon, {});
      }).not.toThrow();

      expect(() => {
        nonFaintedPokemon.removeEffect(effectId);
      }).not.toThrow();
    },
  );
});
