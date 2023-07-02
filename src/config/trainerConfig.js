/*
"trainer": {
    userId
    user
    level
    money
    lastDaily (date)
    backpack
}
*/

const { backpackCategories, backpackItems } = require('./backpackConfig');
const { bannerTypes } = require('./gachaConfig');
const { stageNames } = require('./stageConfig');

const MAX_TRAINER_LEVEL = 100;
const MAX_POKEMON = 500;
const MAX_RELEASE = 10;

const trainerFields = {
    "userId": {
        "type": "string",
    },
    "user": {
        "type": "object",
    },
    "level": {
        "type": "number",
        "default": 1,
    },
    "exp": {
        "type": "number",
        "default": 0,
    },
    "money": {
        "type": "number",
        "default": 1000,
    },
    "lastDaily": {
        "type": "number",
        "default": (new Date(0)).getTime(),
    },
    "claimedDaily": {
        "type": "boolean",
        "default": false,
        "daily": true,
    },
    "backpack": {
        "type": "object",
        "default": {
            [backpackCategories.POKEBALLS]: {
                [backpackItems.POKEBALL]: 10,
                [backpackItems.GREATBALL]: 5,
                [backpackItems.ULTRABALL]: 3,
                [backpackItems.MASTERBALL]: 1,
            }
        },
    },
    "claimedLevelRewards": {
        "type": "array",
        "default": [],
    },
    "purchasedShopItemsToday": {
        "type": "object",
        "default": {},
        "daily": true,
    },
    "locations": {
        "type": "object",
        "default": {},
    },
    "party": {
        "type": "object",
        "default": {
            "pokemonIds": [
                null, null, null, null, 
                null, null, null, null, 
                null, null, null, null,
            ],
            "rows": 3,
            "cols": 4,
        },
    },
    "savedParties": {
        "type": "object",
        "default": {
            "1": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "2": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "3": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "4": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "5": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "6": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "7": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "8": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
            "9": {
                "pokemonIds": [
                    null, null, null, null,
                    null, null, null, null,
                    null, null, null, null,
                ],
                "rows": 3,
                "cols": 4,
            },
        },    
    },
    "beginnerRolls": {
        "type": "number",
        "default": 0,
    },
    "banners": {
        "type": "object",
        "default": {
            [bannerTypes.STANDARD]: {
                "pity": 0,
            },
            [bannerTypes.ROTATING]: {
                "pity": 0,
            },
            [bannerTypes.SPECIAL]: {
                "pity": 0,
            },
        },
    },
    "defeatedNPCsToday": {
        "type": "object",
        "default": {},
        "daily": true,
    },
    "defeatedNPCs": {
        "type": "object",
        "default": {},
    },
    "voting": {
        "type": "object",
        "default": {
            "lastVoted": (new Date(0)).getTime(),
            "streak": 0,
            "rewards": 0,
        },
    }
}

const levelConfig = {
    1: {
        "rewards": {
            "backpack": {}
        }
    },
    2: {
        "rewards": {
            "money": 200,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                }
            }
        }
    },
    3: {
        "rewards": {
            "money": 300,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.GREATBALL]: 5,
                }
            }
        }
    },
    4: {
        "rewards": {
            "money": 400,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.ULTRABALL]: 3,
                }
            }
        }
    },
    5: {
        "rewards": {
            "money": 1000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    6: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    7: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    8: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    9: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    10: {
        "rewards": {
            "money": 2000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.MASTERBALL]: 3,
                }
            }
        }
    },
    11: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    12: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    13: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    14: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    15: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    16: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    17: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    18: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    19: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    20: {
        "rewards": {
            "money": 2000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 3,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    21: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    22: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    23: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    24: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    25: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    26: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    27: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    28: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    29: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    30: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    31: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    32: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    33: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    34: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    35: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    36: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    37: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    38: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    39: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    40: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    41: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    42: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    43: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    44: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    45: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    46: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    47: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    48: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    49: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    50: {
        "rewards": {
            "money": 5000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 10,
                    [backpackItems.GREATBALL]: 5,
                    [backpackItems.ULTRABALL]: 3,
                    [backpackItems.MASTERBALL]: 3,
                }
            }
        }
    },
    51: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    52: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    53: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    54: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    55: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    56: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    57: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    58: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    59: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    60: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    61: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    62: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    63: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    64: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    65: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    66: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    67: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    68: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    69: {
        "rewards": {
            "money": 6969,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    70: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    71: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    72: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    73: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    74: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    75: {
        "rewards": {
            "money": 7500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 10,
                    [backpackItems.GREATBALL]: 5,
                    [backpackItems.ULTRABALL]: 3,
                    [backpackItems.MASTERBALL]: 3,
                }
            }
        }
    },
    76: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    77: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    78: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    79: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    80: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    81: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    82: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    83: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    84: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    85: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    86: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    87: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    88: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    89: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    90: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    91: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    92: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    93: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    94: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    95: {
        "rewards": {
            "money": 2500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 5,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                    [backpackItems.MASTERBALL]: 1,
                }
            }
        }
    },
    96: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    97: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    98: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    99: {
        "rewards": {
            "money": 500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 1,
                }
            }
        }
    },
    100: {
        "rewards": {
            "money": 100000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 100,
                    [backpackItems.GREATBALL]: 10,
                    [backpackItems.ULTRABALL]: 10,
                    [backpackItems.MASTERBALL]: 5,
                }
            }
        }
    },
}

// TODO: move?
// level 1: 0 exp, level 2: 100 exp, level 3: 300 exp, level 4: 600 exp, level 5: 1000 exp etc...
const getTrainerLevelExp = (level) => {
    return 50 * (level ** 2 - level);
}

const expMultiplier = (level) => {
    // 3 * x ^ (1/2)
    return 3 * (Math.pow(level, 1/2));
}

// TEMP: gen 2 event
const NUM_DAILY_REWARDS = (process.env.STAGE === stageNames.ALPHA ? 100 : 3) * 2;
const NUM_DAILY_SHARDS = process.env.STAGE === stageNames.ALPHA ? 100 : 5;

module.exports = { 
    trainerFields, 
    getTrainerLevelExp,
    MAX_TRAINER_LEVEL,
    MAX_POKEMON,
    MAX_RELEASE,
    levelConfig,
    expMultiplier,
    NUM_DAILY_REWARDS,
    NUM_DAILY_SHARDS,
};