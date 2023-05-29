const backpackCategories = {
    POKEBALLS: '0',
    MATERIALS: '1',
}

const backpackItems = {
    POKEBALL: '0',
    GREATBALL: '1',
    ULTRABALL: '2',
    MASTERBALL: '3',
    KNOWLEDGE_SHARD: '4',
    EMOTION_SHARD: '5',
    WILLPOWER_SHARD: '6',
}

const backpackCategoryConfig = {
    [backpackCategories.POKEBALLS]: {
        "name": "Pokeballs",
        "emoji": "<:pokeball:1100296136931156008>",
        "description": "Used to catch Pokemon! Use \`/help gacha\` command to learn more!",
        "items": [
            backpackItems.POKEBALL,
            backpackItems.GREATBALL,
            backpackItems.ULTRABALL,
            backpackItems.MASTERBALL
        ]
    }, 
    [backpackCategories.MATERIALS]: {
        "name": "Materials",
        // TODO: change
        "emoji": "<:pokeball:1100296136931156008>",
        "description": "Used to upgrade equipment!",
        "items": [
            backpackItems.KNOWLEDGE_SHARD,
            backpackItems.EMOTION_SHARD,
            backpackItems.WILLPOWER_SHARD,
        ]
    },
}

const backpackItemConfig = {
    [backpackItems.POKEBALL]: {
        "name": "Pokeball",
        "emoji": "<:pokeball:1100296136931156008>",
        "description": "Used to catch Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
    [backpackItems.GREATBALL]: {
        "name": "Greatball",
        "emoji": "<:greatball:1100296107759779840>",
        "description": "Used to catch better Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
    [backpackItems.ULTRABALL]: {
        "name": "Ultraball",
        "emoji": "<:ultraball:1100296166555521035>",
        "description": "Used to catch top-tier Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
    [backpackItems.MASTERBALL]: {
        "name": "Masterball",
        "emoji": "<:masterball:1100296005041262612>",
        "description": "Used to catch the best Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
    [backpackItems.KNOWLEDGE_SHARD]: {
        "name": "Knowledge Shard",
        "emoji": "<:knowledge_shard:1100296057998333440>",
        "description": "Used to upgrade equipment!",
        "category": backpackCategories.MATERIALS,
    },
    [backpackItems.EMOTION_SHARD]: {
        "name": "Emotion Shard",
        "emoji": "<:emotion_shard:1100296079734010880>",
        "description": "Used to upgrade equipment!",
        "category": backpackCategories.MATERIALS,
    },
    [backpackItems.WILLPOWER_SHARD]: {
        "name": "Willpower Shard",
        "emoji": "<:willpower_shard:1100296099734010880>",
        "description": "Used to upgrade equipment!",
        "category": backpackCategories.MATERIALS,
    },
}

module.exports = {
    backpackCategories,
    backpackItems,
    backpackCategoryConfig,
    backpackItemConfig,
}
