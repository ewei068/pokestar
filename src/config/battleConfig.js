const { types } = require("./pokemonConfig");

const battleEventNames = {
    BATTLE_BEGIN: "battleStart",
    TURN_END: "turnEnd",
    TURN_BEGIN: "turnBegin",
    MOVE_BEGIN: "moveBegin",
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
    const burn = source.status.statusId === statusConditions.BURN && move.damageType === damageTypes.PHYSICAL ? 0.5 : 1;

    /* console.log("power", power)
    console.log("level", level)
    console.log("attack", attack)
    console.log("defense", defense)
    console.log("stab", stab)
    console.log("type", type)
    console.log("random", random) */

    const damage = Math.floor((((2 * level / 5 + 2) * power * attack / defense) / 50 + 2) * stab * type * random * burn * missMult);

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
    "defUp": {
        "name": "Def. Up",
        "description": "The target's Defense increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, target) {
            // if greaterDefUp exists on target, remove defUp and refresh greaterDefUp
            if (target.effectIds.greaterDefUp) {
                const currentDuration = target.effectIds.defUp.duration;
                delete target.effectIds.defUp;
                if (target.effectIds.greaterDefUp.duration < currentDuration) {
                    target.effectIds.greaterDefUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Defense rose!`);
                target.def += Math.floor(target.bdef * 0.5);
            }
        },
        "effectRemove": function(battle, target) {  
            battle.addToLog(`${target.name}'s Defense boost faded!`);
            target.def -= Math.floor(target.bdef * 0.5);
        },
    },
    "greaterDefUp": {
        "name": "Greater Def. Up",
        "description": "The target's Defense sharply increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, target) {
            battle.addToLog(`${target.name}'s Defense sharply rose!`);
            // if defUp exists on target, remove defUp and refresh greaterDefUp
            if (target.effectIds.defUp) {
                const currentDuration = target.effectIds.defUp.duration;
                delete target.effectIds.defUp;
                if (target.effectIds.greaterDefUp.duration < currentDuration) {
                    target.effectIds.greaterDefUp.duration = currentDuration;
                }
                target.def -= Math.floor(target.bdef * 0.5);
            }
            target.def += Math.floor(target.bdef * 0.75);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Defense boost faded!`);
            target.def -= Math.floor(target.bdef * 0.75);
        },
    },
    "speUp": {
        "name": "Spe. Up",
        "description": "The target's Speed increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, target) {
            // if greaterSpeUp exists on target, remove speUp and refresh greaterSpeUp
            if (target.effectIds.greaterSpeUp) {
                const currentDuration = target.effectIds.speUp.duration;
                delete target.effectIds.speUp;
                if (target.effectIds.greaterSpeUp.duration < currentDuration) {
                    target.effectIds.greaterSpeUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Speed rose!`);
                target.spe += Math.floor(target.bspe * 0.25);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed boost faded!`);
            target.spe -= Math.floor(target.bspe * 0.25);
        },
    },
    "greaterSpeUp": {
        "name": "Greater Spe. Up",
        "description": "The target's Speed sharply increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed sharply rose!`);
            // if speUp exists on target, remove speUp and refresh greaterSpeUp
            if (target.effectIds.speUp) {
                const currentDuration = target.effectIds.speUp.duration;
                delete target.effectIds.speUp;
                if (target.effectIds.greaterSpeUp.duration < currentDuration) {
                    target.effectIds.greaterSpeUp.duration = currentDuration;
                }
                target.spe -= Math.floor(target.bspe * 0.25);
            }
            target.spe += Math.floor(target.bspe * 0.5);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed boost faded!`);
            target.spe -= Math.floor(target.bspe * 0.5);
        },
    },
    "confused": {
        "name": "Confused",
        "description": "The target is confused.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const inflictedPokemon = initialArgs.pokemon;
                    const moveUser = args.user;
                    if (inflictedPokemon !== moveUser) {
                        return;
                    }
                    // 33% chance to hurt self
                    if (Math.random() < .33) {
                        const damage = calculateDamage({
                            "power": 40,
                            "damageType": damageTypes.PHYSICAL,
                            "type": types.UNKNOWN,
                        }, inflictedPokemon, inflictedPokemon, false);
                        battle.addToLog(`${inflictedPokemon.name} hurt itself in its confusion!`);
                        inflictedPokemon.dealDamage(damage, inflictedPokemon, {
                            "type": "confusion",
                        });
                        
                        // disable ability to use move
                        args.canUseMove = false;
                    }
                }
            }
            battle.addToLog(`${target.name} became confused!`);
            const listenerId = battle.eventHandler.registerListener(battleEventNames.MOVE_BEGIN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} snapped out of its confusion!`);
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        },
    },
    "flinched": {
        "name": "Flinched",
        "description": "The target flinched.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, target) {
            battle.addToLog(`${target.name} flinched!`);
        },
        "effectRemove": function(battle, target) {
            // nothing
        },
    },
    "loseFlying": {
        "name": "No Flying Type",
        "description": "The target loses its Flying type.",
        "type": effectTypes.NEUTRAL,
        "dispellable": true,
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
    "absorbLight": {
        "name": "Absorbing Light",
        "description": "The target absorbs light, preparing a powerful Solar Beam.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, target) {
            battle.addToLog(`${target.name} is absorbing light!`);
            // disable non-solar beam moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m76") {
                    target.disableMove(moveId, target);
                }
            }
        },
        "effectRemove": function(battle, target, args) {
            // enable non-solar beam moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m76") {
                    target.enableMove(moveId, target);
                }
            }
        }
    },
    "skyCharge": {
        "name": "Sky Charge",
        "description": "The target is charging a powerful Sky Attack.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, target) {
            battle.addToLog(`${target.name} becomes cloaked in a harsh light!`);
            // disable non-sky attack moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m143") {
                    target.disableMove(moveId, target);
                }
            }
        },
        "effectRemove": function(battle, target, args) {
            // enable non-sky attack moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m143") {
                    target.enableMove(moveId, target);
                }
            }
        }
    },
}

