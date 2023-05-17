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
    },
    "lastShopPurchase": {
        "type": "number",
        "default": (new Date(0)).getTime(),
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
    "votes": {
        "type": "number",
        "default": 0,
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
            "money": 750,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    12: {
        "rewards": {
            "money": 750,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    13: {
        "rewards": {
            "money": 750,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    14: {
        "rewards": {
            "money": 750,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                }
            }
        }
    },
    15: {
        "rewards": {
            "money": 3000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.MASTERBALL]: 3,
                }
            }
        }
    },
    16: {
        "rewards": {
            "money": 1000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    17: {
        "rewards": {
            "money": 1000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    18: {
        "rewards": {
            "money": 1000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    19: {
        "rewards": {
            "money": 1000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    20: {
        "rewards": {
            "money": 5000,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.ULTRABALL]: 5,
                    [backpackItems.MASTERBALL]: 3,
                }
            }
        }
    },
    21: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    22: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    23: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    24: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    25: {
        "rewards": {
            "money": 7500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.ULTRABALL]: 5,
                    [backpackItems.MASTERBALL]: 5,
                }
            }
        }
    },
    26: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    27: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    28: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    29: {
        "rewards": {
            "money": 1500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.POKEBALL]: 2,
                    [backpackItems.GREATBALL]: 2,
                    [backpackItems.ULTRABALL]: 1,
                },
            }
        }
    },
    30: {
        "rewards": {
            "money": 7500,
            "backpack": {
                [backpackCategories.POKEBALLS]: {
                    [backpackItems.ULTRABALL]: 5,
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

module.exports = { 
    trainerFields, 
    getTrainerLevelExp,
    MAX_TRAINER_LEVEL,
    MAX_POKEMON,
    MAX_RELEASE,
    levelConfig,
    expMultiplier
};