const backpackCategories = {
    POKEBALLS: '0',
}

const backpackItems = {
    POKEBALL: '0',
    GREATBALL: '1',
    ULTRABALL: '2',
    MASTERBALL: '3',
}

const backpackCategoryConfig = {
    [backpackCategories.POKEBALLS]: {
        "name": "Pokeballs",
        "emoji": "🎾",
        "description": "Used to catch Pokemon! Use \`/help gacha\` command to learn more!",
        "items": [
            backpackItems.POKEBALL,
            backpackItems.GREATBALL,
            backpackItems.ULTRABALL,
            backpackItems.MASTERBALL
        ]
    }
}

const backpackItemConfig = {
    [backpackItems.POKEBALL]: {
        "name": "Pokeball",
        "emoji": "🎾",
        "description": "Used to catch Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
    [backpackItems.GREATBALL]: {
        "name": "Greatball",
        "emoji": "🎾",
        "description": "Used to catch better Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
    [backpackItems.ULTRABALL]: {
        "name": "Ultraball",
        "emoji": "🎾",
        "description": "Used to catch top-tier Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
    [backpackItems.MASTERBALL]: {
        "name": "Masterball",
        "emoji": "🎾",
        "description": "Used to catch the best Pokemon! Use the \`gacha\` command to learn more!",
        "category": backpackCategories.POKEBALLS,
    },
}

module.exports = {
    backpackCategories,
    backpackItems,
    backpackCategoryConfig,
    backpackItemConfig,
}
