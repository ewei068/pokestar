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
        "commands": ["gacha", "info", "list", "pokedex", "train", "evolve", "equipment", "nature", "release", "mew"]
    },
    "shop": {
        "name": "Shop",
        "description": "Browse the shop and buy items",
        "folder": "shop",
        "commands": ["pokemart", "buy"]
    },
    "battle": {
        "name": "Battle",
        "description": "Battle commands",
        "folder": "battle",
        "commands": ["pvp", "pve", "dungeons", "partyinfo", "partyadd", "partyremove", "partyauto", "parties", "partyload"]
    },
    "social": {
        "name": "Social",
        "description": "Social commands",
        "folder": "social",
        "commands": ["vote", "tradeadd", "leaderboard", "invite"]
    },
    "help": {
        "name": "Help",
        "description": "Help commands",
        "folder": "help",
        "commands": ["help", "tutorial", "events", "changelog"]
    },
    "heartbeat": {
        "name": "Heartbeat",
        "description": "Basic heartbeat commands; intended for testing",
        "folder": "heartbeat",
        "commands": ["ping", "echo", "give", "test"]
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
        "stages": [stageNames.ALPHA, stageNames.BETA]
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
        "aliases": ["trainerinfo", "trainer", "ti", "profile", "user"],
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
    "vote": {
        "name": "Vote",
        "aliases": ["vote", "v"],
        "description": "Vote for the bot and claim rewards!",
        "longDescription": "Vote for the bot and claim rewards, ₽200 and 2 Pokeballs per-vote! You can vote on every site once every 12 hours.",
        "execute": "vote.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
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
        "longDescription": "Roll the gacha to get a random Pokemon. You can use different Pokeballs to increase your chances of getting a rare Pokemon. For more information, use this command and press the \"Info\" button. Get Pokeballs at the `/pokemart`, daily rewards, or level rewards.",
        "execute": "gacha.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "list": {
        "name": "List",
        "aliases": ["list", "listpokemon", "lp"],
        "description": "List your Pokemon",
        "execute": "list.js",
        "longDescription": `List your Pokemon. For more complicated functionality, you can filter and sort the list.
        For example, you can filter for Pokemon named 'Pikachu' by using \`/list 1 name Pikachu\`
        If using message commands and you want to sort but not filter, pass 'none' as the \`filterby\` argument.
        For example, you can sort by combat power by using \`${prefix} list 1 none none combatPower\``,
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
                    "shiny", "name", "rarity", "locked", "none"
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
                    "name", "ivTotal", "combatPower", "level", "dateAcquired", "pokedexOrder"
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
        "money": 25
    },
    "info": {
        "name": "Info",
        "aliases": ["info", "i", "pokemoninfo", "pi"],
        "description": "Get detailed info about a Pokemon",
        "longDescription": "Display info about a Pokemon, including its stats, EVs/IVs, and level progress.",
        "execute": "info.js",
        "args": {
            "name_or_id": {
                "type": "string",
                "description": "unique ID or name for pokemon",
                "optional": false,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 10,
        "money": 25
    },
    "pokedex": {
        "name": "Pokedex",
        "aliases": ["pokedex", "dex"],
        "description": "Get info about a Pokemon species",
        "longDescription": "Browse all information about a Pokedex species, including its general information, base stats, and moves. Specify a species to skip to that species.",
        "execute": "pokedex.js",
        "args": {
            "species": {
                "type": "string",
                "description": "species name OR id number",
                "optional": true,
                "variable": true
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
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
                    "home", "restaurant", "gym", "dojo", "temple", "school", "track", "berryBush", "berryFarm"
                ]
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 15,
        "money": 50
    },
    "evolve": {
        "name": "Evolve",
        "aliases": ["evolve"],
        "description": "Evolve a Pokemon",
        "longDescription": "Evolve a Pokemon. You must meet the requirements to evolve said Pokemon. Once done, a list of possible evolutions will be displayed. You can then choose which evolution you want.",
        "execute": "evolve.js",
        "args": {
            "name_or_id": {
                "type": "string",
                "description": "unique ID or name for Pokemon to evolve",
                "optional": false,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 0,
    },
    "equipment": {
        "name": "Equipment",
        "aliases": ["equipment", "equip", "eq"],
        "description": "Manage a Pokemon's equipment",
        "longDescription": "Manage a Pokemon's equipment, upgrade it, and modify its stats.",
        "execute": "equipment.js",
        "args": {
            "name_or_id": {
                "type": "string",
                "description": "unique ID for Pokemon to manage equipment for",
                "optional": false,
                "variable": false
            },
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 0,
    },
    "nature": {
        "name": "Nature",
        "aliases": ["nature"],
        "description": "Spend a mint to change a Pokemon's nature",
        "longDescription": "Spend a mint to change a Pokemon's nature. Mints can be earned daily from `/pve palmer`.",
        "execute": "nature.js",
        "args": {
            "name_or_id": {
                "type": "string",
                "description": "unique ID or name for Pokemon to change nature for",
                "optional": false,
                "variable": false
            },
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10,
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
                "description": "item ID to buy",
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
    "tradeadd": {
        "name": "Trade Add",
        "aliases": ["tradeadd", "ta"],
        "description": "Add a Pokemon or money to your trade offer",
        "longDescription": "Add a Pokemon or money to your trade offer. You can only add Pokemon that are not currently in a trade, in parties, or locked.",
        "execute": "tradeAdd.js",
        "args": {
            "option": {
                "type": "string",
                "description": "option (money, Pokemon name, or Pokemon ID) to add",
                "optional": false,
                "variable": false,
            },
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10,
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
    "pvp": {
        "name": "PvP",
        "aliases": ["pvp", "battle"],
        "description": "Battle another player",
        "longDescription": "Initiates a battle in the channel. Another player may choose to accept the battle. If opponent is specified, only the opponent may accept the battle. If level is specified, all Pokemon will be scaled to that level.",
        "execute": "pvp.js",
        "args": {
            "opponent": {
                "type": "user",
                "description": "@mention an opponent to battle",
                "optional": true,
                "variable": false
            },
            "level": {
                "type": "int",
                "description": "level to battle at",
                "optional": true,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "pve": {
        "name": "PvE",
        "aliases": ["pve", "battleai"],
        "description": "Battle an AI",
        "longDescription": "Browse a list of NPC trainers to battle! Specify an NPC and difficulty to directly battle them.",
        "execute": "pve.js",
        "args": {
            "npcid": {
                "type": "string",
                "description": "NPC ID to battle",
                "optional": true,
                "variable": false,
                "enum": [
                    "bugCatcher", "youngster", "lass", "fisherman", "hiker", "aromaLady", "dragonTamer", "aceTrainer", 
                    "blue", "red", "gold", "palmer", "teamRocket", "goldRush"
                ]
            },
            "difficulty": {
                "type": "string",
                "description": "difficulty to battle at",
                "optional": true,
                "variable": false,
                "enum": [
                    "veryEasy", "easy", "medium", "hard", "veryHard"
                ]
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "dungeons": {
        "name": "Dungeons",
        "aliases": ["dungeons", "dungeon"],
        "description": "Browse a list of dungeons",
        "longDescription": "Browse a list of dungeons, defeat them to get equipment upgrade materials!",
        "execute": "dungeons.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "partyinfo": {
        "name": "Party Info",
        "aliases": ["partyinfo", "party"],
        "description": "Get info about your party",
        "execute": "partyInfo.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "partyadd": {
        "name": "Party Add",
        "aliases": ["partyadd", "pa"],
        "description": "Add a Pokemon to your party",
        "longDescription": "Add a Pokemon to your party at a specified position. If the Pokemon is in the party already, swaps with another Pokemon. If the position is full, removes the Pokemon at that position first.",
        "execute": "partyAdd.js",
        "args": {
            "name_or_id": {
                "type": "string",
                "description": "unique ID or name for Pokemon to add to party",
                "optional": false,
                "variable": false
            },
            "position": {
                "type": "int",
                "description": "position (1-12) to add Pokemon to",
                "optional": false,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "partyremove": {
        "name": "Party Remove",
        "aliases": ["partyremove", "pr"],
        "description": "Remove a Pokemon from your party",
        "longDescription": `Remove Pokemon(s) from your party depending on \`option\`:
        If \`option\` is a number, attempts to remove a Pokemon at that position.
        If \`option\` is a Pokemon ID, attempts to remove Pokemon with that ID.
        If \`option\` is ALL, removes all Pokemon from your party.`,
        "execute": "partyRemove.js",
        "args": {
            "option": {
                "type": "string",
                "description": "option (<position> or <pokemonid> or ALL) to remove Pokemon by",
                "optional": false,
                "variable": false,
            },
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "partyauto": {
        "name": "Party Auto",
        "aliases": ["partyauto", "pauto"],
        "description": "Automatically fill your party with Pokemon",
        "longDescription": "Automatically fill your party with Pokemon. NOTE: Removes all current party Pokemon from the party.",
        "execute": "partyAuto.js",
        "args": {
            "option": {
                "type": "string",
                "description": "option to fill party based on",
                "optional": true,
                "variable": false,
                "enum": [
                    "combatPower", "ivTotal", "level"
                ]
            },
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "parties": {
        "name": "Parties",
        "aliases": ["parties"],
        "description": "Browse a list of your parties",
        "longDescription": "Browse a list of your parties. Parties are saved presets of Pokemon that can be loaded into your party.",
        "execute": "parties.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "partyload": {
        "name": "Party Load",
        "aliases": ["partyload", "pl"],
        "description": "Load a party from a preset",
        "longDescription": "Load a party from a preset. This swaps the current active party with the party preset.",
        "execute": "partyLoad.js",
        "args": {
            "preset": {
                "type": "int",
                "description": "preset number (1-9) to load",
                "optional": false,
                "variable": false,
                "enum": [1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "mew": {
        "name": "Mew",
        "aliases": ["mew"],
        "description": "View and modify your Mew!",
        "longDescription": "View and modify your Mew! Mew is a special Pokemon that can be customized to your liking.",
        "execute": "mew.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
        "exp": 5,
        "money": 10
    },
    "tutorial": {
        "name": "Tutorial",
        "aliases": ["tutorial"],
        "description": "Get a tutorial on how to play",
        "execute": "tutorial.js",
        "args": {
            "page": {
                "type": "int",
                "description": "tutorial page number to view",
                "optional": true,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "events": {
        "name": "Events",
        "aliases": ["events"],
        "description": "View all the events!",
        "execute": "events.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "changelog": {
        "name": "Changelog",
        "aliases": ["changelog"],
        "description": "View all the update changes!",
        "execute": "changelog.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "invite": {
        "name": "Invite",
        "aliases": ["invite"],
        "description": "Invite the bot to your server",
        "execute": "invite.js",
        "args": {},
        "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    },
    "give": {
        "name": "Give",
        "aliases": ["give"],
        "description": "Give a Pokemon to self",
        "longDescription": "Give a Pokemon to self.",
        "execute": "give.js",
        "args": {
            "pokemonid": {
                "type": "string",
                "description": "unique ID for Pokemon to give to self",
                "optional": false,
                "variable": false
            },
            "level": {
                "type": "int",
                "description": "level to give Pokemon at",
                "optional": true,
                "variable": false
            },
            "equipmentlevel": {
                "type": "int",
                "description": "equipment level to give Pokemon at",
                "optional": true,
                "variable": false
            }
        },
        "stages": [stageNames.ALPHA],
        "exp": 0,
        "money": 0
    },
    "test": {
        "name": "Test",
        "aliases": ["test"],
        "description": "Test command",
        "execute": "test.js",
        "args": {
            "arg1": {
                "type": "string",
                "description": "arg1",
                "optional": true,
                "variable": true
            },
        },
        "stages": [stageNames.ALPHA],
    },
}

module.exports = { 
    commandCategoryConfig,
    commandConfig,
};