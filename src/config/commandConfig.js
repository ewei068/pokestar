const { stageNames, stageConfig } = require('./stageConfig');

const prefix = stageConfig[process.env.STAGE].prefix;

// TODO: re-order commands and categories
// TODO: add long descriptions
const commandCategoryConfig = {
    "trainer": {
        "name": "Trainer",
        "description": "Commands involving your trainer",
        "folder": "trainer",
        "commands": ["trainerinfo", "daily", "backpack", "levelrewards", "locations"]
    },
    "pokemon": {
        "name": "Pokemon",
        "description": "Commands to catch, train, and inspect Pokemon",
        "folder": "pokemon",
        "commands": ["gacha", "info", "list", "train", "evolve", "release"]
    },
    "shop": {
        "name": "Shop",
        "description": "Browse the shop and buy items",
        "folder": "shop",
        "commands": ["pokemart", "buy"]
    },
    "social": {
        "name": "Social",
        "description": "Social commands",
        "folder": "social",
        "commands": ["leaderboard"]
    },
    "help": {
        "name": "Help",
        "description": "Help commands",
        "folder": "help",
        "commands": ["help"]
    },
    "heartbeat": {
        "name": "Heartbeat",
        "description": "Basic heartbeat commands; intended for testing",
        "folder": "heartbeat",
        "commands": ["ping", "echo"]
    },
}

