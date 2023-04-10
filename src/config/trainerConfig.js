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
        "default": 0,
    },
    "lastDaily": {
        "type": "number",
        "default": (new Date(0)).getTime(),
    },
    "backpack": {
        "type": "object",
        "default": {
            [backpackCategories.POKEBALLS] : {
                [backpackItems.POKEBALL] : 10,
                [backpackItems.GREATBALL] : 0,
                [backpackItems.ULTRABALL] : 0,
                [backpackItems.MASTERBALL] : 0
            }
        },
    },
}

// level 1: 0 exp, level 2: 100 exp, level 3: 300 exp, level 4: 600 exp, level 5: 1000 exp etc...
const getTrainerLevelExp = (level) => {
    return 50 * (level ** 2 - level);
}
const MAX_TRAINER_LEVEL = 10;


module.exports = { 
    trainerFields, 
    getTrainerLevelExp: getTrainerLevelExp,
    MAX_TRAINER_LEVEL,
};