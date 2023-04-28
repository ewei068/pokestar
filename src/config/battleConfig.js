const { types } = require("./pokemonConfig");

const battleEventNames = {
    BATTLE_BEGIN: "battleStart",
    TURN_END: "turnEnd",
    TURN_BEGIN: "turnBegin",
}

const damageTypes = {
    PHYSICAL: "physical",
    SPECIAL: "special",
}

const moveTiers = {
    BASIC: "basic",
    POWERFUL: "powerful",
    ULTIMATE: "ultimate",
}
// create pokemon type advantage matrix
/*

 

normal = {'rock': .5, 'ghost': 0, 'steel': .5}
fire = {'fire': .5, 'water': .5, 'grass': 2, 'ice': 2, 'bug': 2, 'rock': .5, 'dragon': .5, 'steel': 2}
water = {'fire': 2, 'water': .5, 'grass': .5, 'ground': 2, 'rock': 2, 'dragon': .5}
electric = {'water': 2, 'electric': .5, 'grass': .5, 'ground': 0, 'flying': 2, 'dragon': .5}
grass = {'fire': .5, 'water': 2, 'grass': .5, 'poison': .5, 'ground': 2, 'flying': .5, 'bug': .5, 'rock': 2, 'dragon': .5, 'steel': .5}
ice = {'fire': .5, 'water': .5, 'grass': 2, 'ice': .5, 'ground': 2, 'flying': 2, 'dragon': 2, 'steel': .5}
fighting = {'normal': 2, 'ice': 2, 'poison': .5, 'flying': .5, 'psychic': .5, 'bug': .5, 'rock': 2, 'ghost': 0, 'dark': 2, 'steel': 2, 'fairy': .5}
poison = {'grass': 2, 'poison': .5, 'ground': .5, 'rock': .5, 'ghost': .5, 'steel': 0, 'fairy': 2}
ground = {'fire': 2, 'electric': 2, 'grass': .5, 'poison': 2, 'flying': 0, 'bug': .5, 'rock': 2, 'steel': 2}
flying = {'electric': .5, 'grass': 2, 'fighting': 2, 'bug': 2, 'rock': .5, 'steel': .5}
psychic = {'fighting': 2, 'poison': 2, 'psychic': .5, 'dark': 0, 'steel': .5}
bug = {'fire': .5, 'grass': 2, 'fighting': .5, 'poison': .5, 'flying': .5, 'psychic': 2, 'ghost': .5, 'dark': 2, 'steel': .5, 'fairy': .5}
rock = {'fire': 2, 'ice': 2, 'fighting': .5, 'ground': .5, 'flying': 2, 'bug': 2, 'steel': .5}
ghost = {'normal': 0, 'psychic': 2, 'ghost': 2, 'dark': .5}
dragon = {'dragon': 2, 'steel': .5, 'fairy': 0}
dark = {'fighting': .5, 'psychic': 2, 'ghost': 2, 'dark': .5, 'fairy': .5}
steel = {'fire': .5, 'water': .5, 'electric': .5, 'ice': 2, 'rock': 2, 'steel': .5, 'fairy': 2}
fairy = {'fire': .5, 'fighting': 2, 'poison': .5, 'dragon': 2, 'dark': 2, 'steel': .5}
*/
const typeAdvantages = {
    [types.NORMAL]: { [types.ROCK]: 0.5, [types.GHOST]: 0, [types.STEEL]: 0.5 },
    [types.FIRE]: { [types.FIRE]: 0.5, [types.WATER]: 0.5, [types.GRASS]: 2, [types.ICE]: 2, [types.BUG]: 2, [types.ROCK]: 0.5, [types.DRAGON]: 0.5, [types.STEEL]: 2 },
    [types.WATER]: { [types.FIRE]: 2, [types.WATER]: 0.5, [types.GRASS]: 0.5, [types.GROUND]: 2, [types.ROCK]: 2, [types.DRAGON]: 0.5 },
    [types.ELECTRIC]: { [types.WATER]: 2, [types.ELECTRIC]: 0.5, [types.GRASS]: 0.5, [types.GROUND]: 0, [types.FLYING]: 2, [types.DRAGON]: 0.5 },
    [types.GRASS]: { [types.FIRE]: 0.5, [types.WATER]: 2, [types.GRASS]: 0.5, [types.POISON]: 0.5, [types.GROUND]: 2, [types.FLYING]: 0.5, [types.BUG]: 0.5, [types.ROCK]: 2, [types.DRAGON]: 0.5, [types.STEEL]: 0.5 },
    [types.ICE]: { [types.FIRE]: 0.5, [types.WATER]: 0.5, [types.GRASS]: 2, [types.ICE]: 0.5, [types.GROUND]: 2, [types.FLYING]: 2, [types.DRAGON]: 2, [types.STEEL]: 0.5 },
    [types.FIGHTING]: { [types.NORMAL]: 2, [types.ICE]: 2, [types.POISON]: 0.5, [types.FLYING]: 0.5, [types.PSYCHIC]: 0.5, [types.BUG]: 0.5, [types.ROCK]: 2, [types.GHOST]: 0, [types.DARK]: 2, [types.STEEL]: 2, [types.FAIRY]: 0.5 },
    [types.POISON]: { [types.GRASS]: 2, [types.POISON]: 0.5, [types.GROUND]: 0.5, [types.ROCK]: 0.5, [types.GHOST]: 0.5, [types.STEEL]: 0, [types.FAIRY]: 2 },
    [types.GROUND]: { [types.FIRE]: 2, [types.ELECTRIC]: 2, [types.GRASS]: 0.5, [types.POISON]: 2, [types.FLYING]: 0, [types.BUG]: 0.5, [types.ROCK]: 2, [types.STEEL]: 2 },
    [types.FLYING]: { [types.ELECTRIC]: 0.5, [types.GRASS]: 2, [types.FIGHTING]: 2, [types.BUG]: 2, [types.ROCK]: 0.5, [types.STEEL]: 0.5 },
    [types.PSYCHIC]: { [types.FIGHTING]: 2, [types.POISON]: 2, [types.PSYCHIC]: 0.5, [types.DARK]: 0, [types.STEEL]: 0.5 },
    [types.BUG]: { [types.FIRE]: 0.5, [types.GRASS]: 2, [types.FIGHTING]: 0.5, [types.POISON]: 0.5, [types.FLYING]: 0.5, [types.PSYCHIC]: 2, [types.GHOST]: 0.5, [types.DARK]: 2, [types.STEEL]: 0.5, [types.FAIRY]: 0.5 },
    [types.ROCK]: { [types.FIRE]: 2, [types.ICE]: 2, [types.FIGHTING]: 0.5, [types.GROUND]: 0.5, [types.FLYING]: 2, [types.BUG]: 2, [types.STEEL]: 0.5 },
    [types.GHOST]: { [types.NORMAL]: 0, [types.PSYCHIC]: 2, [types.GHOST]: 2, [types.DARK]: 0.5 },
    [types.DRAGON]: { [types.DRAGON]: 2, [types.STEEL]: 0.5, [types.FAIRY]: 0 },
    [types.DARK]: { [types.FIGHTING]: 0.5, [types.PSYCHIC]: 2, [types.GHOST]: 2, [types.DARK]: 0.5, [types.FAIRY]: 0.5 },
    [types.STEEL]: { [types.FIRE]: 0.5, [types.WATER]: 0.5, [types.ELECTRIC]: 0.5, [types.ICE]: 2, [types.ROCK]: 2, [types.STEEL]: 0.5, [types.FAIRY]: 2 },
    [types.FAIRY]: { [types.FIRE]: 0.5, [types.FIGHTING]: 2, [types.POISON]: 0.5, [types.DRAGON]: 2, [types.DARK]: 2, [types.STEEL]: 0.5 }
};

