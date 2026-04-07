const { getHeldItemIds, getHeldItem } = require("../heldItemRegistry");
const { createMockBattle } = require("../../../__testing__/mocks/battle");

describe("All Held Items e2e", () => {
  const getTestCases = () =>
    getHeldItemIds({}).map((heldItemId) => {
      const heldItem = getHeldItem(heldItemId);
      return [heldItemId, heldItem.name, heldItem.tags?.includes("usable")];
    });

  it.each(getTestCases())(
    "held item %s (%s) can be applied and removed without error (usable: %s)",
    (
      /** @type {HeldItemIdEnum} */ heldItemId,
      // eslint-disable-next-line no-unused-vars
      /** @type {string} */ _heldItemName,
      /** @type {boolean} */ isUsable,
    ) => {
      const { battle } = createMockBattle({
        autoStart: false,
      });

      for (const pokemon of Object.values(battle.allPokemon)) {
        pokemon.setHeldItem(heldItemId);
      }

      expect(() => {
        battle.start();
      }).not.toThrow();

      expect(() => {
        for (const pokemon of Object.values(battle.allPokemon)) {
          if (isUsable) {
            pokemon.useHeldItem();
          } else {
            pokemon.disableHeldItem();
          }
        }
      }).not.toThrow();
    },
  );
});