const commandConfig = {
    "ping": {
        "name": "Ping",
        "aliases": ["ping"],
        "description": "Ping!",
        "execute": "ping.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD]
    },
    "echo": {
        "name": "Echo",
        "aliases": ["echo"],
        "description": "echoes message",
        "execute": "echo.js",
        "args": {
            "message": {
                "type": "string",
                "description": "message to echo",
                "optional": true,
                "variable": true
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD]
    },
    "help": {
        "name": "Help",
        "aliases": ["help", "h"],
        "description": "Help with command usage",
        "longDescription": "Help with command usage. If no command is specified, shows an interactive embed to browse commands. If a command is specified, shows usage information for that command.",
        "execute": "help.js",
        "args": {
            "command": {
                "type": "string",
                "description": "command to get help with",
                "optional": true,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD]
    },
    "trainerinfo": {
        "name": "Trainer Info",
        "aliases": ["trainerinfo", "trainer", "ti", "userinfo", "user"],
        "description": "Get information about your trainer",
        "longDescription": "Displays your trainer card with information such as number of Pokemon, Pokedollars, and level progress.",
        "execute": "trainerInfo.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 0
    },
    "backpack": {
        "name": "Backpack",
        "aliases": ["backpack", "bp"],
        "description": "Get info about your backpack items",
        "execute": "backpack.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "locations": {
        "name": "Locations",
        "aliases": ["locations"],
        "description": "Get info about the locations you own",
        "longDescription": "Displays a list of locations you own and the levels of each location.",
        "execute": "locations.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "daily": {
        "name": "Daily",
        "aliases": ["daily", "d"],
        "description": "Get your daily rewards",
        "longDescription": "Get your daily rewards, including Pokedollars and Pokeballs. You can get your daily rewards once every 24 hours, resetting at 00:00 UTC.",
        "execute": "daily.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 50
    },
    "levelrewards": {
        "name": "Level Rewards",
        "aliases": ["levelrewards"],
        "description": "Claim your level rewards",
        "longDescription": "Claim your level rewards, including Pokedollars and Pokeballs. You can claim your level rewards once every level, starting at level 2.",
        "execute": "levelRewards.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 0
    },
    "gacha": {
        "name": "Gacha",
        "aliases": ["gacha", "g", "roll", "draw"],
        "description": "Roll the gacha",
        "longDescription": "Roll the gacha to get a random Pokemon. You can use different Pokeballs to increase your chances of getting a rare Pokemon. Get Pokeballs at the `/pokemart`, daily rewards, or level rewards.",
        "execute": "gacha.js",
        "args": {
            "pokeball": {
                "type": "string",
                "description": "pokeball to use",
                "optional": false,
                "variable": false,
                "enum": [
                    "pokeball", "greatball", "ultraball", "masterball",
                ]
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 20
    },
    "list": {
        "name": "List",
        "aliases": ["list", "listpokemon", "lp"],
        "description": "List your Pokemon",
        "execute": "list.js",
        "longDescription": `List your Pokemon. For more complicated functionality, you can filter and sort the list.
        For example, you can filter for Pokemon named 'Pikachu' by using \`${prefix}list 1 name Pikachu\`
        If using message commands and you want to sort but not filter, pass 'none' as the \`filterby\` argument.
        For example, you can sort by combat power by using \`${prefix}list 1 none none combatPower\``,
        "args": {
            "page": {
                "type": "int",
                "description": "page number",
                "optional": true,
                "variable": false
            },
            "filterby": {
                "type": "string",
                "description": "category to filter on",
                "optional": true,
                "variable": false,
                "enum": [
                    "shiny", "name", "rarity", "none"
                ]
            },
            "filtervalue": {
                "type": "string",
                "description": "value to filter for",
                "optional": true,
                "variable": false
            },
            "sortby": {
                "type": "string",
                "description": "category to sort by",
                "optional": true,
                "variable": false,
                "enum": [
                    "name", "ivTotal", "combatPower", "level", "dateAcquired"
                ]
            },
            "descending": {
                "type": "bool",
                "description": "sort descending",
                "optional": true,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 10,
        "money": 10
    },
    "info": {
        "name": "Info",
        "aliases": ["info", "i", "pokemoninfo", "pi"],
        "description": "Get detailed info about a Pokemon",
        "longDescription": "Display info about a Pokemon, including its stats, EVs/IVs, and level progress.",
        "execute": "info.js",
        "args": {
            "pokemonid": {
                "type": "string",
                "description": "unique ID for pokemon",
                "optional": false,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 10,
        "money": 10
    },
    "release": {
        "name": "Release",
        "aliases": ["release"],
        "description": "Release up to 10 Pokemon",
        "longDescription": "Release up to 10 Pokemon. You will get Pokedollars for each Pokemon you release based on their rarity.",
        "execute": "release.js",
        "args": {
            "pokemonids": {
                "type": "string",
                "description": "List of unique IDs for pokemon to release, separated by spaces",
                "optional": false,
                "variable": true
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 0
    },
    "train": {
        "name": "Train",
        "aliases": ["train", "t"],
        "description": "Train a Pokemon",
        "longDescription": "Train a Pokemon to increase its level or EVs. If a location is specified, you will get more EVs but less EXP. Level up your locations to increase their EV and EXP bonuses.",
        "execute": "train.js",
        "args": {
            "pokemonid": {
                "type": "string",
                "description": "unique ID for Pokemon to train",
                "optional": false,
                "variable": false
            },
            "location": {
                "type": "string",
                "description": "location to train at; defaults to home",
                "optional": true,
                "variable": false,
                "enum": [
                    "home", "restaurant", "gym", "dojo", "temple", "school", "track"
                ]
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 15,
        "money": 25
    },
    "evolve": {
        "name": "Evolve",
        "aliases": ["evolve"],
        "description": "Evolve a Pokemon",
        "longDescription": "Evolve a Pokemon. You must meet the requirements to evolve said Pokemon. Once done, a list of possible evolutions will be displayed. You can then choose which evolution you want.",
        "execute": "evolve.js",
        "args": {
            "pokemonid": {
                "type": "string",
                "description": "unique ID for Pokemon to evolve",
                "optional": false,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 0,
    },
    "pokemart": {
        "name": "Pokemart",
        "aliases": ["pokemart", "pm", "shop"],
        "description": "Get info about the items in stock at the Pokemart",
        "execute": "pokemart.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5
    },
    "buy": {
        "name": "Buy",
        "aliases": ["buy", "b"],
        "description": "Buy an item from the Pokemart",
        "longDescription": "Buy an item from the Pokemart. You can buy up to 10 items at a time. Certain items may also have daily limits, reset at midnight UTC.",
        "execute": "buy.js",
        "args": {
            "itemid": {
                "type": "string",
                "description": "item to buy",
                "optional": false,
                "variable": false
            },
            "quantity": {
                "type": "int",
                "description": "quantity to buy",
                "optional": true,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 15,
    },
    "leaderboard": {
        "name": "Leaderboard",
        "aliases": ["leaderboard", "rankings"],
        "description": "Get the leaderboard",
        "execute": "leaderboard.js",
        "args": {
            "category": {
                "type": "string",
                "description": "category to get the leaderboard for",
                "optional": false,
                "variable": false,
                "enum": [
                    "level", "worth", "shiny", "power"
                ]
            },
            "scope": {
                "type": "string",
                "description": "scope to get the leaderboard for",
                "optional": true,
                "variable": false,
                "enum": [
                    "global", "server"
                ]
            },
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
}

module.exports = { 
    commandCategoryConfig,
    commandConfig,
};