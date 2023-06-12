const locations = {
    HOME: "0",
    RESTAURANT: "1",
    GYM: "2",
    DOJO: "3",
    TEMPLE: "4",
    SCHOOL: "5",
    TRACK: "6",
    BERRY_BUSH: "7",
    BERRY_FARM: "8",
}

const locationConfig = {
    [locations.HOME]: {
        "name": "Home",
        "emoji": "🏠",
        "description": "Used to train your Pokemon's EXP! Higher level = more EXP!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 4,
                "evs": [0, 0, 0, 0, 0, 0],
            },
            2: {
                "exp": 7,
                "evs": [0, 0, 0, 0, 0, 0],
            },
            3: {
                "exp": 10,
                "evs": [0, 0, 0, 0, 0, 0],
            },
        }
    },
    [locations.RESTAURANT]: {
        "name": "Restaurant",
        "emoji": "🍽️",
        "description": "Used to train your Pokemon's HP! Higher level = more HP!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 3,
                "evs": [4, 0, 0, 0, 0, 0],
            },
            2: {
                "exp": 4.5,
                "evs": [8, 0, 0, 0, 0, 0],
            },
            3: {
                "exp": 6,
                "evs": [12, 0, 0, 0, 0, 0],
            },
        }
    },
    [locations.GYM]: {
        "name": "Gym",
        "emoji": "🏋️",
        "description": "Used to train your Pokemon's ATK! Higher level = more ATK!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 3,
                "evs": [0, 4, 0, 0, 0, 0],
            },
            2: {
                "exp": 4.5,
                "evs": [0, 8, 0, 0, 0, 0],
            },
            3: {
                "exp": 6,
                "evs": [0, 12, 0, 0, 0, 0],
            },
        }
    },
    [locations.DOJO]: {
        "name": "Dojo",
        "emoji": "🥋",
        "description": "Used to train your Pokemon's DEF! Higher level = more DEF!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 3,
                "evs": [0, 0, 4, 0, 0, 0],
            },
            2: {
                "exp": 4.5,
                "evs": [0, 0, 8, 0, 0, 0],
            },
            3: {
                "exp": 6,
                "evs": [0, 0, 12, 0, 0, 0],
            },
        }
    },
    [locations.TEMPLE]: {
        "name": "Temple",
        "emoji": "🛕",
        "description": "Used to train your Pokemon's SPA! Higher level = more SPA!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 3,
                "evs": [0, 0, 0, 4, 0, 0],
            },
            2: {
                "exp": 4.5,
                "evs": [0, 0, 0, 8, 0, 0],
            },
            3: {
                "exp": 6,
                "evs": [0, 0, 0, 12, 0, 0],
            },
        }
    },
    [locations.SCHOOL]: {
        "name": "School",
        "emoji": "🏫",
        "description": "Used to train your Pokemon's SPD! Higher level = more SPD!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 3,
                "evs": [0, 0, 0, 0, 4, 0],
            },
            2: {
                "exp": 4.5,
                "evs": [0, 0, 0, 0, 8, 0],
            },
            3: {
                "exp": 6,
                "evs": [0, 0, 0, 0, 12, 0],
            },
        }
    },
    [locations.TRACK]: {
        "name": "Track",
        "emoji": "🏁",
        "description": "Used to train your Pokemon's SPE! Higher level = more SPE!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 3,
                "evs": [0, 0, 0, 0, 0, 4],
            },
            2: {
                "exp": 4.5,
                "evs": [0, 0, 0, 0, 0, 8],
            },
            3: {
                "exp": 6,
                "evs": [0, 0, 0, 0, 0, 12],
            },
        }
    },
    [locations.BERRY_BUSH]: {
        "name": "Berry Bush",
        "emoji": "🌳",
        "description": "Used to fine-tune your Pokemon's EVs! Reduces all EVs by 1!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 5,
                "evs": [-1, -1, -1, -1, -1, -1],
            },
        }
    },
    [locations.BERRY_FARM]: {
        "name": "Berry Farm",
        "emoji": "🚜",
        "description": "Used to reset your Pokemon's EVs! Reduces all EVs by 10!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 10,
                "evs": [-10, -10, -10, -10, -10, -10],
            },
        }
    },
}

module.exports = {
    locations: locations,
    locationConfig,
}
