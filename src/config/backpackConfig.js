const { heldItemIdEnum } = require("../enums/battleEnums");
const { emojis } = require("../enums/emojis");

/** @typedef {Enum<backpackCategories>} BackpackCategoryEnum */
const backpackCategories = Object.freeze({
  POKEBALLS: "0",
  MATERIALS: "1",
  CONSUMABLES: "2",
  HELD_ITEMS: "3",
});

/** @typedef {Enum<backpackItems>} BackpackItemEnum */
const backpackItemsRaw = Object.freeze({
  POKEBALL: "0",
  GREATBALL: "1",
  ULTRABALL: "2",
  MASTERBALL: "3",
  KNOWLEDGE_SHARD: "4",
  EMOTION_SHARD: "5",
  WILLPOWER_SHARD: "6",
  MINT: "7",
  RAID_PASS: "8",
  STAR_PIECE: "9",
});
const backpackItems = Object.freeze({
  ...backpackItemsRaw,
  ...heldItemIdEnum,
});

const backpackCategoryConfig = Object.freeze({
  [backpackCategories.POKEBALLS]: {
    name: "Pokeballs",
    emoji: "<:pokeball:1100296136931156008>",
    description:
      "Used to catch Pokemon! Use `/help gacha` command to learn more!",
  },
  [backpackCategories.MATERIALS]: {
    name: "Materials",
    emoji: "<:materials:1112557472759160852>",
    description: "Used to upgrade Pokemon, craft items, and as currency!",
  },
  [backpackCategories.CONSUMABLES]: {
    name: "Consumables",
    emoji: "<:raidpass:1150161526297206824>",
    description: "One-time use items for various purposes!",
  },
  [backpackCategories.HELD_ITEMS]: {
    name: "Held Items",
    emoji: emojis.LEFTOVERS,
    description:
      "Items that can be held by Pokemon for various effects in-battle!",
  },
});

const backpackItemConfigRaw = {
  [backpackItems.POKEBALL]: {
    name: "Pokeball",
    emoji: "<:pokeball:1100296136931156008>",
    description:
      "Used to catch Pokemon! Use the `gacha` command to learn more!",
    category: backpackCategories.POKEBALLS,
  },
  [backpackItems.GREATBALL]: {
    name: "Greatball",
    emoji: "<:greatball:1100296107759779840>",
    description:
      "Used to catch better Pokemon! Use the `gacha` command to learn more!",
    category: backpackCategories.POKEBALLS,
  },
  [backpackItems.ULTRABALL]: {
    name: "Ultraball",
    emoji: "<:ultraball:1100296166555521035>",
    description:
      "Used to catch top-tier Pokemon! Use the `gacha` command to learn more!",
    category: backpackCategories.POKEBALLS,
  },
  [backpackItems.MASTERBALL]: {
    name: "Masterball",
    emoji: "<:masterball:1100296005041262612>",
    description:
      "Used to catch the best Pokemon! Use the `gacha` command to learn more!",
    category: backpackCategories.POKEBALLS,
  },
  [backpackItems.KNOWLEDGE_SHARD]: {
    name: "Knowledge Shard",
    emoji: "<:knowledgeshard:1112557606637162537>",
    description: "Used to upgrade equipment!",
    category: backpackCategories.MATERIALS,
  },
  [backpackItems.EMOTION_SHARD]: {
    name: "Emotion Shard",
    emoji: "<:emotionshard:1112557605517275147>",
    description: "Used to upgrade equipment!",
    category: backpackCategories.MATERIALS,
  },
  [backpackItems.WILLPOWER_SHARD]: {
    name: "Willpower Shard",
    emoji: "<:willpowershard:1112557603617259540>",
    description: "Used to upgrade equipment!",
    category: backpackCategories.MATERIALS,
  },
  [backpackItems.MINT]: {
    name: "Mint",
    emoji: "<:mint:1119381176398913576>",
    description: "Used to change a Pokemon's nature!",
    category: backpackCategories.MATERIALS,
  },
  [backpackItems.STAR_PIECE]: {
    name: "Star Piece",
    emoji: "<:starpiece:1329630164526829709>",
    description: "Obtained from raids; used to make wishes!",
    category: backpackCategories.MATERIALS,
  },
  [backpackItems.RAID_PASS]: {
    name: "Raid Pass",
    emoji: "<:raidpass:1150161526297206824>",
    description: "Used to start a raid!",
    category: backpackCategories.CONSUMABLES,
  },
};

/**
 * @typedef {{
 *  name: string,
 *  emoji: string,
 *  description: string,
 *  category: BackpackCategoryEnum[typeof backpackCategories.HELD_ITEMS],
 *  cost: Cost
 * }} CraftableItemData
 */

