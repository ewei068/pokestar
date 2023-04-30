const { types } = require("./pokemonConfig");

const battleEventNames = {
    BATTLE_BEGIN: "battleStart",
    TURN_END: "turnEnd",
    TURN_BEGIN: "turnBegin",
}

const damageTypes = {
    PHYSICAL: "Physical",
    SPECIAL: "Special",
    OTHER: "Other",
}

const moveTiers = {
    BASIC: "Basic",
    POWER: "Power",
    ULTIMATE: "Ultimate",
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

        adv = typeAdvantages[moveType][targetPokemon.type2];
        if (adv !== undefined) {
            mult *= adv;
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
    const missMult = miss ? 0.7 : 1;
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

    const damage = Math.floor((((2 * level / 5 + 2) * power * attack / defense) / 50 + 2) * stab * type * random * missMult);

    return Math.max(damage, 1);
};

const targetTypes = {
    ALLY: "Ally",
    ENEMY: "Enemy",
    ANY: "Any",
};
const targetPositions = {
    SELF: "Self",
    NON_SELF: "Non-self",
    ANY: "Any",
    FRONT: "Front",
    BACK: "Back",
}
const targetPatterns = {
    SINGLE: "Single",
    ALL: "All",
    ALL_EXCEPT_SELF: "All-except-self",
    ROW: "Row",
    COLUMN: "Column",
    RANDOM: "Random",
    SQUARE: "Square",
    CROSS: "Cross",
};

// TODO: is it worth having classes for these?

const effectTypes = {
    BUFF: "Buff",
    DEBUFF: "Debuff",
    NEUTRAL: "Neutral",
};
const effectConfig = {
    "loseFlying": {
        "name": "No Flying Type",
        "description": "The target loses its Flying type.",
        "type": effectTypes.NEUTRAL,
        "effectAdd": function(battle, target) {
            battle.addToLog(`${target.name} lost its Flying type!`);
            // if pure flying, change to pure normal
            if (target.type1 === types.FLYING && target.type2 === null) {
                target.type1 = types.NORMAL;
                return {
                    "typeSlot": "type1",
                }
            // else
            } else if (target.type1 === types.FLYING) {
                target.type1 = null;
                return {
                    "typeSlot": "type1",
                }
            } else if (target.type2 === types.FLYING && target.type1 === null) {
                target.type2 = types.NORMAL;
                return {
                    "typeSlot": "type2",
                }
            } else if (target.type2 === types.FLYING) {
                target.type2 = null;
                return {
                    "typeSlot": "type2",
                }
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} regained its Flying type!`);
            if (args.typeSlot)
                target[args.typeSlot] = types.FLYING;
        },
    },
}

const moveConfig = {
    "m17": {
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
    "m38": {
        "name": "Double Edge",
        "type": types.NORMAL,
        "power": 120,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "A reckless, life-risking tackle. This also damages the user quite a lot.",
    },
    "m355": {
        "name": "Roost",
        "type": types.FLYING,
        "power": 0,
        "accuracy": null,
        "cooldown": 4,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user lands and rests its body, removing its Flying type for one turn. It restores the user's HP by up to half of its max HP.",
    },
    "m369": {
        "name": "U-Turn",
        "type": types.BUG,
        "power": 70,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "After making its attack, the user rushes back, boosting a random party Pokemon's combat readiness to max.",
    },
};

const moveExecutes = {
    "m17": function (battle, source, primaryTargets, allTargets, missedTargets) {
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveConfig["m17"], source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveConfig["m17"]
            });
        }
    },
    "m38": function (battle, source, primaryTargets, allTargets, missedTargets) {
        let damageDealt = 0;
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveConfig["m38"], source, target, missedTargets.includes(target));
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveConfig["m38"]
            });
        }
        // recoil damage to self
        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.floor(damageDealt / 3);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m355": function (battle, source, primaryTargets, allTargets) {
        for (const target of allTargets) {
            source.giveHeal(Math.min(Math.floor(target.maxHp / 2), target.maxHp - target.hp), target, {
                type: "move",
                ...moveConfig["m355"]
            });
        }

        // lose flying type
        source.addEffect("loseFlying", 2, source);
    },
    "m369": function (battle, source, primaryTargets, allTargets, missedTargets) {
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveConfig["m369"], source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveConfig["m369"]
            });
        }

        // boost random non-self party pokemon cr to 100
        const party = battle.parties[source.teamName].pokemons;
        const pokemons = Object.values(party).filter(p => p !== null && !p.isFainted && p !== source);
        if (pokemons.length > 0) {
            const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
            pokemon.boostCombatReadiness(source, 100);
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
    getTypeDamageMultiplier,
    effectConfig,
    effectTypes,
};