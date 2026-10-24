const { pokemonConfig, typeConfig } = require("../config/pokemonConfig");
const { getMoves } = require("../battle/data/moveRegistry");
const { getEffects } = require("../battle/data/effectRegistry");
const { getAbilities } = require("../battle/data/abilityRegistry");
const { getHeldItems } = require("../battle/data/heldItemRegistry");
const { BATTLE_RULESET_VERSION } = require("../battle/persistence/battleRecord");
const { statusConditions } = require("../config/battleConfig");

const statusDisplay = {
  [statusConditions.BURN]: {
    name: "Burn", description: "Takes damage at the end of its turn and deals less damage with attacks.",
  },
  [statusConditions.FREEZE]: {
    name: "Freeze", description: "May be unable to move. Its chance of thawing out increases each turn.",
  },
  [statusConditions.PARALYSIS]: {
    name: "Paralysis", description: "Lowers Speed and may stop it from moving.",
  },
  [statusConditions.POISON]: {
    name: "Poison", description: "Takes damage at the end of its turn.",
  },
  [statusConditions.SLEEP]: {
    name: "Sleep", description: "May be unable to move. Its chance of waking up increases each turn.",
  },
  [statusConditions.BADLY_POISON]: {
    name: "Badly Poison", description: "Takes increasing damage at the end of each of its turns.",
  },
};

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
  effects: select(getEffects({}), ["name", "description", "type"]),
  types: select(typeConfig, ["name"]),
  abilities: select(getAbilities({}), ["name", "description"]),
  heldItems: select(getHeldItems({}), ["name", "description"]),
  statuses: statusDisplay,
});

module.exports = { buildBattleCatalog };