// unqiue status conditions
const statusConditions = {
    BURN: "Burn",
    FREEZE: "Freeze",
    PARALYSIS: "Paralysis",
    POISON: "Poison",
    SLEEP: "Sleep",
    BADLY_POISON: "Badly Poison",
};

const moveConfig = {
    "m17": {
        "name": "Wing Attack",
        "type": types.FLYING,
        "power": 45,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is struck with large, imposing wings spread wide to inflict damage.",
    },
    "m22": {
        "name": "Vine Whip",
        "type": types.GRASS,
        "power": 45,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is struck with slender, whiplike vines to inflict damage.",
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
        "description": "A reckless, life-risking tackle. This also damages the user by a third of the damage dealt.",
    },
    "m52": {
        "name": "Ember",
        "type": types.FIRE,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is attacked with small flames. This has a 10% chance to leave the target with a burn.",
    },
    "m53": {
        "name": "Flamethrower",
        "type": types.FIRE,
        "power": 75,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is scorched with an intense blast of fire. This has a 10% chance to leave targets with a burn.",
    },
    "m55": {
        "name": "Water Gun",
        "type": types.WATER,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is blasted with a forceful shot of water.",
    },
    "m56": {
        "name": "Hydro Pump",
        "type": types.WATER,
        "power": 110,
        "accuracy": 80,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The target row is blasted by a huge volume of water launched under great pressure.",
    },
    "m64": {
        "name": "Peck",
        "type": types.FLYING,
        "power": 35,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is jabbed with a sharply pointed beak or horn.",
    },
    "m76": {
        "name": "Solar Beam",
        "type": types.GRASS,
        "power": 120,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "A two-turn attack. The user gathers light, then blasts a bundled beam on the next turn.",
        "silenceIf": function(battle, pokemon) {
            return pokemon.effectIds.absorbLight === undefined;
        }
    },
    "m79": {
        "name": "Sleep Powder",
        "type": types.GRASS,
        "power": null,
        "accuracy": 75,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user scatters a big cloud of sleep-inducing dust around the target.",
    },
    "m86": {
        "name": "Thunder Wave",
        "type": types.ELECTRIC,
        "power": null,
        "accuracy": 90,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "A weak electric charge is launched at the target. This has a 100% chance to paralyze the target on hit.",
    },
    "m97": {
        "name": "Agility",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user relaxes and lightens its body to move faster. This sharply raises the user's Speed for 3 turns.",
    },
    "m143": {
        "name": "Sky Attack",
        "type": types.FLYING,
        "power": 160,
        "accuracy": 90,
        "cooldown": 6,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "A second-turn attack move. If this defeats the target, surrounding Pokemon have a 30% chance to flinch.",
        "silenceIf": function(battle, pokemon) {
            return pokemon.effectIds.skyCharge === undefined;
        }
    },
    "m188": {
        "name": "Sludge Bomb",
        "type": types.POISON,
        "power": 65,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "Unsanitary sludge is hurled at the target. This has a 30% poison the targets.",
    },
    "m215": {
        "name": "Heal Bell",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user makes a soothing bell chime to heal the status conditions of all the party Pokémon. If a condition is removed, also heals the target for 10% of their max HP.",
    },
    "m229": {
        "name": "Rapid Spin",
        "type": types.NORMAL,
        "power": 20,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "A spin attack that can also dispells debuffs from the user and adjacent allies.",
    },
    "m334": {
        "name": "Iron Defense",
        "type": types.STEEL,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user hardens its body's surface like iron, sharply raising its Defense stat for 2 turns.",
    },
    "m355": {
        "name": "Roost",
        "type": types.FLYING,
        "power": null,
        "accuracy": null,
        "cooldown": 4,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user lands and rests its body, removing its Flying type for one turn. It restores the user's HP by up to half of its max HP.",
    },
    "m366": {
        "name": "Tailwind",
        "type": types.FLYING,
        "power": null,
        "accuracy": null,
        "cooldown": 6,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user whips up a turbulent whirlwind that sharply raises the Speed of all party Pokémon for 2 turns.",
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
    "m394": {
        "name": "Flare Blitz",
        "type": types.FIRE,
        "power": 110,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user cloaks itself in fire and charges at the target, and damaging it and dealing 50% damage to surrounding targets. This also damages the user by a third of the damage dealt, and has a 10% chance to leave targets with a burn.",
    },
    "m420": {
        "name": "Ice Shard",
        "type": types.ICE,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user launches sharp icicles at the target, dealing damage and increasing its own combat readiness by 30%.",
    },
    "m435": {
        "name": "Discharge",
        "type": types.ELECTRIC,
        "power": 65,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user fires a powerful electric blast at the target, dealing damage and has a 30% chance to paralyze targets.",
    },
    "m525": {
        "name": "Dragon Tail",
        "type": types.DRAGON,
        "power": 60,
        "accuracy": 90,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.BACK,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is knocked away, reducing its combat readiness by 30%.",
    },
    "m542": {
        "name": "Hurricane",
        "type": types.FLYING,
        "power": 80,
        "accuracy": 70,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks by wrapping opponents in a fierce wind that flies up into the sky. This also has a 30% chance to leave targets confused for 2 turns.",
    }
};

const moveExecutes = {
    "m17": function (battle, source, primaryTarget, allTargets, missedTargets) {
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveConfig["m17"], source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveConfig["m17"]
            });
        }
    },
    "m22": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m22"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });
        }
    },
    "m38": function (battle, source, primaryTarget, allTargets, missedTargets) {
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
        const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m52": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m52"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });

            // 10% chance to burn
            if (!miss && Math.random() < 0.1) {
                target.applyStatus(statusConditions.BURN, source);
            }
        }
    },
    "m53": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m53"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });

            // 10% chance to burn
            if (!miss && Math.random() < 0.1) {
                target.applyStatus(statusConditions.BURN, source);
            }
        }
    },
    "m55": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m55"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });
        }
    },
    "m56": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m56"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });
        }
    },
    "m64": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m64"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });
        }
    },
    "m76": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m76"];
        // if pokemon doesnt have "abosrb light" buff, apply it
        if (source.effectIds.absorbLight === undefined) {
            source.addEffect("absorbLight", 2, source);
            // remove solar beam cd
            source.moveIds["m76"].cooldown = 0;
        } else {
            // if pokemon has "absorb light" buff, remove it and deal damage
            source.removeEffect("absorbLight");
            for (const target of allTargets) {
                const miss = missedTargets.includes(target);
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    ...moveData
                });
            }
        }
    },
    "m79": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m79"];
        for (const target of allTargets) {
            // check if target is grass type
            if (target.type1 === types.GRASS || target.type2 === types.GRASS) {
                battle.addToLog(`${target.name}'s Grass type renders it immune to spore moves!`);
                continue;
            }

            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            target.applyStatus(statusConditions.SLEEP, source);
        }
    },
    "m86": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m86"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            target.applyStatus(statusConditions.PARALYSIS, source);
        }
    },
    "m97": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m97"];
        for (const target of allTargets) {
            // apply greaterSpeUp buff
            target.addEffect("greaterSpeUp", 4, source);
        }
    },
    "m143": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m143"];
        let defeatedEnemy = false;
        // two turn move logic
        if (source.effectIds.skyCharge === undefined) {
            source.addEffect("skyCharge", 2, source);
            // remove sky attack cd
            source.moveIds["m143"].cooldown = 0;
        } else {
            source.removeEffect("skyCharge");
            for (const target of allTargets) {
                const miss = missedTargets.includes(target);
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    ...moveData
                });

                // check if target fainted
                if (target.isFainted) {
                    defeatedEnemy = true;
                }
            }
        }

        // if target fainted, 30% surrounding pokemon flinch
        if (!defeatedEnemy) {
            return;
        }
        const targetParty = battle.parties[primaryTarget.teamName];
        const targetRow = Math.floor((primaryTarget.position - 1) / targetParty.cols);
        const targetCol = (primaryTarget.position - 1) % targetParty.cols;
        const surroundingTargets = source.getPatternTargets(targetParty, targetPatterns.SQUARE, targetRow, targetCol);
        for (const target of surroundingTargets) {
            if (Math.random() < 0.3) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m188": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m188"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });

            // if not missed, 30% chance to poison
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.POISON, source);
            }
        }
    },
    "m215": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m215"];
        for (const target of allTargets) {
            // remove status conditions
            const statusRemoved = target.removeStatus();

            // if status removed, heal target 10% hp
            if (statusRemoved) {
                const healAmount = Math.floor(target.maxHp * 0.1);
                source.giveHeal(healAmount, target, {
                    type: "move",
                    moveData
                });
            }
        }
    },
    "m229": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m229"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });
        }

        // for all adjacent allies and self, dispell all debuffs
        const allyParty = battle.parties[source.teamName];
        const sourceRow = Math.floor((source.position - 1) / allyParty.cols);
        const sourceCol = (source.position - 1) % allyParty.cols;
        const allyTargets = source.getPatternTargets(allyParty, targetPatterns.CROSS, sourceRow, sourceCol);
        for (const ally of allyTargets) {
            for (const effectId of Object.keys(ally.effectIds)) {
                const effectData = effectConfig[effectId];
                if (effectData.type != effectTypes.DEBUFF) {
                    continue;
                }

                ally.dispellEffect(effectId);
            }
        }
    },
    "m334": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m334"];
        for (const target of allTargets) {
            // sharply raise special def
            target.addEffect("greaterDefUp", 3, source);
        }
    },
    "m355": function (battle, source, primaryTarget, allTargets) {
        for (const target of allTargets) {
            source.giveHeal(Math.min(Math.floor(target.maxHp / 2), target.maxHp - target.hp), target, {
                type: "move",
                ...moveConfig["m355"]
            });

            // lose flying type
            target.addEffect("loseFlying", 2, source);
        }
    },
    "m366": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m366"];
        for (const target of allTargets) {
            // grant greater spe up for 4 turns
            // grants self for 5 turns due to end-of-turn effect tick
            const turns = target === source ? 3 : 2;
            target.addEffect("greaterSpeUp", turns, source);
        }
    },
    "m369": function (battle, source, primaryTarget, allTargets, missedTargets) {
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
    },
    "m394": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m394"];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            // deal half damage if target is primary target
            damageDealt += source.dealDamage(Math.round(damageToDeal * (primaryTarget == target ? 0.5 : 1)), target, {
                type: "move",
                ...moveData
            });

            // 10% chance to burn
            if (!miss && Math.random() < 0.1) {
                target.applyStatus(statusConditions.BURN, source);
            }
        }

        // recoil damage to self
        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m420": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m420"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });
        }

        // boost self cr by 30
        source.boostCombatReadiness(source, 30);
    },
    "m435": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m435"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });

            // 30% chance to paralyze
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }
    },
    "m525": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m525"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });

            // if hit, reduce target's cr by 30
            if (!miss) {
                target.reduceCombatReadiness(source, 30);
            }
        }
    },
    "m542": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m542"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                ...moveData
            });

            // if hit, 30% chance to confuse target
            if (!miss && Math.random() < 0.3) {
                target.addEffect("confused", 2, source);
            }
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
    statusConditions
};