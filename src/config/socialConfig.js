const { collectionNames } = require("./databaseConfig");

const leaderboardConfig = {
    "level": {
        "name": "Trainer Level",
        "collection": collectionNames.USERS,
        "label": ["level"],
    },
    "worth": {
        "name": "Total Pokemon Worth",
        "collection": collectionNames.POKEMON_AND_USERS,
        "label": ["pokemon", "totalWorth"],
    },
    "shiny": {
        "name": "Total Shiny Pokemon",
        "collection": collectionNames.POKEMON_AND_USERS,
        "label": ["pokemon", "totalShiny"],
    },
    "power": {
        "name": "Total Power",
        "collection": collectionNames.POKEMON_AND_USERS,
        "label": ["pokemon", "totalPower"],
    }
}

module.exports = {
    leaderboardConfig
}