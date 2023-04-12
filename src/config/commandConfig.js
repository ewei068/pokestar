const { stageNames } = require('./stageConfig');

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
                "exp": 10
            },
            "backpack": {
                "aliases": ["backpack", "bp"],
                "description": "Get info about your backpack items",
                "execute": "backpack.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 10
            },
            "daily": {
                "aliases": ["daily", "d"],
                "description": "Get your daily reward",
                "execute": "daily.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 10
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
                    }
                },
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
                "exp": 10
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
                "exp": 10
            },
        }
    },
}

module.exports = { 
    commandConfig
};