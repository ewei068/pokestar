const { types } = require("./pokemonConfig");

const battleEventNames = {
    BATTLE_BEGIN: "battleStart",
    TURN_END: "turnEnd",
    TURN_BEGIN: "turnBegin",
    MOVE_BEGIN: "moveBegin",
    BEFORE_DAMAGE_TAKEN: "beforeDamageTaken",
    AFTER_CR_GAINED: "afterCRGained",
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
    type = type !== null ? type : getTypeDamageMultiplier(move.type, target);
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
                target.atk -= Math.floor(target.batk * 0.35);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Attack drop faded!`);
            target.atk += Math.floor(target.batk * 0.35);
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
                target.atk -= Math.floor(target.batk * 0.6);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Attack drop faded!`);
            target.atk += Math.floor(target.batk * 0.6);
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
                target.def -= Math.floor(target.bdef * 0.35);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Defense drop faded!`);
            target.def += Math.floor(target.bdef * 0.35);
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
                target.def += Math.floor(target.bdef * 0.35);
            }
            target.def -= Math.floor(target.bdef * 0.6);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Defense drop faded!`);
            target.def += Math.floor(target.bdef * 0.6);
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
            battle.addToLog(`${target.name}'s Special Defense drop faded!`);
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
                target.spd -= Math.floor(target.bspd * 0.35);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Defense drop faded!`);
            target.spd += Math.floor(target.bspd * 0.35);
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
                target.spd += Math.floor(target.bspd * 0.35);
            }
            target.spd -= Math.floor(target.bspd * 0.6);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Special Defense drop faded!`);
            target.spd += Math.floor(target.bspd * 0.6);
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
                target.spe += Math.floor(target.bspe * 0.35);
            }
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed boost faded!`);
            target.spe -= Math.floor(target.bspe * 0.35);
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
                target.spe -= Math.floor(target.bspe * 0.35);
            }
            target.spe += Math.floor(target.bspe * 0.6);
        },
        "effectRemove": function(battle, target) {
            battle.addToLog(`${target.name}'s Speed boost faded!`);
            target.spe -= Math.floor(target.bspe * 0.6);
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
        "effectAdd": function(battle, source, target) {
            battle.addToLog(`${target.name} flinched!`);
        },
        "effectRemove": function(battle, target) {
            // nothing
        },
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
    "delayedHeal": {
        "name": "Delayed Heal",
        "description": "The target will be healed at the end of the duration.",
        "type": effectTypes.BUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target, args) {
        },
        "effectRemove": function(battle, target, args) {
            const effect = target.effectIds.delayedHeal;
            if (effect && effect.duration > 0) {
                return;
            }

            battle.addToLog(`${target.name} was healed by ${effect.source.name}!`);
            const healAmount = args.healAmount;
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
        "effectAdd": function(battle, source, target, args) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                    healAmount: args.healAmount,
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
    "stealthRock": {
        "name": "Stealth Rock",
        "description": "The target is affected by Stealth Rock.",
        "type": effectTypes.DEBUFF,
        "dispellable": true,
        "effectAdd": function(battle, source, target) {
            const listener = {
                initialArgs: {
                    pokemon: target,
                },
                execute: function(initialArgs, args) {
                    const affectedPokemon = initialArgs.pokemon;
                    const targetPokemon = args.target;
                    if (affectedPokemon !== targetPokemon) {
                        return;
                    }

                    // get damage multiplier
                    let mult = getTypeDamageMultiplier(types.ROCK, targetPokemon);
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
                    const damage = Math.floor(targetPokemon.maxHp * mult / 8);
                    targetPokemon.takeDamage(damage, affectedPokemon, {
                        "type": "stealthRock",
                    });
                }
            }

            const listenerId = battle.eventHandler.registerListener(battleEventNames.AFTER_CR_GAINED, listener);
            return {
                "listenerId": listenerId,
            };
        },
        "effectRemove": function(battle, target, args) {
            const listenerId = args.listenerId;
            battle.eventHandler.unregisterListener(listenerId);
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
    "m34": {
        "name": "Body Slam",
        "type": types.NORMAL,
        "power": 75,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.FRONT,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user drops onto the target with its full body weight. This has a 30% chance to leave the target with paralysis.",
    },
    "m38": {
        "name": "Double Edge",
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
        "power": 90,
        "accuracy": 90,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.SPECIAL,
        "description": "The target is struck with an icy-cold beam of energy. This has a 35% chance to freeze the target.",
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
        "accuracy": 85,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.ANY,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.OTHER,
        "description": "The user scatters a big cloud of sleep-inducing dust around the target.",
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
        "description": "The user taunts the target into only using moves with base power for 3 turns.",
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
        "cooldown": 5,
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
        "description": "The user whips up a turbulent whirlwind that sharply raises the Speed of all party Pokémon for 2 turns and boosting combat readiness by 15%.",
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
        "description": "The user cloaks itself in fire and charges at the target, and damaging it and dealing 50% damage to surrounding targets. This also damages the user by a third of the damage dealt, and has a 10% chance to leave targets with a burn.",
    },
    "m398": {
        "name": "Poison Jab",
        "type": types.POISON,
        "power": 80,
        "accuracy": 100,
        "cooldown": 4,
        "targetType": targetTypes.ENEMY,
        "targetPosition": targetPositions.BACK,
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user stabs the target with a poisonous stinger. This has a 80% chance to poison the target.",
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
    "m444": {
        "name": "Stone Edge",
        "type": types.ROCK,
        "power": 80,
        "accuracy": 80,
        "cooldown": 5,
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
        "description": "The user lays a trap of levitating stones around the target for 3 turns. The trap hurts opposing Pokemon that have their combat readiness boosted.",
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
        "targetPattern": targetPatterns.SINGLE,
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user slams into the target with its heavy body. Power increases in proportion to how slow the user is and user max HP.",
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
        "tier": moveTiers.POWER,
        "damageType": damageTypes.PHYSICAL,
        "description": "The user shrouds itself in electricity and smashes into the target, increasing base power by 10% of user's speed. This also damages the user by 25% of damage dealt.",
    },
    "m540": {
        "name": "Psystrke",
        "type": types.PSYCHIC,
        "power": 95,
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
    }
};

const moveExecutes = {
    "m16": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m16";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const damageToDeal = calculateDamage(moveData, source, target, missedTargets.includes(target));
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

            // if hit, freeze target with 35% chance
            if (!miss && Math.random() < 0.35) {
                target.applyStatus(statusConditions.FREEZE, source);
            }
        }
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
    "m76": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m76";
        const moveData = moveConfig[moveId];
        // if pokemon doesnt have "abosrb light" buff, apply it
        if (source.effectIds.absorbLight === undefined) {
            source.addEffect("absorbLight", 2, source);
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
    "m89": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m89";
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
    "m97": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m97"];
        for (const target of allTargets) {
            // apply greaterSpeUp buff
            target.addEffect("greaterSpeUp", 4, source);
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
    "m143": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m143";
        const moveData = moveConfig[moveId];
        let defeatedEnemy = false;
        // two turn move logic
        if (source.effectIds.skyCharge === undefined) {
            source.addEffect("skyCharge", 2, source);
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
        const targetRow = Math.floor((primaryTarget.position - 1) / targetParty.cols);
        const targetCol = (primaryTarget.position - 1) % targetParty.cols;
        const surroundingTargets = source.getPatternTargets(targetParty, targetPatterns.ALL, targetRow, targetCol);
        for (const target of surroundingTargets) {
            // flinch chance = (30 + source speed/10)
            const flinchChance = Math.min(0.3 + (source.spe / 10)/100, .75);
            console.log(flinchChance)
            if (Math.random() < flinchChance) {
                target.addEffect("flinched", 1, source);
            }
        }
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
    "m182": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m182";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply move invulnerable
            target.addEffect("moveInvulnerable", 2, source);
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
    "m200": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m200";
        const moveData = moveConfig[moveId];
        // if source doesn't have outrage, apply it
        if (source.effectIds.outrage === undefined) {
            source.addEffect("outrage", 3, source);
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
            source.addEffect("confused", 3, source);
        }
    },
    "m203": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m203";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // apply 1 turn immortality
            target.addEffect("immortal", 2, source);
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
            source.addEffect("rollout", 2, source);
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

        // use target type to get party (if any, then default to enemy)
        let targetParty;
        switch (randomMoveData.targetType) {
            case targetTypes.ALLY:
                targetParty = battle.parties[source.teamName];
                break;
            default:
                for (const teamName in battle.parties) {
                    if (teamName !== source.teamName) {
                        targetParty = battle.parties[teamName];
                        break;
                    }
                }
                break;
        }
        // get valid targets: in target party and not fainted
        const validTargets = targetParty.pokemons.filter(p => p !== null && !p.isFainted);
        // if no valid targets, return
        if (validTargets.length === 0) {
            battle.addToLog(`${randomMoveData.name} has no valid targets!`);
            return;
        }

        // choose random target (exception: self moves must target self)
        const randomTarget = randomMoveData.targetPosition === targetPositions.SELF ? source : validTargets[Math.floor(Math.random() * validTargets.length)];
        // use move against target
        battle.addToLog(`${randomMoveData.name} hit ${randomTarget.name}!`);
        moveExecutes[randomMoveId](battle, source, randomTarget, [randomTarget], []);

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
                source.addEffect("atkUp", 2, source);
                break;
            case 2:
                source.addEffect("defUp", 2, source);
                break;
            case 3:
                source.addEffect("spaUp", 2, source);
                break;
            case 4:
                source.addEffect("spdUp", 2, source);
                break;
            case 5:
                source.addEffect("speUp", 2, source);
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
    "m269": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m269";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            const miss = missedTargets.includes(target);
            if (miss) {
                continue;
            }

            // add taunt for 3 turns
            target.addEffect("taunt", 3, source);
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
        source.addEffect("atkDown", 2, source);
        source.addEffect("defDown", 2, source);
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
    "m334": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m334"];
        for (const target of allTargets) {
            // sharply raise special def
            target.addEffect("greaterDefUp", 3, source);
        }
    },
    "m349": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveData = moveConfig["m349"];
        for (const target of allTargets) {
            // raise attack and speed
            target.addEffect("atkUp", 4, source);
            target.addEffect("speUp", 4, source);
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
            target.addEffect("loseFlying", 2, source);
        }
    },
    "m366": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m366";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // grant greater spe up for 2 turns
            // grants self for 3 turns due to end-of-turn effect tick
            const turns = target === source ? 3 : 2;
            target.addEffect("greaterSpeUp", turns, source);
            // boost cr by 15%
            target.boostCombatReadiness(source, 15);
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
        const party = battle.parties[source.teamName].pokemons;
        const pokemons = Object.values(party).filter(p => p !== null && !p.isFainted && p !== source);
        if (pokemons.length > 0) {
            const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
            pokemon.boostCombatReadiness(source, 100);
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
            target.addEffect("defUp", source == target ? 3 : 2, source);
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
    "m417": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m417";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            // sharply raise spatk
            target.addEffect("greaterSpaUp", 4, source);
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
        battle.addToLog(`Sharp rocks were scattered on the ground near ${source.teamName}'s side!`);
        for (const target of allTargets) {
            // give target stealthRock
            target.addEffect("stealthRock", 3, source);
        }
    },
    "m482": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m482";
        const moveData = moveConfig[moveId];

        // get only target row
        const targetParty = battle.parties[primaryTarget.teamName];
        const targetRow = Math.floor((primaryTarget.position - 1) / targetParty.cols);
        const targetCol = (primaryTarget.position - 1) % targetParty.cols;
        const damageTargets = source.getPatternTargets(targetParty, targetPatterns.ROW, targetRow, targetCol);

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
            target.addEffect("spaUp", 3, source);
            target.addEffect("spdUp", 3, source);
            target.addEffect("speUp", 3, source);
        }
    },
    "m484": function (battle, source, primaryTarget, allTargets, missedTargets) {
        const moveId = "m484";
        const moveData = moveConfig[moveId];
        for (const target of allTargets) {
            let speedPower = 0;
            if (source.spe < 150) {
                speedPower = 50;
            } else if (source.spe < 300) {
                speedPower = 40;
            } else if (source.spe < 450) {
                speedPower = 30;
            } else {
                speedPower = 20;
            }
            const hpPower = Math.floor(source.maxHp / 10);
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
        const party = battle.parties[source.teamName].pokemons;
        const pokemons = Object.values(party).filter(p => p !== null && !p.isFainted && p !== source);
        if (pokemons.length > 0) {
            const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
            pokemon.boostCombatReadiness(source, 100);
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
            if (primaryTarget.statusCondition === statusConditions.POISON) {
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
            source.addEffect("greaterAtkUp", 4, source);
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