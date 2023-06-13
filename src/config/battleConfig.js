const { types } = require("./pokemonConfig");

const battleEventNames = {
    BATTLE_BEGIN: "battleStart",
    TURN_END: "turnEnd",
    TURN_BEGIN: "turnBegin",
    BEFORE_MOVE: "beforeMove",
    AFTER_MOVE: "afterMove",
    BEFORE_DAMAGE_DEALT: "beforeDamageDealt",
    AFTER_DAMAGE_DEALT: "afterDamageDealt",
    BEFORE_DAMAGE_TAKEN: "beforeDamageTaken",
    AFTER_DAMAGE_TAKEN: "afterDamageTaken",
    BEFORE_CR_GAINED: "beforeCRGained",
    AFTER_CR_GAINED: "afterCRGained",
    BEFORE_EFFECT_ADD: "beforeEffectAdd",
    AFTER_EFFECT_ADD: "afterEffectAdd",
    BEFORE_EFFECT_REMOVE: "beforeEffectRemove",
    AFTER_EFFECT_REMOVE: "afterEffectRemove",
    BEFORE_STATUS_APPLY: "beforeStatusApply",
    AFTER_STATUS_APPLY: "afterStatusApply",
    BEFORE_CAUSE_FAINT: "beforeCauseFaint",
    BEFORE_FAINT: "beforeFaint",
    AFTER_FAINT: "afterFaint",
    CALCULATE_TYPE_MULTIPLIER: "calculateTypeMultiplier",
    CALCULATE_MISS: "calculateMiss",
    GET_ELIGIBLE_TARGETS: "getEligibleTargets",
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

const calculateDamage = (move, source, target, miss=false, { atkStat = null, defStat = null, power = null, type = null } = {}) => {
    // TODO: handle miss

    power = power || move.power;
    const level = source.level;
    atkStat = atkStat || move.damageType;
    const attack = atkStat === damageTypes.PHYSICAL ? source.atk : source.spa;
    defStat = defStat || move.damageType;
    const defense = defStat === damageTypes.PHYSICAL ? target.def : target.spd;
    const stab = source.type1 === move.type || source.type2 === move.type ? 1.5 : 1;
    const missMult = miss ? 0.7 : 1;
    type = type !== null ? type : source.getTypeDamageMultiplier(move.type, target);
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
        type = 0.35;
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
    "atkUp": {
        "name": "Atk. Up",
        "description": "The target's Attack increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterAtkUp exists on target, remove atkUp and refresh greaterAtkUp
            if (target.effectIds.greaterAtkUp) {
                const currentDuration = target.effectIds.atkUp.duration;
                delete target.effectIds.atkUp;
                if (target.effectIds.greaterAtkUp.duration < currentDuration) {
                    target.effectIds.greaterAtkUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Attack rose!`);
                target.atk += Math.floor(target.batk * 0.5);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Attack boost wore off!`);
            target.atk -= Math.floor(target.batk * 0.5);
        },
    },
    "greaterAtkUp": {
        "name": "Greater Atk. Up",
        "description": "The target's Attack greatly increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if atkUp exists on target, remove greaterAtkUp and refresh atkUp
            if (target.effectIds.atkUp) {
                const currentDuration = target.effectIds.greaterAtkUp.duration;
                delete target.effectIds.greaterAtkUp;
                if (target.effectIds.atkUp.duration < currentDuration) {
                    target.effectIds.atkUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Attack rose sharply!`);
                target.atk += Math.floor(target.batk * 0.75);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Attack boost wore off!`);
            target.atk -= Math.floor(target.batk * 0.75);
        },
    },
    "atkDown": {
        "name": "Atk. Down",
        "description": "The target's Attack decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterAtkDown exists on target, remove atkDown and refresh greaterAtkDown
            if (target.effectIds.greaterAtkDown) {
                const currentDuration = target.effectIds.atkDown.duration;
                delete target.effectIds.atkDown;
                if (target.effectIds.greaterAtkDown.duration < currentDuration) {
                    target.effectIds.greaterAtkDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Attack fell!`);
                target.atk -= Math.floor(target.batk * 0.33);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Attack drop faded!`);
            target.atk += Math.floor(target.batk * 0.33);
        },
    },
    "greaterAtkDown": {
        "name": "Greater Atk. Down",
        "description": "The target's Attack greatly decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if atkDown exists on target, remove greaterAtkDown and refresh atkDown
            if (target.effectIds.atkDown) {
                const currentDuration = target.effectIds.greaterAtkDown.duration;
                delete target.effectIds.greaterAtkDown;
                if (target.effectIds.atkDown.duration < currentDuration) {
                    target.effectIds.atkDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Attack fell sharply!`);
                target.atk -= Math.floor(target.batk * 0.5);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Attack drop faded!`);
            target.atk += Math.floor(target.batk * 0.5);
        },
    },
    "defUp": {
        "name": "Def. Up",
        "description": "The target's Defense increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
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
        "effectAdd": function(battle, source, target) {
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
    "defDown": {
        "name": "Def. Down",
        "description": "The target's Defense decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterDefDown exists on target, remove defDown and refresh greaterDefDown
            if (target.effectIds.greaterDefDown) {
                const currentDuration = target.effectIds.defDown.duration;
                delete target.effectIds.defDown;
                if (target.effectIds.greaterDefDown.duration < currentDuration) {
                    target.effectIds.greaterDefDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Defense fell!`);
                target.def -= Math.floor(target.bdef * 0.33);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Defense drop faded!`);
            target.def += Math.floor(target.bdef * 0.33);
        },
    },
    "greaterDefDown": {
        "name": "Greater Def. Down",
        "description": "The target's Defense sharply decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Defense sharply fell!`);
            // if defDown exists on target, remove defDown and refresh greaterDefDown
            if (target.effectIds.defDown) {
                const currentDuration = target.effectIds.defDown.duration;
                delete target.effectIds.defDown;
                if (target.effectIds.greaterDefDown.duration < currentDuration) {
                    target.effectIds.greaterDefDown.duration = currentDuration;
                }
                target.def += Math.floor(target.bdef * 0.33);
            }
            target.def -= Math.floor(target.bdef * 0.5);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Defense drop faded!`);
            target.def += Math.floor(target.bdef * 0.5);
        },
    },
    "spaUp": {
        "name": "Sp. Atk. Up",
        "description": "The target's Special Attack increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterSpaUp exists on target, remove spaUp and refresh greaterSpaUp
            if (target.effectIds.greaterSpaUp) {
                const currentDuration = target.effectIds.spaUp.duration;
                delete target.effectIds.spaUp;
                if (target.effectIds.greaterSpaUp.duration < currentDuration) {
                    target.effectIds.greaterSpaUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Special Attack rose!`);
                target.spa += Math.floor(target.bspa * 0.5);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Attack boost faded!`);
            target.spa -= Math.floor(target.bspa * 0.5);
        },
    },
    "greaterSpaUp": {
        "name": "Greater Sp. Atk. Up",
        "description": "The target's Special Attack sharply increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Special Attack sharply rose!`);
            // if spaUp exists on target, remove spaUp and refresh greaterSpaUp
            if (target.effectIds.spaUp) {
                const currentDuration = target.effectIds.spaUp.duration;
                delete target.effectIds.spaUp;
                if (target.effectIds.greaterSpaUp.duration < currentDuration) {
                    target.effectIds.greaterSpaUp.duration = currentDuration;
                }
                target.spa -= Math.floor(target.bspa * 0.5);
            }
            target.spa += Math.floor(target.bspa * 0.75);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Attack boost faded!`);
            target.spa -= Math.floor(target.bspa * 0.75);
        },
    },
    "spaDown": {
        "name": "Sp. Atk. Down",
        "description": "The target's Special Attack decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterSpaDown exists on target, remove spaDown and refresh greaterSpaDown
            if (target.effectIds.greaterSpaDown) {
                const currentDuration = target.effectIds.spaDown.duration;
                delete target.effectIds.spaDown;
                if (target.effectIds.greaterSpaDown.duration < currentDuration) {
                    target.effectIds.greaterSpaDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Special Attack fell!`);
                target.spa -= Math.floor(target.bspa * 0.33);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Attack drop faded!`);
            target.spa += Math.floor(target.bspa * 0.33);
        },
    },
    "greaterSpaDown": {
        "name": "Greater Sp. Atk. Down",
        "description": "The target's Special Attack sharply decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Special Attack sharply fell!`);
            // if spaDown exists on target, remove spaDown and refresh greaterSpaDown
            if (target.effectIds.spaDown) {
                const currentDuration = target.effectIds.spaDown.duration;
                delete target.effectIds.spaDown;
                if (target.effectIds.greaterSpaDown.duration < currentDuration) {
                    target.effectIds.greaterSpaDown.duration = currentDuration;
                }
                target.spa += Math.floor(target.bspa * 0.33);
            }
            target.spa -= Math.floor(target.bspa * 0.5);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Attack drop faded!`);
            target.spa += Math.floor(target.bspa * 0.5);
        },
    },
    "spdUp": {
        "name": "Sp. Def. Up",
        "description": "The target's Special Defense increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterSpdUp exists on target, remove spdUp and refresh greaterSpdUp
            if (target.effectIds.greaterSpdUp) {
                const currentDuration = target.effectIds.spdUp.duration;
                delete target.effectIds.spdUp;
                if (target.effectIds.greaterSpdUp.duration < currentDuration) {
                    target.effectIds.greaterSpdUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Special Defense rose!`);
                target.spd += Math.floor(target.bspd * 0.5);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Defense boost faded!`);
            target.spd -= Math.floor(target.bspd * 0.5);
        },
    },
    "greaterSpdUp": {
        "name": "Greater Sp. Def. Up",
        "description": "The target's Special Defense sharply increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Special Defense sharply rose!`);
            // if spdUp exists on target, remove spdUp and refresh greaterSpdUp
            if (target.effectIds.spdUp) {
                const currentDuration = target.effectIds.spdUp.duration;
                delete target.effectIds.spdUp;
                if (target.effectIds.greaterSpdUp.duration < currentDuration) {
                    target.effectIds.greaterSpdUp.duration = currentDuration;
                }
                target.spd -= Math.floor(target.bspd * 0.5);
            }
            target.spd += Math.floor(target.bspd * 0.75);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Defense boost faded!`);
            target.spd -= Math.floor(target.bspd * 0.75);
        },
    },
    "spdDown": {
        "name": "Sp. Def. Down",
        "description": "The target's Special Defense decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterSpdDown exists on target, remove spdDown and refresh greaterSpdDown
            if (target.effectIds.greaterSpdDown) {
                const currentDuration = target.effectIds.spdDown.duration;
                delete target.effectIds.spdDown;
                if (target.effectIds.greaterSpdDown.duration < currentDuration) {
                    target.effectIds.greaterSpdDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Special Defense fell!`);
                target.spd -= Math.floor(target.bspd * 0.33);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Defense drop faded!`);
            target.spd += Math.floor(target.bspd * 0.33);
        },
    },
    "greaterSpdDown": {
        "name": "Greater Sp. Def. Down",
        "description": "The target's Special Defense sharply decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Special Defense sharply fell!`);
            // if spdDown exists on target, remove spdDown and refresh greaterSpdDown
            if (target.effectIds.spdDown) {
                const currentDuration = target.effectIds.spdDown.duration;
                delete target.effectIds.spdDown;
                if (target.effectIds.greaterSpdDown.duration < currentDuration) {
                    target.effectIds.greaterSpdDown.duration = currentDuration;
                }
                target.spd += Math.floor(target.bspd * 0.33);
            }
            target.spd -= Math.floor(target.bspd * 0.5);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Defense drop faded!`);
            target.spd += Math.floor(target.bspd * 0.5);
        },
    },
    "speUp": {
        "name": "Spe. Up",
        "description": "The target's Speed increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterSpeUp exists on target, remove speUp and refresh greaterSpeUp
            if (target.effectIds.greaterSpeUp) {
                const currentDuration = target.effectIds.speUp.duration;
                delete target.effectIds.speUp;
                if (target.effectIds.greaterSpeUp.duration < currentDuration) {
                    target.effectIds.greaterSpeUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Speed rose!`);
                target.spe += Math.floor(target.bspe * 0.4);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed boost faded!`);
            target.spe -= Math.floor(target.bspe * 0.4);
        },
    },
    "greaterSpeUp": {
        "name": "Greater Spe. Up",
        "description": "The target's Speed sharply increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Speed sharply rose!`);
            // if speUp exists on target, remove speUp and refresh greaterSpeUp
            if (target.effectIds.speUp) {
                const currentDuration = target.effectIds.speUp.duration;
                delete target.effectIds.speUp;
                if (target.effectIds.greaterSpeUp.duration < currentDuration) {
                    target.effectIds.greaterSpeUp.duration = currentDuration;
                }
                target.spe -= Math.floor(target.bspe * 0.4);
            }
            target.spe += Math.floor(target.bspe * 0.6);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed boost faded!`);
            target.spe -= Math.floor(target.bspe * 0.6);
        },
    },
    "speDown": {
        "name": "Spe. Down",
        "description": "The target's Speed decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterSpeDown exists on target, remove speDown and refresh greaterSpeDown
            if (target.effectIds.greaterSpeDown) {
                const currentDuration = target.effectIds.speDown.duration;
                delete target.effectIds.speDown;
                if (target.effectIds.greaterSpeDown.duration < currentDuration) {
                    target.effectIds.greaterSpeDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Speed fell!`);
                target.spe -= Math.floor(target.bspe * 0.33);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed drop faded!`);
            target.spe += Math.floor(target.bspe * 0.33);
        },
    },
    "greaterSpeDown": {
        "name": "Greater Spe. Down",
        "description": "The target's Speed sharply decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Speed sharply fell!`);
            // if speDown exists on target, remove speDown and refresh greaterSpeDown
            if (target.effectIds.speDown) {
                const currentDuration = target.effectIds.speDown.duration;
                delete target.effectIds.speDown;
                if (target.effectIds.greaterSpeDown.duration < currentDuration) {
                    target.effectIds.greaterSpeDown.duration = currentDuration;
                }
                target.spe += Math.floor(target.bspe * 0.33);
            }
            target.spe -= Math.floor(target.bspe * 0.5);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed drop faded!`);
            target.spe += Math.floor(target.bspe * 0.5);
        },
    },
    "accDown": {
        "name": "Acc. Down",
        "description": "The target's Accuracy decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterAccDown exists on target, remove accDown and refresh greaterAccDown
            if (target.effectIds.greaterAccDown) {
                const currentDuration = target.effectIds.accDown.duration;
                delete target.effectIds.accDown;
                if (target.effectIds.greaterAccDown.duration < currentDuration) {
                    target.effectIds.greaterAccDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Accuracy fell!`);
                target.acc -= 30;
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Accuracy drop faded!`);
            target.acc += 30;
        },
    },
    "greaterAccDown": {
        "name": "Greater Acc. Down",
        "description": "The target's Accuracy sharply decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Accuracy sharply fell!`);
            // if accDown exists on target, remove accDown and refresh greaterAccDown
            if (target.effectIds.accDown) {
                const currentDuration = target.effectIds.accDown.duration;
                delete target.effectIds.accDown;
                if (target.effectIds.greaterAccDown.duration < currentDuration) {
                    target.effectIds.greaterAccDown.duration = currentDuration;
                }
                target.acc += 30;
            }
            target.acc -= 50;
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Accuracy drop faded!`);
            target.acc += 50;
        },
    },
    "evaUp": {
        "name": "Eva. Up",
        "description": "The target's Evasion increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterEvaUp exists on target, remove evaUp and refresh greaterEvaUp
            if (target.effectIds.greaterEvaUp) {
                const currentDuration = target.effectIds.evaUp.duration;
                delete target.effectIds.evaUp;
                if (target.effectIds.greaterEvaUp.duration < currentDuration) {
                    target.effectIds.greaterEvaUp.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Evasion rose!`);
                target.eva += 50;
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Evasion boost faded!`);
            target.eva -= 50;
        },
    },
    "greaterEvaUp": {
        "name": "Greater Eva. Up",
        "description": "The target's Evasion sharply increased.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Evasion sharply rose!`);
            // if evaUp exists on target, remove evaUp and refresh greaterEvaUp
            if (target.effectIds.evaUp) {
                const currentDuration = target.effectIds.evaUp.duration;
                delete target.effectIds.evaUp;
                if (target.effectIds.greaterEvaUp.duration < currentDuration) {
                    target.effectIds.greaterEvaUp.duration = currentDuration;
                }
                target.eva -= 50;
            }
            target.eva += 75;
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Evasion boost faded!`);
            target.eva -= 75;
        },
    },
    "evaDown": {
        "name": "Eva. Down",
        "description": "The target's Evasion decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            // if greaterEvaDown exists on target, remove evaDown and refresh greaterEvaDown
            if (target.effectIds.greaterEvaDown) {
                const currentDuration = target.effectIds.evaDown.duration;
                delete target.effectIds.evaDown;
                if (target.effectIds.greaterEvaDown.duration < currentDuration) {
                    target.effectIds.greaterEvaDown.duration = currentDuration;
                }
            } else {
                battle.addToLog(`${target.name}'s Evasion fell!`);
                target.eva -= 25;
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Evasion drop faded!`);
            target.eva += 25;
        },
    },
    "greaterEvaDown": {
        "name": "Greater Eva. Down",
        "description": "The target's Evasion sharply decreased.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name}'s Evasion sharply fell!`);
            // if evaDown exists on target, remove evaDown and refresh greaterEvaDown
            if (target.effectIds.evaDown) {
                const currentDuration = target.effectIds.evaDown.duration;
                delete target.effectIds.evaDown;
                if (target.effectIds.greaterEvaDown.duration < currentDuration) {
                    target.effectIds.greaterEvaDown.duration = currentDuration;
                }
                target.eva += 25;
            }
            target.eva -= 40;
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Evasion drop faded!`);
            target.eva += 40;
        },
    },
    "confused": {
        "name": "Confused",
        "description": "The target is confused.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const inflictedPokemon = initialArgs.pokemon;
                    const sourcePokemon = args.source;
                    if (inflictedPokemon !== sourcePokemon) {
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
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_MOVE, listener);
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
    "counter": {
        "name": "Counter",
        "description": "The target will counter physical moves used against it.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    // filter for physical moves
                    if (args.damageInfo.type !== "move") {
                        return;
                    }
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (!moveData || moveData.damageType !== damageTypes.PHYSICAL) {
                        return;
                    }

                    const sourcePokemon = args.source;
                    const targetPokemon = args.target;
                    if (targetPokemon.isFainted || targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    const damage = calculateDamage({
                        "power": moveData.power * 1.5,
                        "damageType": damageTypes.PHYSICAL,
                        "type": types.FIGHTING,
                    }, targetPokemon, sourcePokemon, false);
                    battle.addToLog(`${targetPokemon.name} countered ${sourcePokemon.name}'s ${moveData.name}!`);
                    targetPokemon.dealDamage(damage, sourcePokemon, {
                        "type": "counter",
                    });
                }
            }
            battle.addToLog(`${target.name} assumes a counter stance!`);
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} lowers its counter stance!`);
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        },
    },
    "flinched": {
        "name": "Flinched",
        "description": "The target flinched.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} flinched!`);
            target.incapacitated = true;
        },
        "effectRemove": function(battle, target) {
            target.incapacitated = false;
        },
    },
    "recharge": {
        "name": "Recharge",
        "description": "The target must recharge.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} must recharge!`);
            target.incapacitated = true;
        },
        "effectRemove": function(battle, target) {
            target.incapacitated = false;
        }
    },
    "arenaTrap": {
        "name": "Arena Trap",
        "description": "The target cannot gain combat readiness.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is restricted by ${source.name}'s Arena Trap!`);
            target.restricted = true;
        },
        "effectRemove": function(battle, target) {
            target.restricted = false;
        }
    },
    "immortal": {
        "name": "Immortal",
        "description": "The target's HP cannot be reduced below 1.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is immortal!`);
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const immortalPokemon = initialArgs.pokemon;
                    const damagedPokemon = args.target;
                    if (immortalPokemon !== damagedPokemon) {
                        return;
                    }
                    
                    // if damage would reduce HP below 1, set damage to HP - 1
                    if (args.damage >= damagedPokemon.hp) {
                        immortalPokemon.battle.addToLog(`${immortalPokemon.name} cannot be reduced below 1 HP!`);
                        args.damage = damagedPokemon.hp - 1;
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "moveInvulnerable": {
        "name": "Move Invuln.",
        "description": "The target can't take damage from moves.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} protected itself!`);
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const invulnPokemon = initialArgs.pokemon;
                    const damagedPokemon = args.target;
                    if (invulnPokemon !== damagedPokemon) {
                        return;
                    }
                    
                    // set damage to 0
                    args.damage = 0;
                    args.maxDamage = Math.min(args.maxDamage, args.damage);
                    invulnPokemon.battle.addToLog(`${invulnPokemon.name} protected itself!`);
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "wideGuard": {
        "name": "Wide Guard",
        "description": "The user is protecting its allies from AoE moves.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${source.name} is protecting its allies!`);
            const listener = {
                initialArgs: {
                    pokemon: source,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.targetPattern === targetPatterns.SINGLE) {
                        return;
                    }

                    const wideGuardPokemon = initialArgs.pokemon;
                    if (wideGuardPokemon.isFainted) {
                        return;
                    }
                    const targetPokemon = args.target;
                    if (wideGuardPokemon.teamName !== targetPokemon.teamName) {
                        return;
                    }

                    // set damage to half
                    wideGuardPokemon.battle.addToLog(`${wideGuardPokemon.name} is protecting its allies!`);
                    args.damage = Math.max(Math.floor(args.damage / 2), 1);
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "statusImmunity": {
        "name": "Status Immunity",
        "description": "The target is immune to status conditions.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is immune to status conditions!`);
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    args.canApply = false;
                    targetPokemon.battle.addToLog(`${targetPokemon.name} is immune to status conditions!`);
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_STATUS_APPLY, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer immune to status conditions!`);
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "delayedHeal": {
        "name": "Delayed Heal",
        "description": "The target will be healed at the end of the duration.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target, initialArgs) {
        },
        "effectRemove": function(battle, target, args, initialArgs) {
            const effect = target.effectIds.delayedHeal;
            if (effect && effect.duration > 0) {
                return;
            }

            battle.addToLog(`${target.name} was healed by ${effect.source.name}!`);
            const healAmount = initialArgs.healAmount;
            effect.source.giveHeal(healAmount, target, {
                "type": "delayedHeal",
            });
        }
    },
    "regeneration": {
        "name": "Regen",
        "description": "The target will be healed at the end of each turn.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target, initialArgs) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                    healAmount: initialArgs.healAmount,
                },
                execute: function(initialArgs, args) {
                    const regenPokemon = initialArgs.pokemon;
                    if (regenPokemon !== regenPokemon.battle.activePokemon) {
                        return;
                    }
                    
                    regenPokemon.battle.addToLog(`${regenPokemon.name} regenerated some health!`);
                    const healAmount = initialArgs.healAmount;
                    regenPokemon.takeHeal(healAmount, regenPokemon, {
                        "type": "regeneration",
                    });
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.TURN_END, listener);
            battle.addToLog(`${target.name} is regenerating health!`);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "dot": {
        "name": "DoT",
        "description": "The target will take damage at the end of each turn.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target, args) {
            const listener = {
                initialArgs: {
                    source: source,
                    pokemon: target,
                    damage: args.damage,
                },
                execute: function(initialArgs, args) {
                    const dotPokemon = initialArgs.pokemon;
                    if (dotPokemon !== dotPokemon.battle.activePokemon) {
                        return;
                    }
                    
                    dotPokemon.battle.addToLog(`${dotPokemon.name} took damage from the DoT!`);
                    const damage = initialArgs.damage;
                    dotPokemon.takeDamage(damage, initialArgs.source, {
                        "type": "dot",
                    });
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.TURN_END, listener);
            battle.addToLog(`${target.name} is taking damage from a DoT effect!`);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "leechSeed": {
        "name": "Leech Seed",
        "description": "The target will take damage at the end of each turn and the source will be healed by the damage dealt.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target, args) {
            const listener = {
                initialArgs: {
                    source: source,
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const dotPokemon = initialArgs.pokemon;
                    if (dotPokemon !== dotPokemon.battle.activePokemon) {
                        return;
                    }
                    
                    dotPokemon.battle.addToLog(`${dotPokemon.name} took damage from the Leech Seed!`);
                    const damage = Math.floor(dotPokemon.maxHp / 8);
                    const damageTaken = dotPokemon.takeDamage(damage, initialArgs.source, {
                        "type": "leechSeed",
                    });
                    initialArgs.source.giveHeal(damageTaken, initialArgs.source, {
                        "type": "leechSeed",
                    });
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.TURN_END, listener);
            battle.addToLog(`${target.name} is affected by a Leech Seed!`);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer affected by Leech Seed!`);
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "stealthRock": {
        "name": "Stealth Rock",
        "description": "The target is affected by Stealth Rock.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            const listener = {
                initialArgs: {
                    source: source,
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const affectedPokemon = initialArgs.pokemon;
                    const targetPokemon = args.target;
                    if (affectedPokemon !== targetPokemon) {
                        return;
                    }
                    // only allow buffs to trigger
                    if (args.effectId && effectConfig[args.effectId].type !== effectTypes.BUFF) {
                        return;
                    }

                    // get damage multiplier
                    let mult = targetPokemon.getTypeDamageMultiplier(types.ROCK, targetPokemon);
                    if (mult >= 4) {
                        mult = 2;
                    } else if (mult >= 2) {
                        mult = 1.5;
                    } else if (mult >= 1) {
                        mult = 1;
                    } else if (mult >= 0.5) {
                        mult = 0.75;
                    } else {
                        mult = 0.5;
                    }

                    // calculate damage
                    battle.addToLog(`${targetPokemon.name} was hurt by Stealth Rock!`);
                    const damage = Math.floor(targetPokemon.maxHp * mult / 12);
                    initialArgs.source.dealDamage(damage, affectedPokemon, {
                        "type": "stealthRock",
                    });
                }
            }

            const crListenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_CR_GAINED, listener);
            const buffListenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_EFFECT_ADD, listener);
            return {
                "crListenerId": crListenerId,
                "buffListenerId": buffListenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const crListenerId = args.crListenerId;
            battle.eventHandler.unregisterListener(crListenerId);
            const buffListenerId = args.buffListenerId;
            battle.eventHandler.unregisterListener(buffListenerId);
        }
    },
    "spikes": {
        "name": "Spikes",
        "description": "The target is affected by Spikes.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            const crListener = {
                initialArgs: {
                    source: source,
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const affectedPokemon = initialArgs.pokemon;
                    const targetPokemon = args.target;
                    if (affectedPokemon !== targetPokemon) {
                        return;
                    }

                    // calculate damage
                    battle.addToLog(`${targetPokemon.name} was hurt by Spikes!`);
                    const damage = Math.floor(targetPokemon.maxHp / 12);
                    initialArgs.source.dealDamage(damage, affectedPokemon, {
                        "type": "spikes",
                    });
                }
            }
            const beforeMoveListener = {
                initialArgs: {
                    source: source,
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const affectedPokemon = initialArgs.pokemon;
                    const sourcePokemon = args.source;
                    if (affectedPokemon !== sourcePokemon) {
                        return;
                    }

                    // calculate damage
                    battle.addToLog(`${sourcePokemon.name} was hurt by Spikes!`);
                    const damage = Math.floor(sourcePokemon.maxHp / 12);
                    initialArgs.source.dealDamage(damage, affectedPokemon, {
                        "type": "spikes",
                    });
                }
            }

            const crListenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_CR_GAINED, crListener);
            const beforeMoveListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_MOVE, beforeMoveListener);
            return {
                "crListenerId": crListenerId,
                "beforeMoveListenerId": beforeMoveListenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const crListenerId = args.crListenerId;
            battle.eventHandler.unregisterListener(crListenerId);
            const beforeMoveListenerId = args.beforeMoveListenerId;
            battle.eventHandler.unregisterListener(beforeMoveListenerId);
        }
    },
    "disable": {
        "name": "Disable",
        "description": "The target's ultimate move(s) are disabled.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            const disabledMoves = [];
            // disable ultimate moves
            for (const moveId of Object.keys(target.moveIds)) {
                const moveData = moveConfig[moveId];
                if (moveData.tier === moveTiers.ULTIMATE) {
                    target.disableMove(moveId, source);
                    disabledMoves.push(moveData.name);
                }
            }
            if (disabledMoves.length > 0) {
                battle.addToLog(`${target.name}'s ${disabledMoves.join(", ")} was disabled!`);
            } else {
                battle.addToLog(`${target.name} has no ultimate moves!`);
            }
            return {
                "source": source,
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name}'s ultimate moves are now available!`);
            // enable ultimate moves
            for (const moveId of Object.keys(target.moveIds)) {
                const moveData = moveConfig[moveId];
                if (moveData.tier === moveTiers.ULTIMATE) {
                    target.enableMove(moveId, args.source);
                }
            }
        }
    },
    "silenced": {
        "name": "Silenced",
        "description": "The target can only use basic moves.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is silenced and can only use basic moves!`);
            for (const moveId in target.moveIds) {
                const move = target.moveIds[moveId];
                const moveData = moveConfig[moveId];
                if (moveData.tier !== moveTiers.BASIC) {
                    target.disableMove(moveId, source);
                }
            }
            return {
                "source": source,
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer silenced!`);
            for (const moveId in target.moveIds) {
                const move = target.moveIds[moveId];
                const moveData = moveConfig[moveId];
                if (moveData.tier !== moveTiers.BASIC) {
                    target.enableMove(moveId, args.source);
                }
            }
        }
    },
    "taunt": {
        "name": "Taunt",
        "description": "The target is taunted.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} was taunted!`);
            // disable moves with no power
            for (const moveId of Object.keys(target.moveIds)) {
                const moveData = moveConfig[moveId];
                if (!moveData.power) {
                    target.disableMove(moveId, source);
                }
            }
            return {
                "source": source,
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer taunted!`);
            // enable moves with no power
            for (const moveId of Object.keys(target.moveIds)) {
                const moveData = moveConfig[moveId];
                if (!moveData.power) {
                    target.enableMove(moveId, args.source);
                }
            }
        }
    },
    "reverseTaunt": {
        "name": "Reverse Taunt",
        "description": "The target is reverse-taunted.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} was reverse-taunted!`);
            // disable moves with power
            for (const moveId of Object.keys(target.moveIds)) {
                const moveData = moveConfig[moveId];
                if (moveData.power) {
                    target.disableMove(moveId, source);
                }
            }
            return {
                "source": source,
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer reverse-taunted!`);
            // enable moves with no power
            for (const moveId of Object.keys(target.moveIds)) {
                const moveData = moveConfig[moveId];
                if (moveData.power) {
                    target.enableMove(moveId, args.source);
                }
            }
        }
    },
    "redirect": {
        "name": "Redirect",
        "description": "Moves are redirected to this target.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is redirecting moves!`);
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    // if redirect user isnt targetable, ignore
                    if (!args.user.battle.isPokemonTargetable(initialArgs.pokemon)) {
                        return;
                    }

                    // check that enemy used non-ally move
                    const moveUser = args.user;
                    const moveData = moveConfig[args.moveId];
                    if (moveUser.teamName === initialArgs.pokemon.teamName) {
                        return;
                    }
                    if (moveData.targetType === targetTypes.ALLY) {
                        return;
                    }

                    args.eligibleTargets.push(initialArgs.pokemon);
                    args.shouldReturn = true;
                    return;
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.GET_ELIGIBLE_TARGETS, listener);
            return {
                "listenerId": listenerId,
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer redirecting moves!`);
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "loseFlying": {
        "name": "No Flying Type",
        "description": "The target loses its Flying type.",
        "type": effectTypes.NEUTRAL,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
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
            } else {
                return {};
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
        "effectAdd": function(battle, source, target) {
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
        "effectAdd": function(battle, source, target) {
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
    "burrowed": {
        "name": "Burrowed",
        "description": "The target has burrowed underground.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} burrows underground!`);
            // disable non-dig  moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m91") {
                    target.disableMove(moveId, target);
                }
            }
            // make untargetable and unhittable
            target.targetable = false;
            target.hittable = false;
        },
        "effectRemove": function(battle, target, args) {
            // enable non-dig moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m91") {
                    target.enableMove(moveId, target);
                }
            }
            // make targetable and hittable
            target.targetable = true;
            target.hittable = true;
        }
    },
    "sprungUp": {
        "name": "Sprung Up",
        "description": "The target has sprung up into the sky.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} springs up into the sky!`);
            // disable non-bounce moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m340") {
                    target.disableMove(moveId, target);
                }
            }
            // make untargetable and unhittable
            target.targetable = false;
            target.hittable = false;
        },
        "effectRemove": function(battle, target, args) {
            // enable non-bounce moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m340") {
                    target.enableMove(moveId, target);
                }
            }
            // make targetable and hittable
            target.targetable = true;
            target.hittable = true;
        }
    },
    "outrage": {
        "name": "Outrage",
        "description": "The target is enraged, attacking wildly.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is enraged!`);
            // disable non-outrage moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m200") {
                    target.disableMove(moveId, target);
                }
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} calmed down!`);
            // enable non-outrage moves
            for (const moveId in target.moveIds) {
                if (moveId !== "m200") {
                    target.enableMove(moveId, target);
                }
            }
        }
    },
    "futureSight": {
        "name": "Future Sight",
        "description": "The target is foreseeing an attack.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${source.name} is foreseeing an attack against ${target.name}!`);
        },
        "effectRemove": function(battle, target, args) {
            const effect = target.effectIds["futureSight"];
            if (!effect) return;
            const source = effect.source;
            if (!source) return;
            const remainingDuration = effect.duration;
            if (remainingDuration === undefined) return;

            battle.addToLog(`${target.name} was hit by ${source.name}'s Future Sight!`);
            const damageCalc = calculateDamage(moveConfig["m248"], source, target);
            // calculate damage based on remaining duration. 0 => 100%, 1 => 50%, >= 2 => 25%
            let damageToDeal = damageCalc;
            if (remainingDuration === 0) {
                damageToDeal = damageCalc;
            } else if (remainingDuration === 1) {
                damageToDeal = Math.floor(damageCalc / 2);
            } else {
                damageToDeal = Math.floor(damageCalc / 4);
            }
            source.dealDamage(damageToDeal, target, {
                "type": "move",
                "moveId": "m248",
            });
        }
    },
    "perishSong": {
        "name": "Perish Song",
        "description": "The target is doomed to faint in 3 turns.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is doomed to faint!`);
        },
        "effectRemove": function(battle, target, args) {
            const effect = target.effectIds["perishSong"];
            if (!effect) return;
            const remainingDuration = effect.duration;
            if (remainingDuration === undefined) return;

            if (remainingDuration === 0) {
                battle.addToLog(`${target.name} fell victim to Perish Song!`);
                target.takeFaint(effect.source);
            }
        }
    },
    "rollout": {
        "name": "Rollout",
        "description": "The target is rolling out of control.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, source, target) {
        },
        "effectRemove": function(battle, target, args) {
        }
    },
    "grudge": {
        "name": "Grudge",
        "description": "If the target faints, silence all enemies for 1 turn.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} is filled with a vengeful spirit!`);
            const listener = {
                initialArgs: {
                    "pokemon": target,
                },
                execute: function(initialArgs, args) {
                    // if not grudge user, ignore
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    const teamNames = Object.keys(targetPokemon.battle.parties);
                    const enemyTeamName = teamNames[0] === targetPokemon.teamName ? teamNames[1] : teamNames[0];
                    const enemyPokemons = targetPokemon.getPatternTargets(
                        targetPokemon.battle.parties[enemyTeamName],
                        targetPatterns.ALL,
                        1 
                    );
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s holds a grudge!`);
                    for (const enemyPokemon of enemyPokemons) {
                        enemyPokemon.addEffect("silenced", 1, targetPokemon);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_FAINT, listener);
            return {
                "listenerId": listenerId,
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer holding a grudge!`);
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "destinyBond": {
        "name": "Destiny Bond",
        "description": "If the target faints, the chosen Pokemon faints as well.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target, initialArgs) {
            battle.addToLog(`${target.name} binds ${initialArgs.boundPokemon.name} by a vow!`);
            const listener = {
                initialArgs: {
                    "pokemon": target,
                    "boundPokemon": initialArgs.boundPokemon,
                },
                execute: function(initialArgs, args) {
                    // if not destiny bond user, ignore
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    targetPokemon.battle.addToLog(`${targetPokemon.name} is bound by a vow!`);
                    const boundPokemon = initialArgs.boundPokemon;
                    boundPokemon.takeFaint(targetPokemon);
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_FAINT, listener);
            return {
                "listenerId": listenerId,
            }
        },
        "effectRemove": function(battle, target, args) {
            battle.addToLog(`${target.name} is no longer bound by a vow!`);
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
        }
    },
    "mimic": {
        "name": "Mimic",
        "description": "The target is mimicking a move.",
        "type": effectTypes.BUFF,
        "dispellable": false,
        "effectAdd": function(battle, source, target, initialArgs) {
            const mimicMoveId = initialArgs.moveId;
            const moveData = moveConfig[mimicMoveId];
            if (!mimicMoveId) return;
            if (!moveData) return;
            // if target already knows move, ignore
            if (target.moveIds[mimicMoveId]) {
                battle.addToLog(`${target.name} already knows ${moveData.name}!`);
                initialArgs.noRemove = true;
                target.removeEffect("mimic");
                return;
            }

            const oldMoveId = initialArgs.oldMoveId;
            if (!oldMoveId) return;

            delete target.moveIds[oldMoveId];
            target.moveIds[mimicMoveId] = {
                "cooldown": 0,
                "disabled": false,
            }
            battle.addToLog(`${target.name} is mimicking ${moveData.name}!`);
        },
        "effectRemove": function(battle, target, args, initialArgs) {
            if (initialArgs.noRemove) return;
            const mimicMoveId = initialArgs.moveId;
            const oldMoveId = initialArgs.oldMoveId;

            delete target.moveIds[mimicMoveId];
            target.moveIds[oldMoveId] = {
                "cooldown": 0,
                "disabled": false,
            }
        }
    }
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
    "m6": {
        "name": "Pay Day",
        "type": types.NORMAL,
        "power": 35,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "Numerous coins are hurled at the target to inflict damage. Reduces the cooldowns of a random other ally by 1, and increases money earned after battle.",
    },
    "m6-1": {
        "name": "Gold Rush",
        "type": types.NORMAL,
        "power": 35,
        "accuracy": 80,
        "cooldown": 6,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "Coins are rained down upon all enemy targets. Reduces the cooldowns of a random ally by 1 and increases money earned after battle for each enemy hit.",
    },
    "m10": {
        "name": "Scratch",
        "type": types.NORMAL,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "Hard, pointed, sharp claws rake the target to inflict damage.",
    },
    "m14": {
        "name": "Swords Dance",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat for 3 turns.",
    },
    "m16": {
        "name": "Gust",
        "type": types.FLYING,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "A gust of wind is whipped up by wings and launched at the target to inflict damage.",
    },
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
    "m21": {
        "name": "Slam",
        "type": types.NORMAL,
        "power": 80,
        "accuracy": 85,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is slammed with a long tail, vines, etc., to inflict damage.",
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
    "m23": {
        "name": "Stomp",
        "type": types.NORMAL,
        "power": 65,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is stomped with a big foot. This may also make the target flinch with a 30% chance.",
    },
    "m30": {
        "name": "Horn Attack",
        "type": types.NORMAL,
        "power": 65,
        "accuracy": 100,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is jabbed with a sharply pointed horn to inflict damage.",
    },
    "m33": {
        "name": "Tackle",
        "type": types.NORMAL,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "A physical attack in which the user charges and slams into the target with its whole ass body.",
    },
    "m34": {
        "name": "Body Slam",
        "type": types.NORMAL,
        "power": 85,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user drops onto the target with its full body weight. This has a 30% chance to leave the target with paralysis.",
    },
    "m35": {
        "name": "Wrap",
        "type": types.NORMAL,
        "power": 15,
        "accuracy": 90,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is wrapped in thin, sharp vines to inflict damage over time for 2 turns.",
    },
    "m36": {
        "name": "Take Down",
        "type": types.NORMAL,
        "power": 100,
        "accuracy": 85,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "A reckless, full-body charge attack for slamming into the target. This also damages the user by a fourth of the damage dealt."
    },
    "m38": {
        "name": "Double-Edge",
        "type": types.NORMAL,
        "power": 125,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "A reckless, life-risking tackle. This also damages the user by a third of the damage dealt.",
    },
    "m40": {
        "name": "Poison Sting",
        "type": types.POISON,
        "power": 15,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is stabbed with a toxic barb, poisoning with a 50% chance.",
    },
    "m43": {
        "name": "Leer",
        "type": types.NORMAL,
        "power": null,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The target is stared down with intimidating eyes, lowering its defense for 2 turns.",
    },
    "m46": {
        "name": "Roar",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The target is scared off, fully reducing its combat readiness and removing all buffs.",
    },
    "m47": {
        "name": "Sing",
        "type": types.NORMAL,
        "power": null,
        "accuracy": 55,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "A soothing lullaby is sung in a calming voice that puts targets into a deep slumber.",
    },
    "m50": {
        "name": "Disable",
        "type": types.NORMAL,
        "power": null,
        "accuracy": 100,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "Disables the target's ultimate move for 1 turn.",
    },
    "m51": {
        "name": "Acid",
        "type": types.POISON,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is sprayed with a harsh, dissolving acid that has a 20% chance to lower the target's Sp. Def for 1 turn.",
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
        "power": 70,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is scorched with an intense blast of fire. This has a 20% chance to leave targets with a burn.",
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
        "power": 100,
        "accuracy": 80,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The target row is blasted by a huge volume of water launched under great pressure, reducing their combat readiness by 15%.",
    },
    "m56-1": {
        "name": "Hydro Artilery Pump",
        "type": types.WATER,
        "power": 90,
        "accuracy": 80,
        "cooldown": 6,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The target area is blasted by a huge volume of water launched precisely under great pressure, reducing their combat readiness by 15%. This move is 1.5x effective if there's only one target.",
    },
    "m56-2": {
        "name": "Holy Pump",
        "type": types.PSYCHIC,
        "power": 110,
        "accuracy": 60,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The target row is blasted by a huge volume of holy energy, reducing their attack and special attack for 1 turn. Effects apply even if the attack misses.",
    },
    "m57": {
        "name": "Surf",
        "type": types.WATER,
        "power": 70,
        "accuracy": 90,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "All enemies are hit by a huge wave. Has 5 less base power for each additional enemy targetted (not including the first).",
    },
    "m58": {
        "name": "Ice Beam",
        "type": types.ICE,
        "power": 70,
        "accuracy": 90,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is struck with an icy-cold beam of energy. This has a 30% chance to freeze the targets.",
    },
    "m60": {
        "name": "Psybeam",
        "type": types.PSYCHIC,
        "power": 65,
        "accuracy": 100,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is attacked with a peculiar ray. This has a 50% chance to confuse the target for 1 turn.",
    },
    "m63": {
        "name": "Hyper Beam",
        "type": types.NORMAL,
        "power": 130,
        "accuracy": 90,
        "cooldown": 6,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is attacked with a powerful beam. This does 50% damage to non-primary targets. The user must rest on the next turn.",
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
    "m65": {
        "name": "Drill Peck",
        "type": types.FLYING,
        "power": 70,
        "accuracy": 100,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is repeatedly jabbed with a sharply pointed beak or horn.",
    },
    "m68": {
        "name": "Counter",
        "type": types.FIGHTING,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user assumes a countering stance for 1 turn. When damaged by a physical move, the user retaliates with a physical attack 1.5x the power.",
    },
    "m70": {
        "name": "Strength",
        "type": types.NORMAL,
        "power": 65,
        "accuracy": 100,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is attacked with a powerful blow. This deals a small amount of additional true damage based on user's attack.",
    },
    "m71": {
        "name": "Absorb",
        "type": types.GRASS,
        "power": 20,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is attacked with a peculiar ray. The user gains 50% of the damage dealt as HP.",
    },
    "m73": {
        "name": "Leech Seed",
        "type": types.GRASS,
        "power": null,
        "accuracy": 90,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "A seed is planted on the target for 5 turns. It steals 1/8 of the target's max HP every turn.",
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
    "m77": {
        "name": "Poison Powder",
        "type": types.POISON,
        "power": null,
        "accuracy": 70,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user scatters a cloud of poisonous dust on the target, poisoning the target.",
    },
    "m79": {
        "name": "Sleep Powder",
        "type": types.GRASS,
        "power": null,
        "accuracy": 85,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user scatters a big cloud of sleep-inducing dust around the target.",
    },
    "m81": {
        "name": "String Shot",
        "type": types.BUG,
        "power": null,
        "accuracy": 95,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The target is sprayed with a sticky string that lowers their combat readiness by 15% and sharply lowers their speed for 1 turn.",
    },
    "m84": {
        "name": "Thunder Shock",
        "type": types.ELECTRIC,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "A jolt of electricity is hurled at the target to inflict damage. This has a 10% chance to paralyze the target.",
    },
    "m85": {
        "name": "Thunderbolt",
        "type": types.ELECTRIC,
        "power": 90,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "A strong electric blast is loosed at the target. This has a 25% chance to paralyze the target.",
    },
    "m86": {
        "name": "Thunder Wave",
        "type": types.ELECTRIC,
        "power": null,
        "accuracy": 90,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "A weak electric charge is launched at the target. This has a 100% chance to paralyze the target on hit.",
    },
    "m87": {
        "name": "Thunder",
        "type": types.ELECTRIC,
        "power": 95,
        "accuracy": 70,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "A wicked thunderbolt is dropped on the target to inflict damage. This has a 30% chance to paralyze targets.",
    },
    "m87-1": {
        "name": "Thunder Charge",
        "type": types.ELECTRIC,
        "power": 110,
        "accuracy": 80,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user charges a wicked thunderbolt to be dropped on the target. The user suffers decreased speed for 1 turn.",
    },
    "m89": {
        "name": "Earthquake",
        "type": types.GROUND,
        "power": 95,
        "accuracy": 100,
        "cooldown": 6,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user sets off an earthquake that hits all the Pokémon in the battle. Has 5 less base power for each additional enemy targetted (not including the first).",
    },
    "m91": {
        "name": "Dig",
        "type": types.GROUND,
        "power": 80,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user burrows into the ground, becoming untargetable and unhittable 1 turn. The user then attacks on the next turn.",
        "silenceIf": function(battle, pokemon) {
            return pokemon.effectIds.burrowed === undefined;
        }
    },
    "m92": {
        "name": "Toxic",
        "type": types.POISON,
        "power": null,
        "accuracy": 90,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "A move that leaves the target badly poisoned. Its poison damage worsens every turn. If the user is Poison type, ignore miss.",
    },
    "m93": {
        "name": "Confusion",
        "type": types.PSYCHIC,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is hit by a weak telekinetic force. This has a 25% chance to confuse the target for 1 turn.",
    },
    "m94": {
        "name": "Psychic",
        "type": types.PSYCHIC,
        "power": 70,
        "accuracy": 90,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is hit by a strong telekinetic force. This has a 60% chance to lower the targets' Special Defense for 1 turn.",
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
        "description": "The user relaxes and lightens its body to move faster. This sharply raises the user's Speed for 3 turns and boosts combat readiness by 60%.",
    },
    "m98": {
        "name": "Quick Attack",
        "type": types.NORMAL,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user lunges at the target at a speed that makes it almost invisible. Also boosts the user's combat readiness by 30%.",
    },
    "m100": {
        "name": "Teleport",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user teleports away, boosting the ally with the most combat readiness to 100.",
    },
    "m101": {
        "name": "Night Shade",
        "type": types.GHOST,
        "power": null,
        "accuracy": null,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks the target with a shadowy blob. The damage dealt is equal to the user's level.",
    },
    "m102": {
        "name": "Mimic",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ANY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user copies the target's ultimate move for 3 turns. Fails if the target has no ultimate move. If the user doesn't know mimic, replaces the move in the first slot.",
    },
    "m103": {
        "name": "Screech",
        "type": types.NORMAL,
        "power": null,
        "accuracy": 85,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user emits a screech harsh enough to sharply lower the targets' Defense for 2 turns.",
    },
    "m106": {
        "name": "Harden",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user stiffens all the muscles in its body to raise its Defense for 2 turns.",
    },
    "m108": {
        "name": "Smokescreen",
        "type": types.NORMAL,
        "power": null,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user releases an obscuring cloud of smoke or ink. This sharply lowers the targets' Accuracy for 2 turns.",
    },
    "m108-1": {
        "name": "Rocket Smokescreen",
        "type": types.DARK,
        "power": null,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user releases an obscuring cloud of smoke or ink. This sharply raises allies' evasion for 2 turns.",
    },
    "m110": {
        "name": "Withdraw",
        "type": types.WATER,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user withdraws its body into its hard shell, raising its Defense for 2 turns.",
    },
    "m113": {
        "name": "Light Screen",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 6,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user creates a wall of light, sharply raising the Special Defense of targeted allies for 3 turns.",
    },
    "m115": {
        "name": "Reflect",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 6,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user creates a wall of light, sharply raising the Defense of targeted allies for 3 turns.",
    },
    "m116": {
        "name": "Focus Energy",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user takes a deep breath and focuses, sharply raising the user's attack for 1 turn.",
    },
    "m118": {
        "name": "Metronome",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user waggles a finger and stimulates its brain into randomly using any basic move.",
    },
    "m122": {
        "name": "Lick",
        "type": types.GHOST,
        "power": 20,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user licks the target with its tongue, dealing damage and having a 30% to paralyze it.",
    },
    "m123": {
        "name": "Smog",
        "type": types.POISON,
        "power": 30,
        "accuracy": 70,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The user emits a cloud of poison gas. This may also poison the target with a 40% chance.",
    },
    "m127": {
        "name": "Waterfall",
        "type": types.WATER,
        "power": 80,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user charges at the target and may make it flinch with 20% chance. This chance increases in proportion to how much more attack the user has compared to the target.",
    },
    "m134": {
        "name": "Kinesis",
        "type": types.PSYCHIC,
        "power": 40,
        "accuracy": 80,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The user distracts the target by bending a spoon. This lowers the target's accuracy for 1 turn.",
    },
    "m135": {
        "name": "Soft-Boiled",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user sacrifices 20% of its HP to heal the target by 50% of the user's max HP. If the target is fully healed, reduce this cooldown by 1.",
    },
    "m137": {
        "name": "Glare",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user glares at the target, paralyzing it.",
    },
    "m137-1": {
        "name": "Rocket Glare",
        "type": types.DARK,
        "power": null,
        "accuracy": 80,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user glares at the targets, paralyzing those hit.",
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
        "description": "A second-turn attack move. If this defeats the target, all enemies have a 30% chance to flinch, boosted by 10% of the user's speed, up to a max of 75%.",
        "silenceIf": function(battle, pokemon) {
            return pokemon.effectIds.skyCharge === undefined;
        }
    },
    "m147": {
        "name": "Spore",
        "type": types.GRASS,
        "power": null,
        "accuracy": null,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user scatters bursts of spores that can't miss and cause the target to fall asleep.",
    },
    "m150": {
        "name": "Splash",
        "type": types.WATER,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user flops and splashes around to no effect at all...",
    },
    "m152": {
        "name": "Crabhammer",
        "type": types.WATER,
        "power": 100,
        "accuracy": 90,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user attacks the target row with its pincers. If hit, deals a small amount of true damage proportional to the user's attack.",
    },
    "m153": {
        "name": "Explosion",
        "type": types.NORMAL,
        "power": 150,
        "accuracy": 100,
        "cooldown": 7,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user explodes, dealing damage to enemies. This also deals 1/3rd damage to surrounding allies, and causes the user to faint. Power increases proportional to percent remaining HP.",
    },
    "m156": {
        "name": "Rest",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 6,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user goes to sleep. This fully restores the user's HP and removes all status effects and debuffs. Fails if the user is already asleep or at max HP",
    },
    "m157": {
        "name": "Rock Slide",
        "type": types.ROCK,
        "power": 75,
        "accuracy": 90,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "Large boulders are hurled at the target to inflict damage. This also has a 70% chance to make the target flinch for 1 turn.",
    },
    "m162": {
        "name": "Super Fang",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user chomps hard on the target with its sharp front fangs. This deals damage equal to 50% of the target's current HP and can't miss.",
    },
    "m175": {
        "name": "Flail",
        "type": types.NORMAL,
        "power": null,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user flails about aimlessly to attack. This move's power increases the lower the user's HP.",
    },
    "m182": {
        "name": "Protect",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user becomes invulnerable to moves for 1 turn.",
    },
    "m186": {
        "name": "Sweet Kiss",
        "type": types.FAIRY,
        "power": null,
        "accuracy": 75,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user kisses the target with a sweet, angelic cuteness that causes confusion for 3 turns.",
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
    "m189": {
        "name": "Mud Slap",
        "type": types.GROUND,
        "power": 20,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The user hurls mud in the target's face to inflict damage and lower its accuracy for 1 turn.",
    },
    "m191": {
        "name": "Spikes",
        "type": types.GROUND,
        "power": null,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user lays a trap of spikes at the opposing team's feet. The trap hurts opposing Pokémon that have their combat readiness boosted and before they move.",
    },
    "m194": {
        "name": "Destiny Bond",
        "type": types.GHOST,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user enters in to a dark pact with the target. If the user faints in the next turn, the target Pokemon also faints.",
    },
    "m195": {
        "name": "Perish Song",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 7,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user sings an ancient song that causes targets AND surrounding allies to faint in 3 turns.",
    },
    "m200": {
        "name": "Outrage",
        "type": types.DRAGON,
        "power": 110,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.RANDOM,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user rampages and attacks randomly for 3 turns. The user then becomes confused for 2 turns.",
    },
    "m202": {
        "name": "Giga Drain",
        "type": types.GRASS,
        "power": 75,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "A nutrient-draining attack. The user's HP is restored by half the damage taken by the target.",
    },
    "m203": {
        "name": "Endure",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 4,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "Applies Immortality to the user for 1 turn.",
    },
    "m204": {
        "name": "Charm",
        "type": types.FAIRY,
        "power": null,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user gazes at the target rather charmingly, making it less wary. This sharply lowers the target's attack stat for 2 turns.",
    },
    "m205": {
        "name": "Rollout",
        "type": types.ROCK,
        "power": 30,
        "accuracy": 90,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user continually rolls into the target. If it hits, the next turn's rollout has base 60 power.",
    },
    "m214": {
        "name": "Sleep Talk",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user talks in its sleep, using a random other move against a random target. Ignores cooldowns and missing. Fails if the user is not asleep.",
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
        "description": "The user makes a soothing bell chime to heal the status conditions of all the party Pokémon. Also heals targets for 10% of their max HP, boosted to 20% if a condition is removed.",
    },
    "m216": {
        "name": "Return",
        "type": types.NORMAL,
        "power": 102,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user attacks with a happy burst of energy. Has 20 less base power if user is damaged.",
    },
    "m219": {
        "name": "Safeguard",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user creates a protective field that prevents allies from receiving status conditions for 3 turns.",
    },
    "m223": {
        "name": "Dynamic Punch",
        "type": types.FIGHTING,
        "power": 125,
        "accuracy": 50,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user punches the target with full, concentrated power. If hit, this also confuses the target for 3 turns.",
    },
    "m224": {
        "name": "Megahorn",
        "type": types.BUG,
        "power": 110,
        "accuracy": 85,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "Using its tough and impressive horn, the user rams into the target with no letup.",
    },
    "m226": {
        "name": "Baton Pass",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.NON_SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user boosts an ally's combat readiness to 100%, passing along ALL dispellable effects.",
    },
    "m229": {
        "name": "Rapid Spin",
        "type": types.NORMAL,
        "power": 50,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "A spin attack that can also dispells debuffs from the user and surrounding allies.",
    },
    "m238": {
        "name": "Cross Chop",
        "type": types.FIGHTING,
        "power": 80,
        "accuracy": 80,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user delivers a double chop with its forearms crossed. Deals half damage to adjacent targets.",
    },
    "m239": {
        "name": "Twister",
        "type": types.DRAGON,
        "power": 30,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The user whips up a vicious twister to tear at the opposing team. This may also make the target flinch with a 30% chance.",
    },
    "m245": {
        "name": "Extreme Speed",
        "type": types.NORMAL,
        "power": 80,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.BACK,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user charges the target at blinding speed, raising the user's combat readiness by 60%.",
    },
    "m246": {
        "name": "Ancient Power",
        "type": types.ROCK,
        "power": 30,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks with a prehistoric power. This has a 50% chance to raise the user's highest non-hp base stat for 1 turn.",
    },
    "m247": {
        "name": "Shadow Ball",
        "type": types.GHOST,
        "power": 80,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user hurls a shadowy blob at the target. This may also lower the target's Sp. Def stat with a 85% chance.",
    },
    "m248": {
        "name": "Future Sight",
        "type": types.PSYCHIC,
        "power": 100,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "Two turns after this move is used, a hunk of psychic energy attacks targets. If the Future Sight debuff is cleansed early, deals less damage.",
    },
    "m252": {
        "name": "Fake Out",
        "type": types.NORMAL,
        "power": 40,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user strikes the target with a quick jolt of electricity, causing the target to flinch for 1 turn. Also boosts the user's combat readiness by 60%.",
    },
    "m257": {
        "name": "Heat Wave",
        "type": types.FIRE,
        "power": 80,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks by exhaling hot breath on the opposing team. This only deals damage to the target row, but has a 30% of burning all targets",
    },
    "m266": {
        "name": "Follow Me",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 4,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user redirects all enemy attacks to itself for 1 turn.",
    },
    "m269": {
        "name": "Taunt",
        "type": types.DARK,
        "power": null,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user taunts the target into only using moves with base power for 2 turns.",
    },
    "m269-1": {
        "name": "Reverse Taunt",
        "type": types.DARK,
        "power": null,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user taunts the target into only using moves WITHOUT base power for 2 turns.",
    },
    "m270":{
        "name": "Helping Hand",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.NON_SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.OTHER,
        "description": "The user assists an ally by boosting their attacking stats for 1 turn.",
    },
    "m273": {
        "name": "Wish",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 2,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.NON_SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user makes a wish to heal an ally for 50% of the user's max HP after 1 turn.",
    },
    "m276": {
        "name": "Superpower",
        "type": types.FIGHTING,
        "power": 110,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user attacks the target with great power. However, this also lowers the user's Attack and Defense stats for 1 turn.",
    },
    "m282": {
        "name": "Knock Off",
        "type": types.DARK,
        "power": 65,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user slaps down the target, removing all buffs. For each buff removed, deals 25% more damage, up to 75% more damage.",
    },
    "m283": {
        "name": "Endeavor",
        "type": types.NORMAL,
        "power": null,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "An attack move that cuts down the target's HP to equal the user's HP.",
    },
    "m288": {
        "name": "Grudge",
        "type": types.GHOST,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "If the user faints in the next turn, silence all enemies for 1 turn.",
    },
    "m304": {
        "name": "Hyper Voice",
        "type": types.NORMAL,
        "power": 85,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user lets loose a horribly echoing shout with the power to inflict damage.",
    },
    "m305": {
        "name": "Poison Fang",
        "type": types.POISON,
        "power": 50,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user bites the target with toxic fangs. This may also leave the target badly poisoned with a 50% chance.",
    },
    "m309": {
        "name": "Meteor Mash",
        "type": types.STEEL,
        "power": 90,
        "accuracy": 90,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The target is hit with a hard punch fired like a meteor. This also raises the users attack for 1 turn.",
    },
    "m317": {
        "name": "Rock Tomb",
        "type": types.ROCK,
        "power": 60,
        "accuracy": 95,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "Boulders are hurled at the target. This also lowers the target's Speed stat for 2 turns.",
    },
    "m317-1": {
        "name": "Holy Tomb",
        "type": types.ROCK,
        "power": 70,
        "accuracy": 70,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "Boulders of biblical proportion are hurled at the target. This also lowers the target's Speed stat for 2 turns, even when the attack misses.",
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
    "m334-1": {
        "name": "Titanium Defense",
        "type": types.STEEL,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user hardens its body's surface like titanium to protect its teammates, sharply raising its Defense stat for 2 turns and raising surrounding allies Defense stat for 2 turns.",
    },
    "m334-2": {
        "name": "Genetic Defense",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user hardens its genetic code and experimental armor, sacrificing speed but sharply raising its Defense and Special Defense for 2 turns.",
    },
    "m340": {
        "name": "Bounce",
        "type": types.FLYING,
        "power": 85,
        "accuracy": 85,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user bounces up high, then drops on the target on the second turn. This has a 30% chance to leave the target with paralysis.",
        "silenceIf": function(battle, pokemon) {
            return pokemon.effectIds.sprungUp === undefined;
        }
    },
    "m344": {
        "name": "Volt Tackle",
        "type": types.ELECTRIC,
        "power": 90,
        "accuracy": 80,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user electrifies itself, then charges. This also damages the user by a third of the damage dealt. This may leave the target with paralysis with a 20% chance.",
    },
    "m348": {
        "name": "Leaf Blade",
        "type": types.GRASS,
        "power": 80,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user handles a sharp leaf like a sword and attacks by cutting its target. Deals extra true damage based on attack, and only deals 50% damage to other targets.",
    },
    "m349": {
        "name": "Dragon Dance",
        "type": types.DRAGON,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user vigorously performs a mystic, powerful dance that raises its Attack and Speed stats for 3 turns.",
    },
    "m352": {
        "name": "Water Pulse",
        "type": types.WATER,
        "power": 60,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks the target with a pulsing blast of water. This has a 25% chance to confuse targets for 2 turns.",
    },
    "m355": {
        "name": "Roost",
        "type": types.FLYING,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user lands and rests its body, removing its Flying type for one turn. It restores the user's HP by up to half of its max HP.",
    },
    "m361": {
        "name": "Healing Wish",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.NON_SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user faints and the target Pokemon has their health and combat readiness entirely restored.",
    },
    "m366": {
        "name": "Tailwind",
        "type": types.FLYING,
        "power": null,
        "accuracy": null,
        "cooldown": 6,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.BACK,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user whips up a turbulent whirlwind that sharply raises the Speed of all party Pokémon for 2 turns and boosting combat readiness of the target row by 15%.",
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
    "m387": {
        "name": "Last Resort",
        "type": types.NORMAL,
        "power": 40,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user attacks the target with full force. This move has 40 additional base power for each additional move on cooldown.",
    },
    "m392": {
        "name": "Aqua Ring",
        "type": types.WATER,
        "power": null,
        "accuracy": null,
        "cooldown": 6,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user envelops allies in a veil made of water, restoring 25% of the user's max HP for 3 turns and boosting defense for 2 turns.",
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
        "description": "The user cloaks itself in fire and charges at the target, and damaging it and dealing 50% damage to adjacent targets. This also damages the user by a third of the damage dealt, and has a 10% chance to leave targets with a burn.",
    },
    "m394-1": {
        "name": "Dark Blitz",
        "type": types.FIRE,
        "power": 95,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user cloaks itself in sinister flames and charges at the target. Type effectiveness is calculated as the best of Fire and Dark. This also damages the user by a third of the damage dealt.",
    },
    "m396": {
        "name": "Aura Sphere",
        "type": types.FIGHTING,
        "power": 80,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user lets loose a blast of aura power from deep within its body at the target. This move never misses.",
    },
    "m398": {
        "name": "Poison Jab",
        "type": types.POISON,
        "power": 80,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user stabs the target with a poisonous stinger. This has a 80% chance to poison the target.",
    },
    "m402": {
        "name": "Seed Bomb",
        "type": types.GRASS,
        "power": 80,
        "accuracy": 80,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user slams a barrage of hard-shelled seeds down on the target from above. Adjacent targets take 50% damage.",
    },
    "m405": {
        "name": "Bug Buzz",
        "type": types.BUG,
        "power": 70,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user generates a damaging sound wave by vibration. This also has a 80% chance to lower targets Sp. Defense for two turns BEFORE dealing damage.",
    },
    "m407": {
        "name": "Dragon Rush",
        "type": types.DRAGON,
        "power": 100,
        "accuracy": 75,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.RANDOM,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user tackles the target while exhibiting overwhelming menace. This also has a 30% chance to make the target flinch for 1 turn.",
    },
    "m409": {
        "name": "Drain Punch",
        "type": types.FIGHTING,
        "power": 75,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "An energy-draining punch. The user's HP is restored by half the damage taken by the target.",
    },
    "m413": {
        "name": "Brave Bird",
        "type": types.FLYING,
        "power": 110,
        "accuracy": 80,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user tucks in its wings and charges from a low altitude. This also damages the user by a third of the damage dealt.",
    },
    "m414": {
        "name": "Earth Power",
        "type": types.GROUND,
        "power": 70,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user makes the ground under the target erupt with power. This also has a 20% chance to lower targets' Sp. Defense for 2 turns.",
    },
    "m416": {
        "name": "Giga Impact",
        "type": types.NORMAL,
        "power": 130,
        "accuracy": 90,
        "cooldown": 6,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user charges at the target using every bit of its power, dealing damage to the primary target and 50% damage to other targets. The user must rest on the next turn.",
    },
    "m417": {
        "name": "Nasty Plot",
        "type": types.DARK,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user stimulates its brain by thinking bad thoughts. This sharply raises the user's Sp. Attack stat for 3 turns.",
    },
    "m418": {
        "name": "Bullet Punch",
        "type": types.STEEL,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user strikes the target with tough punches as fast as bullets, dealing damage and increasing its own combat readiness by 30%.",
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
    "m424": {
        "name": "Fire Fang",
        "type": types.FIRE,
        "power": 65,
        "accuracy": 95,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user bites the target with flame-cloaked fangs, dealing damage and has a 10% chance to flinch and 10% chance to leave the target with a burn.",
    },
    "m428": {
        "name": "Zen Headbutt",
        "type": types.PSYCHIC,
        "power": 90,
        "accuracy": 90,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user focuses its willpower to its head and attacks the target. This also causes the target to flinch for 1 turn.",
    },
    "m430": {
        "name": "Flash Cannon",
        "type": types.STEEL,
        "power": 65,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user gathers all its light energy and releases it at once, dealing damage and has a 20% chance to lower targets Sp. Defense for two turns.",
    },
    "m433": {
        "name": "Trick Room",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user creates a bizarre area in which Pokemon recieve speed buffs or debuffs inversely based on how fast they are for 2 turns.",
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
        "description": "The user fires a powerful electric blast at the target, dealing damage and has a 35% chance to paralyze targets.",
    },
    "m435-1": {
        "name": "Volt Discharge",
        "type": types.ELECTRIC,
        "power": 70,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user discharges its debuffs as a powerful electric blast at the target, dealing damage and transferring one dispellable debuff per-target.",
    },
    "m437": {
        "name": "Leaf Storm",
        "type": types.GRASS,
        "power": 100,
        "accuracy": 90,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SQUARE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user whips up a storm of leaves around the target, dealing damage and sharply lowers the user's Sp. Attack for 2 turns.",
    },
    "m441": {
        "name": "Gunk Shot",
        "type": types.POISON,
        "power": 80,
        "accuracy": 80,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user fires a filthy shot at the target to inflict damage and has a 30% chance to poison targets. If already poisoned, deals 1.5x damage.",
    },
    "m444": {
        "name": "Stone Edge",
        "type": types.ROCK,
        "power": 80,
        "accuracy": 80,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.COLUMN,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user stabs the target column with sharpened stones from below.",
    },
    "m446": {
        "name": "Stealth Rock",
        "type": types.ROCK,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user lays a trap of levitating stones around the target for 3 turns. The trap hurts opposing Pokemon that have their combat readiness boosted or receive buffs.",
    },
    "m450": {
        "name": "Bug Bite",
        "type": types.BUG,
        "power": 60,
        "accuracy": 100,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user bites the target with its sharp teeth, dealing damage and stealing one buff from the target.",
    },
    "m469": {
        "name": "Wide Guard",
        "type": types.ROCK,
        "power": null,
        "accuracy": null,
        "cooldown": 3,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user and its allies take 50% damage from non-single-target attacks until the user's next turn.",
    },
    "m479": {
        "name": "Smack Down",
        "type": types.ROCK,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user throws a stone or projectile to the target, dealing damage and knocking the target to the ground. Able to hit flying targets.",
    },
    "m482": {
        "name": "Sludge Wave",
        "type": types.POISON,
        "power": 85,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user strikes everything around it by swamping the area with a giant sludge wave. This only deals damage to the target row, but has a 40% of poisoning all targets.",
    },
    "m483": {
        "name": "Quiver Dance",
        "type": types.BUG,
        "power": null,
        "accuracy": null,
        "cooldown": 4,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user lightly performs a beautiful, mystic dance. This boosts the user's Special Attack, Special Defense, and Speed stats for 2 turns.",
    },
    "m484": {
        "name": "Heavy Slam",
        "type": types.STEEL,
        "power": null,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user slams into the target with its heavy body. Power increases in proportion to how slow the user is and user max HP.",
    },
    "m505": {
        "name": "Heal Pulse",
        "type": types.PSYCHIC,
        "power": null,
        "accuracy": null,
        "cooldown": 2,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.NON_SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user emits a healing pulse which restores the target's HP by 50%.",
    },
    "m506": {
        "name": "Hex",
        "type": types.GHOST,
        "power": 30,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The user places a curse on the target. If the target is debuffed or has a status condition, this move's base power is increased by 25.",
    },
    "m521": {
        "name": "Volt Switch",
        "type": types.ELECTRIC,
        "power": 70,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "After dealing damage, the user switches, increasing the combat readiness of a random ally to 100%.",
    },
    "m523": {
        "name": "Bulldoze",
        "type": types.GROUND,
        "power": 25,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user stomps down on the ground and attacks everything in the area. This lowers the Speed of all targets for 1 turn.",
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
    "m528": {
        "name": "Wild Charge",
        "type": types.ELECTRIC,
        "power": 90,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user shrouds itself in electricity and smashes into the target, increasing base power by 10% of user's speed. This also damages the user by 25% of damage dealt.",
    },
    "m529": {
        "name": "Drill Run",
        "type": types.GROUND,
        "power": 80,
        "accuracy": 95,
        "cooldown": 2,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user crashes into its target while rotating its body like a drill.",
    },
    "m534": {
        "name": "Razor Shell",
        "type": types.WATER,
        "power": 75,
        "accuracy": 95,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user cuts its target with sharp shells. This move has additional power proportional to the user's defense, and may also lower the target's Defense stat for 2 turns with a 50% chance.",
    },
    "m540": {
        "name": "Psystrike",
        "type": types.PSYCHIC,
        "power": 100,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.CROSS,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user creates a powerful blast of psychic energy, dealing damage to the target and 50% damage to adjacent Pokemon. Uses the target's Defense stat.",
    },
    "m542": {
        "name": "Hurricane",
        "type": types.FLYING,
        "power": 75,
        "accuracy": 70,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks by wrapping opponents in a fierce wind that flies up into the sky. This also has a 30% chance to leave targets confused for 2 turns.",
    },
    "m565": {
        "name": "Fell Stinger",
        "type": types.BUG,
        "power": 90,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.BACK,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user attacks the target with full force, dealing 50% more damage if the target is poisoned. If the target is knocked out, sharply raise the user's attack for 3 turns.",
    }, 
    "m573": {
        "name": "Freeze-Dry",
        "type": types.ICE,
        "power": 70,
        "accuracy": 100,
        "cooldown": 3,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The user rapidly cools the target with a 30% chance to freeze. Against water types, is super effective, ignores miss, with 100% chance to freeze.",
    },
    "m572": {
        "name": "Petal Blizzard",
        "type": types.GRASS,
        "power": 90,
        "accuracy": 100,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user stirs up a violent petal blizzard and attacks everything around it. Has 5 less base power for each additional target hit.",
    },
    "m574": {
        "name": "Disarming Voice",
        "type": types.FAIRY,
        "power": 40,
        "accuracy": null,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks the target with a soothing voice, dealing damage with no chance to miss.",
    },
    "m585": {
        "name": "Moonblast",
        "type": types.FAIRY,
        "power": 95,
        "accuracy": 70,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.BACK,
        "targetPattern": targetPatterns.ROW,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user attacks the target with a moonblast. This also lowers the target's special attack for 2 turns with a 70% chance.",
    },
    "m668": {
        "name": "Strength Sap",
        "type": types.GRASS,
        "power": null,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user restores its HP by the same amount as the target's Attack stat. This also lowers the target's Attack stat for 2 turns.",
    },
    "m719": {
        "name": "10,000,000 Volt Thunderbolt",
        "type": types.ELECTRIC,
        "power": 100,
        "accuracy": 100,
        "cooldown": 7,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.SPECIAL,
        "description": "The user unleashes a powerful beam of electricity. This ONLY deals damage to the primary target and 2 additional random enemies, but has a 10% chance to paralyze all targets.",
    },
    "m876": {
        "name": "Pound",
        "type": types.NORMAL,
        "power": 40,
        "accuracy": 100,
        "cooldown": 0,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.BASIC,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user pounds the target with its forelegs or tail.",
    },
    "m20001": {
        "name": "Democracy",
        "type": types.DARK,
        "power": null,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.ALL,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user votes for the primary target, causing it to gain 100% combat readiness and increased speed for 2 turns. All other enemies lose 30% combat readiness and have decreased speed for 1 turn. Ignores miss on the primary target.",
    },
    "m20002": {
        "name": "HM Master",
        "type": types.NORMAL,
        "power": null,
        "accuracy": null,
        "cooldown": 5,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user uses all available HM moves against the target. If the HM move is on cooldown, reset the cooldown instead of using the move.",
    },
    "m20003": {
        "name": "Rocket Thievery",
        "type": types.DARK,
        "power": null,
        "accuracy": null,
        "cooldown": 7,
        "targetType": targetTypes.ALLY,
        "targetPosition": targetPositions.SELF,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.ULTIMATE,
        "damageType": damageTypes.OTHER,
        "description": "The user attempts to steal a random fainted enemy Pokemon, reviving it with 50% HP. Fails if the enemy has no fainted Pokemon, or if the user's party has no empty positions.",
    }
};

const moveExecutes = {
    "m6": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m6";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // reduce random non-self party pokemon cooldowns by 1
        const party = battle.parties[source.teamName];
        const pokemons = source.getPatternTargets(party, targetPatterns.ALL_EXCEPT_SELF, 1);
        if (pokemons.length > 0) {
            const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
            for (const moveId in pokemon.moveIds) {
                pokemon.reduceMoveCooldown(moveId, 1, source);
            }
        }

        if (source.battle.moneyMultiplier) {
            source.battle.moneyMultiplier += 0.1;
        }
    },
    "m6-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m6-1";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // ignore if miss
            if (miss) {
                continue;
            }

            // reduce random party pokemon cooldowns by 1
            const party = battle.parties[source.teamName];
            const pokemons = source.getPatternTargets(party, targetPatterns.ALL, 1);
            if (pokemons.length > 0) {
                const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
                battle.addToLog(`${pokemon.name}'s cooldowns were reduced by 1!`);
                for (const moveId in pokemon.moveIds) {
                    pokemon.reduceMoveCooldown(moveId, 1, source, true);
                }
            }

            // buff money multiplier
            if (source.battle.moneyMultiplier) {
                source.battle.moneyMultiplier += 0.1;
            }
        }
    },
    "m10": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m10";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId,
            });
        }
    },
    "m14": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m14";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply greater atk up for 3 turns
            target.addEffect("greaterAtkUp", 3, source);
        }
    },
    "m16": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m16";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // if sprungUp, have 2x power
            const sprungUp = target.effectIds.sprungUp !== undefined;
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: moveData.power * (sprungUp ? 2 : 1),
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId,
            });
        }
    },
    "m17": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m17";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId,
            });
        }
    },
    "m21": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m21";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m22": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m22";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m23": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m23";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, flinch with 30% chance
            if (!miss && Math.random() < 0.3) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m30": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m30";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m33": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m33";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m34": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m34";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 30% chance to paralyze
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.PARALYSIS, source)
            }
        }
    },
    "m35": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m35";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, apply 1/8 hp DoT for 2 turns
            if (!miss) {
                target.addEffect("dot", 2, source, {
                    damage: Math.max(Math.floor(target.maxHp / 8), 1),
                })
            }
        }
    },
    "m36": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m36";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
        // recoil damage to self
        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.max(Math.floor(damageDealt / 4), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m38": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m38";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target));
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
        // recoil damage to self
        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m40": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m40";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit 50% chance to poison
            if (!miss && Math.random() < 0.5) {
                target.applyStatus(statusConditions.POISON, source);
            }
        }
    },
    "m43": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m43";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (!miss) {
                // def down 2 turns
                target.addEffect("defDown", 2, source);
            }
        }
    },
    "m46": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m46";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // remove all buffs
            for (const effectId of Object.keys(target.effectIds)) {
                const effectData = effectConfig[effectId];
                if (effectData.type === effectTypes.BUFF) {
                    target.dispellEffect(effectId);
                }
            }
            // decrease combat readiness fully
            target.reduceCombatReadiness(source, 100);
        }
    },
    "m47": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m47";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (!miss) {
                target.applyStatus(statusConditions.SLEEP, source);
            }
        }
    },
    "m50": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m50";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (!miss) {
                target.addEffect("disable", 1, source);
            }
        }
    },
    "m51": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m51";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // 20% chance spd down 1 turn
            if (!miss && Math.random() < 0.2) {
                target.addEffect("spdDown", 1, source);
            }
        }
    },
    "m52": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m52";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // 20% chance to burn
            if (!miss && Math.random() < 0.2) {
                target.applyStatus(statusConditions.BURN, source);
            }
        }
    },
    "m53": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m53";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // 10% chance to burn
            if (!miss && Math.random() < 0.1) {
                target.applyStatus(statusConditions.BURN, source);
            }
        }
    },
    "m55": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m55";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m56": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m56";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, reduce cr by 15%
            if (!miss) {
                target.reduceCombatReadiness(source, 15);
            }
        }
    },
    "m56-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m56-1";
        const moveData = moveConfig[moveId];
        const multiplier = allTargets.length === 1 ? 1.5 : 1;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(Math.floor(damageToDeal * multiplier), target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, reduce cr by 15%
            if (!miss) {
                target.reduceCombatReadiness(source, Math.floor(15 * multiplier));
            }
        }
    },
    "m56-2": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m56-2";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // reduce atk and spa for 1 turn
            target.addEffect("atkDown", 1, source);
            target.addEffect("spaDown", 1, source);
        }
    },
    "m57": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m57";
        const moveData = moveConfig[moveId];
        // deal less damage if more targets
        const numTargets = allTargets.length;
        const power = moveData.power - (numTargets - 1) * 5;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: power
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m58": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m58";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit, freeze target with 30% chance
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.FREEZE, source);
            }
        }
    },
    "m60": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m60";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 50% chance to confuse for 1 turn
            if (!miss && Math.random() < 0.5) {
                target.addEffect("confused", 1, source);
            }
        }
    },
    "m63": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m63";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            // deal 50% to non primary target
            source.dealDamage(Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)), target, {
                type: "move",
                moveId: moveId
            });
        }
        // apply recharge to self
        source.addEffect("recharge", 1, source);
    },
    "m64": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m64";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m65": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m65";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m68": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m68";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply counter 1 turn
            target.addEffect("counter", 1, source);
        }
    },
    "m70": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m70";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // 5% of atk true damage
            const damageToDeal = calculateDamage(moveData, source, target, miss) + Math.floor(source.atk * 0.05);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m71": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m71";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // heal half damage dealt
        source.giveHeal(Math.floor(damageDealt / 2), source, {
            type: "move",
            moveId: moveId
        });
    },
    "m73": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m73";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // check if target is grass type
            if (target.type1 === types.GRASS || target.type2 === types.GRASS) {
                battle.addToLog(`${target.name}'s Grass type renders it immune to Leech Seed!`);
                continue;
            }

            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            // apply leech seed 5 turns
            target.addEffect("leechSeed", 5, source);
        }
    },
    "m76": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m76";
        const moveData = moveConfig[moveId];
        // if pokemon doesnt have "abosrb light" buff, apply it
        if (source.effectIds.absorbLight === undefined) {
            source.addEffect("absorbLight", 1, source);
            // remove solar beam cd
            source.moveIds[moveId].cooldown = 0;
        } else {
            // if pokemon has "absorb light" buff, remove it and deal damage
            source.removeEffect("absorbLight");
            for (const target of allTargets) {
                const miss = missedTargets.includes(target);
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    moveId: moveId
                });
            }
        }
    },
    "m77": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m77";
        const moveData = moveConfig[moveId];
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

            target.applyStatus(statusConditions.POISON, source);
        }
    },
    "m79": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m79";
        const moveData = moveConfig[moveId];
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
    "m81": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m81";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            // sharply lower speed for 1 turn
            target.addEffect("greaterSpeDown", 1, source);
            // lower cr by 15%
            target.reduceCombatReadiness(source, 15);
        }
    },
    "m84": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m84";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 10% chance to paralyze
            if (!miss && Math.random() < 0.1) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }
    },
    "m85": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m85";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 25% chance to paralyze
            if (!miss && Math.random() < 0.25) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }
    },
    "m86": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m86";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            target.applyStatus(statusConditions.PARALYSIS, source);
        }
    },
    "m87": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m87";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // if sprungUp, have 2x power
            const sprungUp = target.effectIds.sprungUp !== undefined;
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: moveData.power * (sprungUp ? 2 : 1),
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId,
            });

            // if not miss, 30% chance to paralyze
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }
    },
    "m87-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m87-1";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // if sprungUp, have 2x power
            const sprungUp = target.effectIds.sprungUp !== undefined;
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: moveData.power * (sprungUp ? 2 : 1),
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId,
            });
        }

        // add spe down to user 1 turn
        source.addEffect("speDown", 1, source);
    },
    "m89": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m89";
        const moveData = moveConfig[moveId];
        // deal less damage if more targets
        const numTargets = allTargets.length;
        const power = moveData.power - (numTargets - 1) * 5;
        for (const target of allTargets) {
            const dig = target.effectIds.burrowed !== undefined;
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, dig ? false : miss, {
                power: power * (dig ? 2 : 1)
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m91": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m91";
        const moveData = moveConfig[moveId];
        // if pokemon doesnt have "burrowed" buff, apply it
        if (source.effectIds.burrowed === undefined) {
            source.addEffect("burrowed", 1, source);
            // remove dig cd
            source.moveIds[moveId].cooldown = 0;
        } else {
            // if pokemon has "burrowed" buff, remove it and deal damage
            source.removeEffect("burrowed");
            for (const target of allTargets) {
                const miss = missedTargets.includes(target);
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    moveId: moveId
                });
            }
        }
    },
    "m92": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m92";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // if not miss or user poison, apply badly poisoned
            const miss = missedTargets.includes(target);
            const poisonType = source.type1 === types.POISON || source.type2 === types.POISON;
            if (!miss || poisonType) {
                target.applyStatus(statusConditions.BADLY_POISON, source);
            }
        }
    },
    "m93": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m93";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 25% to confuse
            if (!miss && Math.random() < 0.25) {
                target.addEffect("confused", 1, source);
            }
        }
    },
    "m94": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m94";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 60% chance to spd down 1 turn
            if (!miss && Math.random() < 0.6) {
                target.addEffect("spdDown", 1, source);
            }
        }
    },
    "m97": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m97"];
        for (const target of allTargets) {
            // apply greaterSpeUp buff
            target.addEffect("greaterSpeUp", 3, source);
            // boost combat readiness by 60
            target.boostCombatReadiness(source, 60);
        }
    },
    "m98": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m98"];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: "m98"
            });
        }

        // boost cr by 30
        source.boostCombatReadiness(source, 30);
    },
    "m100": function (battle, source, primaryTarget, allTargets, missedTargets) {
        // boost highest cr non-self party pokemon cr to 100
        const party = battle.parties[source.teamName];
        const pokemons = source.getPatternTargets(party, targetPatterns.ALL_EXCEPT_SELF, 1);
        if (pokemons.length > 0) {
            const pokemon = pokemons.reduce((a, b) => a.combatReadiness > b.combatReadiness ? a : b);
            pokemon.boostCombatReadiness(source, 100);
        } 
    },
    "m101": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m101";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const damageToDeal = source.level;
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m102": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m102";
        const moveData = moveConfig[moveId];
        // get mimic index
        const mimicIndex = Math.max(Object.keys(source.moveIds).indexOf(moveId), 0);
        const oldMoveId = Object.keys(source.moveIds)[mimicIndex];
        for (const target of allTargets) {
            // attempt to get targets ultimate move
            const ultimateMoveIds = Object.keys(target.moveIds).filter(moveId => moveConfig[moveId].tier === moveTiers.ULTIMATE);
            if (ultimateMoveIds.length === 0) {
                battle.addToLog(`But if failed!`);
                return;
            }
            const ultimateMoveId = ultimateMoveIds[0];

            // replace move with ultimate move
            source.addEffect("mimic", 3, source, {
                moveId: ultimateMoveId,
                oldMoveId: oldMoveId
            });
        }
    },
    "m103": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m103";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (!miss) {
                // greater def down for 2 turns
                target.addEffect("greaterDefDown", 2, source);
            }
        }
    },
    "m106": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m106";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // def up for 2 turns
            target.addEffect("defUp", 2, source);
        }
    },
    "m108": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m108";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // if not miss, greater acc down 2 turns
            if (!miss) {
                target.addEffect("greaterAccDown", 2, source);
            }
        }
    },
    "m108-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m108-1";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // greater eva up 2 turns
            target.addEffect("greaterEvaUp", 2, source);
        }
    },
    "m110": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m110";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // def up for 2 turns
            target.addEffect("defUp", 2, source);
        }
    },
    "m113": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m113";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // greater spd up for 3 turns
            target.addEffect("greaterSpdUp", 3, source);
        }
    },
    "m115": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m115";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // greater def up for 3 turns
            target.addEffect("greaterDefUp", 3, source);
        }
    },
    "m116": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m116";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // greater atk up for 1 turn
            target.addEffect("greaterAtkUp", 1, source);
        }
    },
    "m118": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m118";
        const moveData = moveConfig[moveId];
        
        // get random basic moves
        const basicMoves = Object.keys(moveConfig).filter(moveId => moveConfig[moveId].tier == moveTiers.BASIC);
        const randomMoveId = basicMoves[Math.floor(Math.random() * basicMoves.length)];
        const randomMoveData = moveConfig[randomMoveId];
        battle.addToLog(`${source.name} used ${randomMoveData.name}!`);

        // get eligible targets
        const eligibleTargets = battle.getEligibleTargets(source, randomMoveId);
        if (eligibleTargets.length === 0) {
            battle.addToLog(`${randomMoveData.name} has no eligible targets!`);
            return;
        }

        // get random target & use move
        const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
        moveExecutes[randomMoveId](battle, source, randomTarget, [randomTarget], []);
    },
    "m122": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m122";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 30% chance to paralyze
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }
    },
    "m123": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m123";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit 40% chance to poison
            if (!miss && Math.random() < 0.4) {
                target.applyStatus(statusConditions.POISON, source);
            }
        }
    },
    "m127": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m127";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 20% + sourceatk/enemyatk chance to flinch
            const flinchChance = source.atk > target.atk ? 0.2 + (source.atk/target.atk - 1) : 0.2;
            if (!miss && Math.random() < flinchChance) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m134": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m134";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, apply accDown
            if (!miss) {
                target.addEffect("accDown", 1, source);
            }
        }
    },
    "m135": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m135";
        const moveData = moveConfig[moveId];
        // sac 20% hp
        const damageToDeal = Math.floor(source.hp * 0.2);
        source.dealDamage(damageToDeal, source, {
            type: "sacrifice",
        });
        for (const target of allTargets) {
            // heal 50% of source max hp
            const healAmount = Math.floor(source.maxHp * 0.5);
            source.giveHeal(healAmount, target, {
                type: "move",
                moveId: moveId
            });

            // if target hp is max, reduce cd by 1
            if (target.hp === target.maxHp) {
                source.reduceMoveCooldown(moveId, 1, source);
            }
        }
    },
    "m137": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m137";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            target.applyStatus(statusConditions.PARALYSIS, source);
        }
    },
    "m137-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m137-1";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            target.applyStatus(statusConditions.PARALYSIS, source);
        }
    },
    "m143": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m143";
        const moveData = moveConfig[moveId];
        let defeatedEnemy = false;
        // two turn move logic
        if (source.effectIds.skyCharge === undefined) {
            source.addEffect("skyCharge", 1, source);
            // remove sky attack cd
            source.moveIds[moveId].cooldown = 0;
        } else {
            source.removeEffect("skyCharge");
            for (const target of allTargets) {
                const miss = missedTargets.includes(target);
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    moveId: moveId
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
        const surroundingTargets = source.getPatternTargets(targetParty, targetPatterns.ALL, primaryTarget.position);
        for (const target of surroundingTargets) {
            // flinch chance = (30 + source speed/10)
            const flinchChance = Math.min(0.3 + (source.spe / 10)/100, .75);
            if (Math.random() < flinchChance) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m147": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m147";
        const moveData = moveConfig[moveId];
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
    "m150": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m150";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // SECRET: has 1/1000 chance to instakill
            if (Math.random() < 0.001) {
                battle.addToLog(`Arceus looks upon you with favor today...`);
                target.takeFaint(source);
            } else {
                // do nothing
                battle.addToLog(`But nothing happened...`);
            }
        }
    },
    "m152": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m152";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // 5% of atk true damage
            const damageToDeal = calculateDamage(moveData, source, target, miss) + (miss ? 0 : Math.floor(source.atk * 0.05));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m153": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m153";
        const moveData = moveConfig[moveId];
        // power = base power + percent hp * 100
        const power = moveData.power + (source.hp / source.maxHp * 100);
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: power
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
        
        // also deal 1/3rd damage to surrounding allies
        const allyParty = battle.parties[source.teamName];
        const allyTargets = source.getPatternTargets(allyParty, targetPatterns.SQUARE, source.position);
        for (const target of allyTargets) {
            if (target !== source) {
                const damageToDeal = Math.floor(calculateDamage(moveData, source, target, false, {
                    power: power,
                }) * 0.33);
                source.dealDamage(Math.max(damageToDeal, 1), target, {
                    type: "move",
                    moveId: moveId
                });
            }
        }

        // cause self to faint
        source.takeFaint(source);
    },
            
    "m156": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m156";
        const moveData = moveConfig[moveId];

        // if source asleep or max HP, fail
        if (source.status.statusId === statusConditions.SLEEP || source.hp === source.maxHp) {
            battle.addToLog(`${source.name} tried to use ${moveData.name}, but it failed!`);
            return;
        }

        for (const target of allTargets) {
            // remove all debuffs
            for (const effectId of Object.keys(target.effectIds)) {
                const effectData = effectConfig[effectId];
                if (effectData.type === effectTypes.DEBUFF) {
                    target.removeEffect(effectId);
                }
            }
            // remove status
            target.removeStatus();
            // fully heal
            source.giveHeal(source.maxHp, source, {
                type: "move",
                moveId: moveId
            });

            // apply sleep
            target.applyStatus(statusConditions.SLEEP, source);
        }
    },
    "m157": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m157";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 70% chance to flinch for 1 turn
            if (!miss && Math.random() < 0.7) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m162": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m162";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // deal half targets health as damage
            const damageToDeal = Math.floor(target.hp * 0.5);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m175": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m175";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // calculate power (lower hp = higher power)
            n = Math.floor(source.hp / source.maxHp * 100);
            let power = 0;
            if (n >= 67) {
                power = 30;
            } else if (n >= 50) {
                power = 40;
            } else if (n >= 33) {
                power = 50;
            } else if (n >= 10) {
                power = 70;
            } else {
                power = 100;
            }
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: power
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m182": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m182";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply move invulnerable
            target.addEffect("moveInvulnerable", 1, source);
        }
    },
    "m186": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m186";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (!miss) {
                // apply confused for 3 turns
                target.addEffect("confused", 3, source);
            }
        }
    },
    "m188": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m188";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not missed, 30% chance to poison
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.POISON, source);
            }
        }
    },
    "m189": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m189";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not missed, acc down
            if (!miss) {
                target.addEffect("accDown", 1, source);
            }
        }
    },
    "m191": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m191";
        const moveData = moveConfig[moveId];
        // spikes log
        battle.addToLog(`Spikes were scattered around ${primaryTarget.name}'s surroundings!`);
        for (const target of allTargets) {
            // if not miss, apply spikes 3 turns
            if (!missedTargets.includes(target)) {
                target.addEffect("spikes", 3, source);
            }
        }
    },
    "m194": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m194";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply destiny bond 1 turn to user
            source.addEffect("destinyBond", 1, source, {
                boundPokemon: target
            });
        }
    },
    "m195": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m195";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // if not miss, apply perish song 3 turns
            if (!missedTargets.includes(target)) {
                target.addEffect("perishSong", 3, source);
            }
        }

        // apply perish song to surrounding allies for 3 turns
        const allyParty = battle.parties[source.teamName];
        const allyTargets = source.getPatternTargets(allyParty, targetPatterns.SQUARE, source.position);
        for (const target of allyTargets) {
            target.addEffect("perishSong", 3, source);
        }
    },
    "m200": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m200";
        const moveData = moveConfig[moveId];
        // if source doesn't have outrage, apply it
        if (source.effectIds.outrage === undefined) {
            source.addEffect("outrage", 2, source);
        }

        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // if outrage duration > 1, reset cooldown
        if (source.effectIds.outrage.duration > 1) {
            source.moveIds[moveId].cooldown = 0;
        } else {
            // remove outrage
            source.removeEffect("outrage");
            // confuse self
            source.addEffect("confused", 2, source);
        }
    },
    "m202": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m202";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // heal half damage dealt
        source.giveHeal(Math.floor(damageDealt / 2), source, {
            type: "move",
            moveId: moveId
        });
    },
    "m203": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m203";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply 1 turn immortality
            target.addEffect("immortal", 1, source);
        }
    },
    "m204": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m204";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (!miss) {
                // greater atk down for 2 turns
                target.addEffect("greaterAtkDown", 2, source);
            }
        }
    },
    "m205": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m205";
        const moveData = moveConfig[moveId];
        let targetHit = false;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const hasRollout = source.effectIds.rollout !== undefined;
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: moveData.power * (hasRollout ? 2 : 1)
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            if (!miss) {
                targetHit = true;
            }
        }

        if (targetHit) {
            // add rollout for 1 turn
            source.addEffect("rollout", 1, source);
        }
    },
    "m214": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m214";
        const moveData = moveConfig[moveId];
        // if not asleep, fail
        if (source.status.statusId !== statusConditions.SLEEP) {
            battle.addToLog(`${source.name} is not asleep!`);
            return;
        }

        // choose random non-sleep talk move
        const sleepTalkMoves = Object.keys(source.moveIds).filter(mId => mId !== moveId);
        // if no moves, return
        if (sleepTalkMoves.length === 0) {
            battle.addToLog(`${source.name} has no moves to use!`);
            return;
        }
        const randomMoveId = sleepTalkMoves[Math.floor(Math.random() * sleepTalkMoves.length)];
        const randomMoveData = moveConfig[randomMoveId];
        battle.addToLog(`${source.name} used ${randomMoveData.name}!`);

        // get valid targets
        const validTargets = battle.getEligibleTargets(source, randomMoveId);
        // if no valid targets, return
        if (validTargets.length === 0) {
            battle.addToLog(`${randomMoveData.name} has no valid targets!`);
            return;
        }

        // choose random target (exception: self moves must target self)
        const randomTarget = randomMoveData.targetPosition === targetPositions.SELF ? source : validTargets[Math.floor(Math.random() * validTargets.length)];
        const targetParty = battle.parties[randomTarget.teamName];
        const targets = source.getPatternTargets(targetParty, randomMoveData.targetPattern, randomTarget.position, randomMoveId);
        // use move against target
        battle.addToLog(`${randomMoveData.name} hit ${randomTarget.name}!`);
        moveExecutes[randomMoveId](battle, source, randomTarget, targets, []);

        // roll wakeup
        // sleep wakeup chance: 0 turns: 0%, 1 turn: 66%, 2 turns: 100%
        if (source.status.statusId !== statusConditions.SLEEP) {
            return;
        }
        const wakeupChance = source.status.turns * 0.66;
        const wakeupRoll = Math.random();
        if (wakeupRoll < wakeupChance) {
            source.removeStatus();
        }
    },
    "m215": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m215";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // remove status conditions
            const statusRemoved = target.removeStatus();

            // heal 10% max HP, boosted to 20% if condition removed
            const healAmount = Math.floor(target.maxHp * (statusRemoved ? 0.2 : 0.1));
            source.giveHeal(healAmount, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m216": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m216";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // 20 less bp if source is damaged
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: moveData.power - (source.hp < source.maxHp ? 20 : 0)
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m219": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m219";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply status immunity for 3 turns
            target.addEffect("statusImmunity", 3, source);
        }
    },
    "m223": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m223";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit, confuse for 3 turns
            if (!miss) {
                target.addEffect("confused", 3, source);
            }
        }
    },
    "m224": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m224";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m226": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m226";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // boost cr to 100
            target.boostCombatReadiness(source, 100);
            // pass all effects to target
            for (const effectId in source.effectIds) {
                const effect = source.effectIds[effectId];
                // pass effect
                const dispelled = source.dispellEffect(effectId);
                if (!dispelled) {
                    return;
                }
                // apply effect to target
                target.addEffect(effectId, effect.duration, effect.source, effect.initialArgs);
            }
        }
    },
    "m229": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m229";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // for all adjacent allies and self, dispell all debuffs
        const allyParty = battle.parties[source.teamName];
        const allyTargets = source.getPatternTargets(allyParty, targetPatterns.SQUARE, source.position);
        for (const ally of allyTargets) {
            for (const effectId of Object.keys(ally.effectIds)) {
                const effectData = effectConfig[effectId];
                if (effectData.type != effectTypes.DEBUFF) {
                    continue;
                }

                ally.dispellEffect(effectId);
            }
        }

        // append ally targets to all targets
        allTargets.push(...allyTargets);
    },
    "m238": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m238";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            // deal half damage if target is not primary target
            source.dealDamage(Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)), target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m239": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m239";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not missed, 30% chance to flinch
            if (!miss && Math.random() < 0.3) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m245": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m245";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId,
            });
        }

        // raise own cr by 60%
        source.boostCombatReadiness(source, 60);
    },
    "m246": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m246";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // 50% chance to boost highest stat
        if (Math.random() > 0.5) {
            return;
        }

        // get highest non-hp base stat
        const statValues = [source.batk, source.bdef, source.bspa, source.bspd, source.bspe];
        // argmax 
        const highestStatIndex = statValues.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        switch (highestStatIndex + 1) {
            case 1:
                source.addEffect("atkUp", 1, source);
                break;
            case 2:
                source.addEffect("defUp", 1, source);
                break;
            case 3:
                source.addEffect("spaUp", 1, source);
                break;
            case 4:
                source.addEffect("spdUp", 1, source);
                break;
            case 5:
                source.addEffect("speUp", 1, source);
                break;
        }
    },
    "m247": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m247";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 85% chance to reduce sp def
            if (!miss && Math.random() < 0.85) {
                target.addEffect("spdDown", 2, source);
            }
        }
    },
    "m248": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m248";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            // apply 2 turns future sight
            target.addEffect("futureSight", 2, source);
        }
    },
    "m252": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m252";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, flinch for 1 turn
            if (!miss) {
                target.addEffect("flinched", 1, source);
            }
        }
        
        // boost source cr by 60
        source.boostCombatReadiness(source, 60);
    },
    "m257": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m257";
        const moveData = moveConfig[moveId];

        // get only target row
        const targetParty = battle.parties[primaryTarget.teamName];
        const damageTargets = source.getPatternTargets(targetParty, targetPatterns.ROW, primaryTarget.position);

        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // only deal damage if target is primary target row
            if (damageTargets.includes(target)) {
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    moveId: moveId
                });
            }

            // if not miss, 30% chance to burn
            if (!miss && Math.random() < 0.3) {
                target.applyStatus(statusConditions.BURN, source);
            }
        }
    },
    "m266": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m266";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply redirect for 1 turn
            target.addEffect("redirect", 1, source);
        }
    },
    "m269": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m269";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            // add taunt for 2 turns
            target.addEffect("taunt", 2, source);
        }
    },
    "m269-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m269-1";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            // add reverse taunt for 2 turns
            target.addEffect("reverseTaunt", 2, source);
        }
    },
    "m270": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m270";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply atk up and spa up 1 turn
            target.addEffect("atkUp", 1, source);
            target.addEffect("spaUp", 1, source);
        }
    },
    "m273": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m273";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // give delayed heal
            battle.addToLog(`${target.name} recieved ${source.name}'s wish!`);
            target.addEffect("delayedHeal", 1, source, {
                healAmount: Math.floor(source.maxHp * 0.5),
            });
        }
    },
    "m276": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m276";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
        // reduce source atk and def
        source.addEffect("atkDown", 1, source);
        source.addEffect("defDown", 1, source);
    },
    "m282": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m282";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);

            let buffsRemoved = 0;
            // if not miss, remove all buffs
            if (!miss) {
                for (const effectId of Object.keys(target.effectIds)) {
                    const effectData = effectConfig[effectId];
                    if (effectData.type != effectTypes.BUFF) {
                        continue;
                    }

                    if (target.dispellEffect(effectId)) {
                        buffsRemoved++;
                    }
                }
            }

            // damage bonus = 0.25 * buffs up to 0.75
            const damageBonus = Math.min(0.75, 0.25 * buffsRemoved);
            const damageToDeal = Math.floor(calculateDamage(moveData, source, target, miss) * (1 + damageBonus));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },       
    "m283": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m283";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            // calculate damage pokemonhp - sourcehp
            const damageToDeal = target.hp - source.hp;
            if (damageToDeal <= 0) {
                battle.addToLog(`${target.name} is unaffected!`);
                continue;
            }

            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m288": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m288";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply grudge for 1 turn
            target.addEffect("grudge", 1, source);
        }
    },
    "m304": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m304";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m305": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m305";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, badly poison 50% chance
            if (!miss && Math.random() < 0.5) {
                target.applyStatus(statusConditions.BADLY_POISON, source);
            }
        }
    },
    "m309": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m309";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // raise user atk for 1 turn
        source.addEffect("atkUp", 1, source);
    },
    "m317": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m317";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, spe down for 2 turns
            if (!miss) {
                target.addEffect("speDown", 2, source);
            }
        }
    },
    "m317-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m317-1";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // spe down 2 turns
            target.addEffect("speDown", 2, source);
        }
    },
    "m334": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m334"];
        for (const target of allTargets) {
            // sharply raise def
            target.addEffect("greaterDefUp", 2, source);
        }
    },
    "m334-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m334-1"];
        for (const target of allTargets) {
            // if primary target, greater def up, else def up
            if (target === primaryTarget) {
                target.addEffect("greaterDefUp", 2, source);
            } else {
                target.addEffect("defUp", 2, source);
            }
        }
    },
    "m334-2": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m334-2"];
        for (const target of allTargets) {
            // sharply raise def & special def
            target.addEffect("greaterDefUp", 2, source);
            target.addEffect("greaterSpdUp", 2, source);
            // lower spe
            target.addEffect("speDown", 2, source);
        }
    },
    "m340": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m340";
        const moveData = moveConfig[moveId];
        // if pokemon doesnt have "sprungUp" buff, apply it
        if (source.effectIds.sprungUp === undefined) {
            source.addEffect("sprungUp", 1, source);
            // remove bounce cd
            source.moveIds[moveId].cooldown = 0;
        } else {
            // if pokemon has "sprungUp" buff, remove it and deal damage
            source.removeEffect("sprungUp");
            for (const target of allTargets) {
                const miss = missedTargets.includes(target);
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    moveId: moveId
                });

                // if hit, 30% chance to paralyze
                if (!miss && Math.random() < 0.3) {
                    target.applyStatus(statusConditions.PARALYSIS, source);
                }
            }
        }
    },
    "m344": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m344";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 20% chance to paralyze
            if (!miss && Math.random() < 0.2) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }

        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m348": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m348";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // 5% atk true damage
            const damageToDeal = calculateDamage(moveData, source, target, miss) + Math.round(source.atk * 0.05);
            // deal half damage if target is not primary target
            source.dealDamage(Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)), target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m349": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m349"];
        for (const target of allTargets) {
            // raise attack and speed
            target.addEffect("atkUp", 3, source);
            target.addEffect("speUp", 3, source);
        }
    },
    "m352": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m352";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, confuse with 25% chance
            if (!miss && Math.random() < 0.25) {
                target.addEffect("confused", 2, source);
            }
        }
    },
    "m355": function (battle, source, primaryTarget, allTargets) {
        const moveId = "m355";
        for (const target of allTargets) {
            source.giveHeal(Math.min(Math.floor(target.maxHp / 2), target.maxHp - target.hp), target, {
                type: "move",
                moveId: moveId
            });

            // lose flying type
            target.addEffect("loseFlying", 1, source);
        }
    },
    "m361": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m361";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // fully heal
            source.giveHeal(target.maxHp, target, {
                type: "move",
                moveId: moveId
            });
            // fully restore cr
            target.boostCombatReadiness(source, 100);
        }
        // cause self to faint
        source.takeFaint(source);
    },
    "m366": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m366";
        const moveData = moveConfig[moveId];

        // get only target row
        const targetParty = battle.parties[primaryTarget.teamName];
        const boostTargets = source.getPatternTargets(targetParty, targetPatterns.ROW, primaryTarget.position);

        for (const target of allTargets) {
            // grant greater spe up for 2 turns
            target.addEffect("greaterSpeUp", 2, source);

            // grant 15% CR to backmost row
            if (boostTargets.includes(target)) {
                target.boostCombatReadiness(source, 15);
            }
        }
    },
    "m369": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m369";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // boost random non-self party pokemon cr to 100
        const party = battle.parties[source.teamName];
        const pokemons = source.getPatternTargets(party, targetPatterns.ALL_EXCEPT_SELF, 1);
        if (pokemons.length > 0) {
            const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
            pokemon.boostCombatReadiness(source, 100);
        } 
    },
    "m387": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m387";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // calculate power = base power * moves on cooldown
            const numCooldownMoves = Object.values(source.moveIds).filter(m => m.cooldown > 0).length;
            const power = moveData.power * numCooldownMoves;
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: power
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m392": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m392";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // add regeneration and def up
            target.addEffect("regeneration", 3, source, {
                healAmount: Math.floor(source.maxHp * 0.25),
            });
            target.addEffect("defUp", 2, source);
        }
    },
    "m394": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m394";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            // deal half damage if target is not primary target
            damageDealt += source.dealDamage(Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)), target, {
                type: "move",
                moveId: moveId
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
    "m394-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m394-1";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // get max of fire, dark multiplier
            const fireMultiplier = source.getTypeDamageMultiplier(types.FIRE, target);
            const darkMultiplier = source.getTypeDamageMultiplier(types.DARK, target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                type: Math.max(fireMultiplier, darkMultiplier)
            });
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // recoil damage to self
        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m396": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m398";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // ignore miss
            const damageToDeal = calculateDamage(moveData, source, target, false);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m398": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m398";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // 80% chance to poison
            if (!miss && Math.random() < 0.8) {
                target.applyStatus(statusConditions.POISON, source);
            }
        }
    },
    "m402": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m402";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            // deal half damage if target is not primary target
            source.dealDamage(Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)), target, {
                type: "move",
                moveId: moveId
            });
        }
    },      
    "m405": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m405";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // if not miss, 80% to spd down
            if (!miss && Math.random() < 0.8) {
                target.addEffect("spdDown", 2, source);
            }

            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m407": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m407";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 30% chance to flinch
            if (!miss && Math.random() < 0.3) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m409": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m409";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // heal half damage dealt
        source.giveHeal(Math.floor(damageDealt / 2), source, {
            type: "move",
            moveId: moveId
        });
    },
    "m413": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m413";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // recoil damage to self
        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m414": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m414";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 20% spd down 2 turns
            if (!miss && Math.random() < 0.2) {
                target.addEffect("spdDown", 2, source);
            }
        }
    },
    "m416": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m416";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            // deal 50% to non primary target
            source.dealDamage(Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)), target, {
                type: "move",
                moveId: moveId
            });
        }
        // apply recharge to self
        source.addEffect("recharge", 1, source);
    },
    "m417": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m417";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // sharply raise spatk
            target.addEffect("greaterSpaUp", 3, source);
        }
    },
    "m418": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m418";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // boost self cr by 30
        source.boostCombatReadiness(source, 30);
    },
    "m420": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m420";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // boost self cr by 30
        source.boostCombatReadiness(source, 30);
    },
    "m424": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m424";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 10% chance to burn
            if (!miss && Math.random() < 0.1) {
                target.applyStatus(statusConditions.BURN, source);
            }
            // if not miss, 10% chance to flinch for 1 turn
            if (!miss && Math.random() < 0.1) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m428": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m428";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, flinch for 1 turn
            if (!miss) {
                target.addEffect("flinched", 1, source);
            }
        }
    },
    "m430": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m430";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 20% to spd down
            if (!miss && Math.random() < 0.2) {
                target.addEffect("spdDown", 2, source);
            }
        }
    },
    "m433": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m433";
        // get all non-fainted, hitable pokemon
        const targets = Object.values(battle.allPokemon).filter(p => battle.isPokemonHittable(p, moveId));
        // if no targets, return
        if (targets.length === 0) {
            return;
        }
        
        // get mean spe of all targets
        const meanSpe = targets.reduce((acc, p) => acc + p.spe, 0) / targets.length;
        // for all targets apply effect: 
        // if spe > 1.4 * meanSpe, greater spe down
        // if spe > meanSpe, spe down
        // if spe < meanSpe, spe up
        // if spe < 0.60 * meanSpe, greater spe up
        for (const target of targets) {
            const spe = target.spe;
            if (spe > 1.4 * meanSpe) {
                target.addEffect("greaterSpeDown", 2, source);
            } else if (spe > meanSpe) {
                target.addEffect("speDown", 2, source);
            } else if (spe > meanSpe * 0.60) {
                target.addEffect("speUp", 2, source);
            } else {
                target.addEffect("greaterSpeUp", 2, source);
            }
        }
    },
    "m435": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m435";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // 35% chance to paralyze
            if (!miss && Math.random() < 0.35) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }
    },
    "m435-1": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m435-1";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, transfer 1 dispellable debuff
            if (!miss) {
                const possibleDebuffs = Object.keys(source.effectIds).filter(effectId => {
                    const effectData = effectConfig[effectId];
                    return effectData.type === effectTypes.DEBUFF && effectData.dispellable;
                });
                if (possibleDebuffs.length == 0) {
                    continue;
                }

                // get random debuff
                const debuffId = possibleDebuffs[Math.floor(Math.random() * possibleDebuffs.length)];
                const debuff = source.effectIds[debuffId];
                // remove debuff from source
                const dispelled = source.dispellEffect(debuffId);
                if (!dispelled) {
                    continue;
                }

                // apply debuff to target
                target.addEffect(debuffId, debuff.duration, source, debuff.initialArgs);
            }
        }
    },
    "m437": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m437";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            let damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // apply greater spa down to user 2 turns
        source.addEffect("greaterSpaDown", 2, source);
    },
    "m441": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m441";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            let damageToDeal = calculateDamage(moveData, source, primaryTarget, false);

            // if target poisoned, 1.5x damage
            if (primaryTarget.statusCondition === statusConditions.POISON || primaryTarget.statusCondition === statusConditions.BADLY_POISON) {
                damageToDeal = Math.round(damageToDeal * 1.5);
            }

            source.dealDamage(damageToDeal, primaryTarget, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 30% chance to poison
            if (!miss && Math.random() < 0.3) {
                primaryTarget.applyStatus(statusConditions.POISON, source);
            }
        }
    },
    "m444": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m444";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m446": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m446";
        const moveData = moveConfig[moveId];
        // stealth rock log
        battle.addToLog(`Sharp rocks were scattered on the ground near ${primaryTarget.teamName}'s side!`);
        for (const target of allTargets) {
            // give target stealthRock
            target.addEffect("stealthRock", 3, source);
        }
    },
    "m450": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m450";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, attempt to steal a buff
            if (!miss) {
                const possibleBuffs = Object.keys(target.effectIds).filter(effectId => {
                    const effectData = effectConfig[effectId];
                    return effectData.type === effectTypes.BUFF && effectData.dispellable;
                });
                if (possibleBuffs.length == 0) {
                    return;
                }

                // get random buff
                const buffIdToSteal = possibleBuffs[Math.floor(Math.random() * possibleBuffs.length)];
                const buffToSteal = target.effectIds[buffIdToSteal];
                // steal buff
                const dispelled = target.dispellEffect(buffIdToSteal);
                if (!dispelled) {
                    return;
                }
                // apply buff to self
                source.addEffect(buffIdToSteal, buffToSteal.duration, buffToSteal.source, buffToSteal.initialArgs);
            }
        }
    },
    "m469": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m469";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply wide guard 1 turn
            target.addEffect("wideGuard", 1, source);
        }
    },
    "m479": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m479";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss and target has flying type, apply loseFlying to target
            if (!miss && (target.type1 === types.FLYING || target.type2 === types.FLYING)) {
                target.addEffect("loseFlying", 1, source);
            }
        }
    },
    "m482": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m482";
        const moveData = moveConfig[moveId];

        // get only target row
        const targetParty = battle.parties[primaryTarget.teamName];
        const damageTargets = source.getPatternTargets(targetParty, targetPatterns.ROW, primaryTarget.position);

        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // only deal damage if target is primary target row
            if (damageTargets.includes(target)) {
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    moveId: moveId
                });
            }

            // if not miss, 40% chance to poison
            if (!miss && Math.random() < 0.4) {
                target.applyStatus(statusConditions.POISON, source);
            }
        }
    },
    "m483": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m483";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // boost spa, spd, spe
            target.addEffect("spaUp", 2, source);
            target.addEffect("spdUp", 2, source);
            target.addEffect("speUp", 2, source);
        }
    },
    "m484": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m484";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            let speedPower = 0;
            if (source.spe < 150) {
                speedPower = 35;
            } else if (source.spe < 300) {
                speedPower = 25;
            } else if (source.spe < 450) {
                speedPower = 15;
            } else {
                speedPower = 5;
            }
            const hpPower = Math.floor(source.maxHp / 15);
            const power = speedPower + hpPower;
            
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: power
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m505": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m505";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // heal 50%
            const healAmount = Math.floor(target.maxHp / 2);
            source.giveHeal(healAmount, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m506": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m506";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);

            let hasDebuff = false;
            for (const effect of Object.keys(target.effectIds)) {
                const effectData = effectConfig[effect];
                if (effectData.type === effectTypes.DEBUFF) {
                    hasDebuff = true;
                    break;
                }
            }
            const hasStatus = target.status.statusId !== null;
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: (hasDebuff || hasStatus) ? moveData.power + 25 : moveData.power
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m521": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m521";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target));
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }

        // boost random non-self party pokemon cr to 100
        const party = battle.parties[source.teamName];
        const pokemons = source.getPatternTargets(party, targetPatterns.ALL_EXCEPT_SELF, 1);
        if (pokemons.length > 0) {
            const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
            pokemon.boostCombatReadiness(source, 100);
        } 
    },
    "m523": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m523";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit, reduce targets speed for 1 turn
            if (!miss) {
                target.addEffect("speDown", 1, source);
            }
        }
    },
    "m525": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m525";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit, reduce target's cr by 30
            if (!miss) {
                target.reduceCombatReadiness(source, 30);
            }
        }
    },
    "m528": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m528";
        const moveData = moveConfig[moveId];
        let damageDealt = 0;
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target), {
                power: Math.floor(moveData.power + (source.spe * 0.1))
            });
            damageDealt += source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
        // recoil damage to self
        battle.addToLog(`${source.name} is affected by recoil!`);
        const damageToDeal = Math.max(Math.floor(damageDealt / 4), 1);
        source.dealDamage(damageToDeal, source, {
            type: "recoil"
        });
    },
    "m529": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m529";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m534": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m534";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, { 
                power: Math.floor(moveData.power + (source.def * 0.05))
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 50% to def down for 2 turns
            if (!miss && Math.random() < 0.5) {
                target.addEffect("defDown", 2, source);
            }
        }
    },
    "m540": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m540";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, { defStat: damageTypes.PHYSICAL });
            // deal half damage if target is not primary target
            source.dealDamage(Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)), target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m542": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m542";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit, 30% chance to confuse target
            if (!miss && Math.random() < 0.3) {
                target.addEffect("confused", 2, source);
            }
        }
    },
    "m565": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m565";
        const moveData = moveConfig[moveId];
        let defeatedEnemy = false;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            let damageToDeal = calculateDamage(moveData, source, primaryTarget, false);

            // if target poisoned, 1.5x damage
            if (primaryTarget.statusCondition === statusConditions.POISON || primaryTarget.statusCondition === statusConditions.BADLY_POISON) {
                damageToDeal = Math.round(damageToDeal * 1.5);
            }

            source.dealDamage(damageToDeal, primaryTarget, {
                type: "move",
                moveId: moveId
            });

            if (target.isFainted) {
                defeatedEnemy = true;
            }
        }

        // if enemy was defeated, greatly raise atk for 3 turns
        if (defeatedEnemy) {
            source.addEffect("greaterAtkUp", 3, source);
        }
    },
    "m573": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m573";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // see if target is water type
            const waterType = target.type1 === types.WATER || target.type2 === types.WATER;
            const miss = !waterType && missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, { type: waterType ? 2 : null });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if hit, 30% chance to freeze target (water = 100%)
            if (!miss && (waterType || Math.random() < 0.3)) {
                target.applyStatus(statusConditions.FREEZE, source);
            }
        }
    },
    "m572": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m572";
        const moveData = moveConfig[moveId];
        // deal less damage if more targets
        const numTargets = allTargets.length;
        const power = moveData.power - (numTargets - 1) * 5;
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss, {
                power: power
            });
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m574": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m574";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // ignore miss
            const damageToDeal = calculateDamage(moveData, source, target, false);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m585": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m585";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });

            // if not miss, 70% chance to lower spatk
            if (!miss && Math.random() < 0.7) {
                target.addEffect("spaDown", 2, source);
            }
        }
    },
    "m668": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m668";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            // heal hp equal to targets atk
            const healAmount = target.atk;
            source.giveHeal(healAmount, source, {
                type: "move",
                moveId: moveId
            });

            // if not miss, apply atk down to target 2 turns
            if (!miss) {
                target.addEffect("atkDown", 2, source);
            }
        }
    },
    "m719": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m719";
        const moveData = moveConfig[moveId];
        // filter out allTargets => just the primary target and up to 2 random other targets
        let damagedTargets = [];
        if (allTargets.length > 3) {
            const newTargets = [primaryTarget];
            const otherTargets = allTargets.filter(t => t !== primaryTarget);
            for (let i = 0; i < 2; i++) {
                const randomIndex = Math.floor(Math.random() * otherTargets.length);
                newTargets.push(otherTargets[randomIndex]);
                otherTargets.splice(randomIndex, 1);
            }
            damagedTargets = newTargets;
        } else {
            damagedTargets = allTargets;
        }
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (damagedTargets.includes(target)) {
                const damageToDeal = calculateDamage(moveData, source, target, miss);
                source.dealDamage(damageToDeal, target, {
                    type: "move",
                    moveId: moveId
                });
            }

            // if not miss, 10% chance to paralysis
            if (!miss && Math.random() < 0.1) {
                target.applyStatus(statusConditions.PARALYSIS, source);
            }
        }
    },
    "m876": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m876";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            const damageToDeal = calculateDamage(moveData, source, target, miss);
            source.dealDamage(damageToDeal, target, {
                type: "move",
                moveId: moveId
            });
        }
    },
    "m20001": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m20001";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // if primary target, increase cr to 100% and give spe up 2 turns
            if (target === primaryTarget) {
                target.boostCombatReadiness(source, 100);
                target.addEffect("speUp", 2, source);
            } else {
                // else, decrease cr by 30% and spe down 1 turn
                const miss = missedTargets.includes(target);
                if (miss) {
                    continue;
                }

                target.reduceCombatReadiness(source, 30);
                target.addEffect("speDown", 1, source);
            }
        }
    },
    "m20002": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m20002";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // use all HM moves
            const hmMoveIds = ["m57", "m70", "m127"];
            for (const [moveId, move] of Object.entries(source.moveIds)) {
                if (!hmMoveIds.includes(moveId)) {
                    continue;
                }

                // if on cooldown, reset cooldown
                if (move.cooldown > 0) {
                    source.reduceMoveCooldown(moveId, move.cooldown, source);
                } else {
                    const moveData = moveConfig[moveId];
                    // else, use move and set cooldown
                    battle.addToLog(`${source.name} used ${moveData.name}!`);
                    // get target
                    const targetParty = battle.parties[target.teamName];
                    const targets = source.getPatternTargets(targetParty, moveData.targetPattern, target.position, moveId);
                    moveExecutes[moveId](battle, source, target, targets, []);

                    // set cd
                    move.cooldown = moveData.cooldown;
                }
            }
        }
    },
    "m20003": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m20003";
        const moveData = moveConfig[moveId];
        
        // get random fainted enemy of primary target
        const enemyParty = primaryTarget.getEnemyParty();
        const enemyPokemons = enemyParty.pokemons;
        const faintedPokemons = enemyPokemons.filter(p => p && p.isFainted);
        if (faintedPokemons.length === 0) {
            battle.addToLog(`But it failed!`);
            return;
        }
        const randomIndex = Math.floor(Math.random() * faintedPokemons.length);
        const randomFaintedPokemon = faintedPokemons[randomIndex];

        // find an empty position in the party
        const allyParty = battle.parties[source.teamName];
        const emptyIndices = allyParty.pokemons.map((p, i) => p ? null : i).filter(i => i !== null);
        if (emptyIndices.length === 0) {
            battle.addToLog(`But it failed!`);
            return;
        }
        const randomEmptyIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

        // attempt to switch positions
        if (!randomFaintedPokemon.switchPositions(source.userId, randomEmptyIndex + 1, source)) {
            battle.addToLog(`But it failed!`);
            return;
        }

        // revive fainted pokemon with 50% hp
        randomFaintedPokemon.beRevived(Math.floor(randomFaintedPokemon.maxHp / 2), source);
    },
};

