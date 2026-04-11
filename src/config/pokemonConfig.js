const { moveIdEnum, abilityIdEnum } = require("../enums/battleEnums");
const { ansiTokens } = require("../enums/miscEnums");
const { pokemonIdEnum } = require("../enums/pokemonEnums");

/** @typedef {Enum<types>} PokemonTypeEnum */
const types = Object.freeze({
  NORMAL: 0,
  FIGHTING: 1,
  FLYING: 2,
  POISON: 3,
  GROUND: 4,
  ROCK: 5,
  BUG: 6,
  GHOST: 7,
  STEEL: 8,
  FIRE: 9,
  WATER: 10,
  GRASS: 11,
  ELECTRIC: 12,
  PSYCHIC: 13,
  ICE: 14,
  DRAGON: 15,
  DARK: 16,
  FAIRY: 17,
  UNKNOWN: 18,
  SHADOW: 19,
});

const typeConfig = {
  0: {
    name: "Normal",
    color: "#A8A878",
    id: 0,
    emoji: "<:normal:1107083676136783892>",
  },
  1: {
    name: "Fighting",
    color: "#C03028",
    id: 1,
    emoji: "<:fighting:1107083600052101160>",
  },
  2: {
    name: "Flying",
    color: "#A890F0",
    id: 2,
    emoji: "<:flying:1107083603889885214>",
  },
  3: {
    name: "Poison",
    color: "#A040A0",
    id: 3,
    emoji: "<:poison:1107083678401699921>",
  },
  4: {
    name: "Ground",
    color: "#E0C068",
    id: 4,
    emoji: "<:ground:1107083673410478100>",
  },
  5: {
    name: "Rock",
    color: "#B8A038",
    id: 5,
    emoji: "<:rock:1107083680742125640>",
  },
  6: {
    name: "Bug",
    color: "#A8B820",
    id: 6,
    emoji: "<:bug:1107083592779190272>",
  },
  7: {
    name: "Ghost",
    color: "#705898",
    id: 7,
    emoji: "<:ghost:1107083605114622123>",
  },
  8: {
    name: "Steel",
    color: "#B8B8D0",
    id: 8,
    emoji: "<:steel:1107083687931166862>",
  },
  9: {
    name: "Fire",
    color: "#F08030",
    id: 9,
    emoji: "<:fire:1107083601151004764>",
  },
  10: {
    name: "Water",
    color: "#6890F0",
    id: 10,
    emoji: "<:water:1107083690422587402>",
  },
  11: {
    name: "Grass",
    color: "#78C850",
    id: 11,
    emoji: "<:grass:1107083671372058697>",
  },
  12: {
    name: "Electric",
    color: "#F8D030",
    id: 12,
    emoji: "<:electric:1107083597250310214>",
  },
  13: {
    name: "Psychic",
    color: "#F85888",
    id: 13,
    emoji: "<:psychic:1107083679588683828>",
  },
  14: {
    name: "Ice",
    color: "#98D8D8",
    id: 14,
    emoji: "<:ice:1107083674748469338>",
  },
  15: {
    name: "Dragon",
    color: "#7038F8",
    id: 15,
    emoji: "<:dragon:1107083595937484820>",
  },
  16: {
    name: "Dark",
    color: "#705848",
    id: 16,
    emoji: "<:dark:1107083594112970853>",
  },
  17: {
    name: "Fairy",
    color: "#EE99AC",
    id: 17,
    emoji: "<:fairy:1107083598298886155>",
  },
  18: { name: "Unknown", color: "#68A090", id: 18, emoji: "❓" },
  19: { name: "Shadow", color: "#705848", id: 19, emoji: "⬛" },
};

/** @typedef {Keys<natureConfig>} NatureEnum */
const natureConfig = Object.freeze({
  0: {
    name: "Hardy",
    description: "No stat changes",
    stats: [0, 0, 0, 0, 0, 0],
  },
  1: {
    name: "Lonely",
    description: "Atk +1, Def -1",
    stats: [0, 1, -1, 0, 0, 0],
  },
  2: {
    name: "Brave",
    description: "Atk +1, Spe -1",
    stats: [0, 1, 0, 0, 0, -1],
  },
  3: {
    name: "Adamant",
    description: "Atk +1, SpA -1",
    stats: [0, 1, 0, -1, 0, 0],
  },
  4: {
    name: "Naughty",
    description: "Atk +1, SpD -1",
    stats: [0, 1, 0, 0, -1, 0],
  },
  5: {
    name: "Bold",
    description: "Def +1, Atk -1",
    stats: [0, -1, 1, 0, 0, 0],
  },
  6: {
    name: "Docile",
    description: "No stat changes",
    stats: [0, 0, 0, 0, 0, 0],
  },
  7: {
    name: "Relaxed",
    description: "Def +1, Spe -1",
    stats: [0, 0, 1, 0, 0, -1],
  },
  8: {
    name: "Impish",
    description: "Def +1, SpA -1",
    stats: [0, 0, 1, -1, 0, 0],
  },
  9: { name: "Lax", description: "Def +1, SpD -1", stats: [0, 0, 1, 0, -1, 0] },
  10: {
    name: "Timid",
    description: "Spe +1, Atk -1",
    stats: [0, -1, 0, 0, 0, 1],
  },
  11: {
    name: "Hasty",
    description: "Spe +1, Def -1",
    stats: [0, 0, -1, 0, 0, 1],
  },
  12: {
    name: "Serious",
    description: "No stat changes",
    stats: [0, 0, 0, 0, 0, 0],
  },
  13: {
    name: "Jolly",
    description: "Spe +1, SpA -1",
    stats: [0, 0, 0, -1, 0, 1],
  },
  14: {
    name: "Naive",
    description: "Spe +1, SpD -1",
    stats: [0, 0, 0, 0, -1, 1],
  },
  15: {
    name: "Modest",
    description: "SpA +1, Atk -1",
    stats: [0, -1, 0, 1, 0, 0],
  },
  16: {
    name: "Mild",
    description: "SpA +1, Def -1",
    stats: [0, 0, -1, 1, 0, 0],
  },
  17: {
    name: "Quiet",
    description: "SpA +1, Spe -1",
    stats: [0, 0, 0, 1, 0, -1],
  },
  18: {
    name: "Bashful",
    description: "No stat changes",
    stats: [0, 0, 0, 0, 0, 0],
  },
  19: {
    name: "Rash",
    description: "SpA +1, SpD -1",
    stats: [0, 0, 0, 1, -1, 0],
  },
  20: {
    name: "Calm",
    description: "SpD +1, Atk -1",
    stats: [0, -1, 0, 0, 1, 0],
  },
  21: {
    name: "Gentle",
    description: "SpD +1, Def -1",
    stats: [0, 0, -1, 0, 1, 0],
  },
  22: {
    name: "Sassy",
    description: "SpD +1, Spe -1",
    stats: [0, 0, 0, 0, 1, -1],
  },
  23: {
    name: "Careful",
    description: "SpD +1, SpA -1",
    stats: [0, 0, 0, -1, 1, 0],
  },
  24: {
    name: "Quirky",
    description: "No stat changes",
    stats: [0, 0, 0, 0, 0, 0],
  },
});

/** @typedef {Enum<stats>} StatIndexEnum */
const stats = Object.freeze({
  HP: 0,
  ATTACK: 1,
  DEFENSE: 2,
  SPATK: 3,
  SPDEF: 4,
  SPEED: 5,
});

const statConfig = {
  0: { name: "HP", emoji: "❤️", description: "Hit Points", battleStatId: "hp" },
  1: { name: "Atk", emoji: "⚔️", description: "Attack", battleStatId: "atk" },
  2: { name: "Def", emoji: "🛡️", description: "Defense", battleStatId: "def" },
  3: {
    name: "SpA",
    emoji: "🔮",
    description: "Special Attack",
    battleStatId: "spa",
  },
  4: {
    name: "SpD",
    emoji: "🌀",
    description: "Special Defense",
    battleStatId: "spd",
  },
  5: { name: "Spe", emoji: "⚡︎", description: "Speed", battleStatId: "spe" },
};

/** @typedef {Enum<growthRates>} GrowthRateEnum */
const growthRates = Object.freeze({
  ERRATIC: 0,
  FAST: 1,
  MEDIUMFAST: 2,
  MEDIUMSLOW: 3,
  SLOW: 4,
  FLUCTUATING: 5,
});

const growthRateConfig = {
  [growthRates.ERRATIC]: {
    name: "Erratic",
    growthFn(level) {
      // TODO: change?
      return Math.floor(0.5 * level ** 2.5);
    },
  },
  [growthRates.FAST]: {
    name: "Fast",
    growthFn(level) {
      return Math.floor(0.5 * level ** 2.5);
    },
  },
  [growthRates.MEDIUMFAST]: {
    name: "Medium Fast",
    growthFn(level) {
      return Math.floor(0.8 * level ** 2.5);
    },
  },
  [growthRates.MEDIUMSLOW]: {
    name: "Medium Slow",
    growthFn(level) {
      return Math.floor(level ** 2.5);
    },
  },
  [growthRates.SLOW]: {
    name: "Slow",
    growthFn(level) {
      return Math.floor(1.5 * level ** 2.5);
    },
  },
  [growthRates.FLUCTUATING]: {
    name: "Fluctuating",
    growthFn(level) {
      // TODO: change?
      return Math.floor(1.5 * level ** 2.5);
    },
  },
};

/** @typedef {Enum<rarities>} RarityEnum */
const rarities = Object.freeze({
  COMMON: "Common",
  RARE: "Rare",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
  MYTHICAL: "Mythical",
});

/**
 * @typedef {Keys<canonicalPokemonConfig> | Keys<fakePokemonConfig>} PokemonIdEnum
 */

/**
 * @satisfies {PartialRecord<AllPokemonIdEnum, CanonicalPokemonConfigData>}
 */
