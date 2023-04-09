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
        "default": {},
    },
}

const levelConfig = {
    1: {
        "exp": 0,
    },
    2: {
        "exp": 100,
    },
    3: {
        "exp": 200,
    },
    4: {
        "exp": 300,
    },
    5: {
        "exp": 400,
    },
    6: {
        "exp": 500,
    },
    7: {
        "exp": 600,
    },
    8: {
        "exp": 700,
    },
    9: {
        "exp": 800,
    },
    10: {
        "exp": 900,
    }
}

module.exports = { 
    trainerFields, 
    levelConfig 
};