/** @type {Record<HeldItemIdEnum, CraftableItemData>} */
const backpackHeldItemConfig = {
  [heldItemIdEnum.LUM_BERRY]: {
    name: "Lum Berry",
    emoji: "<:lumberry:1342652061484978248>",
    description:
      "Cures the user of any status condition and confusion, consumed after use.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 5000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 40,
          [backpackItems.EMOTION_SHARD]: 20,
          [backpackItems.WILLPOWER_SHARD]: 40,
        },
      },
    },
  },
  [heldItemIdEnum.SITRUS_BERRY]: {
    name: "Sitrus Berry",
    emoji: "<:sitrusberry:1342652062734880863>",
    description:
      "Restores 50% of the user's HP when it falls below 50%, consumed after use.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 5000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 50,
          [backpackItems.EMOTION_SHARD]: 20,
          [backpackItems.WILLPOWER_SHARD]: 30,
        },
      },
    },
  },
  [heldItemIdEnum.EXP_SHARE]: {
    name: "Exp. Share",
    emoji: "<:expshare:1343335843447701594>",
    description:
      "Increases the experience earned by all Pokemon in a battle by 15%, stacking additively.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 5000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 33,
          [backpackItems.EMOTION_SHARD]: 33,
          [backpackItems.WILLPOWER_SHARD]: 33,
        },
      },
    },
  },
  [heldItemIdEnum.CHOICE_BAND]: {
    name: "Choice Band",
    emoji: "<:choiceband:1336571391616614411>",
    description:
      "Increases the user's Attack by 50%. Whenver the user uses a non-basic move, disable its other non-basic moves until a basic move is used.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.EMOTION_SHARD]: 150,
          [backpackItems.WILLPOWER_SHARD]: 50,
        },
      },
    },
  },
  [heldItemIdEnum.AMULET_COIN]: {
    name: "Amulet Coin",
    emoji: "<:amuletcoin:1343335842307113000>",
    description:
      "Increases the money earned at the end of battle by 25%, stacking additively.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 5000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 33,
          [backpackItems.EMOTION_SHARD]: 33,
          [backpackItems.WILLPOWER_SHARD]: 33,
        },
      },
    },
  },
  [heldItemIdEnum.FOCUS_BAND]: {
    name: "Focus Band",
    emoji: "<:focusband:1342654744526716938>",
    description:
      "The first time the user would take fatal damage, instead survive with 1 HP and gain a 1 HP shield for 1 turn.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 75,
          [backpackItems.EMOTION_SHARD]: 100,
          [backpackItems.WILLPOWER_SHARD]: 25,
        },
      },
    },
  },
  [heldItemIdEnum.LUCKY_EGG]: {
    name: "Lucky Egg",
    emoji: "<:luckyegg:1343335844433498144>",
    description:
      "Increases the experience in Battle earned by the Pokemon holding this item by 100%.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 5000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 33,
          [backpackItems.EMOTION_SHARD]: 33,
          [backpackItems.WILLPOWER_SHARD]: 33,
        },
      },
    },
  },
  [heldItemIdEnum.LEFTOVERS]: {
    name: "Leftovers",
    emoji: emojis.LEFTOVERS,
    description: "Restores 10% of the user's HP at the end of its turn.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 50,
          [backpackItems.EMOTION_SHARD]: 100,
        },
      },
    },
  },
  [heldItemIdEnum.WIDE_LENS]: {
    name: "Wide Lens",
    emoji: "<:widelens:1342655292982169662>",
    description: "Increases the user's accuracy by 10%.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 5000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 30,
          [backpackItems.WILLPOWER_SHARD]: 70,
        },
      },
    },
  },
  [heldItemIdEnum.LIFE_ORB]: {
    name: "Life Orb",
    emoji: "<:lifeorb:1342654745906774046>",
    description:
      "Increases the power of the user's moves by 30%, but damages the user by 10% of its max HP after each damaging move.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.EMOTION_SHARD]: 100,
          [backpackItems.WILLPOWER_SHARD]: 100,
        },
      },
    },
  },
  [heldItemIdEnum.POWER_HERB]: {
    name: "Power Herb",
    emoji: "<:powerherb:1343334633424551956>",
    description: "Allows the user to use two-turn moves in one turn.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 15,
          [backpackItems.EMOTION_SHARD]: 120,
          [backpackItems.WILLPOWER_SHARD]: 15,
        },
      },
    },
  },
  [heldItemIdEnum.FOCUS_SASH]: {
    name: "Focus Sash",
    emoji: "<:focussash:1342654744526716938>",
    description:
      "The first time taking fatal damage from full health, the user instead survives with 1 HP and gains invulnerability to direct damage for 1 turn.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 50,
          [backpackItems.EMOTION_SHARD]: 100,
        },
      },
    },
  },
  [heldItemIdEnum.CHOICE_SCARF]: {
    name: "Choice Scarf",
    emoji: "<:choicescarf:1336571392480514069>",
    description:
      "Increases the user's Speed by 100. Whenver the user uses a non-basic move, disable its other non-basic moves until a basic move is used.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 50,
          [backpackItems.WILLPOWER_SHARD]: 150,
        },
      },
    },
  },
  [heldItemIdEnum.CHOICE_SPECS]: {
    name: "Choice Specs",
    emoji: "<:choicespecs:1336571393458049107>",
    description:
      "Increases the user's Special Attack by 50%. Whenver the user uses a non-basic move, disable its other non-basic moves until a basic move is used.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 150,
          [backpackItems.EMOTION_SHARD]: 50,
        },
      },
    },
  },
  [heldItemIdEnum.EVIOLITE]: {
    name: "Eviolite",
    emoji: "<:eviolite:1342652890451546172>",
    description:
      "Increases the user's Defense and Special Defense by 50% if it is an unevolved Pokemon.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 30,
          [backpackItems.EMOTION_SHARD]: 70,
          [backpackItems.WILLPOWER_SHARD]: 100,
        },
      },
    },
  },
  [heldItemIdEnum.HEAVY_DUTY_BOOTS]: {
    name: "Heavy-Duty Boots",
    emoji: "<:heavydutyboots:1342656422562758707>",
    description:
      "Prevents the user from taking damage from hazards like Stealth Rock.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 40,
          [backpackItems.EMOTION_SHARD]: 70,
          [backpackItems.WILLPOWER_SHARD]: 40,
        },
      },
    },
  },
  [heldItemIdEnum.TOXIC_ORB]: {
    name: "Toxic Orb",
    emoji: "<:toxicorb:1342654749169811506>",
    description: "Badly poisons the user at the end of their turn.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.EMOTION_SHARD]: 75,
          [backpackItems.WILLPOWER_SHARD]: 75,
        },
      },
    },
  },
  [heldItemIdEnum.FLAME_ORB]: {
    name: "Flame Orb",
    emoji: "<:flameorb:1342654741846429778>",
    description: "Burns the user at the end of their turn.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 75,
          [backpackItems.EMOTION_SHARD]: 75,
        },
      },
    },
  },
  [heldItemIdEnum.EJECT_BUTTON]: {
    name: "Eject Button",
    emoji: "<:ejectbutton:1358643223655874690>",
    description:
      "The first time the user takes damage, consume this item to boost the adjacent ally with the lowest combat readiness to max.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 125,
          [backpackItems.EMOTION_SHARD]: 50,
          [backpackItems.WILLPOWER_SHARD]: 25,
        },
      },
    },
  },
  [heldItemIdEnum.ROCKY_HELMET]: {
    name: "Rocky Helmet",
    emoji: "<:rockyhelmet:1342654748070772746>",
    description:
      "When the user is hit by a damaging move, the move user takes 5% of its max HP as damage.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 100,
          [backpackItems.EMOTION_SHARD]: 25,
          [backpackItems.WILLPOWER_SHARD]: 25,
        },
      },
    },
  },
  [heldItemIdEnum.CUSTAP_BERRY]: {
    name: "Custap Berry",
    emoji: "<:custapberry:1358678114938519662>",
    description:
      "When the user drops to 30% or less of its max HP, consume this item to boost the user's combat readiness to 100.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 7500,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 50,
          [backpackItems.EMOTION_SHARD]: 100,
        },
      },
    },
  },
  [heldItemIdEnum.SHELL_BELL]: {
    name: "Shell Bell",
    emoji: "<:shellbell:1358678116150542518>",
    description: "When the user deals damage, heal 10% of the damage dealt.",
    category: backpackCategories.HELD_ITEMS,
    cost: {
      money: 10000,
      backpack: {
        [backpackCategories.MATERIALS]: {
          [backpackItems.KNOWLEDGE_SHARD]: 50,
          [backpackItems.WILLPOWER_SHARD]: 150,
        },
      },
    },
  },
};

const craftableItemConfig = Object.freeze({
  ...backpackHeldItemConfig,
});

/** @typedef {Keys<craftableItemConfig>} CraftableItemEnum */

const backpackItemConfig = Object.freeze({
  ...backpackItemConfigRaw,
  ...craftableItemConfig,
});

module.exports = {
  backpackCategories,
  backpackItems,
  backpackCategoryConfig,
  backpackItemConfig,
  craftableItemConfig,
  backpackHeldItemConfig,
};
