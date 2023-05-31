const { backpackItems } = require("./backpackConfig")

const shopCategories = {
    GACHA: "0",
    LOCATIONS: "1",
    MATERIALS: "2",
}

const shopItems = {
    RANDOM_POKEBALL: "0",
    HOME: "1",
    RESTAURANT: "2",
    GYM: "3",
    DOJO: "4",
    TEMPLE: "5",
    SCHOOL: "6",
    TRACK: "7",
    KNOWLEDGE_SHARD: "8",
    EMOTION_SHARD: "9",
    WILLPOWER_SHARD: "10",
}
    

// training locations
// exp: home
// hp: restaurant
// atk: gym
// def: dojo
// spa: temple
// spd: school
// spe: track

const shopCategoryConfig = {
    [shopCategories.GACHA]: {
        "name": "Gacha",
        "emoji": "<:pokeball:1100296136931156008>",
        "description": "Used to catch Pokemon! Use the \`/help gacha\` command to learn more!",
        "items": [
            shopItems.RANDOM_POKEBALL,
        ]
    },
    [shopCategories.LOCATIONS]: {
        "name": "Locations",
        "emoji": "🏠",
        "description": "Used to train your Pokemon! Use the \`/help train\` command to learn more!",
        // TODO: is there a better way to do this?
        "items": [
            shopItems.HOME,
            shopItems.RESTAURANT,
            shopItems.GYM,
            shopItems.DOJO,
            shopItems.TEMPLE,
            shopItems.SCHOOL,
            shopItems.TRACK,
        ]        
    },
    [shopCategories.MATERIALS]: {
        "name": "Materials",
        "emoji": "<:materials:1112557472759160852>",
        "description": "Used to upgrade equipment!",
        "items": [
            shopItems.KNOWLEDGE_SHARD,
            shopItems.EMOTION_SHARD,
            shopItems.WILLPOWER_SHARD,
        ]
    },
}

const shopItemConfig = {
    [shopItems.RANDOM_POKEBALL]: {
        "name": "Random Pokeball",
        "emoji": "<:pokeball:1100296136931156008>",
        "description": "Gain a random Pokeball used to catch Pokemon! Use the \`/help gacha\` command to learn more! Limit 5 per day.",
        "category": shopCategories.GACHA,
        "price": [200],
        "limit": 5,
    },
    [shopItems.HOME]: {
        "name": "Home",
        "emoji": "🏠",
        "description": "Train your Pokemon to gain EXP! Higher level = more EXP! Use the \`/help train\` command to learn more!",
        "category": shopCategories.LOCATIONS,
        "price": [1000, 5000, 25000],
    },
    [shopItems.RESTAURANT]: {
        "name": "Restaurant",
        "emoji": "🍔",
        "description": "Train your Pokemon to gain HP! Higher level = more HP! Use the \`/help train\` command to learn more!",
        "category": shopCategories.LOCATIONS,
        "price": [1000, 5000, 25000],
    },
    [shopItems.GYM]: {
        "name": "Gym",
        "emoji": "🏋️",
        "description": "Train your Pokemon to gain ATK! Higher level = more ATK! Use the \`/help train\` command to learn more!",
        "category": shopCategories.LOCATIONS,
        "price": [1000, 5000, 25000],
    },
    [shopItems.DOJO]: {
        "name": "Dojo",
        "emoji": "🥋",
        "description": "Train your Pokemon to gain DEF! Higher level = more DEF! Use the \`/help train\` command to learn more!",
        "category": shopCategories.LOCATIONS,
        "price": [1000, 5000, 25000],
    },
    [shopItems.TEMPLE]: {
        "name": "Temple",
        "emoji": "🛕",
        "description": "Train your Pokemon to gain SPA! Higher level = more SPA! Use the \`/help train\` command to learn more!",
        "category": shopCategories.LOCATIONS,
        "price": [1000, 5000, 25000],
    },
    [shopItems.SCHOOL]: {
        "name": "School",
        "emoji": "🏫",
        "description": "Train your Pokemon to gain SPD! Higher level = more SPD! Use the \`/help train\` command to learn more!",
        "category": shopCategories.LOCATIONS,
        "price": [1000, 5000, 25000],
    },
    [shopItems.TRACK]: {
        "name": "Track",
        "emoji": "🏃",
        "description": "Train your Pokemon to gain SPE! Higher level = more SPE! Use the \`/help train\` command to learn more!",
        "category": shopCategories.LOCATIONS,
        "price": [1000, 5000, 25000],
    },
    [shopItems.KNOWLEDGE_SHARD]: {
        "name": "Knowledge Shard",
        "emoji": "<:knowledgeshard:1112557606637162537>",
        "description": "Used to upgrade equipment!",
        "category": shopCategories.MATERIALS,
        "price": [250],
        "limit": 10,
        "backpackItem": backpackItems.KNOWLEDGE_SHARD,
    },
    [shopItems.EMOTION_SHARD]: {
        "name": "Emotion Shard",
        "emoji": "<:emotionshard:1112557605517275147>",
        "description": "Used to upgrade equipment!",
        "category": shopCategories.MATERIALS,
        "price": [250],
        "limit": 10,
        "backpackItem": backpackItems.EMOTION_SHARD,
    },
    [shopItems.WILLPOWER_SHARD]: {
        "name": "Willpower Shard",
        "emoji": "<:willpowershard:1112557603617259540>",
        "description": "Used to upgrade attack equipment!",
        "category": shopCategories.MATERIALS,
        "price": [250],
        "limit": 10,
        "backpackItem": backpackItems.WILLPOWER_SHARD,
    },
}

module.exports = {
    shopCategories,
    shopItems,
    shopCategoryConfig,
    shopItemConfig,
}

