/*
"trainer": {
    userId
    user
    level
    money
    lastCorrected (date)
    backpack
}
*/

const { backpackCategories, backpackItems } = require("./backpackConfig");
const { bannerTypes } = require("./gachaConfig");
const { stageNames } = require("./stageConfig");
const { timeEnum } = require("../enums/miscEnums");
const { getNumIntervalsBetweenDates } = require("../utils/utils");

const MAX_TRAINER_LEVEL = 100;
const MAX_POKEMON = 500;
const MAX_RELEASE = 10;

/**
 * @typedef {{
 *  name: string,
 *  options: Array<{value: any, display: string}>,
 *  trainerField: FieldConfigEntry<Trainer>,
 * }} UserSettingsData
 */
/** @typedef {Keys<userSettingsConfigRaw>} UserSettingsEnum */

/** @satisfies {Record<string, UserSettingsData>} */
const userSettingsConfigRaw = {
  publicProfile: {
    name: "Profile Privacy",
    options: /** @type {const} */ ([
      {
        value: true,
        display: "Public",
      },
      {
        value: false,
        display: "Private",
      },
    ]),
    trainerField: {
      type: "boolean",
      default: true,
    },
  },
  deviceType: {
    name: "Device Type",
    options: /** @type {const} */ ([
      {
        value: "desktop",
        display: "Desktop",
      },
      {
        value: "mobile",
        display: "Mobile",
      },
    ]),
    trainerField: {
      type: "string",
      default: "desktop",
    },
  },
  showTargetIndicator: {
    name: "Show Target Indicator",
    options: /** @type {const} */ ([
      {
        value: true,
        display: "Yes",
      },
      {
        value: false,
        display: "No",
      },
    ]),
    trainerField: {
      type: "boolean",
      default: true,
    },
  },
  instantAutoBattle: {
    name: "Instant Auto Battle",
    options: /** @type {const} */ ([
      {
        value: true,
        display: "On",
      },
      {
        value: false,
        display: "Off",
      },
    ]),
    trainerField: {
      type: "boolean",
      default: true,
    },
  },
  enableQuestUpsell: {
    name: "Enable Quest Upsell",
    options: /** @type {const} */ ([
      {
        value: true,
        display: "Yes",
      },
      {
        value: false,
        display: "No",
      },
    ]),
    trainerField: {
      type: "boolean",
      default: true,
    },
  },
};
/** @type {Record<UserSettingsEnum, UserSettingsData>} */
const userSettingsConfig = Object.freeze(userSettingsConfigRaw);
/**
 * Given a settings enum, get an enum of its options
 * @template {UserSettingsEnum} T
 * @typedef {(typeof userSettingsConfigRaw[T]["options"][number]["value"])} UserSettingsOptions
 */

/**
 * @type {DefaultFieldConfig<Trainer>}
 */
const userSettingsTrainerFieldsConfig = Object.entries(
  userSettingsConfig
).reduce((acc, [key, value]) => {
  acc[key] = value.trainerField;
  return acc;
}, {});

/**
 * @type {DefaultFieldConfig<Trainer>}
 */
const questFields = {
  dailyQuests: {
    type: "object",
    default: {},
    refreshInterval: timeEnum.DAY,
  },
  achievements: {
    type: "object",
    default: {},
  },
};

/**
 * @type {DefaultFieldConfig<Trainer>}
 */
const trainerFields = {
  userId: {
    type: "string",
  },
  user: {
    type: "object",
  },
  level: {
    type: "number",
    default: 1,
  },
  exp: {
    type: "number",
    default: 0,
  },
  money: {
    type: "number",
    default: 1000,
  },
  lastCorrected: {
    type: "number",
    default: new Date(0).getTime(),
  },
  claimedDaily: {
    type: "boolean",
    default: false,
    refreshInterval: timeEnum.DAY,
  },
  backpack: {
    type: "object",
    default: {
      [backpackCategories.POKEBALLS]: {
        [backpackItems.POKEBALL]: 10,
        [backpackItems.GREATBALL]: 5,
        [backpackItems.ULTRABALL]: 3,
        [backpackItems.MASTERBALL]: 1,
      },
    },
  },
  claimedLevelRewards: {
    type: "array",
    default: [],
  },
  purchasedShopItemsToday: {
    type: "object",
    default: {},
    refreshInterval: timeEnum.DAY,
  },
  locations: {
    type: "object",
    default: {},
  },
  party: {
    type: "object",
    default: {
      pokemonIds: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      rows: 3,
      cols: 4,
    },
  },
  savedParties: {
    type: "object",
    default: {
      1: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      2: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      3: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      4: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      5: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      6: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      7: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      8: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
      9: {
        pokemonIds: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        rows: 3,
        cols: 4,
      },
    },
  },
  beginnerRolls: {
    type: "number",
    default: 0,
  },
  banners: {
    type: "object",
    default: {
      [bannerTypes.STANDARD]: {
        pity: 0,
      },
      [bannerTypes.ROTATING]: {
        pity: 0,
      },
      [bannerTypes.SPECIAL]: {
        pity: 0,
      },
    },
  },
  defeatedNPCsToday: {
    type: "object",
    default: {},
    refreshInterval: timeEnum.DAY,
  },
  defeatedNPCs: {
    type: "object",
    default: {},
  },
  voting: {
    type: "object",
    default: {},
    config: {
      lastVoted: {
        type: "number",
        default: new Date(0).getTime(),
      },
      streak: {
        type: "number",
        default: 0,
      },
      rewards: {
        type: "number",
        default: 0,
      },
    },
  },
  trade: {
    type: "object",
    default: {
      money: 0,
      pokemonIds: [],
    },
  },
  // TODO: move mythics to its own nested object?
  hasCelebi: {
    type: "boolean",
    default: false,
  },
  hasJirachi: {
    type: "boolean",
    default: false,
  },
  hasDarkrai: {
    type: "boolean",
    default: false,
  },
  usedTimeTravel: {
    type: "boolean",
    default: false,
    refreshInterval: timeEnum.DAY,
  },
  usedWish: {
    type: "boolean",
    default: false,
    refreshInterval: timeEnum.WEEK,
  },
  usedCreation: {
    type: "boolean",
    default: false,
    refreshInterval: timeEnum.WEEK,
  },
  dreamCards: {
    type: "number",
    default: 100,
    refreshInterval: timeEnum.MINUTE * 5,
    refreshCallback: ({
      previousObject,
      previousValue,
      lastCorrectedDate,
      newCorrectedDate,
      refreshInterval,
    }) => {
      const toAdd = getNumIntervalsBetweenDates(
        refreshInterval,
        newCorrectedDate,
        lastCorrectedDate
      );
      const max = 100 + previousObject.level + 50;
      if (previousValue > max) {
        return previousValue; // Don't reduce dream cards if they're over limit
      }

      return Math.min(previousValue + toAdd, max);
    },
  },
  lastTowerStage: {
    type: "number",
    default: 0,
    refreshInterval: timeEnum.FORTNITE,
  },
  settings: {
    type: "object",
    default: {},
    config: userSettingsTrainerFieldsConfig,
  },
  upsellData: {
    type: "object",
    default: {},
  },
  tutorialData: {
    type: "object",
    default: {
      completedTutorialStages: {},
      currentTutorialStage: "welcome", // keep in sync with first stage in tutorialConfig
    },
  },
  questData: {
    type: "object",
    default: {},
    config: questFields,
  },
};

