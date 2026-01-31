const { getAbilityIds, getAbility } = require("../abilityRegistry");
const { createMockBattle } = require("../../../__testing__/mocks/battle");

describe("All Abilities e2e", () => {
  const getTestCases = () =>
    getAbilityIds({}).map((abilityId) => [
      abilityId,
      getAbility(abilityId).name,
    ]);

  it.each(getTestCases())(
    "ability %s (%s) can be applied and removed without error",
    (
      /** @type {AbilityIdEnum} */ abilityId,
      // eslint-disable-next-line no-unused-vars
      /** @type {string} */ _abilityName,
    ) => {
      const { battle } = createMockBattle({
        autoStart: false,
      });

      for (const pokemon of Object.values(battle.allPokemon)) {
        pokemon.setAbility(abilityId);
      }

      expect(() => {
        battle.start();
      }).not.toThrow();

      expect(() => {
        for (const pokemon of Object.values(battle.allPokemon)) {
          pokemon.disableAbility();
        }
      }).not.toThrow();
    },
  );
});