const canonicalPokemonConfig = {
  [pokemonIdEnum.BULBASAUR]: {
    emoji: "<:1_:1100279982556708956>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.IVYSAUR,
      },
    ],
    moveIds: [
      moveIdEnum.VINE_WHIP,
      moveIdEnum.TACKLE,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.GIGA_DRAIN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.IVYSAUR]: {
    emoji: "<:2_:1100279984922296501>",
    evolution: [
      {
        level: 32,
        id: pokemonIdEnum.VENUSAUR,
      },
    ],
    moveIds: [
      moveIdEnum.VINE_WHIP,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.GIGA_DRAIN,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.VENUSAUR]: {
    emoji: "<:3_:1100279986012819536>",
    moveIds: [
      moveIdEnum.VINE_WHIP,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.SOLAR_BEAM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CHARMANDER]: {
    emoji: "<:4_:1100279987057209364>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.CHARMELEON,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.EMBER,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.FLAMETHROWER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CHARMELEON]: {
    emoji: "<:5_:1100279988156104774>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.CHARIZARD,
      },
    ],
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.DRAGON_TAIL,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CHARIZARD]: {
    emoji: "<:6_:1100279989703819264>",
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.DRAGON_TAIL,
      moveIdEnum.FLARE_BLITZ,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SQUIRTLE]: {
    emoji: "<:7_:1100279990806904882>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.WARTORTLE,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.WITHDRAW,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.WATER_PULSE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.WARTORTLE]: {
    emoji: "<:8_:1100279991813558332>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.BLASTOISE,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.WATER_PULSE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.BLASTOISE]: {
    emoji: "<:9_:1100280018468347974>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CATERPIE]: {
    emoji: "<:10:1100279993835196418>",
    evolution: [
      {
        level: 7,
        id: pokemonIdEnum.METAPOD,
      },
    ],
    moveIds: [moveIdEnum.TACKLE, moveIdEnum.STRING_SHOT, moveIdEnum.BUG_BITE],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.METAPOD]: {
    emoji: "<:11:1100280981321162752>",
    evolution: [
      {
        level: 10,
        id: pokemonIdEnum.BUTTERFREE,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.HARDEN,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.BUTTERFREE]: {
    emoji: "<:12:1100280983024058418>",
    moveIds: [
      moveIdEnum.GUST,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.QUIVER_DANCE,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.WEEDLE]: {
    emoji: "<:13:1100280983837737041>",
    evolution: [
      {
        level: 7,
        id: pokemonIdEnum.KAKUNA,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.KAKUNA]: {
    emoji: "<:14:1100280985343508520>",
    evolution: [
      {
        level: 10,
        id: pokemonIdEnum.BEEDRILL,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.HARDEN,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.BEEDRILL]: {
    emoji: "<:15:1100280987197378610>",
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.POISON_JAB,
      moveIdEnum.BUG_BITE,
      moveIdEnum.FELL_STINGER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.PIDGEY]: {
    emoji: "<:16:1100280988304674866>",
    evolution: [
      {
        level: 13,
        id: pokemonIdEnum.PIDGEOTTO,
      },
    ],
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.ROOST,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PIDGEOTTO]: {
    emoji: "<:17:1100280989403578410>",
    evolution: [
      {
        level: 28,
        id: pokemonIdEnum.PIDGEOT,
      },
    ],
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.ROOST,
      moveIdEnum.U_TURN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PIDGEOT]: {
    emoji: "<:18:1100280990225662025>",
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.ROOST,
      moveIdEnum.U_TURN,
      moveIdEnum.DOUBLE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.RATTATA]: {
    emoji: "<:19:1100280992297664552>",
    evolution: [
      {
        level: 12,
        id: pokemonIdEnum.RATICATE,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.ENDEAVOR,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.RATICATE]: {
    emoji: "<:20:1100281012111552562>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.ENDURE,
      moveIdEnum.ENDEAVOR,
      moveIdEnum.SUPER_FANG,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.EKANS]: {
    emoji: "<:23:1100282068837081109>",
    evolution: [
      {
        level: 22,
        id: pokemonIdEnum.ARBOK,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.LEER,
      moveIdEnum.GLARE,
      moveIdEnum.POISON_JAB,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.ARBOK]: {
    emoji: "<:24:1100282070082801670>",
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.GLARE,
      moveIdEnum.GUNK_SHOT,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.PIKACHU]: {
    emoji: "<:25:1100282072003772457>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.RAICHU,
      },
    ],
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.SURF,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.NASTY_PLOT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.RAICHU]: {
    emoji: "<:26:1100282073509527672>",
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.SURF,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.THUNDER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.NIDORAN_F]: {
    emoji: "<:29:1100282077531865088>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.NIDORINA,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.EARTH_POWER,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.NIDORINA]: {
    emoji: "<:30:1100282100952858664>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.NIDOQUEEN,
      },
    ],
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.EARTH_POWER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.NIDOQUEEN]: {
    emoji: "<:31:1100282806065696768>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.NIDORAN_M]: {
    emoji: "<:32:1100282808032833536>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.NIDORINO,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.LEER,
      moveIdEnum.POISON_JAB,
      moveIdEnum.EARTH_POWER,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.NIDORINO]: {
    emoji: "<:33:1100282809089785948>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.NIDOKING,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.HORN_ATTACK,
      moveIdEnum.POISON_JAB,
      moveIdEnum.EARTH_POWER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.NIDOKING]: {
    emoji: "<:34:1100282810960449576>",
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.MEGAHORN,
      moveIdEnum.POISON_JAB,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CLEFAIRY]: {
    emoji: "<:35:1100282812810137600>",
    evolution: [
      {
        level: 26,
        id: pokemonIdEnum.CLEFABLE,
      },
    ],
    moveIds: [
      moveIdEnum.METRONOME,
      moveIdEnum.FOLLOW_ME,
      moveIdEnum.METEOR_MASH,
      moveIdEnum.HEALING_WISH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.CLEFABLE]: {
    emoji: "<:36:1100282814701781032>",
    moveIds: [
      moveIdEnum.METRONOME,
      moveIdEnum.FOLLOW_ME,
      moveIdEnum.HEALING_WISH,
      moveIdEnum.MOONBLAST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.VULPIX]: {
    emoji: "<:37:1100282816270438432>",
    evolution: [
      {
        level: 26,
        id: pokemonIdEnum.NINETALES,
      },
    ],
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.SAFEGUARD,
      moveIdEnum.GRUDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.NINETALES]: {
    emoji: "<:38:1100282817818144809>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.SAFEGUARD,
      moveIdEnum.GRUDGE,
      moveIdEnum.HEAT_WAVE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.JIGGLYPUFF]: {
    emoji: "<:39:1100282819411972116>",
    evolution: [
      {
        level: 26,
        id: pokemonIdEnum.WIGGLYTUFF,
      },
    ],
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.SING,
      moveIdEnum.SWEET_KISS,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.WIGGLYTUFF]: {
    emoji: "<:40:1100282821093904484>",
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.SING,
      moveIdEnum.SWEET_KISS,
      moveIdEnum.HYPER_VOICE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ZUBAT]: {
    emoji: "<:41:1100283650458779648>",
    evolution: [
      {
        level: 14,
        id: pokemonIdEnum.GOLBAT,
      },
    ],
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.ABSORB,
      moveIdEnum.TAUNT,
      moveIdEnum.POISON_FANG,
    ],
    abilities: {
      [abilityIdEnum.COLOR_CHANGE]: 0.2,
      [abilityIdEnum.INNER_FOCUS]: 0.8,
    },
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GOLBAT]: {
    emoji: "<:42:1100283652367200276>",
    evolution: [
      {
        level: 42,
        id: pokemonIdEnum.CROBAT,
      },
    ],
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.TAUNT,
      moveIdEnum.POISON_FANG,
      moveIdEnum.ROOST,
    ],
    abilities: {
      [abilityIdEnum.COLOR_CHANGE]: 0.2,
      [abilityIdEnum.INNER_FOCUS]: 0.8,
    },
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ODDISH]: {
    emoji: "<:43:1100283653122170963>",
    evolution: [
      {
        level: 21,
        id: pokemonIdEnum.GLOOM,
      },
    ],
    moveIds: [
      moveIdEnum.ACID,
      moveIdEnum.ABSORB,
      moveIdEnum.LEECH_SEED,
      moveIdEnum.SLEEP_POWDER,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GLOOM]: {
    emoji: "<:44:1100283654749552771>",
    evolution: [
      {
        level: 31,
        id: pokemonIdEnum.VILEPLUME,
      },
      {
        level: 31,
        id: pokemonIdEnum.BELLOSSOM,
      },
    ],
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.LEECH_SEED,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.GIGA_DRAIN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.VILEPLUME]: {
    emoji: "<:45:1100283656561512509>",
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.LEECH_SEED,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.PETAL_BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PARAS]: {
    emoji: "<:46:1100283657832386611>",
    evolution: [
      {
        level: 24,
        id: pokemonIdEnum.PARASECT,
      },
    ],
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.POISON_POWDER,
      moveIdEnum.BUG_BITE,
      moveIdEnum.SPORE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.PARASECT]: {
    emoji: "<:47:1100283658994200637>",
    moveIds: [
      moveIdEnum.POISON_POWDER,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.BUG_BITE,
      moveIdEnum.SPORE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.VENONAT]: {
    emoji: "<:48:1100283660852273213>",
    evolution: [
      {
        level: 21,
        id: pokemonIdEnum.VENOMOTH,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_POWDER,
      moveIdEnum.DISABLE,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.VENOMOTH]: {
    emoji: "<:49:1100283661900861541>",
    moveIds: [
      moveIdEnum.POISON_POWDER,
      moveIdEnum.DISABLE,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.DIGLETT]: {
    emoji: "<:50:1100283701142757397>",
    evolution: [
      {
        level: 26,
        id: pokemonIdEnum.DUGTRIO,
      },
    ],
    moveIds: [
      moveIdEnum.MUD_SLAP,
      moveIdEnum.DIG,
      moveIdEnum.SCREECH,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.DUGTRIO]: {
    emoji: "<:51:1100285026106613840>",
    moveIds: [
      moveIdEnum.MUD_SLAP,
      moveIdEnum.DIG,
      moveIdEnum.SCREECH,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MEOWTH]: {
    emoji: "<:52:1100285028157640704>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.PERSIAN,
      },
    ],
    moveIds: [
      moveIdEnum.PAY_DAY,
      moveIdEnum.SCRATCH,
      moveIdEnum.TAUNT,
      moveIdEnum.U_TURN,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.PERSIAN]: {
    emoji: "<:53:1100285029122318406>",
    moveIds: [
      moveIdEnum.PAY_DAY,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.TAUNT,
      moveIdEnum.U_TURN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.GROWLITHE]: {
    emoji: "<:58:1100285035745136650>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.ARCANINE,
      },
    ],
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.ROAR,
      moveIdEnum.FIRE_FANG,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ARCANINE]: {
    emoji: "<:59:1100285037452202024>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.ROAR,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.FLARE_BLITZ,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.POLIWAG]: {
    emoji: "<:60:1100285079281991781>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.POLIWHIRL,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.POUND,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.WATERFALL,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.POLIWHIRL]: {
    emoji: "<:61:1100286232086454313>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.POLIWRATH,
      },
      {
        level: 36,
        id: pokemonIdEnum.POLITOED,
      },
    ],
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.WATERFALL,
      moveIdEnum.BELLY_DRUM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.POLIWRATH]: {
    emoji: "<:62:1100286233449611336>",
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.WATERFALL,
      moveIdEnum.BELLY_DRUM,
      moveIdEnum.DYNAMIC_PUNCH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ABRA]: {
    emoji: "<:63:1100286235064414279>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.KADABRA,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.TELEPORT,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.NASTY_PLOT,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.KADABRA]: {
    emoji: "<:64:1100286236280754206>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.ALAKAZAM,
      },
    ],
    moveIds: [
      moveIdEnum.KINESIS,
      moveIdEnum.PSYBEAM,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.NASTY_PLOT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ALAKAZAM]: {
    emoji: "<:65:1100286237836836914>",
    moveIds: [
      moveIdEnum.KINESIS,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.FUTURE_SIGHT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MACHOP]: {
    emoji: "<:66:1100286238864449616>",
    evolution: [
      {
        level: 28,
        id: pokemonIdEnum.MACHOKE,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.STRENGTH,
      moveIdEnum.CROSS_CHOP,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MACHOKE]: {
    emoji: "<:67:1100286239929815050>",
    evolution: [
      {
        level: 42,
        id: pokemonIdEnum.MACHAMP,
      },
    ],
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.STRENGTH,
      moveIdEnum.CROSS_CHOP,
      moveIdEnum.KNOCK_OFF,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MACHAMP]: {
    emoji: "<:68:1100286241376849941>",
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.CROSS_CHOP,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.DYNAMIC_PUNCH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BELLSPROUT]: {
    emoji: "<:69:1100286243637559316>",
    evolution: [
      {
        level: 21,
        id: pokemonIdEnum.WEEPINBELL,
      },
    ],
    moveIds: [
      moveIdEnum.VINE_WHIP,
      moveIdEnum.ACID,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.POISON_JAB,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.WEEPINBELL]: {
    emoji: "<:70:1100286274746716230>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.VICTREEBEL,
      },
    ],
    moveIds: [
      moveIdEnum.ACID,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.POISON_JAB,
      moveIdEnum.STRENGTH_SAP,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.VICTREEBEL]: {
    emoji: "<:71:1100287549051777144>",
    moveIds: [
      moveIdEnum.ACID,
      moveIdEnum.POISON_JAB,
      moveIdEnum.STRENGTH_SAP,
      moveIdEnum.LEAF_STORM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GEODUDE]: {
    emoji: "<:74:1100287553464184933>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.GRAVELER,
      },
    ],
    moveIds: [
      moveIdEnum.HARDEN,
      moveIdEnum.ROLLOUT,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GRAVELER]: {
    emoji: "<:75:1100287555330654320>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.GOLEM,
      },
    ],
    moveIds: [
      moveIdEnum.ROLLOUT,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GOLEM]: {
    emoji: "<:76:1100287556530212914>",
    moveIds: [
      moveIdEnum.ROLLOUT,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SLOWPOKE]: {
    emoji: "<:79:1100287560393183233>",
    evolution: [
      {
        level: 37,
        id: pokemonIdEnum.SLOWBRO,
      },
      {
        level: 37,
        id: pokemonIdEnum.SLOWKING,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PSYCHIC,
      moveIdEnum.SCALD,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SLOWBRO]: {
    emoji: "<:80:1100287586657902654>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.SCALD,
      moveIdEnum.SLACK_OFF,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MAGNEMITE]: {
    emoji: "<:81:1100288375589699594>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.MAGNETON,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.FLASH_CANNON,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MAGNETON]: {
    emoji: "<:82:1100288377275818068>",
    evolution: [
      {
        level: 50,
        id: pokemonIdEnum.MAGNEZONE,
      },
    ],
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.FLASH_CANNON,
      moveIdEnum.VOLT_SWITCH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.FARFETCHD]: {
    emoji: "<:83:1100288378076942449>",
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.LEAF_BLADE,
      moveIdEnum.BRAVE_BIRD,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GRIMER]: {
    emoji: "<:88:1100288386092245062>",
    evolution: [
      {
        level: 38,
        id: pokemonIdEnum.MUK,
      },
    ],
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.TOXIC,
      moveIdEnum.POISON_JAB,
      moveIdEnum.GUNK_SHOT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MUK]: {
    emoji: "<:89:1100288387363119235>",
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.TOXIC,
      moveIdEnum.GUNK_SHOT,
      moveIdEnum.SLUDGE_WAVE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SHELLDER]: {
    emoji: "<:90:1100288411937546250>",
    evolution: [
      {
        level: 38,
        id: pokemonIdEnum.CLOYSTER,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.ICE_SHARD,
      moveIdEnum.SPIKES,
      moveIdEnum.IRON_DEFENSE,
    ],
    abilities: {
      [abilityIdEnum.SHELL_ARMOR]: 0.45,
      [abilityIdEnum.ADAPTABILITY]: 0.45,
      [abilityIdEnum.OVERCOAT]: 0.1,
    },
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CLOYSTER]: {
    emoji: "<:91:1100288966881718342>",
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.SPIKES,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.RAZOR_SHELL,
    ],
    abilities: {
      [abilityIdEnum.SHELL_ARMOR]: 0.45,
      [abilityIdEnum.ADAPTABILITY]: 0.45,
      [abilityIdEnum.OVERCOAT]: 0.1,
    },
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GASTLY]: {
    emoji: "<:92:1100288967909322783>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.HAUNTER,
      },
    ],
    moveIds: [
      moveIdEnum.LICK,
      moveIdEnum.HEX,
      moveIdEnum.NIGHT_SHADE,
      moveIdEnum.SHADOW_BALL,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.HAUNTER]: {
    emoji: "<:93:1100288969935175750>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.GENGAR,
      },
    ],
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.NIGHT_SHADE,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.TAUNT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GENGAR]: {
    emoji: "<:94:1100288971067633765>",
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.TAUNT,
      moveIdEnum.SLUDGE_WAVE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ONIX]: {
    emoji: "<:95:1100288972938285177>",
    evolution: [
      {
        id: pokemonIdEnum.STEELIX,
        level: 40,
      },
    ],
    moveIds: [
      moveIdEnum.FLAIL,
      moveIdEnum.ENDURE,
      moveIdEnum.WIDE_GUARD,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.KRABBY]: {
    emoji: "<:98:1100288977631711252>",
    evolution: [
      {
        level: 28,
        id: pokemonIdEnum.KINGLER,
      },
    ],
    moveIds: [
      moveIdEnum.FLAIL,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.STRENGTH,
      moveIdEnum.WATERFALL,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.KINGLER]: {
    emoji: "<:99:1100288979040993314>",
    moveIds: [
      moveIdEnum.FLAIL,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.CRABHAMMER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.VOLTORB]: {
    emoji: "<:100:1100288981884751922>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.ELECTRODE,
      },
    ],
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.TAUNT,
      moveIdEnum.DISCHARGE,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ELECTRODE]: {
    emoji: "<:101:1100290179073331240>",
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.TAUNT,
      moveIdEnum.DISCHARGE,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.EXEGGCUTE]: {
    emoji: "<:102:1100290181124337685>",
    evolution: [
      {
        level: 35,
        id: pokemonIdEnum.EXEGGUTOR,
      },
    ],
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.PSYCHIC,
      moveIdEnum.SLUDGE_BOMB,
      moveIdEnum.GIGA_DRAIN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.EXEGGUTOR]: {
    emoji: "<:103:1100290182420369419>",
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.PSYCHIC,
      moveIdEnum.SYNTHESIS,
      moveIdEnum.SOLAR_BEAM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.HITMONLEE]: {
    emoji: "<:106:1100290187147362405>",
    moveIds: [
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.COUNTER,
      moveIdEnum.BLAZE_KICK,
      moveIdEnum.HIGH_JUMP_KICK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.HITMONCHAN]: {
    emoji: "<:107:1100290188539854898>",
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.COUNTER,
      moveIdEnum.DRAIN_PUNCH,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LICKITUNG]: {
    emoji: "<:108:1100290190532169819>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.LICKILICKY,
      },
    ],
    moveIds: [
      moveIdEnum.LICK,
      moveIdEnum.STOMP,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.ZEN_HEADBUTT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.KOFFING]: {
    emoji: "<:109:1100290191874347008>",
    evolution: [
      {
        level: 35,
        id: pokemonIdEnum.WEEZING,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.SMOG,
      moveIdEnum.SMOKESCREEN,
      moveIdEnum.DESTINY_BOND,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.WEEZING]: {
    emoji: "<:110:1100290193061318686>",
    moveIds: [
      moveIdEnum.SMOG,
      moveIdEnum.SMOKESCREEN,
      moveIdEnum.DESTINY_BOND,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.RHYHORN]: {
    emoji: "<:111:1100290441380888576>",
    evolution: [
      {
        level: 42,
        id: pokemonIdEnum.RHYDON,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.SMACK_DOWN,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.DRILL_RUN,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.RHYDON]: {
    emoji: "<:112:1100290443150901320>",
    evolution: [
      {
        level: 55,
        id: pokemonIdEnum.RHYPERIOR,
      },
    ],
    moveIds: [
      moveIdEnum.SMACK_DOWN,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.DRILL_RUN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CHANSEY]: {
    emoji: "<:113:1100290444249804800>",
    evolution: [
      {
        level: 50,
        id: pokemonIdEnum.BLISSEY,
      },
    ],
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.HEAL_PULSE,
      moveIdEnum.SOFT_BOILED,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.KANGASKHAN]: {
    emoji: "<:115:1100290446514733136>",
    moveIds: [
      moveIdEnum.POWER_UP_PUNCH,
      moveIdEnum.CRUNCH,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.DOUBLE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.HORSEA]: {
    emoji: "<:116:1100290448708354049>",
    evolution: [
      {
        level: 32,
        id: pokemonIdEnum.SEADRA,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.WATER_GUN,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.WATER_PULSE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SEADRA]: {
    emoji: "<:117:1100290449991807008>",
    evolution: [
      {
        level: 45,
        id: pokemonIdEnum.KINGDRA,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.WATER_PULSE,
      moveIdEnum.DRAGON_PULSE,
    ],
    abilities: {
      [abilityIdEnum.DAMP]: 0.1,
      [abilityIdEnum.SWIFT_SWIM]: 0.45,
      [abilityIdEnum.SNIPER]: 0.45,
    },
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.STARYU]: {
    emoji: "<:120:1100290515284525177>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.STARMIE,
      },
    ],
    moveIds: [
      moveIdEnum.HARDEN,
      moveIdEnum.PSYCHIC,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.WATER_PULSE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.STARMIE]: {
    emoji: "<:121:1100290825935671307>",
    moveIds: [
      moveIdEnum.HARDEN,
      moveIdEnum.PSYCHIC,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MR_MIME]: {
    emoji: "<:122:1100290827466575914>",
    moveIds: [
      moveIdEnum.MIMIC,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.REFLECT,
      moveIdEnum.TRICK_ROOM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SCYTHER]: {
    emoji: "<:123:1100290829127516160>",
    evolution: [
      {
        level: 50,
        id: pokemonIdEnum.SCIZOR,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.AERIAL_ACE,
      moveIdEnum.X_SCISSOR,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.JYNX]: {
    emoji: "<:124:1100290830440333374>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.SING,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PERISH_SONG,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ELECTABUZZ]: {
    emoji: "<:125:1100290832097099808>",
    evolution: [
      {
        level: 50,
        id: pokemonIdEnum.ELECTIVIRE,
      },
    ],
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.ICE_PUNCH,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.CROSS_CHOP,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MAGMAR]: {
    emoji: "<:126:1100290832914989108>",
    evolution: [
      {
        level: 50,
        id: pokemonIdEnum.MAGMORTAR,
      },
    ],
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.CROSS_CHOP,
      moveIdEnum.TAUNT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.PINSIR]: {
    emoji: "<:127:1100290834290720798>",
    moveIds: [
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.BUG_BITE,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.GIGA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MAGIKARP]: {
    emoji: "<:129:1100290837092515870>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.GYARADOS,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.SPLASH,
      moveIdEnum.FLAIL,
      moveIdEnum.BOUNCE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GYARADOS]: {
    emoji: "<:130:1100290880952348762>",
    moveIds: [
      moveIdEnum.FLAIL,
      moveIdEnum.WATERFALL,
      moveIdEnum.DRAGON_DANCE,
      moveIdEnum.GIGA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.LAPRAS]: {
    emoji: "<:131:1100291594927742976>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.SCALD,
      moveIdEnum.FREEZE_DRY,
      moveIdEnum.BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.DITTO]: {
    emoji: "<:132:1100291596718702613>",
    moveIds: [moveIdEnum.TRANSFORM],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.EEVEE]: {
    emoji: "<:133:1100291598564204634>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.VAPOREON,
      },
      {
        level: 25,
        id: pokemonIdEnum.JOLTEON,
      },
      {
        level: 25,
        id: pokemonIdEnum.FLAREON,
      },
      {
        level: 25,
        id: pokemonIdEnum.ESPEON,
      },
      {
        level: 25,
        id: pokemonIdEnum.UMBREON,
      },
      {
        level: 25,
        id: pokemonIdEnum.LEAFEON,
      },
      {
        level: 25,
        id: pokemonIdEnum.GLACEON,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.CHARM,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.LAST_RESORT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.VAPOREON]: {
    emoji: "<:134:1100291601311486052>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.PROTECT,
      moveIdEnum.WISH,
      moveIdEnum.AQUA_RING,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.JOLTEON]: {
    emoji: "<:135:1100291602402005073>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.AGILITY,
      moveIdEnum.BATON_PASS,
      moveIdEnum.WILD_CHARGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.FLAREON]: {
    emoji: "<:136:1100291603635126402>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.RETURN,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.FLARE_BLITZ,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.PORYGON]: {
    emoji: "<:137:1100291605384142940>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.PORYGON2,
      },
    ],
    moveIds: [
      moveIdEnum.TELEPORT,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.PROTECT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.OMANYTE]: {
    emoji: "<:138:1100291607103819806>",
    evolution: [
      {
        id: pokemonIdEnum.OMASTAR,
        level: 40,
      },
    ],
    moveIds: [
      moveIdEnum.WITHDRAW,
      moveIdEnum.SURF,
      moveIdEnum.PROTECT,
      moveIdEnum.ROCK_TOMB,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.OMASTAR]: {
    emoji: "<:139:1100291608139796490>",
    moveIds: [
      moveIdEnum.WITHDRAW,
      moveIdEnum.PROTECT,
      moveIdEnum.ROCK_TOMB,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.AERODACTYL]: {
    emoji: "<:142:1100294776689004546>",
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.ROCK_TOMB,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SNORLAX]: {
    emoji: "<:143:1100294778157027328>",
    moveIds: [
      moveIdEnum.SLEEP_TALK,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.HEAVY_SLAM,
      moveIdEnum.REST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ARTICUNO]: {
    emoji: "<:144:1100294779419504680>",
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.HEAL_BELL,
      moveIdEnum.ROOST,
      moveIdEnum.HURRICANE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.ZAPDOS]: {
    emoji: "<:145:1100294781789286500>",
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.DISCHARGE,
      moveIdEnum.TAILWIND,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.MOLTRES]: {
    emoji: "<:146:1100294783097917490>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.AGILITY,
      moveIdEnum.SKY_ATTACK,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.DRATINI]: {
    emoji: "<:147:1100294785367015434>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.DRAGONAIR,
      },
    ],
    moveIds: [
      moveIdEnum.WRAP,
      moveIdEnum.TWISTER,
      moveIdEnum.SLAM,
      moveIdEnum.DRAGON_DANCE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.DRAGONAIR]: {
    emoji: "<:148:1100294786474332230>",
    evolution: [
      {
        level: 55,
        id: pokemonIdEnum.DRAGONITE,
      },
    ],
    moveIds: [
      moveIdEnum.TWISTER,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.DRAGON_DANCE,
      moveIdEnum.DRAGON_RUSH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.DRAGONITE]: {
    emoji: "<:149:1100294787996860508>",
    moveIds: [
      moveIdEnum.TWISTER,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.DRAGON_DANCE,
      moveIdEnum.OUTRAGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.MEWTWO]: {
    emoji: "<:150:1100294789867520052>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PSYSTRIKE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.MEW]: {
    emoji: "<:151:1116755839919853670>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.PSYCHIC,
      moveIdEnum.AURA_SPHERE,
      moveIdEnum.HYPER_BEAM,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.CHIKORITA]: {
    emoji: "<:152:1116755846769168434>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.BAYLEEF,
      },
    ],
    moveIds: [
      moveIdEnum.VINE_WHIP,
      moveIdEnum.POISON_POWDER,
      moveIdEnum.LEECH_SEED,
      moveIdEnum.GIGA_DRAIN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.BAYLEEF]: {
    emoji: "<:153:1116755847712870470>",
    evolution: [
      {
        level: 32,
        id: pokemonIdEnum.MEGANIUM,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_POWDER,
      moveIdEnum.LEECH_SEED,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.DRAGON_TAIL,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MEGANIUM]: {
    emoji: "<:154:1116755848803405936>",
    moveIds: [
      moveIdEnum.POISON_POWDER,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.DRAGON_TAIL,
      moveIdEnum.ODOR_SLEUTH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CYNDAQUIL]: {
    emoji: "<:155:1116755850229456969>",
    evolution: [
      {
        level: 14,
        id: pokemonIdEnum.QUILAVA,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.FIRE_FANG,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.QUILAVA]: {
    emoji: "<:156:1116755851542274099>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.TYPHLOSION,
      },
    ],
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.FIRE_FANG,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.TYPHLOSION]: {
    emoji: "<:157:1116755852565696594>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.ERUPTION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.TOTODILE]: {
    emoji: "<:158:1116755865123442739>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.CROCONAW,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.LEER,
      moveIdEnum.WATERFALL,
      moveIdEnum.CRUNCH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CROCONAW]: {
    emoji: "<:159:1116755866650153051>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.FERALIGATR,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.STRENGTH,
      moveIdEnum.WATERFALL,
      moveIdEnum.CRUNCH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.FERALIGATR]: {
    emoji: "<:160:1116756250579959858>",
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.WATERFALL,
      moveIdEnum.CRUNCH,
      moveIdEnum.GIGA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SENTRET]: {
    emoji: "<:161:1116755922249846924>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.FURRET,
      },
    ],
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SLAM,
      moveIdEnum.AGILITY,
      moveIdEnum.BATON_PASS,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.FURRET]: {
    emoji: "<:162:1116755923642363924>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.AGILITY,
      moveIdEnum.BATON_PASS,
      moveIdEnum.DOUBLE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.HOOTHOOT]: {
    emoji: "<:163:1116755924858703932>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.NOCTOWL,
      },
    ],
    moveIds: [
      moveIdEnum.WORK_UP,
      moveIdEnum.AGILITY,
      moveIdEnum.ROOST,
      moveIdEnum.AIR_SLASH,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.NOCTOWL]: {
    emoji: "<:164:1116755926037311490>",
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.DEFOG,
      moveIdEnum.REST,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.LEDYBA]: {
    emoji: "<:165:1116755928121868298>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.LEDIAN,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.MACH_PUNCH,
      moveIdEnum.BATON_PASS,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.LEDIAN]: {
    emoji: "<:166:1116755929082363985>",
    moveIds: [
      moveIdEnum.MACH_PUNCH,
      moveIdEnum.BATON_PASS,
      moveIdEnum.BUG_BITE,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.SPINARAK]: {
    emoji: "<:167:1116755930084818967>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.ARIADOS,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.MEGAHORN,
      moveIdEnum.STICKY_WEB,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.ARIADOS]: {
    emoji: "<:168:1116755931053707316>",
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.MEGAHORN,
      moveIdEnum.STICKY_WEB,
      moveIdEnum.TOXIC_THREAD,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.CROBAT]: {
    emoji: "<:169:1116755982895304805>",
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.TAUNT,
      moveIdEnum.POISON_FANG,
      moveIdEnum.TAILWIND,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PICHU]: {
    emoji: "<:172:1116755986728886342>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.PIKACHU,
      },
    ],
    moveIds: [
      moveIdEnum.CHARM,
      moveIdEnum.NUZZLE,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.THUNDER_WAVE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.CLEFFA]: {
    emoji: "<:173:1116755987949432842>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.CLEFAIRY,
      },
    ],
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.CHARM,
      moveIdEnum.SING,
      moveIdEnum.ENCORE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.IGGLYBUFF]: {
    emoji: "<:174:1116755993150357686>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.JIGGLYPUFF,
      },
    ],
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.CHARM,
      moveIdEnum.DEFENSE_CURL,
      moveIdEnum.SWEET_KISS,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.TOGEPI]: {
    emoji: "<:175:1116755996228976770>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.TOGETIC,
      },
    ],
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.POUND,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.FOLLOW_ME,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.TOGETIC]: {
    emoji: "<:176:1116755997755703356>",
    evolution: [
      {
        level: 45,
        id: pokemonIdEnum.TOGEKISS,
      },
    ],
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.FOLLOW_ME,
      moveIdEnum.ROOST,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.NATU]: {
    emoji: "<:177:1116755999097897013>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.XATU,
      },
    ],
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.TELEPORT,
      moveIdEnum.PSYCHIC,
      moveIdEnum.REFLECT,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.XATU]: {
    emoji: "<:178:1116756065791508531>",
    moveIds: [
      moveIdEnum.TELEPORT,
      moveIdEnum.REFLECT,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.TAILWIND,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MAREEP]: {
    emoji: "<:179:1116756067767029843>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.FLAAFFY,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.ELECTROWEB,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.FLAAFFY]: {
    emoji: "<:180:1116756068941443193>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.AMPHAROS,
      },
    ],
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.HEAL_BELL,
      moveIdEnum.ELECTROWEB,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.AMPHAROS]: {
    emoji: "<:181:1116756069931302972>",
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.HEAL_BELL,
      moveIdEnum.ELECTROWEB,
      moveIdEnum.ZAP_CANNON,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BELLOSSOM]: {
    emoji: "<:182:1116756070740799509>",
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.LEECH_SEED,
      moveIdEnum.QUIVER_DANCE,
      moveIdEnum.MOONBLAST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MARILL]: {
    emoji: "<:183:1116756072523378743>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.AZUMARILL,
      },
    ],
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.BELLY_DRUM,
      moveIdEnum.PLAY_ROUGH,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.AZUMARILL]: {
    emoji: "<:184:1116756074121408693>",
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.BELLY_DRUM,
      moveIdEnum.PLAY_ROUGH,
      moveIdEnum.DOUBLE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.POLITOED]: {
    emoji: "<:186:1116756077007085618>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SURF,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PERISH_SONG,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.HOPPIP]: {
    emoji: "<:187:1116756122334929037>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.SKIPLOOM,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.RAGE_POWDER,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SKIPLOOM]: {
    emoji: "<:188:1116756124989915270>",
    evolution: [
      {
        level: 27,
        id: pokemonIdEnum.JUMPLUFF,
      },
    ],
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.BOUNCE,
      moveIdEnum.RAGE_POWDER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.JUMPLUFF]: {
    emoji: "<:189:1116756126747336754>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.SLEEP_POWDER,
      moveIdEnum.RAGE_POWDER,
      moveIdEnum.TAILWIND,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.AIPOM]: {
    emoji: "<:190:1116756128198561874>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.AMBIPOM,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.RETURN,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.U_TURN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SUNKERN]: {
    emoji: "<:191:1116756130018906232>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.SUNFLORA,
      },
    ],
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.SUNNY_DAY,
      moveIdEnum.EARTH_POWER,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SUNFLORA]: {
    emoji: "<:192:1116756131990208564>",
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.SUNNY_DAY,
      moveIdEnum.EARTH_POWER,
      moveIdEnum.SOLAR_BEAM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.YANMA]: {
    emoji: "<:193:1116756133969936384>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.YANMEGA,
      },
    ],
    moveIds: [
      moveIdEnum.WING_ATTACK,
      moveIdEnum.PROTECT,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.WOOPER]: {
    emoji: "<:194:1116756135303717024>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.QUAGSIRE,
      },
    ],
    moveIds: [
      moveIdEnum.MUD_SLAP,
      moveIdEnum.RAIN_DANCE,
      moveIdEnum.EARTH_POWER,
      moveIdEnum.LIQUIDATION,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.QUAGSIRE]: {
    emoji: "<:195:1116756137149202493>",
    moveIds: [
      moveIdEnum.MUD_SLAP,
      moveIdEnum.RAIN_DANCE,
      moveIdEnum.LIQUIDATION,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ESPEON]: {
    emoji: "<:196:1116756190685319258>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.BATON_PASS,
      moveIdEnum.CALM_MIND,
      moveIdEnum.FUTURE_SIGHT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.UMBREON]: {
    emoji: "<:197:1116756191922630680>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.MOONLIGHT,
      moveIdEnum.FOUL_PLAY,
      moveIdEnum.MEAN_LOOK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MURKROW]: {
    emoji: "<:198:1116756193457745970>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.HONCHKROW,
      },
    ],
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.ROOST,
      moveIdEnum.FOUL_PLAY,
      moveIdEnum.QUASH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SLOWKING]: {
    emoji: "<:199:1116756194565050408>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.PSYCHIC,
      moveIdEnum.CALM_MIND,
      moveIdEnum.SLACK_OFF,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.UNOWN]: {
    emoji: "<:201:1119803386364186674>",
    moveIds: [moveIdEnum.HIDDEN_POWER],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.WOBBUFFET]: {
    emoji: "<:202:1119803387874119821>",
    moveIds: [
      moveIdEnum.COUNTER,
      moveIdEnum.DESTINY_BOND,
      moveIdEnum.SAFEGUARD,
      moveIdEnum.MIRROR_COAT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PINECO]: {
    emoji: "<:204:1119803389744775209>",
    evolution: [
      {
        level: 31,
        id: pokemonIdEnum.FORRETRESS,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.SPIKES,
      moveIdEnum.RAPID_SPIN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.FORRETRESS]: {
    emoji: "<:205:1119803390772383858>",
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.SPIKES,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GLIGAR]: {
    emoji: "<:207:1119803393783910533>",
    evolution: [
      {
        level: 45,
        id: pokemonIdEnum.GLISCOR,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.PROTECT,
      moveIdEnum.SPIKES,
      moveIdEnum.KNOCK_OFF,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.STEELIX]: {
    emoji: "<:208:1119803395272871946>",
    moveIds: [
      moveIdEnum.FLAIL,
      moveIdEnum.ENDURE,
      moveIdEnum.WIDE_GUARD,
      moveIdEnum.IRON_TAIL,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SCIZOR]: {
    emoji: "<:212:1119803485857267794>",
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.BUG_BITE,
      moveIdEnum.X_SCISSOR,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SHUCKLE]: {
    emoji: "<:213:1119803487191044206>",
    moveIds: [
      moveIdEnum.ROLLOUT,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.STICKY_WEB,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.HERACROSS]: {
    emoji: "<:214:1119803488688410655>",
    moveIds: [
      moveIdEnum.FLAIL,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.MEGAHORN,
      moveIdEnum.CLOSE_COMBAT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SNEASEL]: {
    emoji: "<:215:1119803489837658182>",
    evolution: [
      {
        level: 45,
        id: pokemonIdEnum.WEAVILE,
      },
    ],
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.ICICLE_CRASH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SWINUB]: {
    emoji: "<:220:1119803558909460510>",
    evolution: [
      {
        level: 33,
        id: pokemonIdEnum.PILOSWINE,
      },
    ],
    moveIds: [
      moveIdEnum.MUD_SLAP,
      moveIdEnum.ICE_SHARD,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.ICICLE_CRASH,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.PILOSWINE]: {
    emoji: "<:221:1119803559983190066>",
    evolution: [
      {
        level: 55,
        id: pokemonIdEnum.MAMOSWINE,
      },
    ],
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.BULLDOZE,
      moveIdEnum.ICICLE_CRASH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SKARMORY]: {
    emoji: "<:227:1119803619605233664>",
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.COUNTER,
      moveIdEnum.SPIKES,
      moveIdEnum.ROOST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.HOUNDOUR]: {
    emoji: "<:228:1119803620993552464>",
    evolution: [
      {
        level: 24,
        id: pokemonIdEnum.HOUNDOOM,
      },
    ],
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.DARK_PULSE,
      moveIdEnum.NASTY_PLOT,
    ],
    abilities: {
      [abilityIdEnum.INNER_FOCUS]: 0.45,
      [abilityIdEnum.EARLY_BIRD]: 0.45,
      [abilityIdEnum.UNNERVE]: 0.1,
    },
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.HOUNDOOM]: {
    emoji: "<:229:1119803622809665556>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.DARK_PULSE,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.FIRE_BLAST,
    ],
    abilities: {
      [abilityIdEnum.INNER_FOCUS]: 0.45,
      [abilityIdEnum.EARLY_BIRD]: 0.45,
      [abilityIdEnum.UNNERVE]: 0.1,
    },
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.KINGDRA]: {
    emoji: "<:230:1119803623904383017>",
    moveIds: [
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.MUDDY_WATER,
      moveIdEnum.DRACO_METEOR,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PHANPY]: {
    emoji: "<:231:1119803681806753833>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.DONPHAN,
      },
    ],
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.DONPHAN]: {
    emoji: "<:232:1119803683287351377>",
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.PORYGON2]: {
    emoji: "<:233:1119803684344303646>",
    evolution: [
      {
        level: 48,
        id: pokemonIdEnum.PORYGON_Z,
      },
    ],
    moveIds: [
      moveIdEnum.TELEPORT,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PROTECT,
      moveIdEnum.TRICK_ROOM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.STANTLER]: {
    emoji: "<:234:1119803685808132257>",
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.DISABLE,
      moveIdEnum.MEGAHORN,
      moveIdEnum.DOUBLE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SMEARGLE]: {
    emoji: "<:235:1119803687708143636>",
    moveIds: [
      moveIdEnum.SKETCH,
      moveIdEnum.SKETCH_2,
      moveIdEnum.SKETCH_3,
      moveIdEnum.SKETCH_4,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.TYROGUE]: {
    emoji: "<:236:1119803689545240667>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.HITMONLEE,
      },
      {
        level: 20,
        id: pokemonIdEnum.HITMONCHAN,
      },
      {
        level: 20,
        id: pokemonIdEnum.HITMONTOP,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.COUNTER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.HITMONTOP]: {
    emoji: "<:237:1119803691885674619>",
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.COUNTER,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.TRIPLE_KICK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ELEKID]: {
    emoji: "<:239:1119803751566417982>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.ELECTABUZZ,
      },
    ],
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.ICE_PUNCH,
      moveIdEnum.THUNDERBOLT,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MAGBY]: {
    emoji: "<:240:1119803753445458031>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.MAGMAR,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.CROSS_CHOP,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MILTANK]: {
    emoji: "<:241:1119803755014144051>",
    moveIds: [
      moveIdEnum.ROLLOUT,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.DEFENSE_CURL,
      moveIdEnum.MILK_DRINK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.BLISSEY]: {
    emoji: "<:242:1119803756150796309>",
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.HEAL_PULSE,
      moveIdEnum.SOFT_BOILED,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.RAIKOU]: {
    emoji: "<:243:1119803757895618650>",
    moveIds: [
      moveIdEnum.CHARGE,
      moveIdEnum.HOWL,
      moveIdEnum.VOLT_SWITCH,
      moveIdEnum.THUNDER,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.ENTEI]: {
    emoji: "<:244:1119803759007109190>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.ROAR,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.SACRED_FIRE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.SUICUNE]: {
    emoji: "<:245:1119803760080863314>",
    moveIds: [
      moveIdEnum.GUST,
      moveIdEnum.PROTECT,
      moveIdEnum.MIRROR_COAT,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.LARVITAR]: {
    emoji: "<:246:1119803828120866886>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.PUPITAR,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.LEER,
      moveIdEnum.CRUNCH,
      moveIdEnum.STONE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.PUPITAR]: {
    emoji: "<:247:1119803829676937267>",
    evolution: [
      {
        level: 55,
        id: pokemonIdEnum.TYRANITAR,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.CRUNCH,
      moveIdEnum.STONE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.TYRANITAR]: {
    emoji: "<:248:1119803830880702506>",
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.CRUNCH,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.LUGIA]: {
    emoji: "<:249:1119803832050921523>",
    moveIds: [
      moveIdEnum.WEATHER_BALL,
      moveIdEnum.PSYCHIC,
      moveIdEnum.ROOST,
      moveIdEnum.AEROBLAST,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.HO_OH]: {
    emoji: "<:250:1119803833187569735>",
    moveIds: [
      moveIdEnum.WEATHER_BALL,
      moveIdEnum.AERIAL_ACE,
      moveIdEnum.DEFOG,
      moveIdEnum.SACRED_FIRE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.CELEBI]: {
    emoji: "<:251:1126680965905915944>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.PSYCHIC,
      moveIdEnum.GIGA_DRAIN,
      "m20004",
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.FAST,
    noGacha: true,
  },
  [pokemonIdEnum.TREECKO]: {
    emoji: "<:252:1126680967252283392>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.GROVYLE,
      },
    ],
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.SLAM,
      moveIdEnum.GIGA_DRAIN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GROVYLE]: {
    emoji: "<:253:1126680969806622840>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.SCEPTILE,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.SLAM,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.LEAF_BLADE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SCEPTILE]: {
    emoji: "<:254:1126680971501109288>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.LEAF_BLADE,
      moveIdEnum.LEAF_STORM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.TORCHIC]: {
    emoji: "<:255:1126680974080614411>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.COMBUSKEN,
      },
    ],
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.ROCK_SMASH,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.PROTECT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.COMBUSKEN]: {
    emoji: "<:256:1126680975171129375>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.BLAZIKEN,
      },
    ],
    moveIds: [
      moveIdEnum.ROCK_SMASH,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.PROTECT,
      moveIdEnum.BLAZE_KICK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.BLAZIKEN]: {
    emoji: "<:257:1126680977759015013>",
    moveIds: [
      moveIdEnum.ROCK_SMASH,
      moveIdEnum.PROTECT,
      moveIdEnum.BLAZE_KICK,
      moveIdEnum.FIRE_BLAST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MUDKIP]: {
    emoji: "<:258:1126680978891493448>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.MARSHTOMP,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.MUD_SLAP,
      moveIdEnum.DIG,
      moveIdEnum.SUPERPOWER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MARSHTOMP]: {
    emoji: "<:259:1126681029546102935>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.SWAMPERT,
      },
    ],
    moveIds: [
      moveIdEnum.MUD_SLAP,
      moveIdEnum.DIG,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.MUDDY_WATER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SWAMPERT]: {
    emoji: "<:260:1126681031202848778>",
    moveIds: [
      moveIdEnum.MUD_SLAP,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.MUDDY_WATER,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.POOCHYENA]: {
    emoji: "<:261:1126681032498884648>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.MIGHTYENA,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.MUD_SLAP,
      moveIdEnum.CRUNCH,
      moveIdEnum.TAUNT,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MIGHTYENA]: {
    emoji: "<:262:1126681033656500275>",
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.THIEF,
      moveIdEnum.CRUNCH,
      moveIdEnum.TAUNT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.ZIGZAGOON]: {
    emoji: "<:263:1126681035627835462>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.LINOONE,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.FLAIL,
      moveIdEnum.BELLY_DRUM,
      moveIdEnum.EXTREME_SPEED,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.LINOONE]: {
    emoji: "<:264:1126681036940640317>",
    moveIds: [
      moveIdEnum.FLAIL,
      moveIdEnum.BELLY_DRUM,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.DOUBLE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.WURMPLE]: {
    emoji: "<:265:1126681038341546054>",
    evolution: [
      {
        level: 7,
        id: pokemonIdEnum.SILCOON,
      },
      {
        level: 7,
        id: pokemonIdEnum.CASCOON,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.POISON_STING,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.SILCOON]: {
    emoji: "<:266:1126681040061202547>",
    evolution: [
      {
        level: 10,
        id: pokemonIdEnum.BEAUTIFLY,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.HARDEN,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.BEAUTIFLY]: {
    emoji: "<:267:1126681113612517486>",
    moveIds: [
      moveIdEnum.STRING_SHOT,
      moveIdEnum.PROTECT,
      moveIdEnum.QUIVER_DANCE,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.CASCOON]: {
    emoji: "<:268:1126681115609022525>",
    evolution: [
      {
        level: 10,
        id: pokemonIdEnum.DUSTOX,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.HARDEN,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.DUSTOX]: {
    emoji: "<:269:1126681117920075836>",
    moveIds: [
      moveIdEnum.POISON_POWDER,
      moveIdEnum.TOXIC,
      moveIdEnum.QUIVER_DANCE,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.LOTAD]: {
    emoji: "<:270:1126681120143065099>",
    evolution: [
      {
        level: 14,
        id: pokemonIdEnum.LOMBRE,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.ABSORB,
      moveIdEnum.WATER_PULSE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LOMBRE]: {
    emoji: "<:271:1126681121229381753>",
    evolution: [
      {
        level: 28,
        id: pokemonIdEnum.LUDICOLO,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.WATER_PULSE,
      moveIdEnum.ENERGY_BALL,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LUDICOLO]: {
    emoji: "<:272:1126681122680610847>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.ENERGY_BALL,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SEEDOT]: {
    emoji: "<:273:1126681124345761803>",
    evolution: [
      {
        level: 14,
        id: pokemonIdEnum.NUZLEAF,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.ROLLOUT,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.KNOCK_OFF,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.NUZLEAF]: {
    emoji: "<:274:1126681125713092609>",
    evolution: [
      {
        level: 28,
        id: pokemonIdEnum.SHIFTRY,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.LEAF_BLADE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SHIFTRY]: {
    emoji: "<:275:1126681183279919114>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.LEAF_BLADE,
      moveIdEnum.LEAF_STORM,
    ],
    abilities: {
      [abilityIdEnum.CHLOROPHYLL]: 0.45,
      [abilityIdEnum.EARLY_BIRD]: 0.45,
      [abilityIdEnum.PICKPOCKET]: 0.1,
    },
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.TAILLOW]: {
    emoji: "<:276:1126681184798249100>",
    evolution: [
      {
        level: 22,
        id: pokemonIdEnum.SWELLOW,
      },
    ],
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.U_TURN,
      moveIdEnum.AIR_SLASH,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SWELLOW]: {
    emoji: "<:277:1126681186312388730>",
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.U_TURN,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.BOOMBURST,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.WINGULL]: {
    emoji: "<:278:1126681187994320986>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.PELIPPER,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ROOST,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.SCALD,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PELIPPER]: {
    emoji: "<:279:1126681189823041659>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ROOST,
      moveIdEnum.SCALD,
      moveIdEnum.HURRICANE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.RALTS]: {
    emoji: "<:280:1126681191332978778>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.KIRLIA,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.TELEPORT,
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.PSYCHIC,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.KIRLIA]: {
    emoji: "<:281:1126681193606299770>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.GARDEVOIR,
      },
      {
        level: 30,
        id: pokemonIdEnum.GALLADE,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.PSYCHIC,
      moveIdEnum.DAZZLING_GLEAM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GARDEVOIR]: {
    emoji: "<:282:1126681195460186193>",
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.PSYCHIC,
      moveIdEnum.DAZZLING_GLEAM,
      moveIdEnum.TRICK_ROOM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SHROOMISH]: {
    emoji: "<:285:1126681261646299286>",
    evolution: [
      {
        level: 23,
        id: pokemonIdEnum.BRELOOM,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.ABSORB,
      moveIdEnum.SPORE,
      moveIdEnum.BULLET_SEED,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BRELOOM]: {
    emoji: "<:286:1126681263076548699>",
    moveIds: [
      moveIdEnum.MACH_PUNCH,
      moveIdEnum.SPORE,
      moveIdEnum.BULLET_SEED,
      moveIdEnum.DYNAMIC_PUNCH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SLAKOTH]: {
    emoji: "<:287:1126681264741695518>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.VIGOROTH,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.MUD_SLAP,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.COUNTER,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.VIGOROTH]: {
    emoji: "<:288:1126681265924485221>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.SLAKING,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.COUNTER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.SLAKING]: {
    emoji: "<:289:1126681267061133382>",
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.COUNTER,
      moveIdEnum.HAMMER_ARM,
      moveIdEnum.GIGA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.NINCADA]: {
    emoji: "<:290:1126681268172623903>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.NINJASK,
      },
      {
        level: 20,
        id: pokemonIdEnum.SHEDINJA,
      },
    ],
    moveIds: [moveIdEnum.X_SCISSOR],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.NINJASK]: {
    emoji: "<:291:1126681319443808369>",
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.AGILITY,
      moveIdEnum.BATON_PASS,
      moveIdEnum.X_SCISSOR,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SHEDINJA]: {
    emoji: "<:292:1126681322354643014>",
    moveIds: [
      moveIdEnum.SHADOW_SNEAK,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.ENDURE,
      moveIdEnum.X_SCISSOR,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MAKUHITA]: {
    emoji: "<:296:1126681372732432384>",
    evolution: [
      {
        level: 24,
        id: pokemonIdEnum.HARIYAMA,
      },
    ],
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.CROSS_CHOP,
      moveIdEnum.WIDE_GUARD,
      moveIdEnum.HEAVY_SLAM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.HARIYAMA]: {
    emoji: "<:297:1126681374313685003>",
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.WIDE_GUARD,
      moveIdEnum.HEAVY_SLAM,
      moveIdEnum.CLOSE_COMBAT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SABLEYE]: {
    emoji: "<:302:1132496476791115806>",
    moveIds: [
      moveIdEnum.SHADOW_SNEAK,
      moveIdEnum.RECOVER,
      moveIdEnum.ENDURE,
      moveIdEnum.MEAN_LOOK,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MAWILE]: {
    emoji: "<:303:1132496477894226000>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.CRUNCH,
      moveIdEnum.PLAY_ROUGH,
      moveIdEnum.GIGA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ARON]: {
    emoji: "<:304:1132496478955376730>",
    evolution: [
      {
        level: 32,
        id: pokemonIdEnum.LAIRON,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.HARDEN,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.STONE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.LAIRON]: {
    emoji: "<:305:1132496480003952720>",
    evolution: [
      {
        level: 42,
        id: pokemonIdEnum.AGGRON,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.HEAVY_SLAM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.AGGRON]: {
    emoji: "<:306:1132496481480351754>",
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.IRON_TAIL,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MEDITITE]: {
    emoji: "<:307:1132496482566676580>",
    evolution: [
      {
        level: 37,
        id: pokemonIdEnum.MEDICHAM,
      },
    ],
    moveIds: [
      moveIdEnum.MEDITATE,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.DRAIN_PUNCH,
      moveIdEnum.ZEN_HEADBUTT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MEDICHAM]: {
    emoji: "<:308:1132496483690758194>",
    moveIds: [
      moveIdEnum.MEDITATE,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.ZEN_HEADBUTT,
      moveIdEnum.HIGH_JUMP_KICK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ELECTRIKE]: {
    emoji: "<:309:1132496527521230870>",
    evolution: [
      {
        level: 26,
        id: pokemonIdEnum.MANECTRIC,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.ROAR,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.THUNDER_WAVE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MANECTRIC]: {
    emoji: "<:310:1132496529706467499>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.ROAR,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.THUNDER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PLUSLE]: {
    emoji: "<:311:1132496530742456391>",
    moveIds: [
      moveIdEnum.NUZZLE,
      moveIdEnum.BATON_PASS,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.THUNDER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MINUN]: {
    emoji: "<:312:1132496531757486131>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.ENCORE,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.THUNDER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ROSELIA]: {
    emoji: "<:315:1132496536497033227>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.ROSERADE,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.SPIKES,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.SYNTHESIS,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.CARVANHA]: {
    emoji: "<:318:1132496585511682168>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.SHARPEDO,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.AQUA_JET,
      moveIdEnum.WATERFALL,
      moveIdEnum.CRUNCH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SHARPEDO]: {
    emoji: "<:319:1132496586635739177>",
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.WATERFALL,
      moveIdEnum.CRUNCH,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.WAILMER]: {
    emoji: "<:320:1132496587910828123>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.WAILORD,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.SPLASH,
      moveIdEnum.BOUNCE,
      moveIdEnum.WATER_PULSE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.WAILORD]: {
    emoji: "<:321:1132496589563383858>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.WATER_PULSE,
      moveIdEnum.NOBLE_ROAR,
      moveIdEnum.AQUA_RING,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.NUMEL]: {
    emoji: "<:322:1132496591115276389>",
    evolution: [
      {
        level: 33,
        id: pokemonIdEnum.CAMERUPT,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.EMBER,
      moveIdEnum.YAWN,
      moveIdEnum.EARTH_POWER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.CAMERUPT]: {
    emoji: "<:323:1132496592709111869>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.YAWN,
      moveIdEnum.EARTH_POWER,
      moveIdEnum.ERUPTION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.TORKOAL]: {
    emoji: "<:324:1132496594567188584>",
    moveIds: [
      moveIdEnum.WITHDRAW,
      moveIdEnum.PROTECT,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.ERUPTION,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.TRAPINCH]: {
    emoji: "<:328:1132496654193397770>",
    evolution: [
      {
        level: 35,
        id: pokemonIdEnum.VIBRAVA,
      },
    ],
    moveIds: [
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.MUD_SLAP,
      moveIdEnum.BUG_BITE,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.VIBRAVA]: {
    emoji: "<:329:1132496655694975067>",
    evolution: [
      {
        level: 45,
        id: pokemonIdEnum.FLYGON,
      },
    ],
    moveIds: [
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.DRAGON_RUSH,
      moveIdEnum.BUG_BITE,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.FLYGON]: {
    emoji: "<:330:1132496657683054693>",
    moveIds: [
      moveIdEnum.FOCUS_ENERGY,
      moveIdEnum.U_TURN,
      moveIdEnum.DRAGON_RUSH,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SWABLU]: {
    emoji: "<:333:1132496705162588302>",
    evolution: [
      {
        level: 35,
        id: pokemonIdEnum.ALTARIA,
      },
    ],
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.DRAGON_PULSE,
      moveIdEnum.DEFOG,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ALTARIA]: {
    emoji: "<:334:1132496708140535858>",
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.DRAGON_PULSE,
      moveIdEnum.DEFOG,
      moveIdEnum.PERISH_SONG,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.BALTOY]: {
    emoji: "<:343:1132496780639088710>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.CLAYDOL,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.HARDEN,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.STEALTH_ROCK,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CLAYDOL]: {
    emoji: "<:344:1132496781960286308>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.LILEEP]: {
    emoji: "<:345:1132496783939997797>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.CRADILY,
      },
    ],
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.RECOVER,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.ROCK_TOMB,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CRADILY]: {
    emoji: "<:346:1132496785286365345>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.RECOVER,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ANORITH]: {
    emoji: "<:347:1132496786007801997>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.ARMALDO,
      },
    ],
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ARMALDO]: {
    emoji: "<:348:1132496788432109599>",
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.RAPID_SPIN,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.X_SCISSOR,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.FEEBAS]: {
    emoji: "<:349:1132496790181126254>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.MILOTIC,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.SPLASH,
      moveIdEnum.FLAIL,
      moveIdEnum.SURF,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.MILOTIC]: {
    emoji: "<:350:1132496791556857946>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.RECOVER,
      moveIdEnum.MIRROR_COAT,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.DUSKULL]: {
    emoji: "<:355:1132496884175491164>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.DUSCLOPS,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.SHADOW_SNEAK,
      moveIdEnum.DESTINY_BOND,
      moveIdEnum.SHADOW_BALL,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.DUSCLOPS]: {
    emoji: "<:356:1132496885215674440>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.DUSKNOIR,
      },
    ],
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.WILL_O_WISP,
      moveIdEnum.DESTINY_BOND,
      moveIdEnum.TRICK_ROOM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ABSOL]: {
    emoji: "<:359:1132496959765229610>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.SUCKER_PUNCH,
      moveIdEnum.IRON_TAIL,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SNORUNT]: {
    emoji: "<:361:1132496962969677864>",
    evolution: [
      {
        level: 42,
        id: pokemonIdEnum.GLALIE,
      },
      {
        level: 42,
        id: pokemonIdEnum.FROSLASS,
      },
    ],
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.SPIKES,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GLALIE]: {
    emoji: "<:362:1132496964358000803>",
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.SPIKES,
      moveIdEnum.TAUNT,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SPHEAL]: {
    emoji: "<:363:1132496966589358100>",
    evolution: [
      {
        level: 32,
        id: pokemonIdEnum.SEALEO,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ROLLOUT,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.HAIL,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.SEALEO]: {
    emoji: "<:364:1132496968258695248>",
    evolution: [
      {
        level: 44,
        id: pokemonIdEnum.WALREIN,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.SURF,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.HAIL,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.WALREIN]: {
    emoji: "<:365:1132496969655390249>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.SURF,
      moveIdEnum.HAIL,
      moveIdEnum.BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.BAGON]: {
    emoji: "<:371:1132497162991845548>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.SHELGON,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.EMBER,
      moveIdEnum.CRUNCH,
      moveIdEnum.DRAGON_RUSH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.SHELGON]: {
    emoji: "<:372:1132497164455641158>",
    evolution: [
      {
        level: 50,
        id: pokemonIdEnum.SALAMENCE,
      },
    ],
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.CRUNCH,
      moveIdEnum.DRAGON_DANCE,
      moveIdEnum.DRAGON_RUSH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.SALAMENCE]: {
    emoji: "<:373:1132497165521010728>",
    moveIds: [
      moveIdEnum.LEER,
      moveIdEnum.DRAGON_DANCE,
      moveIdEnum.DUAL_WINGBEAT,
      moveIdEnum.OUTRAGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.BELDUM]: {
    emoji: "<:374:1132497167546863617>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.METANG,
      },
    ],
    moveIds: [moveIdEnum.TACKLE],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.METANG]: {
    emoji: "<:375:1132497317581291650>",
    evolution: [
      {
        level: 45,
        id: pokemonIdEnum.METAGROSS,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.METEOR_MASH,
      moveIdEnum.HAMMER_ARM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.METAGROSS]: {
    emoji: "<:376:1132497319359684708>",
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.METEOR_MASH,
      moveIdEnum.HAMMER_ARM,
      moveIdEnum.ZEN_HEADBUTT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.REGIROCK]: {
    emoji: "<:377:1132497320550879272>",
    moveIds: [
      moveIdEnum.LOCK_ON,
      moveIdEnum.PROTECT,
      moveIdEnum.DRAIN_PUNCH,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.REGICE]: {
    emoji: "<:378:1132497321653981255>",
    moveIds: [
      moveIdEnum.LOCK_ON,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.PROTECT,
      moveIdEnum.BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.REGISTEEL]: {
    emoji: "<:379:1132497322765467778>",
    moveIds: [
      moveIdEnum.LOCK_ON,
      moveIdEnum.PROTECT,
      moveIdEnum.HEAVY_SLAM,
      moveIdEnum.ZAP_CANNON,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.LATIAS]: {
    emoji: "<:380:1132497324363481108>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.DRAGON_PULSE,
      moveIdEnum.MIST_BALL,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.LATIOS]: {
    emoji: "<:381:1132497325491765328>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.DRAGON_PULSE,
      moveIdEnum.LUSTER_PURGE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.KYOGRE]: {
    emoji: "<:382:1132497326691332166>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PROTECT,
      moveIdEnum.ORIGIN_PULSE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.GROUDON]: {
    emoji: "<:383:1132497390079852674>",
    moveIds: [
      moveIdEnum.SMACK_DOWN,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.PRECIPICE_BLADES,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.RAYQUAZA]: {
    emoji: "<:384:1132497391535272016>",
    moveIds: [
      moveIdEnum.TWISTER,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.DRAGON_PULSE,
      moveIdEnum.DRAGON_ASCENT,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.JIRACHI]: {
    emoji: "<:385:1132497393431105588>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.PSYCHIC,
      moveIdEnum.IRON_HEAD,
      moveIdEnum.DOOM_DESIRE,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.DEOXYS]: {
    emoji: "<:386:1132497394739712010>",
    moveIds: [
      moveIdEnum.WRAP,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.COSMIC_POWER,
      moveIdEnum.PSYCHO_BOOST,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.TURTWIG]: {
    emoji: "<:387:1132497397587640392>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.GROTLE,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.ABSORB,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.SEED_BOMB,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GROTLE]: {
    emoji: "<:388:1132497399483486329>",
    evolution: [
      {
        level: 32,
        id: pokemonIdEnum.TORTERRA,
      },
    ],
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.SEED_BOMB,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.TORTERRA]: {
    emoji: "<:389:1132497401433817139>",
    moveIds: [
      moveIdEnum.ABSORB,
      moveIdEnum.SYNTHESIS,
      moveIdEnum.BULLDOZE,
      moveIdEnum.WOOD_HAMMER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.CHIMCHAR]: {
    emoji: "<:390:1132497402746646719>",
    evolution: [
      {
        level: 14,
        id: pokemonIdEnum.MONFERNO,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.U_TURN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MONFERNO]: {
    emoji: "<:391:1132497467036930131>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.INFERNAPE,
      },
    ],
    moveIds: [
      moveIdEnum.MACH_PUNCH,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.BRICK_BREAK,
      moveIdEnum.U_TURN,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.INFERNAPE]: {
    emoji: "<:392:1132497469498982460>",
    moveIds: [
      moveIdEnum.MACH_PUNCH,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.U_TURN,
      moveIdEnum.CLOSE_COMBAT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.PIPLUP]: {
    emoji: "<:393:1132497470715338752>",
    evolution: [
      {
        level: 16,
        id: pokemonIdEnum.PRINPLUP,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.PECK,
      moveIdEnum.ICY_WIND,
      moveIdEnum.SCALD,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.PRINPLUP]: {
    emoji: "<:394:1132497471994597406>",
    evolution: [
      {
        level: 36,
        id: pokemonIdEnum.EMPOLEON,
      },
    ],
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ICY_WIND,
      moveIdEnum.ROOST,
      moveIdEnum.SCALD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.EMPOLEON]: {
    emoji: "<:395:1132497473873649796>",
    moveIds: [
      moveIdEnum.WATER_GUN,
      moveIdEnum.ICY_WIND,
      moveIdEnum.ROOST,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.STARLY]: {
    emoji: "<:396:1132497475182276711>",
    evolution: [
      {
        level: 14,
        id: pokemonIdEnum.STARAVIA,
      },
    ],
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.RETURN,
      moveIdEnum.AERIAL_ACE,
    ],
    abilities: {
      [abilityIdEnum.INTIMIDATE]: 0.8,
      [abilityIdEnum.KEEN_EYE]: 0.2,
    },
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.STARAVIA]: {
    emoji: "<:397:1132497476407001088>",
    evolution: [
      {
        level: 34,
        id: pokemonIdEnum.STARAPTOR,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.RETURN,
      moveIdEnum.AERIAL_ACE,
      moveIdEnum.U_TURN,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.STARAPTOR]: {
    emoji: "<:398:1132497478265077871>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.RETURN,
      moveIdEnum.U_TURN,
      moveIdEnum.BRAVE_BIRD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BIDOOF]: {
    emoji: "<:399:1132497479712129054>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.BIBAREL,
      },
    ],
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.AQUA_JET,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.WATERFALL,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.BIBAREL]: {
    emoji: "<:400:1132497518480068698>",
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.WATERFALL,
      moveIdEnum.GIGA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.KRICKETOT]: {
    emoji: "<:401:1351026500140531712>",
    evolution: [
      {
        level: 10,
        id: pokemonIdEnum.KRICKETUNE,
      },
    ],
    moveIds: [moveIdEnum.TACKLE, moveIdEnum.ENDEAVOR, moveIdEnum.BUG_BITE],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.KRICKETUNE]: {
    emoji: "<:402:1351026502359187548>",
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.NIGHT_SLASH,
      moveIdEnum.BUG_BITE,
      moveIdEnum.PERISH_SONG,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.SHINX]: {
    emoji: "<:403:1351026503688912957>",
    evolution: [
      {
        level: 15,
        id: pokemonIdEnum.LUXIO,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.BITE,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.THUNDERBOLT,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LUXIO]: {
    emoji: "<:404:1351026504854802533>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.LUXRAY,
      },
    ],
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.FACADE,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.SUPERPOWER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LUXRAY]: {
    emoji: "<:405:1351026506612342834>",
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.FACADE,
      moveIdEnum.SUPERPOWER,
      moveIdEnum.WILD_CHARGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BUDEW]: {
    emoji: "<:406:1351026507904061471>",
    evolution: [
      {
        level: 18,
        id: pokemonIdEnum.ROSELIA,
      },
    ],
    moveIds: [moveIdEnum.ABSORB, moveIdEnum.GIGA_DRAIN, moveIdEnum.SYNTHESIS],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ROSERADE]: {
    emoji: "<:407:1351026508851970050>",
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.SPIKES,
      moveIdEnum.SYNTHESIS,
      moveIdEnum.LEAF_STORM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.CRANIDOS]: {
    emoji: "<:408:1351026510210928761>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.RAMPARDOS,
      },
    ],
    moveIds: [
      moveIdEnum.HEADBUTT,
      moveIdEnum.TAKE_DOWN,
      moveIdEnum.STRENGTH,
      moveIdEnum.STONE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.RAMPARDOS]: {
    emoji: "<:409:1351026511691382835>",
    moveIds: [
      moveIdEnum.HEADBUTT,
      moveIdEnum.STRENGTH,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.HEAD_SMASH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SHIELDON]: {
    emoji: "<:410:1351026649004642356>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.BASTIODON,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.IRON_HEAD,
      moveIdEnum.STONE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BASTIODON]: {
    emoji: "<:411:1351026514866475088>",
    moveIds: [
      moveIdEnum.BLOCK,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.WIDE_GUARD,
      moveIdEnum.METAL_BURST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BURMY]: {
    emoji: "<:412:1351026650770313226>",
    evolution: [
      {
        level: 20,
        id: pokemonIdEnum.WORMADAM_PLANT,
      },
      {
        level: 20,
        id: pokemonIdEnum.MOTHIM,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.STRING_SHOT,
      moveIdEnum.PROTECT,
      moveIdEnum.BUG_BITE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.WORMADAM_PLANT]: {
    emoji: "<:413:1351026652628520990>",
    formSpeciesIds: [
      pokemonIdEnum.WORMADAM_SANDY,
      pokemonIdEnum.WORMADAM_TRASH,
    ],
    moveIds: [
      moveIdEnum.BUG_BITE,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.QUIVER_DANCE,
      moveIdEnum.LEAF_STORM,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.WORMADAM_SANDY]: {
    emoji: "<:413sandy:1367375026709598308>",
    baseSpeciesId: pokemonIdEnum.WORMADAM_PLANT,
    moveIds: [
      moveIdEnum.BUG_BITE,
      moveIdEnum.PROTECT,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
    noGacha: true,
  },
  [pokemonIdEnum.WORMADAM_TRASH]: {
    emoji: "<:413trash:1367375027850317834>",
    baseSpeciesId: pokemonIdEnum.WORMADAM_PLANT,
    moveIds: [
      moveIdEnum.BUG_BITE,
      moveIdEnum.PSYCHIC,
      moveIdEnum.PROTECT,
      moveIdEnum.METAL_BURST,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
    noGacha: true,
  },
  [pokemonIdEnum.MOTHIM]: {
    emoji: "<:414:1351026659247132702>",
    moveIds: [
      moveIdEnum.BUG_BITE,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.QUIVER_DANCE,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.COMBEE]: {
    emoji: "<:415:1351026660564013127>",
    evolution: [
      {
        level: 21,
        id: pokemonIdEnum.VESPIQUEN,
      },
    ],
    moveIds: [moveIdEnum.GUST, moveIdEnum.BUG_BITE],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.VESPIQUEN]: {
    emoji: "<:416:1351026662292193300>",
    moveIds: [
      moveIdEnum.GUST,
      moveIdEnum.DEFEND_ORDER,
      moveIdEnum.HEAL_ORDER,
      moveIdEnum.ATTACK_ORDER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.PACHIRISU]: {
    emoji: "<:417:1351026663319928853>",
    moveIds: [
      moveIdEnum.NUZZLE,
      moveIdEnum.PROTECT,
      moveIdEnum.FOLLOW_ME,
      moveIdEnum.SUPER_FANG,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.BUIZEL]: {
    emoji: "<:418:1351026665127542967>",
    evolution: [
      {
        level: 26,
        id: pokemonIdEnum.FLOATZEL,
      },
    ],
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.SURF,
      moveIdEnum.WATERFALL,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.FLOATZEL]: {
    emoji: "<:419:1351026666943807528>",
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.ICE_PUNCH,
      moveIdEnum.SWITCHEROO,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SHELLOS]: {
    emoji: "<:422:1351026845843460209>",
    evolution: [
      {
        level: 30,
        id: pokemonIdEnum.GASTRODON,
      },
    ],
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.RECOVER,
      moveIdEnum.MUDDY_WATER,
      moveIdEnum.EARTH_POWER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GASTRODON]: {
    emoji: "<:423:1351026846891905186>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.RECOVER,
      moveIdEnum.MUDDY_WATER,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.AMBIPOM]: {
    emoji: "<:424:1351026847709659178>",
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.U_TURN,
      moveIdEnum.DOUBLE_EDGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.DRIFLOON]: {
    emoji: "<:425:1351026848901107773>",
    evolution: [
      {
        level: 28,
        id: pokemonIdEnum.DRIFBLIM,
      },
    ],
    moveIds: [
      moveIdEnum.GUST,
      moveIdEnum.HEX,
      moveIdEnum.DESTINY_BOND,
      moveIdEnum.WILL_O_WISP,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.DRIFBLIM]: {
    emoji: "<:426:1351026850100678727>",
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.DESTINY_BOND,
      moveIdEnum.WILL_O_WISP,
      moveIdEnum.TAILWIND,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BUNEARY]: {
    emoji: "<:427:1351026851253850214>",
    evolution: [
      {
        level: 24,
        id: pokemonIdEnum.LOPUNNY,
      },
    ],
    moveIds: [
      moveIdEnum.CHARM,
      moveIdEnum.ENCORE,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.DRAIN_PUNCH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LOPUNNY]: {
    emoji: "<:428:1351026852797485127>",
    moveIds: [
      moveIdEnum.CHARM,
      moveIdEnum.ENCORE,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.HIGH_JUMP_KICK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.HONCHKROW]: {
    emoji: "<:430:1351026855834026015>",
    moveIds: [
      moveIdEnum.PECK,
      moveIdEnum.ROOST,
      moveIdEnum.NIGHT_SLASH,
      moveIdEnum.BRAVE_BIRD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.GLAMEOW]: {
    emoji: "<:431:1351026924763353198>",
    evolution: [
      {
        level: 38,
        id: pokemonIdEnum.PURUGLY,
      },
    ],
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.CHARM,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.AERIAL_ACE,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.PURUGLY]: {
    emoji: "<:432:1351026926520897536>",
    moveIds: [
      moveIdEnum.SCRATCH,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.SWAGGER,
      moveIdEnum.FAKE_OUT,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.STUNKY]: {
    emoji: "<:434:1351026930526191707>",
    evolution: [
      {
        level: 34,
        id: pokemonIdEnum.SKUNTANK,
      },
    ],
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.TOXIC,
      moveIdEnum.SMOKESCREEN,
      moveIdEnum.NIGHT_SLASH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SKUNTANK]: {
    emoji: "<:435:1351026932027756676>",
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.TOXIC,
      moveIdEnum.NIGHT_SLASH,
      moveIdEnum.FIRE_BLAST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BRONZOR]: {
    emoji: "<:436:1351026934229766144>",
    evolution: [
      {
        level: 33,
        id: pokemonIdEnum.BRONZONG,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.SAFEGUARD,
      moveIdEnum.GYRO_BALL,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.BRONZONG]: {
    emoji: "<:437:1351026938378059787>",
    moveIds: [
      moveIdEnum.BLOCK,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.GYRO_BALL,
      moveIdEnum.TRICK_ROOM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MIME_JR]: {
    emoji: "<:439:1351027015305920582>",
    evolution: [
      {
        level: 32,
        id: pokemonIdEnum.MR_MIME,
      },
    ],
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.MIMIC,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.REFLECT,
    ],
    battleEligible: true,
    rarity: rarities.COMMON,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.HAPPINY]: {
    emoji: "<:440:1351027016610353192>",
    evolution: [
      {
        level: 25,
        id: pokemonIdEnum.CHANSEY,
      },
    ],
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.CHARM,
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.HEAL_BELL,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.FAST,
  },
  [pokemonIdEnum.SPIRITOMB]: {
    emoji: "<:442:1351027022180126731>",
    moveIds: [
      moveIdEnum.SHADOW_SNEAK,
      moveIdEnum.PURSUIT,
      moveIdEnum.TAUNT,
      moveIdEnum.MEMENTO,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GIBLE]: {
    emoji: "<:443:1351027023757181010>",
    evolution: [
      {
        level: 24,
        id: pokemonIdEnum.GABITE,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.BITE,
      moveIdEnum.DIG,
      moveIdEnum.DRAGON_CLAW,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.GABITE]: {
    emoji: "<:444:1351027024822534224>",
    evolution: [
      {
        level: 48,
        id: pokemonIdEnum.GARCHOMP,
      },
    ],
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.DIG,
      moveIdEnum.DRAGON_CLAW,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.GARCHOMP]: {
    emoji: "<:445:1351027080271368202>",
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.DRAGON_CLAW,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.MUNCHLAX]: {
    emoji: "<:446:1351027086944636939>",
    evolution: [
      {
        level: 45,
        id: pokemonIdEnum.SNORLAX,
      },
    ],
    moveIds: [
      moveIdEnum.TACKLE,
      moveIdEnum.ROLLOUT,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.DEFENSE_CURL,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.RIOLU]: {
    emoji: "<:447:1351027087896744047>",
    evolution: [
      {
        level: 35,
        id: pokemonIdEnum.LUCARIO,
      },
    ],
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.COACHING,
      moveIdEnum.COUNTER,
      moveIdEnum.CROSS_CHOP,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.LUCARIO]: {
    emoji: "<:448:1351027088919892081>",
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.AURA_SPHERE,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.CLOSE_COMBAT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.HIPPOPOTAS]: {
    emoji: "<:449:1351027089934913626>",
    evolution: [
      {
        level: 34,
        id: pokemonIdEnum.HIPPOWDON,
      },
    ],
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.ROAR,
      moveIdEnum.YAWN,
      moveIdEnum.BULLDOZE,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.HIPPOWDON]: {
    emoji: "<:450:1351027091616829460>",
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.YAWN,
      moveIdEnum.BULLDOZE,
      moveIdEnum.SLACK_OFF,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.CROAGUNK]: {
    emoji: "<:453:1351027173229592708>",
    evolution: [
      {
        level: 37,
        id: pokemonIdEnum.TOXICROAK,
      },
    ],
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.POISON_JAB,
      moveIdEnum.DRAIN_PUNCH,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.TOXICROAK]: {
    emoji: "<:454:1351027174915706880>",
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.POISON_JAB,
      moveIdEnum.DYNAMIC_PUNCH,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.SNOVER]: {
    emoji: "<:459:1351027254427389952>",
    evolution: [
      {
        level: 40,
        id: pokemonIdEnum.ABOMASNOW,
      },
    ],
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.ICY_WIND,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.SWAGGER,
    ],
    battleEligible: true,
    rarity: rarities.RARE,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ABOMASNOW]: {
    emoji: "<:460:1351027255798796308>",
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.SWAGGER,
      moveIdEnum.BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.WEAVILE]: {
    emoji: "<:461:1351027256788779078>",
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.FAKE_OUT,
      moveIdEnum.KNOCK_OFF,
      moveIdEnum.TRIPLE_AXEL,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.MAGNEZONE]: {
    emoji: "<:462:1351027257807867956>",
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.FLASH_CANNON,
      moveIdEnum.ZAP_CANNON,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LICKILICKY]: {
    emoji: "<:463:1351027258953044010>",
    moveIds: [
      moveIdEnum.LICK,
      moveIdEnum.BODY_SLAM,
      moveIdEnum.SCREECH,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.RHYPERIOR]: {
    emoji: "<:464:1351027260102017025>",
    moveIds: [
      moveIdEnum.SMACK_DOWN,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.DRILL_RUN,
      moveIdEnum.ROCK_WRECKER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.ELECTIVIRE]: {
    emoji: "<:466:1351027262602084486>",
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.ICE_PUNCH,
      moveIdEnum.CROSS_CHOP,
      moveIdEnum.WILD_CHARGE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MAGMORTAR]: {
    emoji: "<:467:1351027328238489660>",
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.CROSS_CHOP,
      moveIdEnum.TAUNT,
      moveIdEnum.FIRE_BLAST,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.TOGEKISS]: {
    emoji: "<:468:1351027329920536576>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.HEAT_WAVE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.YANMEGA]: {
    emoji: "<:469:1351027330964783146>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.PROTECT,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.LEAFEON]: {
    emoji: "<:470:1351027331963289691>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.BATON_PASS,
      moveIdEnum.SYNTHESIS,
      moveIdEnum.SOLAR_BLADE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GLACEON]: {
    emoji: "<:471:1351027333095493632>",
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.PROTECT,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GLISCOR]: {
    emoji: "<:472:1351027334123094056>",
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.PROTECT,
      moveIdEnum.SPIKES,
      moveIdEnum.TAILWIND,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.MAMOSWINE]: {
    emoji: "<:473:1351027335155024042>",
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.ICICLE_CRASH,
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.PORYGON_Z]: {
    emoji: "<:474:1351027336203730944>",
    moveIds: [
      moveIdEnum.TELEPORT,
      moveIdEnum.DARK_PULSE,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.TRI_ATTACK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.GALLADE]: {
    emoji: "<:475:1351027411306942495>",
    moveIds: [
      moveIdEnum.SLASH,
      moveIdEnum.PSYCHO_CUT,
      moveIdEnum.LEAF_BLADE,
      moveIdEnum.SACRED_SWORD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.DUSKNOIR]: {
    emoji: "<:477:1351027414158803086>",
    moveIds: [
      moveIdEnum.SHADOW_SNEAK,
      moveIdEnum.WILL_O_WISP,
      moveIdEnum.SHADOW_PUNCH,
      moveIdEnum.TRICK_ROOM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
  },
  [pokemonIdEnum.FROSLASS]: {
    emoji: "<:478:1351027415761289236>",
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.SPIKES,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
  },
  [pokemonIdEnum.ROTOM]: {
    emoji: "<:479:1351027417409650698>",
    moveIds: [
      moveIdEnum.CHARGE,
      moveIdEnum.SHADOW_BALL,
      moveIdEnum.DISCHARGE,
      moveIdEnum.THUNDER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    formSpeciesIds: [
      pokemonIdEnum.ROTOM_HEAT,
      pokemonIdEnum.ROTOM_WASH,
      pokemonIdEnum.ROTOM_FROST,
      pokemonIdEnum.ROTOM_FAN,
      pokemonIdEnum.ROTOM_MOW,
    ],
  },
  [pokemonIdEnum.ROTOM_HEAT]: {
    emoji: "<:479heat:1367375032354865193>",
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.WILL_O_WISP,
      moveIdEnum.DISCHARGE,
      moveIdEnum.OVERHEAT,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    baseSpeciesId: pokemonIdEnum.ROTOM,
    noGacha: true,
  },
  [pokemonIdEnum.ROTOM_WASH]: {
    emoji: "<:479wash:1367375035022573598>",
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.DISCHARGE,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    baseSpeciesId: pokemonIdEnum.ROTOM,
    noGacha: true,
  },
  [pokemonIdEnum.ROTOM_FROST]: {
    emoji: "<:479frost:1367375030916481054>",
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.DISCHARGE,
      moveIdEnum.BLIZZARD,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    baseSpeciesId: pokemonIdEnum.ROTOM,
    noGacha: true,
  },
  [pokemonIdEnum.ROTOM_FAN]: {
    emoji: "<:479fan:1367375028881981494>",
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.DISCHARGE,
      moveIdEnum.THUNDER,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    baseSpeciesId: pokemonIdEnum.ROTOM,
    noGacha: true,
  },
  [pokemonIdEnum.ROTOM_MOW]: {
    emoji: "<:479mow:1367375033604898909>",
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.TRICK,
      moveIdEnum.DISCHARGE,
      moveIdEnum.LEAF_STORM,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    baseSpeciesId: pokemonIdEnum.ROTOM,
    noGacha: true,
  },
  [pokemonIdEnum.UXIE]: {
    emoji: "<:480:1351027418453901353>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.AMNESIA,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.MYSTICAL_POWER,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.MESPRIT]: {
    emoji: "<:481:1351027419686899774>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.HEALING_WISH,
      moveIdEnum.U_TURN,
      moveIdEnum.MYSTICAL_POWER,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.AZELF]: {
    emoji: "<:482:1351027420806910054>",
    moveIds: [
      moveIdEnum.CONFUSION,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.MYSTICAL_POWER,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.DIALGA]: {
    emoji: "<:483:1351027491304898600>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.FLASH_CANNON,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.ROAR_OF_TIME,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    formSpeciesIds: [pokemonIdEnum.DIALGA_ORIGIN],
  },
  [pokemonIdEnum.DIALGA_ORIGIN]: {
    emoji: "<:483origin:1404654211324448848>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.THUNDER_WAVE,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.ROAR_OF_TIME,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    baseSpeciesId: pokemonIdEnum.DIALGA,
    noGacha: true,
  },
  [pokemonIdEnum.PALKIA]: {
    emoji: "<:484:1351027493041209355>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.WATER_PULSE,
      moveIdEnum.DRAGON_TAIL,
      moveIdEnum.SPACIAL_REND,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    formSpeciesIds: [pokemonIdEnum.PALKIA_ORIGIN],
  },
  [pokemonIdEnum.PALKIA_ORIGIN]: {
    emoji: "<:484origin:1404654213325131797>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.ROAR,
      moveIdEnum.DRAGON_TAIL,
      moveIdEnum.SPACIAL_REND,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    baseSpeciesId: pokemonIdEnum.PALKIA,
    noGacha: true,
  },
  [pokemonIdEnum.HEATRAN]: {
    emoji: "<:485:1351027494563614828>",
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.EARTH_POWER,
      moveIdEnum.FLASH_CANNON,
      moveIdEnum.MAGMA_STORM,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.REGIGIGAS]: {
    emoji: "<:486:1351027495612321883>",
    moveIds: [
      moveIdEnum.POUND,
      moveIdEnum.HAMMER_ARM,
      moveIdEnum.WIDE_GUARD,
      moveIdEnum.CRUSH_GRIP,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.GIRATINA_ALTERED]: {
    emoji: "<:487:1351027496769814528>",
    moveIds: [
      moveIdEnum.OMINOUS_WIND,
      moveIdEnum.WILL_O_WISP,
      moveIdEnum.DEFOG,
      moveIdEnum.SHADOW_FORCE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    formSpeciesIds: [pokemonIdEnum.GIRATINA_ORIGIN],
  },
  [pokemonIdEnum.GIRATINA_ORIGIN]: {
    emoji: "<:487origin:1367375036347973652>",
    moveIds: [
      moveIdEnum.OMINOUS_WIND,
      moveIdEnum.DRAGON_CLAW,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.SHADOW_FORCE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    baseSpeciesId: pokemonIdEnum.GIRATINA_ALTERED,
    noGacha: true,
  },
  [pokemonIdEnum.CRESSELIA]: {
    emoji: "<:488:1351027498275835954>",
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.LUNAR_DANCE,
      moveIdEnum.LUNAR_BLESSING,
      moveIdEnum.FUTURE_SIGHT,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
  },
  [pokemonIdEnum.DARKRAI]: {
    emoji: "<:491:1351027502801354822>",
    moveIds: [
      moveIdEnum.HEX,
      moveIdEnum.DARK_PULSE,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.DARK_VOID,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.ARCEUS]: {
    emoji: "<:493:1351027589258543166>",
    moveIds: [
      moveIdEnum.MIMIC,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.DEOXYS_ATTACK]: {
    emoji: "<:386attack:1151715511009300501>",
    baseSpeciesId: pokemonIdEnum.DEOXYS,
    moveIds: [
      moveIdEnum.MIMIC,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.SUPERPOWER,
      "m354-1",
    ],
    abilities: {
      20015: 1,
    },
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.DEOXYS_DEFENSE]: {
    emoji: "<:386defense:1151715513022558290>",
    baseSpeciesId: pokemonIdEnum.DEOXYS,
    moveIds: [
      moveIdEnum.TELEPORT,
      moveIdEnum.RECOVER,
      moveIdEnum.COSMIC_POWER,
      "m354-2",
    ],
    abilities: {
      20016: 1,
    },
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.DEOXYS_SPEED]: {
    emoji: "<:386speed:1151715514352156702>",
    baseSpeciesId: pokemonIdEnum.DEOXYS,
    moveIds: [
      moveIdEnum.WRAP,
      moveIdEnum.TAUNT,
      moveIdEnum.STEALTH_ROCK,
      "m354-3",
    ],
    abilities: {
      20017: 1,
    },
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
};

/**
 * @satisfies {PartialRecord<AllPokemonIdEnum, PokemonConfigData>}
 */
const fakePokemonConfig = {
  [pokemonIdEnum.GARYS_BLASTOISE]: {
    name: "Gary's Blastoise",
    emoji: "<:garyblastoise:1109522094645063810>",
    description:
      "The ultimate evolution of the Water-type Squirtle. Known for its exceptional power and formidable presence, this Pokémon has rightfully earned its place as one of the most respected members of its trainer's esteemed team.",
    type: [types.WATER],
    baseStats: [95, 70, 120, 90, 125, 80],
    sprite: "https://archives.bulbagarden.net/media/upload/2/2c/Spr_1b_009.png",
    shinySprite:
      "https://archives.bulbagarden.net/media/upload/4/43/Spr_2g_009_s.png",
    abilities: {
      [abilityIdEnum.SHELL_ARMOR]: 1,
    },
    moveIds: [moveIdEnum.WATER_GUN, moveIdEnum.RAPID_SPIN, "m334-1", "m56-1"],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.AAABAAAJSS]: {
    name: "aaabaaajss",
    emoji: "<:bjs:1114223245349109830>",
    description:
      "The mythical avian given the nickname Bird Jesus, revered for its unwavering guidance and miraculous feats against impossible odds.",
    type: [types.NORMAL, types.FLYING],
    baseStats: [85, 120, 80, 80, 75, 110],
    sprite: "https://archives.bulbagarden.net/media/upload/c/c0/Spr_1b_018.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/bjs-shiny-resized.png",
    abilities: {
      20008: 1,
    },
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.ROOST,
      moveIdEnum.U_TURN,
      moveIdEnum.SKY_ATTACK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    noGacha: true,
  },
  [pokemonIdEnum.JESSIES_ARBOK]: {
    name: "Jessie's Arbok",
    emoji: "<:jessiearbok:1117130466479325225>",
    description:
      "Jessie's loyal and nefarious partner. Foes are frozen with fear at the sight of it.",
    type: [types.POISON],
    baseStats: [75, 125, 70, 70, 80, 110],
    sprite: "https://archives.bulbagarden.net/media/upload/3/39/Spr_1b_024.png",
    shinySprite:
      "https://archives.bulbagarden.net/media/upload/0/00/Spr_2c_024_s.png",
    abilities: {
      [abilityIdEnum.INTIMIDATE]: 1,
    },
    moveIds: [
      moveIdEnum.POISON_STING,
      "m137-1",
      moveIdEnum.POISON_JAB,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    noGacha: true,
  },
  [pokemonIdEnum.ASHS_PIKACHU]: {
    name: "Ash's Pikachu",
    emoji: "<:ashpikachu:1109522092283658250>",
    description:
      "This Pikachu wears its partner's cap, which is brimming with memories of traveling through many different regions.",
    type: [types.ELECTRIC],
    baseStats: [85, 120, 70, 115, 80, 130],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/ash-pikachu-small.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/ash-pikachu-shiny-small.gif",
    abilities: {
      [abilityIdEnum.STATIC]: 1,
    },
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.SURF,
      moveIdEnum.VOLT_TACKLE,
      moveIdEnum.TEN_MILLION_VOLT_THUNDERBOLT,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
    tags: ["eviolite"],
  },
  [pokemonIdEnum.AAAAAAAAAA]: {
    name: "AAAAAAAAAA",
    emoji: "<:fonz:1114223247601455204>",
    description:
      "A majestic Pokemon whos fierce power and commanding presence earns its title as King.",
    type: [types.POISON, types.GROUND],
    baseStats: [95, 120, 80, 90, 75, 90],
    sprite: "https://archives.bulbagarden.net/media/upload/b/b8/Spr_1b_034.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/fonz-shiny-resized.png",
    abilities: {
      20009: 1,
    },
    moveIds: [
      moveIdEnum.POISON_STING,
      moveIdEnum.SURF,
      moveIdEnum.EARTH_POWER,
      moveIdEnum.SLUDGE_WAVE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.AATTVVV]: {
    name: "AATTVVV",
    emoji: "<:atv:1114223244363431996>",
    description:
      "An oddly mechanical Pokemon; its mere presence is rumored to completely prevent Pokemon attacks.",
    type: [types.BUG, types.STEEL],
    baseStats: [80, 75, 105, 90, 85, 115],
    sprite: "https://archives.bulbagarden.net/media/upload/2/28/Spr_1b_049.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/atv-shiny-resized.png",
    abilities: {
      [abilityIdEnum.SHIELD_DUST]: 1,
    },
    moveIds: [
      moveIdEnum.POISON_POWDER,
      "m269-1",
      moveIdEnum.FLASH_CANNON,
      moveIdEnum.BUG_BUZZ,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    noGacha: true,
  },
  [pokemonIdEnum.ROCKET_MEOWTH]: {
    name: "Rocket Meowth",
    emoji: "<:rocketmeowth:1117873583537016832>",
    description:
      "A cunning member of the notorious Team Rocket, known for its iconic ability to speak human language.",
    type: [types.NORMAL],
    baseStats: [85, 100, 75, 90, 90, 140],
    sprite: "https://archives.bulbagarden.net/media/upload/4/4d/Spr_1b_052.png",
    shinySprite:
      "https://archives.bulbagarden.net/media/upload/9/95/Spr_2c_052_s.png",
    abilities: {
      [abilityIdEnum.PICKUP]: 1,
    },
    moveIds: [moveIdEnum.PAY_DAY, "m6-1", moveIdEnum.FAKE_OUT, "m20003"],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
    tags: ["eviolite"],
  },
  [pokemonIdEnum.JAMES_WEEZING]: {
    name: "James's Weezing",
    emoji: "<:jamesweezing:1117130463186800640>",
    description:
      "James's loyal and formidable companion. Its noxious fumes can incapacitate fields of foes.",
    type: [types.POISON],
    baseStats: [75, 95, 125, 85, 80, 70],
    sprite: "https://archives.bulbagarden.net/media/upload/1/1b/Spr_1b_110.png",
    shinySprite:
      "https://archives.bulbagarden.net/media/upload/3/3f/Spr_2c_110_s.png",
    abilities: {
      [abilityIdEnum.LEVITATE]: 1,
    },
    moveIds: [
      moveIdEnum.SMOG,
      "m108-1",
      moveIdEnum.DESTINY_BOND,
      moveIdEnum.EXPLOSION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    noGacha: true,
  },
  [pokemonIdEnum.POKESTARMIE]: {
    name: "PokeStarmie",
    emoji: "<:pokestarmie:1368808978938855474>",
    description:
      "The mascot of Pokestar, it is said to only appear once a year to bless its loyal fans.",
    type: [types.WATER, types.PSYCHIC],
    baseStats: [65, 75, 95, 135, 95, 135],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/pokestarmie-loop-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/pokestarmie-loop-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.STAR_BOOST]: 1,
    },
    moveIds: [
      moveIdEnum.MIMIC,
      moveIdEnum.PSYCHIC,
      moveIdEnum.STAR_CELEBRATE,
      moveIdEnum.HYDRO_PUMP,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.SCORO]: {
    name: "Scoro",
    emoji: "<:zoro:1136890672775954432>",
    description:
      "A Pokemon with another world, it has devoted its life to becomming the world's strongest Bug-type.",
    type: [types.BUG, types.DARK],
    baseStats: [80, 125, 90, 65, 90, 90],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/zoro-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/zoro-shiny-resized.png",
    abilities: {
      [abilityIdEnum.TECHNICIAN]: 1,
    },
    moveIds: [
      moveIdEnum.FURY_CUTTER,
      moveIdEnum.SWORDS_DANCE,
      "m331-1",
      "m20009",
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
    tags: ["eviolite"],
  },
  [pokemonIdEnum.AIIIIIIRRR]: {
    name: "AIIIIIIRRR",
    emoji: "<:air:1114223243075801198>",
    description:
      "A POKéMON that has been overhunted almost to extinction. It helps people traverse harsh terrain of any variety.",
    type: [types.WATER, types.ICE],
    baseStats: [130, 90, 80, 90, 95, 65],
    sprite: "https://archives.bulbagarden.net/media/upload/7/77/Spr_1b_131.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/air-shiny-resized.png",
    abilities: {
      [abilityIdEnum.WATER_ABSORB]: 1,
    },
    moveIds: [
      moveIdEnum.ROCK_SMASH,
      moveIdEnum.SURF,
      moveIdEnum.STRENGTH,
      "m20002",
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.FALSE_PROPHET]: {
    name: "False Prophet",
    emoji: "<:falseprophet:1114045843369119785>",
    description:
      "The Deceptive Pokémon known as the False Prophet, its fiery appearance belies its controversial actions and mysterious intentions.",
    type: [types.FIRE, types.DARK],
    baseStats: [90, 140, 75, 80, 120, 95],
    sprite: "https://archives.bulbagarden.net/media/upload/1/1f/Spr_1b_136.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/false-prophet-shiny-resized.png",
    abilities: {
      20005: 1,
    },
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.SUPERPOWER,
      "m20001",
      "m394-1",
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.LORD_HELIX]: {
    name: "Lord Helix",
    emoji: "<:lordhelix:1114224346873991268>",
    description:
      "The Divine Fossil Pokémon revered as a symbol of balance and divine intervention, worshipped for its guidance and miracles during tumultuous times of anarchy.",
    type: [types.ROCK, types.PSYCHIC],
    baseStats: [120, 80, 140, 115, 80, 65],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/lord-helix-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/lord-helix-shiny-resized.png",
    abilities: {
      20006: 1,
    },
    moveIds: [moveIdEnum.WITHDRAW, moveIdEnum.PROTECT, "m317-1", "m56-2"],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.SLEEPING_SNORLAX]: {
    name: "Sleeping Snorlax",
    emoji: "<:sleepingsnorlax:1132059622979670096>",
    description:
      "The star of Pokemon Sleep, this Snorlax is always sleeping. The more it sleeps, the more powerful it gets.",
    type: [types.NORMAL],
    baseStats: [160, 100, 70, 60, 80, 80],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/sleeping-snorlax-resized.png",
    shinySprite:
      "https://media.tenor.com/-Uz6xHwMa4gAAAAi/snorlax-snorlax-pokemon.gif",
    abilities: {
      [abilityIdEnum.GUTS]: 1,
    },
    moveIds: [moveIdEnum.SLEEP_TALK, "m34-1", moveIdEnum.YAWN, moveIdEnum.REST],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.AA_J]: {
    name: "AA-j",
    emoji: "<:aaj:1114223240047493241>",
    description:
      "Known for its unpredictability and immense power, many were sacrificed to bring this electrifying Pokemon into being.",
    type: [types.ELECTRIC, types.FLYING],
    baseStats: [90, 95, 85, 130, 90, 90],
    sprite: "https://archives.bulbagarden.net/media/upload/d/dd/Spr_1b_145.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aaj-shiny-resized.png",
    abilities: {
      20007: 1,
    },
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.DRILL_PECK,
      "m435-1",
      "m87-1",
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.ARMORED_MEWTWO]: {
    name: "Armored Mewtwo",
    emoji: "<:armoredmewtwo:1117130461282578535>",
    description:
      "A genetic clone donning inpenetrable armor. Its powers are dedicated to battling.",
    type: [types.PSYCHIC, types.STEEL],
    baseStats: [120, 95, 120, 135, 105, 105],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo-shiny.png",
    abilities: {
      [abilityIdEnum.PRESSURE]: 1,
    },
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      "m334-2",
      moveIdEnum.FLASH_CANNON,
      moveIdEnum.PSYSTRIKE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.RED_HAIR_MEWTWO]: {
    name: "Red Hair Mewtwo",
    emoji: "<:shanks:1136890671588970498>",
    description:
      "A genetic clone of a powerful emperor. Its conquering presence alone frightens Pokemon to the brink of fainting.",
    type: [types.PSYCHIC],
    baseStats: [106, 130, 90, 130, 90, 134],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shanks-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shanks-shiny-resized.png",
    abilities: {
      "46-1": 1,
    },
    moveIds: [
      moveIdEnum.FURY_CUTTER,
      moveIdEnum.LEAF_BLADE,
      moveIdEnum.AIR_SLASH,
      "m540-1",
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.GOLDS_TYPHLOSION]: {
    name: "Gold's Typhlosion",
    emoji: "<:goldtyphlosion:1127276634853101688>",
    description:
      "Gold's Typhlosion obscures itself behind a shimmering heat haze that it creates using its intensely hot flames. This Pokémon creates blazing explosive blasts that burn everything to cinders.",
    type: [types.FIRE],
    baseStats: [90, 70, 78, 115, 85, 102],
    sprite: "https://archives.bulbagarden.net/media/upload/b/b9/Spr_2g_157.png",
    shinySprite:
      "https://archives.bulbagarden.net/media/upload/6/6c/Spr_2g_157_s.png",
    abilities: {
      [abilityIdEnum.SOLAR_POWER]: 1,
    },
    moveIds: [
      moveIdEnum.EMBER,
      moveIdEnum.FLAMETHROWER,
      "m20005",
      moveIdEnum.ERUPTION,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.VINSMOKE_HITMONTOP]: {
    name: "Vinsmoke Hitmontop",
    emoji: "<:sanji:1136890669735084053>",
    description:
      "A culinary expert, its meals are said to physically strengthen Pokemon who try it. It fights with its legs to avoid damaging its cooking hands.",
    type: [types.FIGHTING],
    baseStats: [65, 90, 90, 45, 100, 150],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/sanji-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/sanji-shiny-resized.png",
    abilities: {
      [abilityIdEnum.SPEED_BOOST]: 1,
    },
    moveIds: [
      moveIdEnum.HELPING_HAND,
      "m97-1",
      moveIdEnum.BLAZE_KICK,
      "m226-1",
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.DARK_TYRANITAR]: {
    name: "Dark Tyranitar",
    emoji: "<:darktyranitar:1127276632831447091>",
    description:
      "Corrupted by Team Rocket's Dark Ball, it has converted its inpenetrable armor into a destructive offense.",
    type: [types.GROUND, types.DARK],
    baseStats: [90, 154, 80, 115, 70, 91],
    sprite: "https://archives.bulbagarden.net/media/upload/b/bb/Spr_2g_248.png",
    shinySprite:
      "https://archives.bulbagarden.net/media/upload/1/1c/Spr_2g_248_s.png",
    abilities: {
      [abilityIdEnum.ARENA_TRAP]: 1,
    },
    moveIds: [
      moveIdEnum.SMACK_DOWN,
      moveIdEnum.CRUNCH,
      "m20006",
      moveIdEnum.EARTHQUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.SHADOW_LUGIA]: {
    name: "Shadow Lugia",
    emoji: "<:shadowlugia:1127311851278061608>",
    description:
      "The legendary Lugia under the influence of a dark organization; it radiates a malevolent aura of corruption.",
    type: [types.GHOST, types.FLYING],
    baseStats: [100, 130, 90, 154, 90, 116],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia-shiny.png",
    abilities: {
      [abilityIdEnum.PRESSURE]: 1,
    },
    moveIds: [moveIdEnum.WEATHER_BALL, moveIdEnum.PSYCHIC, "m542-1", "m177-1"],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.SLAKING_D_GARP]: {
    name: "Slaking D. Garp",
    emoji: "<:garp:1136890665003925554>",
    description:
      "An old Pokemon hero; this Slaking empowers its fists with pure willpower to launch devastating attacks that can level cities.",
    type: [types.NORMAL],
    baseStats: [125, 150, 100, 85, 65, 75],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/garp-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/garp-shiny-resized.png",
    abilities: {
      "54-1": 1,
    },
    moveIds: [
      moveIdEnum.ROCK_THROW,
      moveIdEnum.COUNTER,
      moveIdEnum.HAMMER_ARM,
      "m416-1",
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.BILLIONAIRE_SABLEYE]: {
    name: "Billionaire Sableye",
    emoji: "<:billionairesableye:1130698671474888815>",
    description:
      "A Sableye that has amassed a fortune through its business ventures. It is said to be the richest Pokémon in the world.",
    type: [types.NORMAL, types.GHOST],
    baseStats: [70, 100, 130, 90, 130, 60],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/billionaire-sableye-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/billionaire-sableye-shiny-resized.png",
    abilities: {
      20010: 1,
    },
    moveIds: [
      moveIdEnum.PAY_DAY,
      moveIdEnum.RECOVER,
      moveIdEnum.ENDURE,
      "m20008",
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.ARLONG]: {
    name: "Arlong",
    emoji: "<:arlong:1136891755908833320>",
    description: "If it's a 1v1 in water, ALWAYS bet on Arlong!",
    type: [types.WATER, types.DARK],
    baseStats: [70, 130, 80, 115, 60, 85],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/arlong-resized.png",
    shinySprite: "https://i.ytimg.com/vi/sJdQll3I-S4/maxresdefault.jpg",
    abilities: {
      20012: 1,
    },
    moveIds: [
      moveIdEnum.AQUA_JET,
      moveIdEnum.WATERFALL,
      moveIdEnum.CRUNCH,
      "m20013",
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    noGacha: true,
  },
  [pokemonIdEnum.AQUAS_SHARPEDO]: {
    name: "Aqua's Sharpedo",
    emoji: "<:aquasharpedo:1325287154125111420>",
    description:
      "A Sharpedo controlled by Team Aqua. It is said to be able to cause tsunamis where it swims.",
    type: [types.WATER, types.DARK],
    baseStats: [80, 100, 50, 145, 60, 115],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aqua-sharpedo-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aqua-sharpedo-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.JET_SPEED]: 1,
    },
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.SURF,
      moveIdEnum.DARK_PULSE,
      moveIdEnum.MEAN_LOOK,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    noGacha: true,
  },
  [pokemonIdEnum.MAGMAS_CAMERUPT]: {
    name: "Magma's Camerupt",
    emoji: "<:magmacamerupt:1325287155198722160>",
    description:
      "A Camerupt controlled by Team Magma. It is said to be able to cause volcanic eruptions with a single stomp.",
    type: [types.FIRE, types.GROUND],
    baseStats: [70, 135, 90, 90, 95, 70],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-camerupt-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-camerupt-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.BURNING_DRAFT]: 1,
    },
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.BULLDOZE,
      moveIdEnum.FLAME_BALL,
      moveIdEnum.ROCK_SLIDE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.MEDIUMFAST,
    noGacha: true,
  },
  [pokemonIdEnum.ARCHIES_KYOGRE]: {
    name: "Archie's Kyogre",
    emoji: "<:aquakyogre:1325287152979939348>",
    description:
      "A Kyogre under the control of Archie, the leader of Team Aqua. It summons heavy rain to flood the world.",
    type: [types.WATER, types.DARK],
    baseStats: [110, 80, 100, 145, 140, 85],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aqua-kyogre-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aqua-kyogre-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.AQUA_POWER]: 1,
    },
    moveIds: [
      moveIdEnum.TWISTER,
      moveIdEnum.CALM_MIND,
      moveIdEnum.DARK_PULSE,
      moveIdEnum.AQUA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.MAXIES_GROUDON]: {
    name: "Maxie's Groudon",
    emoji: "<:magmagroudon:1325287156268404878>",
    description:
      "A Groudon under the control of Maxie, the leader of Team Magma. It uses its power to expand the land.",
    type: [types.GROUND, types.FIRE],
    baseStats: [99, 166, 130, 90, 90, 85],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-groudon-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-groudon-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.MAGMA_POWER]: 1,
    },
    moveIds: [
      moveIdEnum.SMACK_DOWN,
      moveIdEnum.SWORDS_DANCE,
      moveIdEnum.BULLDOZE,
      moveIdEnum.MAGMA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.RAYKAIDO]: {
    name: "Raykaido",
    emoji: "<:kaido:1136890666442555403>",
    description:
      "A legendary creature that has been seen in the skies of a faraway region. It is said to be the protector of the skies.",
    type: [types.DRAGON],
    baseStats: [125, 90, 150, 110, 130, 75],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/kaido-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/kaido-shiny-resized.png",
    abilities: {
      [abilityIdEnum.REGENERATOR]: 1,
    },
    moveIds: [moveIdEnum.TWISTER, "m208-1", moveIdEnum.THUNDERBOLT, "m620-1"],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.RUBBER_INFERNAPE]: {
    name: "Rubber Infernape",
    emoji: "<:luffy:1136890668342595654>",
    description:
      "An Infernape who ate a special poffin, granting its body the properties of rubber.",
    type: [types.NORMAL, types.FIGHTING],
    baseStats: [86, 154, 70, 104, 70, 116],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-shiny-resized.png",
    abilities: {
      20011: 1,
    },
    moveIds: ["m183-1", "m7-1", "m370-1", "m20010"],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.SUN_GOD_INFERNAPE]: {
    name: "Sun God Infernape",
    emoji: "<:luffy:1136890668342595654>",
    description:
      "The Infernape that has awakened its poffin powers. Destined to liberate the world, it brings joy and freedom wherever it goes.",
    type: [types.FAIRY, types.FIGHTING],
    baseStats: [86, 154, 75, 154, 75, 136],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-shiny-resized.png",
    abilities: {
      20009: 1,
    },
    moveIds: ["m20011", "m182-1", "m417-1", "m20012"],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    unobtainable: true,
  },
  [pokemonIdEnum.CYNTHIA_GARCHOMP]: {
    name: "Cynthia's Garchomp",
    emoji: "<:cynthiagarchomp:1416980451473490130>",
    description:
      "It flies at the speed of sound while searching for prey, and it has midair battles with Salamence as the two compete for food.",
    type: [types.DRAGON, types.GROUND],
    baseStats: [108, 135, 85, 75, 85, 112],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/cynthia-garchomp-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/cynthia-garchomp-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.SURGING_SAND]: 1,
    },
    moveIds: [
      moveIdEnum.BITE,
      moveIdEnum.BRICK_BREAK,
      moveIdEnum.DRAGON_RUSH,
      moveIdEnum.CATACLYSMIC_QUAKE,
    ],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.VOLO_GIRATINA_ALTERED]: {
    name: "Volo's Giratina",
    emoji: "<:vologiratina:1416980461376507924> ",
    description:
      "This Pokémon is said to live in a world on the reverse side of ours, where common knowledge is distorted and strange.",
    type: [types.GHOST, types.DRAGON],
    baseStats: [150, 90, 130, 90, 130, 90],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/volo-giratina-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/volo-giratina-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.ELDRITCH_REVIVAL]: 1,
    },
    moveIds: [
      moveIdEnum.OMINOUS_WIND,
      moveIdEnum.DRAGON_CLAW,
      moveIdEnum.AURA_SPHERE,
      moveIdEnum.DISTORTION_FORCE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    noGacha: true,
  },
  [pokemonIdEnum.VOLO_GIRATINA_ORIGIN]: {
    name: "Volo's True Giratina",
    emoji: "<:vologiratinaorigin:1416980459786600528>",
    description:
      "Volo's Giratina in its true Origin Form. Its power is unleashed through the bonds forged with its trainer in the Distortion World.",
    type: [types.GHOST, types.DRAGON],
    baseStats: [150, 130, 90, 130, 90, 90],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10007.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10007.png",
    abilities: {
      [abilityIdEnum.THE_HEAVENS_AND_EARTH_AS_ONE]: 1,
    },
    moveIds: [
      moveIdEnum.OMINOUS_WIND,
      moveIdEnum.DRAGON_CLAW,
      moveIdEnum.EARTH_POWER,
      moveIdEnum.DISTORTION_FORCE,
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.SLOW,
    baseSpeciesId: pokemonIdEnum.VOLO_GIRATINA_ALTERED,
    noGacha: true,
    unobtainable: true,
  },
  [pokemonIdEnum.ARCEUS_BUG]: {
    name: "Arceus-Bug",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.BUG],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-bug.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-bug.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.BUG_BITE,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.HEAL_ORDER,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_DARK]: {
    name: "Arceus-Dark",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.DARK],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-dark.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-dark.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.REFRESH,
      moveIdEnum.TAUNT,
      moveIdEnum.FOUL_PLAY,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_DRAGON]: {
    name: "Arceus-Dragon",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.DRAGON],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-dragon.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-dragon.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.BULLET_PUNCH,
      moveIdEnum.DRAGON_CLAW,
      moveIdEnum.DRAGON_DANCE,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_ELECTRIC]: {
    name: "Arceus-Electric",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.ELECTRIC],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-electric.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-electric.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.NUZZLE,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.CALM_MIND,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_FAIRY]: {
    name: "Arceus-Fairy",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.FAIRY],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-fairy.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-fairy.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.REFRESH,
      moveIdEnum.CALM_MIND,
      moveIdEnum.AURA_SPHERE,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_FIGHTING]: {
    name: "Arceus-Fighting",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.FIGHTING],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-fighting.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-fighting.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.SHADOW_SNEAK,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.BODY_PRESS,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_FIRE]: {
    name: "Arceus-Fire",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.FIRE],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-fire.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-fire.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.REFRESH,
      moveIdEnum.THUNDERBOLT,
      moveIdEnum.WILL_O_WISP,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_FLYING]: {
    name: "Arceus-Flying",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.FLYING],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-flying.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-flying.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.HELPING_HAND,
      moveIdEnum.AIR_SLASH,
      moveIdEnum.DEFOG,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_GHOST]: {
    name: "Arceus-Ghost",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.GHOST],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-ghost.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-ghost.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.OMINOUS_WIND,
      moveIdEnum.AURA_SPHERE,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_GRASS]: {
    name: "Arceus-Grass",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.GRASS],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-grass.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-grass.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.SPORE,
      moveIdEnum.STRENGTH_SAP,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_GROUND]: {
    name: "Arceus-Ground",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.GROUND],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-ground.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-ground.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.SMACK_DOWN,
      moveIdEnum.SPIKES,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_ICE]: {
    name: "Arceus-Ice",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.ICE],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-ice.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-ice.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.REFRESH,
      moveIdEnum.CALM_MIND,
      moveIdEnum.FREEZE_DRY,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_POISON]: {
    name: "Arceus-Poison",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.POISON],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-poison.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-poison.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.SMOG,
      moveIdEnum.TOXIC,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_PSYCHIC]: {
    name: "Arceus-Psychic",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.PSYCHIC],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-psychic.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-psychic.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.TELEPORT,
      moveIdEnum.CALM_MIND,
      moveIdEnum.STORED_POWER,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_ROCK]: {
    name: "Arceus-Rock",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.ROCK],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-rock.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-rock.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.WIDE_GUARD,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_STEEL]: {
    name: "Arceus-Steel",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.STEEL],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-steel.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-steel.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.HARDEN,
      moveIdEnum.IRON_HEAD,
      moveIdEnum.BODY_PRESS,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.ARCEUS_WATER]: {
    name: "Arceus-Water",
    emoji: "<:493:1351027589258543166>",
    description:
      "According to the legends of Sinnoh, this Pokémon emerged from an egg and shaped all there is in this world.",
    type: [types.WATER],
    baseStats: [120, 120, 120, 120, 120, 120],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493-water.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/493-water.png",
    abilities: {
      [abilityIdEnum.MULTITYPE]: 1,
    },
    moveIds: [
      moveIdEnum.REFRESH,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.SCALD,
      moveIdEnum.JUDGMENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    noGacha: true,
    baseSpeciesId: pokemonIdEnum.ARCEUS,
  },
  [pokemonIdEnum.LITTENYAN]: {
    name: "Littenyan",
    emoji: "<:littenyan:1145193884817834005>",
    description:
      "A special Litten with two tails. It is said to be the mascot of another world.",
    type: [types.FIRE, types.FAIRY],
    baseStats: [65, 119, 70, 80, 65, 131],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/littenyan-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/littenyan-shiny-resized.png",
    abilities: {
      [abilityIdEnum.MOXIE]: 1,
    },
    moveIds: [moveIdEnum.SCRATCH, "m212-1", moveIdEnum.PLAY_ROUGH, "m154-1"],
    battleEligible: true,
    rarity: rarities.EPIC,
    growthRate: growthRates.SLOW,
    noGacha: true,
    tags: ["eviolite"],
  },
  [pokemonIdEnum.SCAMMER_THIEVUL]: {
    name: "Scammer Thievul",
    emoji: "<:scammerthievul:1130698673794338968>",
    description:
      "A devious thief whos lies have fooled countless trainers. It preys on the unaware and naive.",
    type: [types.DARK],
    baseStats: [80, 80, 60, 130, 100, 130],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/scammer-thievul-resized.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/scammer-thievul-shiny-resized.png",
    abilities: {
      [abilityIdEnum.STAKEOUT]: 1,
    },
    moveIds: [
      moveIdEnum.QUICK_ATTACK,
      moveIdEnum.THIEF,
      moveIdEnum.DARK_PULSE,
      "m20007",
    ],
    battleEligible: true,
    rarity: rarities.LEGENDARY,
    growthRate: growthRates.MEDIUMSLOW,
    noGacha: true,
  },
  [pokemonIdEnum.TEMPLE_GUARDIAN_CLOYSTER]: {
    name: "Temple Guardian Cloyster",
    emoji: "<:91:1100288966881718342>",
    description:
      "Faithful guardian of the ancient Mind Temple. It's said to be untouchable through centuries of perfecting its mind.",
    type: [types.WATER, types.ICE],
    baseStats: [150, 115, 180, 90, 75, 90],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/91.png",
    abilities: {
      20001: 1,
    },
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.SPIKES,
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.RAZOR_SHELL,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.MEDIUMSLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.CAVE_DWELLER_ELECTRODE]: {
    name: "Cave Dweller Electrode",
    emoji: "<:101:1100290179073331240>",
    description:
      "The provider and powerhouse of the Soul Cave's primordial energy. It's said to harness the energy from every emotion ever experienced.",
    type: [types.ELECTRIC],
    baseStats: [115, 90, 75, 115, 80, 225],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/101.png",
    abilities: {
      20003: 1,
    },
    moveIds: [
      moveIdEnum.THUNDER_SHOCK,
      moveIdEnum.TAUNT,
      moveIdEnum.DISCHARGE,
      moveIdEnum.WILD_CHARGE,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.MEDIUMFAST,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.CAVE_DWELLER_CHANSEY]: {
    name: "Cave Dweller Chansey",
    emoji: "<:113:1100290444249804800>",
    description:
      "The life force of the Soul Cave. A millenia of harnessing soul energy has made it an unbreakable guardian.",
    type: [types.NORMAL],
    baseStats: [350, 40, 45, 90, 90, 85],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/113.png",
    abilities: {
      20002: 1,
    },
    moveIds: [
      moveIdEnum.DISARMING_VOICE,
      moveIdEnum.LIGHT_SCREEN,
      moveIdEnum.HEAL_PULSE,
      moveIdEnum.MOONBLAST,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.MEDIUMFAST,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.TEMPLE_GUARDIAN_ARTICUNO]: {
    name: "Temple Guardian Articuno",
    emoji: "<:144:1100294779419504680>",
    description:
      "Stalwart guardian of the Mind Temple. It's been bestowed wisdom from the ancient gods.",
    type: [types.ICE, types.FLYING],
    baseStats: [160, 85, 90, 110, 160, 95],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/144.png",
    abilities: {
      20001: 1,
    },
    moveIds: [
      moveIdEnum.ICE_SHARD,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.HEAL_BELL,
      moveIdEnum.HURRICANE,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.SPIRIT_PRIEST_DRAGONITE]: {
    name: "Spirit Priest Dragonite",
    emoji: "<:149:1100294787996860508>",
    description:
      "The protector and most devout follower of the Spirit Altar. Its unstoppable will has been hardened through communion with the ancient gods.",
    type: [types.DRAGON, types.FLYING],
    baseStats: [125, 155, 85, 100, 95, 140],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/149.png",
    abilities: {
      20004: 1,
    },
    moveIds: [
      moveIdEnum.TWISTER,
      moveIdEnum.EXTREME_SPEED,
      moveIdEnum.DRAGON_DANCE,
      moveIdEnum.OUTRAGE,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.SPIRIT_PRIEST_MEWTWO]: {
    name: "Spirit Priest Mewtwo",
    emoji: "<:150:1100294789867520052>",
    description:
      "The sole founder of the Spirit Altar. It was created by the gods after centuries of meditation and prayer.",
    type: [types.PSYCHIC],
    baseStats: [125, 90, 90, 160, 90, 145],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png",
    abilities: {
      20004: 1,
    },
    moveIds: [
      moveIdEnum.ANCIENT_POWER,
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PSYSTRIKE,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.RAID_BOSS_MEWTWO]: {
    name: "Raid Boss Mewtwo",
    emoji: "<:armoredmewtwo:1117130461282578535>",
    description:
      "The superpowered Mewtwo under the control of Team Rocket GO. Many trainers must band together to take down this mighty foe.",
    type: [types.PSYCHIC, types.STEEL],
    baseStats: [6000, 145, 154, 154, 127, 80],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo-shiny.png",
    abilities: {
      20013: 1,
    },
    moveIds: [
      moveIdEnum.COUNTER,
      moveIdEnum.MIRROR_COAT,
      "m334-2",
      moveIdEnum.FLASH_CANNON,
      moveIdEnum.HYPER_BEAM,
      moveIdEnum.PSYSTRIKE,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.RAID_BOSS_LUGIA]: {
    name: "Raid Boss Lugia",
    emoji: "<:shadowlugia:1127311851278061608>",
    description:
      "The legendary Lugia corrupted by Team Rocket GO. It's violent rampage requires multiple strong trainers to take down.",
    type: [types.GHOST, types.FLYING],
    baseStats: [6000, 140, 100, 170, 110, 140],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia.png",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia-shiny.png",
    abilities: {
      20014: 1,
    },
    moveIds: [
      moveIdEnum.PSYCHIC,
      moveIdEnum.EXTREME_SPEED,
      "m542-1",
      moveIdEnum.DUAL_WINGBEAT,
      "m177-1",
      moveIdEnum.FUTURE_SIGHT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.RAID_BOSS_KYOGRE]: {
    name: "Raid Boss Kyogre",
    emoji: "<:aquakyogre:1325287152979939348>",
    description:
      "A Kyogre free from the control of Team Aqua, more powerful than ever. Many trainers must band together to take down this mighty foe before it envelops the world in water.",
    type: [types.WATER, types.DARK],
    baseStats: [6000, 120, 100, 160, 160, 120],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aqua-kyogre-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aqua-kyogre-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.ALPHA_CORE]: 1,
    },
    moveIds: [
      moveIdEnum.ICE_BEAM,
      moveIdEnum.PROTECT,
      moveIdEnum.DARK_PULSE,
      moveIdEnum.NASTY_PLOT,
      moveIdEnum.THUNDER,
      moveIdEnum.AQUA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.META_GROUDON]: {
    name: "Meta Groudon",
    emoji: "<:magmagroudon:1325287156268404878>",
    description:
      "Groudon brought back to life from an ancient fossil. A failed experiment rendered it an abomination, consuming humans and Pokemon alike.",
    type: [types.GROUND, types.STEEL],
    baseStats: [100, 200, 200, 200, 100, 70],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-groudon-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-groudon-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.DROUGHT]: 1,
    },
    moveIds: [
      moveIdEnum.FLAMETHROWER,
      moveIdEnum.GIGA_DRAIN,
      moveIdEnum.SOLAR_BEAM,
      moveIdEnum.IRON_TAIL,
      moveIdEnum.PRECIPICE_BLADES,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
  },
  [pokemonIdEnum.RAID_BOSS_GROUDON]: {
    name: "Raid Boss Groudon",
    emoji: "<:magmagroudon:1325287156268404878>",
    description:
      "A Groudon free from the control of Team Magma, more powerful than ever. Many trainers must band together to take down this mighty foe before it dooms the world to drought.",
    type: [types.GROUND, types.FIRE],
    baseStats: [6000, 160, 160, 120, 100, 120],
    sprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-groudon-resized.gif",
    shinySprite:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/magma-groudon-shiny-resized.gif",
    abilities: {
      [abilityIdEnum.OMEGA_CORE]: 1,
    },
    moveIds: [
      moveIdEnum.FIRE_PUNCH,
      moveIdEnum.PROTECT,
      moveIdEnum.STONE_EDGE,
      moveIdEnum.STEALTH_ROCK,
      moveIdEnum.EARTHQUAKE,
      moveIdEnum.MAGMA_IMPACT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
    tags: ["boss"],
  },
  [pokemonIdEnum.PALMERS_RAYQUAZA]: {
    name: "Palmer's Rayquaza",
    emoji: "<:384:1132497391535272016>",
    description:
      "Palmer's trusted sidekick, whose dominance in battle won Palmer the title of Battle Tower Tycoon.",
    type: [types.DRAGON, types.FLYING],
    baseStats: [125, 150, 90, 100, 90, 145],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/384.png",
    abilities: {
      [abilityIdEnum.AIR_LOCK]: 1,
    },
    moveIds: [
      moveIdEnum.EARTHQUAKE,
      moveIdEnum.OUTRAGE,
      moveIdEnum.SACRED_FIRE,
      moveIdEnum.GIGA_IMPACT,
      moveIdEnum.DRAGON_ASCENT,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
  },
  [pokemonIdEnum.WILLOWS_MELMETAL]: {
    name: "Willow's Melmetal",
    emoji: "<:809:1149545704008716391>",
    description:
      "After studying this Pokemon for decades, Professor Willow has brought the full potential out of Melmetal.",
    type: [types.STEEL],
    baseStats: [135, 153, 153, 100, 125, 34],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/809.png",
    shinySprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/809.png",
    abilities: {
      20002: 1,
    },
    moveIds: [
      moveIdEnum.IRON_DEFENSE,
      moveIdEnum.EXPLOSION,
      moveIdEnum.DYNAMIC_PUNCH,
      moveIdEnum.TEN_MILLION_VOLT_THUNDERBOLT,
      moveIdEnum.DOUBLE_IRON_BASH,
    ],
    battleEligible: true,
    rarity: rarities.MYTHICAL,
    growthRate: growthRates.SLOW,
    unobtainable: true,
  },
};

// @ts-ignore
const pokemonData = require("../../data/pokemonData.json");

const typeNameToId = Object.fromEntries(
  Object.entries(types).map(([key, val]) => [key.toLowerCase(), val]),
);

/**
 *
 * @param abilities
 */
function buildAbilityMap(abilities) {
  const nonHidden = abilities.filter((a) => !a.isHidden);
  const hidden = abilities.filter((a) => a.isHidden);
  const map = {};

  if (abilities.length === 0) return map;

  if (hidden.length === 0) {
    const prob = 1 / abilities.length;
    for (const a of abilities) {
      map[a.id] = prob;
    }
    return map;
  }

  if (abilities.length === 2) {
    for (const a of nonHidden) map[a.id] = 0.8;
    for (const a of hidden) map[a.id] = 0.2;
  } else if (abilities.length >= 3) {
    const nonHiddenProb = (1 - 0.1 * hidden.length) / nonHidden.length;
    for (const a of nonHidden) map[a.id] = nonHiddenProb;
    for (const a of hidden) map[a.id] = 0.1;
  } else {
    for (const a of abilities) map[a.id] = 1;
  }

  return map;
}

/**
 * @param {AllPokemonIdEnum} id
 * @param {CanonicalPokemonConfigData} overrides
 * @returns {PokemonConfigData}
 */
function buildCanonicalEntry(id, overrides) {
  const cached = pokemonData[id];
  if (!cached) {
    throw new Error(`No cached data for canonical Pokemon ${id}`);
  }

  return {
    name: cached.name,
    description: cached.description,
    type: cached.types.map((t) => typeNameToId[t]),
    baseStats: cached.baseStats,
    sprite: cached.sprite,
    shinySprite: cached.shinySprite,
    // @ts-ignore
    abilities: buildAbilityMap(cached.abilities),
    ...overrides,
  };
}

/**
 * @returns {Record<PokemonIdEnum, PokemonConfigData>}
 */
function buildPokemonConfig() {
  const result = {};

  for (const id of Object.keys(canonicalPokemonConfig)) {
    // @ts-ignore
    result[id] = buildCanonicalEntry(id, canonicalPokemonConfig[id]);
  }

  for (const id of Object.keys(fakePokemonConfig)) {
    result[id] = fakePokemonConfig[id];
  }

  // @ts-ignore
  return result;
}

/** @type {Record<PokemonIdEnum, PokemonConfigData>} */
const pokemonConfig = Object.freeze(buildPokemonConfig());

const rarityBins = {
  [rarities.COMMON]: [],
  [rarities.RARE]: [],
  [rarities.EPIC]: [],
  [rarities.LEGENDARY]: [],
};

for (const id in pokemonConfig) {
  const speciesData = pokemonConfig[id];
  if (speciesData.noGacha || speciesData.unobtainable) {
    continue;
  }
  if (speciesData.rarity === rarities.MYTHICAL) {
    continue;
  }

  rarityBins[speciesData.rarity].push(id);
}

// TODO: fix pokemon rarity bins
const rarityConfig = {
  [rarities.COMMON]: {
    pokemon: [],
    color: 0x00ff00,
    money: 25,
    formChangeCost: 500,
    statMultiplier: [1.15, 1.1, 1.15, 1.1, 1.15, 1.1],
    emoji: "⚪",
    ansiColor: ansiTokens.TEXT_GREEN,
    name: "Common",
  },
  [rarities.RARE]: {
    pokemon: [],
    color: 0x0000ff,
    money: 50,
    formChangeCost: 1000,
    statMultiplier: [1.15, 1.1, 1.15, 1.1, 1.15, 1.1],
    emoji: "💎",
    ansiColor: ansiTokens.TEXT_BLUE,
    name: "Rare",
  },
  [rarities.EPIC]: {
    pokemon: [],
    color: 0xff00ff,
    money: 75,
    formChangeCost: 2500,
    statMultiplier: [1.075, 1.05, 1.075, 1.05, 1.075, 1.05],
    emoji: "🔮",
    ansiColor: ansiTokens.TEXT_MAGENTA,
    name: "Epic",
  },
  [rarities.LEGENDARY]: {
    pokemon: [],
    color: 0xffff00,
    money: 200,
    formChangeCost: 10000,
    emoji: "🌟",
    ansiColor: ansiTokens.TEXT_YELLOW,
    name: "Legendary",
  },
  [rarities.MYTHICAL]: {
    pokemon: [],
    color: 0xff0000,
    money: 10000,
    formChangeCost: 10000,
    emoji: "㊙️",
    ansiColor: ansiTokens.TEXT_RED,
    name: "Mythical",
  },
};

const generations = [152, 252, 387];

const getGeneration = (id) => {
  const baseNumber = parseInt(id.split("-")[0], 10);
  for (let i = 0; i < generations.length; i += 1) {
    if (baseNumber < generations[i]) {
      return i + 1;
    }
  }
  return generations.length + 1;
};

const MAX_TOTAL_EVS = 510;
const MAX_SINGLE_EVS = 252;

module.exports = {
  pokemonConfig,
  rarities,
  rarityBins,
  rarityConfig,
  types,
  typeConfig,
  growthRates,
  growthRateConfig,
  natureConfig,
  MAX_TOTAL_EVS,
  MAX_SINGLE_EVS,
  stats,
  statConfig,
  getGeneration,
};