const getTypeDamageMultiplier = (moveType, targetPokemon) => {
    let mult = 1;
    if (typeAdvantages[moveType]) {
        let adv = typeAdvantages[moveType][targetPokemon.type1];
        if (adv !== undefined) {
            mult *= adv;
        }

        if (targetPokemon.type2) {
            adv = typeAdvantages[moveType][targetPokemon.type2];
            if (adv !== undefined) {
                mult *= adv;
            }
        }
    }

    return mult;
};


const calculateDamage = (move, source, target, miss=false) => {
    // TODO: handle miss

    const power = move.power;
    const level = source.level;
    const attack = move.damageType === damageTypes.PHYSICAL ? source.atk : source.spa;
    const defense = move.damageType === damageTypes.PHYSICAL ? target.def : target.spd;
    const stab = source.type1 === move.type || source.type2 === move.type ? 1.5 : 1;
    let type = getTypeDamageMultiplier(move.type, target);
    // balance type
    if (type >= 4) {
        type = 2;
    } else if (type >= 2) {
        type = 1.5;
    } else if (type >= 1) {
        type = 1;
    } else if (type >= 0.5) {
        type = 0.75;
    } else if (type >= 0.25) {
        type = 0.5;
    } else {
        type = 0.25;
    }
    const random = Math.random() * (1 - 0.85) + 0.85;
    // TODO: burn

    /* console.log("power", power)
    console.log("level", level)
    console.log("attack", attack)
    console.log("defense", defense)
    console.log("stab", stab)
    console.log("type", type)
    console.log("random", random) */

    const damage = Math.floor((((2 * level / 5 + 2) * power * attack / defense) / 50 + 2) * stab * type * random);

    return Math.max(damage, 1);
};

const targetTypes = {
    ALLY: "ally",
    ENEMY: "enemy",
    ANY: "any",
};
const targetPositions = {
    SELF: "self",
    NON_SELF: "non-self",
    ANY: "any",
    FRONT: "front",
    BACK: "back",
}
const targetPatterns = {
    SINGLE: "single",
    ALL: "all",
    ALL_EXCEPT_SELF: "all-except-self",
    ROW: "row",
    COLUMN: "column",
    RANDOM: "random",
    SQUARE: "square",
    CROSS: "cross",
};

const moveConfig = {
    "17": {
        "name": "Wing Attack",
        "type": types.FLYING,
        "power": 35,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is struck with large, imposing wings spread wide to inflict damage.",
    },
};

const moveExecutes = {
    "17": function (battle, source, primaryTargets, allTargets) {
        // TODO: calculate miss

        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveConfig["17"], source, allTargets[0]);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveConfig["17"]
            });
        }
    }
};

module.exports = {
    battleEventNames,
    moveConfig,
    moveExecutes,
    targetTypes,
    targetPositions,
    targetPatterns,
};