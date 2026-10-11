const { pokemonConfig } = require("../config/pokemonConfig");
const { getMoves } = require("../battle/data/moveRegistry");
const { getEffects } = require("../battle/data/effectRegistry");
const { getAbilities } = require("../battle/data/abilityRegistry");
const { getHeldItems } = require("../battle/data/heldItemRegistry");
const { BATTLE_RULESET_VERSION } = require("../battle/persistence/battleRecord");

const select = (entries, fields) => Object.fromEntries(
  Object.entries(entries).map(([id, entry]) => [
    id,
    Object.fromEntries(fields
      .filter((field) => entry[field] !== undefined)
      .map((field) => [field, entry[field]])),
  ]),
);

const buildBattleCatalog = () => ({
  rulesetVersion: BATTLE_RULESET_VERSION,
  species: select(pokemonConfig, ["name", "type", "sprite", "shinySprite"]),
  moves: select(getMoves({}), [
    "name", "type", "power", "accuracy", "cooldown", "damageType",
    "targetPattern", "description",
  ]),
  effects: select(getEffects({}), ["name", "description"]),
  abilities: select(getAbilities({}), ["name", "description"]),
  heldItems: select(getHeldItems({}), ["name", "description"]),
});

module.exports = { buildBattleCatalog };