const abilityConfig = {
    "5": {
        "name": "Sturdy",
        "description": "The first time the user takes fatal damage, the user instead survives with 1 HP.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // attempt to get ability data
                    const ability = initialArgs.pokemon.ability;
                    if (!ability || ability.abilityId !== "5" || !ability.data) {
                        return;
                    }
                    const abilityData = ability.data;

                    // if fatal damage, set hp to 1
                    if (args.damage > targetPokemon.hp) {
                        args.damage = targetPokemon.hp - 1;
                        args.maxDamage= Math.min(args.maxDamage, args.damage);
                        targetPokemon.battle.addToLog(`${targetPokemon.name} hung on with Sturdy!`);
                        // remove event listener
                        targetPokemon.battle.eventHandler.unregisterListener(abilityData.listenerId);
                    }
                }
            };

            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "5" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "9": {
        "name": "Static",
        "description": "When the user takes damage and survives from a physical move, 30% chance to paralyze the attacker.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    const sourcePokemon = args.source;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // if physical, 30% chance to paralyze
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.damageType === damageTypes.PHYSICAL && Math.random() < 0.3) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Static affects ${sourcePokemon.name}!`);
                        sourcePokemon.applyStatus(statusConditions.PARALYSIS, targetPokemon);
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "9" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "10": {
        "name": "Volt Absorb",
        "description": "When the user takes damage from an electric move, negate the damage and heal 25% of max HP.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // if electric, negate damage and heal 25% of max hp
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type === types.ELECTRIC) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name} is healed by Volt Absorb!`);
                        targetPokemon.giveHeal(Math.floor(targetPokemon.maxHp * 0.25), targetPokemon, {
                            "type": "waterAbsorb"
                        });
                        args.damage = 0;
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "10" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "11": {
        "name": "Water Absorb",
        "description": "When the user takes damage from a water move, negate the damage and heal 25% of max HP.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // if water, negate damage and heal 25% of max hp
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type === types.WATER) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name} is healed by Water Absorb!`);
                        targetPokemon.giveHeal(Math.floor(targetPokemon.maxHp * 0.25), targetPokemon, {
                            "type": "waterAbsorb"
                        });
                        args.damage = 0;
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "11" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "14": {
        "name": "Compound Eyes",
        "description": "Increases accuracy of moves by 30%.",
        "abilityAdd": function (battle, source, target) {
            battle.addToLog(`${target.name}'s Compound Eyes ability increases its accuracy!`)
            target.acc += 30;
        },
        "abilityRemove": function (battle, source, target) {
            target.acc -= 30;
        }
    },
    "18": {
        "name": "Flash Fire",
        "description": "When the user takes damage from a fire move, negate the damage grant Atk. Up and Spa. Up. for 1 turn.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // if fire, negate damage and grant atk up, spa up
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type === types.FIRE) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Flash Fire was activated by the Fire attack!`);
                        targetPokemon.addEffect("atkUp", 1, targetPokemon);
                        targetPokemon.addEffect("spaUp", 1, targetPokemon);
                        args.damage = 0;
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "18" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "19": {
        "name": "Shield Dust",
        "description": "Prevents the user from being debuffed by dispellable debuffs.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const effectId = args.effectId;
                    const effectData = effectConfig[effectId];
                    if (!effectData) {
                        return;
                    }
                    if (!effectData.dispellable || effectData.type !== effectTypes.DEBUFF) {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Shield Dust blocks the debuff!`);
                    args.canAdd = false;
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_EFFECT_ADD, listener);
            
            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "19" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "20": {
        "name": "Own Tempo",
        "description": "Prevents the user from being confused.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.effectId !== "confused") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Own Tempo prevents confusion!`);
                    args.canAdd = false;
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_EFFECT_ADD, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "22": {
        "name": "Intimidate",
        "description": "At the start of battle, lowers the attack of the enemy Pokemon with the highest attack and the enemy Pokemon with the highest speed for 1 turn.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const sourcePokemon = initialArgs.pokemon;
                    const battle = args.battle;
                    const enemyParty = sourcePokemon.getEnemyParty();
                    const enemyPokemons = enemyParty.pokemons.filter(p => battle.isPokemonHittable(p));
                    if (enemyPokemons.length === 0) {
                        return;
                    }

                    // get pokemon with highest atk
                    let highestAtkPokemon = enemyPokemons[0];
                    let maxAtk = enemyPokemons[0].atk;
                    for (const pokemon of enemyPokemons) {
                        if (pokemon.atk > maxAtk) {
                            highestAtkPokemon = pokemon;
                            maxAtk = pokemon.atk;
                        }
                    }
                    battle.addToLog(`${sourcePokemon.name}'s Intimidate affects ${highestAtkPokemon.name}!`);
                    highestAtkPokemon.addEffect("atkDown", 1, sourcePokemon);

                    // get pokemon with highest spe
                    let highestSpePokemon = enemyPokemons[0];
                    let maxSpe = enemyPokemons[0].spe;
                    for (const pokemon of enemyPokemons) {
                        if (pokemon.spe > maxSpe) {
                            highestSpePokemon = pokemon;
                            maxSpe = pokemon.spe;
                        }
                    }
                    if (highestAtkPokemon === highestSpePokemon) {
                        return;
                    }
                    battle.addToLog(`${sourcePokemon.name}'s Intimidate affects ${highestSpePokemon.name}!`);
                    highestSpePokemon.addEffect("atkDown", 1, sourcePokemon);
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BATTLE_BEGIN, listener);
            return {
                "listenerId": listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "22" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "26": {
        "name": "Levitate",
        "description": "The user evades Ground-type moves and effects.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    const moveType = args.moveType;
                    if (moveType !== types.GROUND) {
                        return;
                    }
                    args.multiplier = 0;
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.CALCULATE_TYPE_MULTIPLIER, listener);
            return {
                "listenerId": listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "26" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "27": {
        "name": "Effect Spore",
        "description": "When the user is damaged by a physical move, the Pokemon that hit the user has a 30% chance of being inflicted with Poison, Paralysis, or Sleep.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    const sourcePokemon = args.source;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // if physical, 30% chance to status
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.damageType === damageTypes.PHYSICAL && Math.random() < 0.3) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Effect Spore affects ${sourcePokemon.name}!`);
                        // get status randomly
                        const possibleStatusConditions = [statusConditions.POISON, statusConditions.PARALYSIS, statusConditions.SLEEP];
                        const status = possibleStatusConditions[Math.floor(Math.random() * possibleStatusConditions.length)];
                        sourcePokemon.applyStatus(status, targetPokemon);
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "27" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },      
    "28": {
        "name": "Synchronize",
        // TODO: this functionality is different from the game, may need to nerf
        "description": "When the user is inflicted with a status condition, the Pokemon that inflicted the status condition is also inflicted with the same status condition.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    const sourcePokemon = args.source;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    if (targetPokemon === sourcePokemon) {
                        return;
                    }

                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Synchronize affects ${sourcePokemon.name}!`);
                    sourcePokemon.applyStatus(args.statusId, targetPokemon);
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_STATUS_APPLY, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "28" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "30": {
        "name": "Natural Cure",
        "description": "After the user targets an ally with a move, heal their status conditions. If the move is ULTIMATE, also dispell their debuffs.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const sourcePokemon = args.source;
                    const targetPokemons = args.targets;
                    if (initialArgs.pokemon !== sourcePokemon) {
                        return;
                    }
                    for (const target of targetPokemons) {
                        if (target.teamName !== sourcePokemon.teamName) {
                            continue;
                        }
                        if (target.isFainted) {
                            continue;
                        }

                        target.battle.addToLog(`${sourcePokemon.name}'s Natural Cure remedies ${target.name}!`);
                        target.removeStatus();
                        const moveData = moveConfig[args.moveId];
                        if (moveData && moveData.tier == moveTiers.ULTIMATE) {
                            for (const effectId in target.effectIds) {
                                const effectData = effectConfig[effectId];
                                if (effectData.type === effectTypes.DEBUFF) {
                                    target.dispellEffect(effectId);
                                }
                            }
                        }
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_MOVE, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "30" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "31": {
        "name": "Lightning Rod",
        "description": "When the user is targeted by an Electric-type move, the move is redirected to the user. This also boosts user's special attack for 1 turn if dealt damage.",
        "abilityAdd": function (battle, source, target) {
            // redirect listener
            const listener1 = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    // if redirect user isnt targetable, ignore
                    if (!args.user.battle.isPokemonTargetable(initialArgs.pokemon)) {
                        return;
                    }

                    // check that enemy used non-ally move, and that move is electric
                    const moveUser = args.user;
                    const moveData = moveConfig[args.moveId];
                    if (moveData.type !== types.ELECTRIC) {
                        return;
                    }
                    if (moveUser.teamName === initialArgs.pokemon.teamName) {
                        return;
                    }
                    if (moveData.targetType === targetTypes.ALLY) {
                        return;
                    }

                    args.eligibleTargets.push(initialArgs.pokemon);
                    args.shouldReturn = true;
                    return;
                }
            }
            // raise special attack on take damage from electric type move
            const listener2 = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type !== types.ELECTRIC) {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon.isFainted || targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Lightning Rod was activated by the Electric attack!`);
                    targetPokemon.addEffect("spaUp", 1, targetPokemon);
                }
            }
            const listenerId1 = battle.eventHandler.registerListener(battleEventNames.GET_ELIGIBLE_TARGETS, listener1);
            const listenerId2 = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener2);
            return {
                "listenerId1": listenerId1,
                "listenerId2": listenerId2,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "31" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId1);
            battle.eventHandler.unregisterListener(abilityData.listenerId2);
        }
    },
    "34": {
        "name": "Chlorophyll",
        "description": "Weather hasn't been implemented yet, so increases user speed by 25%.",
        "abilityAdd": function (battle, source, target) {
            battle.addToLog(`${target.name}'s Chlorophyll increases its speed!`);
            target.spe += Math.floor(target.spe * 0.25);
        },
        "abilityRemove": function (battle, source, target) {
            target.spe -= Math.floor(target.spe * 0.25);
        }
    },
    "35": {
        "name": "Illuminate",
        "description": "At the start of battle, reduce the evasion of the enemy front row for 2 turns.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const sourcePokemon = initialArgs.pokemon;
                    const battle = args.battle;
                    const teamNames = Object.keys(battle.teams);
                    // get enemy pokemons
                    const enemyTeamName = teamNames[0] === sourcePokemon.teamName ? teamNames[1] : teamNames[0];
                    const enemyPokemons = sourcePokemon.getPatternTargets(
                        sourcePokemon.battle.parties[enemyTeamName],
                        targetPatterns.ROW,
                        1
                    )
                    for (const pokemon of enemyPokemons) {
                        battle.addToLog(`${sourcePokemon.name}'s Illuminate affects ${pokemon.name}!`);
                        pokemon.addEffect("evaDown", 1, sourcePokemon);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BATTLE_BEGIN, listener);
            return {
                "listenerId": listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "35" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "38": {
        "name": "Poison Point",
        "description": "When the user is damaged by a physical move, the move user has a 30% chance to be poisoned.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    const sourcePokemon = args.source;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // if physical, 30% chance to poison
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.damageType === damageTypes.PHYSICAL && Math.random() < 0.3) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Poison Point affects ${sourcePokemon.name}!`);
                        sourcePokemon.applyStatus(statusConditions.POISON, targetPokemon);
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "38" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "39": {
        "name": "Inner Focus",
        "description": "Prevents the user from flinching.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.effectId !== "flinched") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Inner Focus prevents flinching!`);
                    args.canAdd = false;
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_EFFECT_ADD, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "39" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "46": {
        "name": "Pressure",
        "description": "When the user takes or deals damage, put a random available move for the target on cooldown for 2 turns, if it can have a cooldown. Can only be triggered once per-target.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    // check who should be affected
                    let targetPokemon = null;
                    if (initialArgs.pokemon === args.source) {
                        targetPokemon = args.target;
                    } else if (initialArgs.pokemon === args.target) {
                        targetPokemon = args.source;
                    } else {
                        return;
                    }

                    // attempt to get ability data
                    const ability = initialArgs.pokemon.ability;
                    if (!ability || ability.abilityId !== "46" || !ability.data) {
                        return;
                    }
                    const abilityData = ability.data;

                    // if target already affected or fainted, return
                    if (targetPokemon.isFainted || abilityData.affectedPokemons.includes(targetPokemon)) {
                        return;
                    }

                    // find all target moves that can have cooldown and increase cooldown of a random available one by 2
                    const targetMoveIds = targetPokemon.moveIds;
                    const possibleMoves = Object.entries(targetMoveIds).filter(([moveId, move]) => {
                        const moveData = moveConfig[moveId];
                        const currentCooldown = move.cooldown;
                        return moveData.cooldown && currentCooldown === 0;
                    });
                    if (possibleMoves.length === 0) {
                        return;
                    }
                    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    randomMove[1].cooldown = 2;
                    targetPokemon.battle.addToLog(`${initialArgs.pokemon.name} is exerting Pressure against ${targetPokemon.name}'s ${moveConfig[randomMove[0]].name}!`)
                    abilityData.affectedPokemons.push(targetPokemon);
                }
            }

            // add listener to after damage dealt and after damage taken
            const dealtListenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_DEALT, listener);
            const takenListenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);

            return {
                dealtListenerId: dealtListenerId,
                takenListenerId: takenListenerId,
                affectedPokemons: [target],
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "46" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.dealtListenerId);
            battle.eventHandler.unregisterListener(abilityData.takenListenerId);
        }
    },
    "47": {
        "name": "Thick Fat",
        "description": "Reduces damage taken from fire and ice moves by 50%.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if move type === fire or ice, reduce damage by 50%
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type === types.FIRE || moveData.type === types.ICE) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Thick Fat reduces damage taken!`);
                        args.damage = Math.round(args.damage * 0.5);
                    }
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);

            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "47" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "50": {
        "name": "Run Away",
        "description": "The first time this Pokemon's HP is reduced below 25%, increase its combat readiness to 100%.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon.isFainted || targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    // attempt to get ability data
                    const ability = initialArgs.pokemon.ability;
                    if (!ability || ability.abilityId !== "50" || !ability.data) {
                        return;
                    }
                    const abilityData = ability.data;

                    // if hp < 25%, increase combat readiness to 100%
                    if (targetPokemon.hp < targetPokemon.maxHp / 4) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Run Away increases its combat readiness!`);
                        targetPokemon.boostCombatReadiness(targetPokemon, 100);
                        // remove event listener
                        targetPokemon.battle.eventHandler.unregisterListener(abilityData.listenerId);
                    }
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);

            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "50" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "52": {
        "name": "Hyper Cutter",
        "description": "Prevents the user's attack from being lowered by Atk. Down and Greater Atk. Down.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.effectId !== "atkDown" && args.effectId !== "greaterAtkDown") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Hyper Cutter prevents its attack from being lowered!`);
                    args.canAdd = false;
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_EFFECT_ADD, listener);
            
            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "52" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "53": {
        "name": "Pickup",
        "description": "After an other ally loses a dispellable buff, have a 20% chance to gain that buff for 1 turn.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon === initialArgs.pokemon || targetPokemon.teamName !== initialArgs.pokemon.teamName) {
                        return;
                    }

                    const effectData = effectConfig[args.effectId];
                    if (!effectData || !effectData.dispellable || effectData.type !== effectTypes.BUFF) {
                        return;
                    }

                    // 20% chance to gain buff
                    if (Math.random() < 0.2) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Pickup gains ${effectData.name}!`);
                        // apply buff to self
                        source.addEffect(args.effectId, 1, args.source, args.initialArgs);
                    }
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_EFFECT_REMOVE, listener);

            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "53" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "56": {
        "name": "Cute Charm",
        "description": "Before the user is hit by a physical move, there is a 30% chance to lower the attacker's attack for 1 turn.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    const sourcePokemon = args.source;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if move is physical, 30% chance to lower attacker's attack for 1 turn
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.damageType === damageTypes.PHYSICAL && Math.random() < 0.3) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Cute Charm affects ${sourcePokemon.name}!`);
                        sourcePokemon.addEffect("atkDown", 1, targetPokemon);
                    }
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);

            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "56" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "65": {
        "name": "Overgrow",
        "description": "Increases damage of grass moves by 50% when HP is below 1/3.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const userPokemon = args.source;
                    if (userPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if move type === grass and hp < 1/3, increase damage by 50%
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type === types.GRASS && userPokemon.hp < userPokemon.maxHp / 3) {
                        userPokemon.battle.addToLog(`${userPokemon.name}'s Overgrow increases damage!`);
                        args.damage = Math.round(args.damage * 1.5);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_DEALT, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "65" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "66": {
        "name": "Blaze",
        "description": "Increases damage of fire moves by 50% when HP is below 1/3.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const userPokemon = args.source;
                    if (userPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if move type === fire and hp < 1/3, increase damage by 50%
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type === types.FIRE && userPokemon.hp < userPokemon.maxHp / 3) {
                        userPokemon.battle.addToLog(`${userPokemon.name}'s Blaze increases damage!`);
                        args.damage = Math.round(args.damage * 1.5);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_DEALT, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "66" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "67": {
        "name": "Torrent",
        "description": "Increases damage of water moves by 50% when HP is below 1/3.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const userPokemon = args.source;
                    if (userPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if move type === water and hp < 1/3, increase damage by 50%
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.type === types.WATER && userPokemon.hp < userPokemon.maxHp / 3) {
                        userPokemon.battle.addToLog(`${userPokemon.name}'s Torrent increases damage!`);
                        args.damage = Math.round(args.damage * 1.5);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_DEALT, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "67" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "71": {
        "name": "Arena Trap",
        "description": "Whenever the user damages a target, restrict their combat readiness boosts for 2 turns. Doesn't affect Pokemon in the air.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const sourcePokemon = args.source;
                    const targetPokemon = args.target;
                    if (sourcePokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if target is not flying, restrict combat readiness boosts for 2 turns
                    if (sourcePokemon.getTypeDamageMultiplier(types.GROUND, targetPokemon) !== 0) {
                        targetPokemon.addEffect("arenaTrap", 2, sourcePokemon);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_DEALT, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "71" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "75": {
        "name": "Shell Armor",
        "description": "Reduces damage taken from moves by 12.5%.",
        "abilityAdd": function (battle, source, target) {
            battle.addToLog(`${target.name}'s Shell Armor is reducing its damage taken!`);
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // reduce damage taken by 12.5%
                    args.damage = Math.round(args.damage * 0.875);
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "75" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "89": {
        "name": "Iron Fist",
        "description": "Increases damage of punching moves by 20%.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const userPokemon = args.source;
                    if (userPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if move type === punch, increase damage by 20%
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.name.toLowerCase().includes("punch")) {
                        userPokemon.battle.addToLog(`${userPokemon.name}'s Iron Fist increases the damage!`);
                        args.damage = Math.round(args.damage * 1.2);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_DEALT, listener);
            return {
                "listenerId": listenerId,
            };
        }
    },
    "97": {
        "name": "Sniper",
        "description": "Increases damage dealt by user to the BACKMOST row by 50%.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const userPokemon = args.source;
                    const targetPokemon = args.target;
                    if (userPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if target is backmost row, increase damage by 50%
                    const { party, row, col } = targetPokemon.getPartyRowColumn();
                    if (row === party.rows - 1) {
                        args.damage = Math.round(args.damage * 1.5);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_DEALT, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "97" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "99": {
        "name": "No Guard",
        "description": "Moves used by and against the user never miss.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const sourcePokemon = args.source;
                    const targetPokemon = args.target;
                    if (sourcePokemon !== initialArgs.pokemon && targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    args.hitChance = 100;
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.CALCULATE_MISS, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "99" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "101": {
        "name": "Technician",
        "description": "Increases damage dealt by moves with 60 base power or less by 50%.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const sourcePokemon = args.source;
                    const targetPokemon = args.target;
                    if (sourcePokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if move has 60 base power or less, increase damage by 50%
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.power <= 60) {
                        sourcePokemon.battle.addToLog(`${sourcePokemon.name}'s Technician is increasing its damage!`);
                        args.damage = Math.round(args.damage * 1.5);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_DEALT, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "101" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "108": {
        "name": "Forewarn",
        "description": "The user takes 15% less damage from super effective and ultimate moves.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const sourcePokemon = args.source;
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (!moveData) {
                        return;
                    }

                    // if move is super effective or ultimate, reduce damage by 15%
                    if (moveData.tier === moveTiers.ULTIMATE || sourcePokemon.getTypeDamageMultiplier(moveData.type, targetPokemon) > 1) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Forewarn reduces the damage!`);
                        args.damage = Math.round(args.damage * 0.85);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "108" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "111": {
        "name": "Filter",
        "description": "The user takes 20% less damage from super effective moves.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const sourcePokemon = args.source;
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (!moveData) {
                        return;
                    }

                    // if move is super effective or ultimate, reduce damage by 20%
                    if (sourcePokemon.getTypeDamageMultiplier(moveData.type, targetPokemon) > 1) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Filter reduces the damage!`);
                        args.damage = Math.round(args.damage * 0.8);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "111" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "130": {
        "name": "Cursed Body",
        "description": "When the user is damaged by a move, the move has a 30% chance to increase its cooldown by 2.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const sourcePokemon = args.source;
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    if (!sourcePokemon.moveIds[args.damageInfo.moveId]) {
                        return;
                    }
                    
                    // 30% chance to increase cooldown by 2
                    if (Math.random() < 0.3) {
                        targetPokemon.battle.addToLog(`${sourcePokemon.name} was cursed by ${targetPokemon.name}'s Cursed Body!`);
                        sourcePokemon.moveIds[args.damageInfo.moveId].cooldown += 2;
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "130" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "138": {
        "name": "Multiscale",
        "description": "Reduces damage taken by 50% when HP is full.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    // if hp is full, reduce damage by 50%
                    if (targetPokemon.hp === targetPokemon.maxHp) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Multiscale reduces damage taken!`);
                        args.damage = Math.round(args.damage * 0.5);
                    }
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "138" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "143": {
        "name": "Poison Touch",
        "description": "When the user is damaged by a physical move, the move user has a 30% chance to be poisoned.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.damageInfo.type !== "move") {
                        return;
                    }

                    const targetPokemon = args.target;
                    const sourcePokemon = args.source;
                    if (targetPokemon.isFainted || initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // if physical, 30% chance to poison
                    const moveData = moveConfig[args.damageInfo.moveId];
                    if (moveData.damageType === damageTypes.PHYSICAL && Math.random() < 0.3) {
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Poison Touch affects ${sourcePokemon.name}!`);
                        sourcePokemon.applyStatus(statusConditions.POISON, targetPokemon);
                    }
                }
            };
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, listener);
            return {
                "listenerId": listenerId
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "143" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "145": {
        "name": "Big Pecks",
        "description": "Immune to Def. Down and Greater Def. Down.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    if (args.effectId !== "defDown" && args.effectId !== "greaterDefDown") {
                        return;
                    }

                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }
                    
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Big Pecks prevents the defense drop!`);
                    args.canAdd = false;
                }
            }
            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_EFFECT_ADD, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "145" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "20001": {
        "name": "Mind Presence",
        "description": "Whenever an enemy ends a turn, increase the user's combat readiness by 10% attacking stats by 2% without triggering effects. The user cannot be damaged by more than 35% of its max HP at a time. The user is immune to instant-faint effects.",
        "abilityAdd": function (battle, source, target) {
            const turnListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const pokemon = initialArgs.pokemon;
                    const activePokemon = pokemon.battle.activePokemon;
                    if (activePokemon.teamName === pokemon.teamName) {
                        return;
                    }

                    pokemon.battle.addToLog(`${pokemon.name}'s Mind Presence increases its combat readiness and attacking stats!`);
                    pokemon.boostCombatReadiness(pokemon, 10, false);
                    pokemon.atk += Math.round(pokemon.atk * 0.02);
                    pokemon.spa += Math.round(pokemon.spa * 0.02);
                }
            }
            const damageListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    const damage = args.damage;
                    const maxHp = targetPokemon.maxHp;
                    if (damage > maxHp * 0.35) {
                        args.damage = Math.floor(maxHp * 0.35);
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Mind Presence reduces damage taken!`);
                    }
                }
            }
            const faintListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    args.canFaint = false;
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Mind Presence prevents it from fainting!`);
                }
            }

            const turnListenerId = battle.eventHandler.registerListener(battleEventNames.TURN_END, turnListener);
            const damageListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, damageListener);
            const faintListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_CAUSE_FAINT, faintListener);
            return {
                "turnListenerId": turnListenerId,
                "damageListenerId": damageListenerId,
                "faintListenerId": faintListenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20001" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.turnListenerId);
            battle.eventHandler.unregisterListener(abilityData.damageListenerId);
            battle.eventHandler.unregisterListener(abilityData.faintListenerId);
        }
    },
    "20002": {
        "name": "Soul Body",
        "description": "Whenever the user survives damage, increase its combat readiness by 15% without triggering effects, and heal all allies by 5% of its max HP. The user cannot be damaged by more than 35% of its max HP at a time. The user is immune to instant-faint effects.",
        "abilityAdd": function (battle, source, target) {
            const afterDamageListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon.isFainted || targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Soul Body increases its combat readiness and heals its allies!`);
                    targetPokemon.boostCombatReadiness(targetPokemon, 15, false);
                    const allyParty = targetPokemon.battle.parties[targetPokemon.teamName];
                    const allyPokemons = targetPokemon.getPatternTargets(allyParty, targetPatterns.ALL_EXCEPT_SELF, targetPokemon.position);
                    for (const allyPokemon of allyPokemons) {
                        targetPokemon.giveHeal(Math.round(targetPokemon.maxHp * 0.05), allyPokemon, {
                            "type": "soulBody"
                        });
                    }
                }
            }
            const damageListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    const damage = args.damage;
                    const maxHp = targetPokemon.maxHp;
                    if (damage > maxHp * 0.35) {
                        args.damage = Math.floor(maxHp * 0.35);
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Soul Body reduces damage taken!`);
                    }
                }
            }
            const faintListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    args.canFaint = false;
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Soul Body prevents it from fainting!`);
                }
            }

            const afterDamageListenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_DAMAGE_TAKEN, afterDamageListener);
            const damageListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, damageListener);
            const faintListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_CAUSE_FAINT, faintListener);
            return {
                "afterDamageListenerId": afterDamageListenerId,
                "damageListenerId": damageListenerId,
                "faintListenerId": faintListenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20002" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.afterDamageListenerId);
            battle.eventHandler.unregisterListener(abilityData.damageListenerId);
            battle.eventHandler.unregisterListener(abilityData.faintListenerId);
        }
    },
    "20003": {
        "name": "Soul Energy",
        "description": "Whenever the user's turn ends, increase the combat readiness of all allies by 15% without triggering effects. The user cannot be damaged by more than 55% of its max HP at a time. The user is immune to instant-faint effects.",
        "abilityAdd": function (battle, source, target) {
            const turnListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const pokemon = initialArgs.pokemon;
                    const activePokemon = pokemon.battle.activePokemon;
                    if (activePokemon !== pokemon) {
                        return;
                    }

                    pokemon.battle.addToLog(`${pokemon.name}'s Soul Energy increases its allies' combat readiness!`);
                    const allyParty = pokemon.battle.parties[pokemon.teamName];
                    const allyPokemons = pokemon.getPatternTargets(allyParty, targetPatterns.ALL, pokemon.position);
                    for (const allyPokemon of allyPokemons) {
                        allyPokemon.boostCombatReadiness(pokemon, 15, false);
                    }
                }
            }
            const damageListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    const damage = args.damage;
                    const maxHp = targetPokemon.maxHp;
                    if (damage > maxHp * 0.55) {
                        args.damage = Math.floor(maxHp * 0.55);
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Soul Energy reduces damage taken!`);
                    }
                }
            }
            const faintListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    args.canFaint = false;
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Soul Energy prevents it from fainting!`);
                }
            }

            const turnListenerId = battle.eventHandler.registerListener(battleEventNames.TURN_END, turnListener);
            const damageListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, damageListener);
            const faintListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_CAUSE_FAINT, faintListener);
            return {
                "turnListenerId": turnListenerId,
                "damageListenerId": damageListenerId,
                "faintListenerId": faintListenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20003" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.turnListenerId);
            battle.eventHandler.unregisterListener(abilityData.damageListenerId);
            battle.eventHandler.unregisterListener(abilityData.faintListenerId);
        }
    },
    "20004": {
        "name": "Spirit Power",
        "description": "Whenever a Pokemon faints, permanently incease the user's attacking stats and speed by 20% without triggering effects. The user cannot be damaged by more than 55% of its max HP at a time. The user is immune to instant-faint effects.",
        "abilityAdd": function (battle, source, target) {
            const afterFaintListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const pokemon = initialArgs.pokemon;
                    const targetPokemon = args.target;
                    if (targetPokemon === pokemon) {
                        return;
                    }

                    pokemon.battle.addToLog(`${pokemon.name}'s Spirit Power increases its attacking stats and speed!`);
                    pokemon.atk += Math.floor(pokemon.atk * 0.2);
                    pokemon.spa += Math.floor(pokemon.spa * 0.2);
                    pokemon.spe += Math.floor(pokemon.spe * 0.2);
                }
            }
            const damageListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    const damage = args.damage;
                    const maxHp = targetPokemon.maxHp;
                    if (damage > maxHp * 0.55) {
                        args.damage = Math.floor(maxHp * 0.55);
                        args.maxDamage = Math.min(args.maxDamage, args.damage);
                        targetPokemon.battle.addToLog(`${targetPokemon.name}'s Spirit Power reduces damage taken!`);
                    }
                }
            }
            const faintListener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon !== initialArgs.pokemon) {
                        return;
                    }

                    args.canFaint = false;
                    targetPokemon.battle.addToLog(`${targetPokemon.name}'s Spirit Power prevents it from fainting!`);
                }
            }

            const afterFaintListenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_FAINT, afterFaintListener);
            const damageListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, damageListener);
            const faintListenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_CAUSE_FAINT, faintListener);
            return {
                "afterFaintListenerId": afterFaintListenerId,
                "damageListenerId": damageListenerId,
                "faintListenerId": faintListenerId,
            };
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20004" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.afterFaintListenerId);
            battle.eventHandler.unregisterListener(abilityData.damageListenerId);
            battle.eventHandler.unregisterListener(abilityData.faintListenerId);
        }
    },
    "20005": {
        "name": "False Democracy",
        "description": "Whenever an enemy gains combat readiness, disable its ultimate move for 1 turn. This can only happen once per-enemy.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (targetPokemon.teamName === initialArgs.pokemon.teamName) {
                        return;
                    }

                    // attempt to get ability data
                    const ability = initialArgs.pokemon.ability;
                    if (!ability || ability.abilityId !== "20005" || !ability.data) {
                        return;
                    }
                    const abilityData = ability.data;

                    // if target already affected or fainted, return
                    if (targetPokemon.isFainted || abilityData.affectedPokemons.includes(targetPokemon)) {
                        return;
                    }

                    // apply disable for 1 turn
                    targetPokemon.battle.addToLog(`${targetPokemon.name} suffers under ${initialArgs.pokemon.name}'s False Democracy!`);
                    targetPokemon.addEffect("disable", 1, initialArgs.pokemon);
                    abilityData.affectedPokemons.push(targetPokemon);
                }
            }

            // add listener to after cr gain
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_CR_GAINED, listener);

            return {
                "listenerId": listenerId,
                affectedPokemons: [target],
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20005" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "20006": {
        "name": "Anarchy",
        "description": "Every other turn, the user enters Anarchy mode. This increases the user's speed by 100%, but decreases accuracy by 50%. Starts the battle in Anarchy mode.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const battle = initialArgs.pokemon.battle;
                    const activePokemon = battle.activePokemon;
                    if (activePokemon !== initialArgs.pokemon) {
                        return;
                    }

                    // attempt to get ability data
                    const ability = initialArgs.pokemon.ability;
                    if (!ability || ability.abilityId !== "20006" || !ability.data) {
                        return;
                    }
                    const abilityData = ability.data;

                    // if already in anarchy mode, make not in anarchy mode
                    if (abilityData.inAnarchyMode) {
                        abilityData.inAnarchyMode = false;
                        battle.addToLog(`${initialArgs.pokemon.name} exits Anarchy mode!`);
                        initialArgs.pokemon.spe -= initialArgs.pokemon.bspe;
                        initialArgs.pokemon.acc += 50;
                    } else {
                        // otherwise, make in anarchy mode
                        abilityData.inAnarchyMode = true;
                        battle.addToLog(`${initialArgs.pokemon.name} enters Anarchy mode!`);
                        initialArgs.pokemon.spe += initialArgs.pokemon.bspe;
                        initialArgs.pokemon.acc -= 50;
                    }
                }
            }

            // add listener to after turn end
            const listenerId = battle.eventHandler.registerListener(battleEventNames.TURN_END, listener);

            // start in anarchy mode
            target.spe += target.bspe;
            target.acc -= 50;
            battle.addToLog(`${target.name} enters Anarchy mode!`);

            return {
                "listenerId": listenerId,
                inAnarchyMode: true,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20006" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);

            // if in anarchy mode, remove anarchy mode
            if (abilityData.inAnarchyMode) {
                abilityData.inAnarchyMode = false;
                target.spe -= target.bspe;
                target.acc += 50;
            }
        }
    },
    "20007": {
        "name": "Bloody Sunday",
        "description": "Whenever an ally Pokemon faints, increase the user's combat readiness to 100%.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const battle = initialArgs.pokemon.battle;
                    const targetPokemon = args.target;
                    if (targetPokemon.teamName !== initialArgs.pokemon.teamName) {
                        return;
                    }

                    // if user not fainted, set user cr to 100%
                    if (!initialArgs.pokemon.isFainted) {
                        battle.addToLog(`${targetPokemon.name} has been sacrificed to ${initialArgs.pokemon.name}'s Bloody Sunday!`);
                        initialArgs.pokemon.boostCombatReadiness(initialArgs.pokemon, 100);
                    }
                }
            }

            // add listener to after faint
            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_FAINT, listener);

            return {
                "listenerId": listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20007" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "20008": {
        "name": "Resurrection",
        "description": "The first time the user would take lethal damage, prevent it and set its combat readiness to 100%.",
        "abilityAdd": function (battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const targetPokemon = args.target;
                    if (initialArgs.pokemon !== targetPokemon) {
                        return;
                    }

                    // attempt to get ability data
                    const ability = initialArgs.pokemon.ability;
                    if (!ability || ability.abilityId !== "20008" || !ability.data) {
                        return;
                    }
                    const abilityData = ability.data;

                    // if fatal damage, prevent it and set cr to 100
                    if (args.damage > targetPokemon.hp) {
                        args.damage = 0;
                        args.maxDamage= Math.min(args.maxDamage, args.damage);
                        targetPokemon.battle.addToLog(`${targetPokemon.name} resurrects!`);
                        targetPokemon.boostCombatReadiness(targetPokemon, 100);
                        // remove event listener
                        targetPokemon.battle.eventHandler.unregisterListener(abilityData.listenerId);
                    }
                }
            };

            const listenerId = battle.eventHandler.registerListener(battleEventNames.BEFORE_DAMAGE_TAKEN, listener);
            return {
                listenerId: listenerId,
            }
        },
        "abilityRemove": function (battle, source, target) {
            const ability = target.ability;
            if (!ability || ability.abilityId !== "20008" || !ability.data) {
                return;
            }
            const abilityData = ability.data;
            battle.eventHandler.unregisterListener(abilityData.listenerId);
        }
    },
    "20009": {
        "name": "Royalty",
        "description": "Boosts the user's Special Attack by 25% of its Attack.",
        "abilityAdd": function (battle, source, target) {
            const batk = target.batk;
            target.spa += Math.floor(batk * 0.25);
            battle.addToLog(`${target.name}'s Royalty boosted its Special Attack!`);
            return {};
        },
        "abilityRemove": function (battle, source, target) {
            target.spa -= Math.floor(target.batk * 0.25);
        }
    },
};

module.exports = {
    typeAdvantages,
    battleEventNames,
    moveConfig,
    moveExecutes,
    moveTiers,
    targetTypes,
    targetPositions,
    targetPatterns,
    effectConfig,
    effectTypes,
    statusConditions,
    calculateDamage,
    abilityConfig,
};