const levelConfig = {
  1: {
    rewards: {
      backpack: {},
    },
  },
  2: {
    rewards: {
      money: 200,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
        },
      },
    },
  },
  3: {
    rewards: {
      money: 300,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.GREATBALL]: 5,
        },
      },
    },
  },
  4: {
    rewards: {
      money: 400,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.ULTRABALL]: 3,
        },
      },
    },
  },
  5: {
    rewards: {
      money: 1000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  6: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
        },
      },
    },
  },
  7: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
        },
      },
    },
  },
  8: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
        },
      },
    },
  },
  9: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
        },
      },
    },
  },
  10: {
    rewards: {
      money: 2000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.MASTERBALL]: 3,
        },
      },
    },
  },
  11: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  12: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  13: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  14: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  15: {
    rewards: {
      money: 1500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  16: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  17: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  18: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  19: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  20: {
    rewards: {
      money: 2000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 3,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  21: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  22: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  23: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  24: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  25: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  26: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  27: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  28: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  29: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  30: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  31: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  32: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  33: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  34: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  35: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  36: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  37: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  38: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  39: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  40: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  41: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  42: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  43: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  44: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  45: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  46: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  47: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  48: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  49: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  50: {
    rewards: {
      money: 5000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
          [backpackItems.GREATBALL]: 5,
          [backpackItems.ULTRABALL]: 3,
          [backpackItems.MASTERBALL]: 3,
        },
      },
    },
  },
  51: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  52: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  53: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  54: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  55: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  56: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  57: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  58: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  59: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  60: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  61: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  62: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  63: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  64: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  65: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  66: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  67: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  68: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  69: {
    rewards: {
      money: 6969,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  70: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  71: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  72: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  73: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  74: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  75: {
    rewards: {
      money: 7500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
          [backpackItems.GREATBALL]: 5,
          [backpackItems.ULTRABALL]: 3,
          [backpackItems.MASTERBALL]: 3,
        },
      },
    },
  },
  76: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  77: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  78: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  79: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  80: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  81: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  82: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  83: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  84: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  85: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  86: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  87: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  88: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  89: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  90: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  91: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  92: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  93: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  94: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  95: {
    rewards: {
      money: 2500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
          [backpackItems.GREATBALL]: 2,
          [backpackItems.ULTRABALL]: 1,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
  },
  96: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  97: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  98: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  99: {
    rewards: {
      money: 500,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 2,
          [backpackItems.GREATBALL]: 1,
        },
      },
    },
  },
  100: {
    rewards: {
      money: 100000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 100,
          [backpackItems.GREATBALL]: 10,
          [backpackItems.ULTRABALL]: 10,
          [backpackItems.MASTERBALL]: 5,
        },
      },
    },
  },
};

// TODO: move?
// level 1: 0 exp, level 2: 100 exp, level 3: 300 exp, level 4: 600 exp, level 5: 1000 exp etc...
const getTrainerLevelExp = (level) => 50 * (level ** 2 - level);

const expMultiplier = (level) =>
  // 2.5 * x ^ (1/2) + 15
  2.5 * level ** (1 / 2) + 15;

const NUM_DAILY_REWARDS = process.env.STAGE === stageNames.ALPHA ? 100 : 5;
const NUM_DAILY_SHARDS = process.env.STAGE === stageNames.ALPHA ? 100 : 5;

module.exports = {
  trainerFields,
  getTrainerLevelExp,
  MAX_TRAINER_LEVEL,
  MAX_POKEMON,
  MAX_RELEASE,
  levelConfig,
  expMultiplier,
  NUM_DAILY_REWARDS,
  NUM_DAILY_SHARDS,
  userSettingsConfig,
};
