const backpackCategories = {
  POKEBALLS: "0",
  MATERIALS: "1",
  CONSUMABLES: "2",
};

const backpackItems = {
  POKEBALL: "0",
  GREATBALL: "1",
  ULTRABALL: "2",
  MASTERBALL: "3",
  KNOWLEDGE_SHARD: "4",
  EMOTION_SHARD: "5",
  WILLPOWER_SHARD: "6",
  MINT: "7",
  RAID_PASS: "8",
};

const backpackCategoryConfig = {
  [backpackCategories.POKEBALLS]: {
    name: "Pokeballs",
    emoji: "<:pokeball:1100296136931156008>",
    description:
      "Used to catch Pokemon! Use `/help gacha` command to learn more!",
    items: [
      backpackItems.POKEBALL,
      backpackItems.GREATBALL,
      backpackItems.ULTRABALL,
      backpackItems.MASTERBALL,
    ],
  },
  [backpackCategories.MATERIALS]: {
    name: "Materials",
    emoji: "<:materials:1112557472759160852>",
    description: "Used to upgrade Pokemon and equipment!",
    items: [
      backpackItems.KNOWLEDGE_SHARD,
      backpackItems.EMOTION_SHARD,
      backpackItems.WILLPOWER_SHARD,
      backpackItems.MINT,
    ],
  },
  [backpackCategories.CONSUMABLES]: {
    name: "Consumables",
    emoji: "<:raidpass:1150161526297206824>",
    description: "One-time use items for various purposes!",
    items: [backpackItems.RAID_PASS],
  },
};

const backpackItemConfig = {
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
  [backpackItems.RAID_PASS]: {
    name: "Raid Pass",
    emoji: "<:raidpass:1150161526297206824>",
    description: "Used to start a raid!",
    category: backpackCategories.CONSUMABLES,
  },
};

module.exports = {
  backpackCategories,
  backpackItems,
  backpackCategoryConfig,
  backpackItemConfig,
};
