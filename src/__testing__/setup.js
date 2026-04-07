// eslint-disable-next-line global-require
jest.mock("../database/mongoHandler", () => require("./mocks/database"));

const { initialize } = require("../battle/data/initialize");

initialize(true);

expect.extend({
  toBeDamaged(pokemon) {
    const pass = pokemon.hp < pokemon.maxHp;
    return {
      pass,
      message: () =>
        `expected Pokemon ${pass ? "not " : ""}to have taken damage (hp: ${pokemon.hp}, maxHp: ${pokemon.maxHp})`,
    };
  },
  toBeDamagedBy(pokemon, amount) {
    const damageTaken = pokemon.maxHp - pokemon.hp;
    const pass = this.equals(damageTaken, amount);
    return {
      pass,
      message: () =>
        `expected Pokemon ${pass ? "not " : ""}to have taken ${this.utils.printExpected(amount)} damage, but took ${this.utils.printReceived(damageTaken)}`,
    };
  },
  toBeGreaterThanOrEqual(received, expected) {
    const pass = received >= expected;
    return {
      pass,
      message: () =>
        `expected ${this.utils.printReceived(received)}${pass ? " not" : ""} to be greater than or equal to ${this.utils.printExpected(expected)}`,
    };
  },
  toBeGreaterThan(received, expected) {
    const pass = received > expected;
    return {
      pass,
      message: () =>
        `expected ${this.utils.printReceived(received)}${pass ? " not" : ""} to be greater than ${this.utils.printExpected(expected)}`,
    };
  },
  toBeLessThanOrEqual(received, expected) {
    const pass = received <= expected;
    return {
      pass,
      message: () =>
        `expected ${this.utils.printReceived(received)}${pass ? " not" : ""} to be less than or equal to ${this.utils.printExpected(expected)}`,
    };
  },
  toBeLessThan(received, expected) {
    const pass = received < expected;
    return {
      pass,
      message: () =>
        `expected ${this.utils.printReceived(received)}${pass ? " not" : ""} to be less than ${this.utils.printExpected(expected)}`,
    };
  },
  toHaveEffect(pokemon, effectId) {
    const pass = pokemon.effectIds[effectId] !== undefined;
    return {
      pass,
      message: () =>
        `expected ${pokemon.name} ${pass ? "not " : ""}to have effect ${this.utils.printExpected(effectId)}`,
    };
  },
  toBeShielded(pokemon) {
    const effectInstance = pokemon.effectIds.shield;
    const pass =
      effectInstance !== undefined && effectInstance.args?.shield > 0;
    return {
      pass,
      message: () =>
        `expected ${pokemon.name} ${pass ? "not " : ""}to be shielded`,
    };
  },
  toHaveHeldItem(pokemon, heldItemId) {
    if (heldItemId === undefined) {
      const pass = pokemon.heldItem.heldItemId !== undefined;
      return {
        pass,
        message: () =>
          `expected ${pokemon.name} ${pass ? "not " : ""}to have a held item (has: ${this.utils.printReceived(pokemon.heldItem.heldItemId)})`,
      };
    }
    const pass = pokemon.heldItem.heldItemId === heldItemId;
    return {
      pass,
      message: () =>
        `expected ${pokemon.name} ${pass ? "not " : ""}to have held item ${this.utils.printExpected(heldItemId)}, but has ${this.utils.printReceived(pokemon.heldItem.heldItemId)}`,
    };
  },
});
