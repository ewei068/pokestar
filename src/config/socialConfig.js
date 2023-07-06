const { collectionNames } = require("./databaseConfig");

const INVITE_URL = "https://discord.com/api/oauth2/authorize?client_id=1093411444877439066&permissions=517610982464&scope=bot%20applications.commands";

const voteConfig = [
    {
        "label": "Top.gg",
        "url": "https://top.gg/bot/1093411444877439066/vote"
    },
    {
        "label": "DBL",
        "url": "https://discordbotlist.com/bots/pokestar/upvote"
    },
    /* {
        "label": "Botlist",
        "url": "https://botlist.me/bots/1093411444877439066"
    }, */
]

const getVoteMultiplier = (streak) => {
    if (streak < 5) {
        return 1;
    } else if (streak < 15) {
        return 2;
    } else if (streak < 30) {
        return 3;
    } else if (streak < 50) {
        return 4;
    } else {
        return 5;
    }
}

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

const MAX_TRADE_POKEMON = 3;
const MAX_TRADE_MONEY = 3000;

module.exports = {
    leaderboardConfig,
    INVITE_URL,
    voteConfig,
    getVoteMultiplier,
    MAX_TRADE_POKEMON,
    MAX_TRADE_MONEY,
}