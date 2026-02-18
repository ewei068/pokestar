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
});
