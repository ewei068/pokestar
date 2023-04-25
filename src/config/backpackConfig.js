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
        "emoji": "<:pokeball:1100296136931156008>",
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
}

module.exports = {
    backpackCategories,
    backpackItems,
    backpackCategoryConfig,
    backpackItemConfig,
}
