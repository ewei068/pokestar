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

const MAX_TRAINER_LEVEL = 25;
const MAX_POKEMON = 200;
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
                [backpackItems.GREATBALL]: 0,
                [backpackItems.ULTRABALL]: 0,
                [backpackItems.MASTERBALL]: 0
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
    }
}

// TODO: move?
// level 1: 0 exp, level 2: 100 exp, level 3: 300 exp, level 4: 600 exp, level 5: 1000 exp etc...
const getTrainerLevelExp = (level) => {
    return 50 * (level ** 2 - level);
}

const expMultiplier = (level) => {
    // 4 * x ^ (2/3)
    return 4 * (Math.pow(level, 2/3));
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