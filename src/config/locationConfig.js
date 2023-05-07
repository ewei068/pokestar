const locations = {
    HOME: "0",
    RESTAURANT: "1",
    GYM: "2",
    DOJO: "3",
    TEMPLE: "4",
    SCHOOL: "5",
    TRACK: "6",
}

const locationConfig = {
    [locations.HOME]: {
        "name": "Home",
        "emoji": "🏠",
        "description": "Used to train your Pokemon's EXP! Higher level = more EXP!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 2,
                "evs": [0, 0, 0, 0, 0, 0],
            },
            2: {
                "exp": 3,
                "evs": [0, 0, 0, 0, 0, 0],
            },
            3: {
                "exp": 4,
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
                "exp": 1,
                "evs": [2, 0, 0, 0, 0, 0],
            },
            2: {
                "exp": 1.5,
                "evs": [4, 0, 0, 0, 0, 0],
            },
            3: {
                "exp": 2,
                "evs": [6, 0, 0, 0, 0, 0],
            },
        }
    },
    [locations.GYM]: {
        "name": "Gym",
        "emoji": "🏋️",
        "description": "Used to train your Pokemon's ATK! Higher level = more ATK!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 1,
                "evs": [0, 2, 0, 0, 0, 0],
            },
            2: {
                "exp": 1.5,
                "evs": [0, 4, 0, 0, 0, 0],
            },
            3: {
                "exp": 2,
                "evs": [0, 6, 0, 0, 0, 0],
            },
        }
    },
    [locations.DOJO]: {
        "name": "Dojo",
        "emoji": "🥋",
        "description": "Used to train your Pokemon's DEF! Higher level = more DEF!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 1,
                "evs": [0, 0, 2, 0, 0, 0],
            },
            2: {
                "exp": 1.5,
                "evs": [0, 0, 4, 0, 0, 0],
            },
            3: {
                "exp": 2,
                "evs": [0, 0, 6, 0, 0, 0],
            },
        }
    },
    [locations.TEMPLE]: {
        "name": "Temple",
        "emoji": "🛕",
        "description": "Used to train your Pokemon's SPA! Higher level = more SPA!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 1,
                "evs": [0, 0, 0, 2, 0, 0],
            },
            2: {
                "exp": 1.5,
                "evs": [0, 0, 0, 4, 0, 0],
            },
            3: {
                "exp": 2,
                "evs": [0, 0, 0, 6, 0, 0],
            },
        }
    },
    [locations.SCHOOL]: {
        "name": "School",
        "emoji": "🏫",
        "description": "Used to train your Pokemon's SPD! Higher level = more SPD!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 1,
                "evs": [0, 0, 0, 0, 2, 0],
            },
            2: {
                "exp": 1.5,
                "evs": [0, 0, 0, 0, 4, 0],
            },
            3: {
                "exp": 2,
                "evs": [0, 0, 0, 0, 6, 0],
            },
        }
    },
    [locations.TRACK]: {
        "name": "Track",
        "emoji": "🏁",
        "description": "Used to train your Pokemon's SPE! Higher level = more SPE!\nUse the \`/help train\` command to learn more!",
        "levelConfig": {
            1: {
                "exp": 1,
                "evs": [0, 0, 0, 0, 0, 2],
            },
            2: {
                "exp": 1.5,
                "evs": [0, 0, 0, 0, 0, 4],
            },
            3: {
                "exp": 2,
                "evs": [0, 0, 0, 0, 0, 6],
            },
        }
    },
}

module.exports = {
    locations: locations,
    locationConfig,
}
