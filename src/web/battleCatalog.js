const { pokemonConfig, typeConfig } = require("../config/pokemonConfig");
const { getMoves } = require("../battle/data/moveRegistry");
const { getEffects } = require("../battle/data/effectRegistry");
const { getAbilities } = require("../battle/data/abilityRegistry");
const { getHeldItems } = require("../battle/data/heldItemRegistry");
const { BATTLE_RULESET_VERSION } = require("../battle/persistence/battleRecord");
const { statusConditions } = require("../config/battleConfig");

const statusDisplay = {
  [statusConditions.BURN]: {
    name: "Burn", description: "Takes damage when status ticks and deals less attack damage.",
  },
  [statusConditions.FREEZE]: {
    name: "Freeze", description: "May prevent a move. The chance to thaw rises with each turn.",
  },
  [statusConditions.PARALYSIS]: {
    name: "Paralysis", description: "Speed is reduced and each move has a chance to be blocked.",
  },
  [statusConditions.POISON]: {
    name: "Poison", description: "Takes damage when status ticks.",
  },
  [statusConditions.SLEEP]: {
    name: "Sleep", description: "May prevent a move. The chance to wake rises with each turn.",
  },
  [statusConditions.BADLY_POISON]: {
    name: "Badly Poison", description: "Takes increasing damage when status ticks.",
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
