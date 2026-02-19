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
});
