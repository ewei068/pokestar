const { stageNames } = require('./stageConfig');

// TODO: re-order commands and categories
// TODO: add long descriptions
const commandConfig = {
    "heartbeat": {
        "description": "Basic heartbeat commands",
        "folder": "heartbeat",
        "commands": {
            "ping": {
                "aliases": ["ping"],
                "description": "Ping!",
                "execute": "ping.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD]
            },
            "echo": {
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
            }
        }
    },
    "help": {
        "description": "Help commands",
        "folder": "help",
        "commands": {
            "help": {
                "aliases": ["help", "h"],
                "description": "Help with command usage",
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
            }
        }
    },
    "trainer": {
        "description": "Trainer commands",
        "folder": "trainer",
        "commands": {
            "trainerinfo": {
                "aliases": ["trainerinfo", "trainer", "ti", "userinfo", "user"],
                "description": "Get info about a trainer",
                "execute": "trainerInfo.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 0
            },
            "backpack": {
                "aliases": ["backpack", "bp"],
                "description": "Get info about your backpack items",
                "execute": "backpack.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 5,
                "money": 10
            },
            "locations": {
                "aliases": ["locations"],
                "description": "Get info about the locations you own",
                "execute": "locations.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 5,
                "money": 10
            },
            "daily": {
                "aliases": ["daily", "d"],
                "description": "Get your daily reward",
                "execute": "daily.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 50
            },
            "levelrewards": {
                "aliases": ["levelrewards"],
                "description": "Get your level rewards",
                "execute": "levelRewards.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 0
            },
        }
    },
    "pokemon": {
        "description": "Pokemon commands",
        "folder": "pokemon",
        "commands": {
            "gacha": {
                "aliases": ["gacha", "g", "roll", "draw"],
                "description": "Roll the gacha",
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
                "aliases": ["list", "listpokemon", "lp"],
                "description": "List your pokemon",
                "execute": "list.js",
                "args": {
                    "page": {
                        "type": "int",
                        "description": "page number",
                        "optional": true,
                        "variable": false
                    },
                    "filterby": {
                        "type": "string",
                        "description": "category to filter by",
                        "optional": true,
                        "variable": false,
                        "enum": [
                            "shiny", "name", "rarity", "none"
                        ]
                    },
                    "filtervalue": {
                        "type": "string",
                        "description": "value to filter by",
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
                "aliases": ["info", "i", "pokemoninfo", "pi"],
                "description": "Get info about a pokemon",
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
                "aliases": ["release"],
                "description": "Release up to 10 pokemon",
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
                "aliases": ["train", "t"],
                "description": "Train a pokemon",
                "execute": "train.js",
                "args": {
                    "pokemonid": {
                        "type": "string",
                        "description": "unique ID for pokemon to train",
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
                "aliases": ["evolve"],
                "description": "Evolve a pokemon",
                "execute": "evolve.js",
                "args": {
                    "pokemonid": {
                        "type": "string",
                        "description": "unique ID for pokemon to evolve",
                        "optional": false,
                        "variable": false
                    }
                },
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 0,
            },
        }
    },
    "shop": {
        "description": "Shop commands",
        "folder": "shop",
        "commands": {
            "pokemart": {
                "aliases": ["pokemart", "pm", "shop"],
                "description": "Get info about the items in stock at the Pokemart",
                "execute": "pokemart.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 5
            },
            "buy": {
                "aliases": ["buy", "b"],
                "description": "Buy an item from the Pokemart",
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
        }
    },
    "social": {
        "description": "Social commands",
        "folder": "social",
        "commands": {
            "leaderboard": {
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
    },
}

module.exports = { 
    commandConfig
};