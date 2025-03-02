/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
const { types: pokemonTypes } = require("./pokemonConfig");
const { getMove, getMoveIds } = require("../battle/data/moveRegistry");
const { getEffect } = require("../battle/data/effectRegistry");
const { battleEventEnum, effectIdEnum } = require("../enums/battleEnums");

/** @typedef {Enum<damageTypes>} DamageTypeEnum */
const damageTypes = Object.freeze({
  PHYSICAL: "Physical",
  SPECIAL: "Special",
  OTHER: "Other",
});

/** @typedef {Enum<moveTiers>} MoveTierEnum */
const moveTiers = Object.freeze({
  BASIC: "Basic",
  POWER: "Power",
  ULTIMATE: "Ultimate",
});
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
  [pokemonTypes.NORMAL]: {
    [pokemonTypes.ROCK]: 0.5,
    [pokemonTypes.GHOST]: 0,
    [pokemonTypes.STEEL]: 0.5,
  },
  [pokemonTypes.FIRE]: {
    [pokemonTypes.FIRE]: 0.5,
    [pokemonTypes.WATER]: 0.5,
    [pokemonTypes.GRASS]: 2,
    [pokemonTypes.ICE]: 2,
    [pokemonTypes.BUG]: 2,
    [pokemonTypes.ROCK]: 0.5,
    [pokemonTypes.DRAGON]: 0.5,
    [pokemonTypes.STEEL]: 2,
  },
  [pokemonTypes.WATER]: {
    [pokemonTypes.FIRE]: 2,
    [pokemonTypes.WATER]: 0.5,
    [pokemonTypes.GRASS]: 0.5,
    [pokemonTypes.GROUND]: 2,
    [pokemonTypes.ROCK]: 2,
    [pokemonTypes.DRAGON]: 0.5,
  },
  [pokemonTypes.ELECTRIC]: {
    [pokemonTypes.WATER]: 2,
    [pokemonTypes.ELECTRIC]: 0.5,
    [pokemonTypes.GRASS]: 0.5,
    [pokemonTypes.GROUND]: 0,
    [pokemonTypes.FLYING]: 2,
    [pokemonTypes.DRAGON]: 0.5,
  },
  [pokemonTypes.GRASS]: {
    [pokemonTypes.FIRE]: 0.5,
    [pokemonTypes.WATER]: 2,
    [pokemonTypes.GRASS]: 0.5,
    [pokemonTypes.POISON]: 0.5,
    [pokemonTypes.GROUND]: 2,
    [pokemonTypes.FLYING]: 0.5,
    [pokemonTypes.BUG]: 0.5,
    [pokemonTypes.ROCK]: 2,
    [pokemonTypes.DRAGON]: 0.5,
    [pokemonTypes.STEEL]: 0.5,
  },
  [pokemonTypes.ICE]: {
    [pokemonTypes.FIRE]: 0.5,
    [pokemonTypes.WATER]: 0.5,
    [pokemonTypes.GRASS]: 2,
    [pokemonTypes.ICE]: 0.5,
    [pokemonTypes.GROUND]: 2,
    [pokemonTypes.FLYING]: 2,
    [pokemonTypes.DRAGON]: 2,
    [pokemonTypes.STEEL]: 0.5,
  },
  [pokemonTypes.FIGHTING]: {
    [pokemonTypes.NORMAL]: 2,
    [pokemonTypes.ICE]: 2,
    [pokemonTypes.POISON]: 0.5,
    [pokemonTypes.FLYING]: 0.5,
    [pokemonTypes.PSYCHIC]: 0.5,
    [pokemonTypes.BUG]: 0.5,
    [pokemonTypes.ROCK]: 2,
    [pokemonTypes.GHOST]: 0,
    [pokemonTypes.DARK]: 2,
    [pokemonTypes.STEEL]: 2,
    [pokemonTypes.FAIRY]: 0.5,
  },
  [pokemonTypes.POISON]: {
    [pokemonTypes.GRASS]: 2,
    [pokemonTypes.POISON]: 0.5,
    [pokemonTypes.GROUND]: 0.5,
    [pokemonTypes.ROCK]: 0.5,
    [pokemonTypes.GHOST]: 0.5,
    [pokemonTypes.STEEL]: 0,
    [pokemonTypes.FAIRY]: 2,
  },
  [pokemonTypes.GROUND]: {
    [pokemonTypes.FIRE]: 2,
    [pokemonTypes.ELECTRIC]: 2,
    [pokemonTypes.GRASS]: 0.5,
    [pokemonTypes.POISON]: 2,
    [pokemonTypes.FLYING]: 0,
    [pokemonTypes.BUG]: 0.5,
    [pokemonTypes.ROCK]: 2,
    [pokemonTypes.STEEL]: 2,
  },
  [pokemonTypes.FLYING]: {
    [pokemonTypes.ELECTRIC]: 0.5,
    [pokemonTypes.GRASS]: 2,
    [pokemonTypes.FIGHTING]: 2,
    [pokemonTypes.BUG]: 2,
    [pokemonTypes.ROCK]: 0.5,
    [pokemonTypes.STEEL]: 0.5,
  },
  [pokemonTypes.PSYCHIC]: {
    [pokemonTypes.FIGHTING]: 2,
    [pokemonTypes.POISON]: 2,
    [pokemonTypes.PSYCHIC]: 0.5,
    [pokemonTypes.DARK]: 0,
    [pokemonTypes.STEEL]: 0.5,
  },
  [pokemonTypes.BUG]: {
    [pokemonTypes.FIRE]: 0.5,
    [pokemonTypes.GRASS]: 2,
    [pokemonTypes.FIGHTING]: 0.5,
    [pokemonTypes.POISON]: 0.5,
    [pokemonTypes.FLYING]: 0.5,
    [pokemonTypes.PSYCHIC]: 2,
    [pokemonTypes.GHOST]: 0.5,
    [pokemonTypes.DARK]: 2,
    [pokemonTypes.STEEL]: 0.5,
    [pokemonTypes.FAIRY]: 0.5,
  },
  [pokemonTypes.ROCK]: {
    [pokemonTypes.FIRE]: 2,
    [pokemonTypes.ICE]: 2,
    [pokemonTypes.FIGHTING]: 0.5,
    [pokemonTypes.GROUND]: 0.5,
    [pokemonTypes.FLYING]: 2,
    [pokemonTypes.BUG]: 2,
    [pokemonTypes.STEEL]: 0.5,
  },
  [pokemonTypes.GHOST]: {
    [pokemonTypes.NORMAL]: 0,
    [pokemonTypes.PSYCHIC]: 2,
    [pokemonTypes.GHOST]: 2,
    [pokemonTypes.DARK]: 0.5,
  },
  [pokemonTypes.DRAGON]: {
    [pokemonTypes.DRAGON]: 2,
    [pokemonTypes.STEEL]: 0.5,
    [pokemonTypes.FAIRY]: 0,
  },
  [pokemonTypes.DARK]: {
    [pokemonTypes.FIGHTING]: 0.5,
    [pokemonTypes.PSYCHIC]: 2,
    [pokemonTypes.GHOST]: 2,
    [pokemonTypes.DARK]: 0.5,
    [pokemonTypes.FAIRY]: 0.5,
  },
  [pokemonTypes.STEEL]: {
    [pokemonTypes.FIRE]: 0.5,
    [pokemonTypes.WATER]: 0.5,
    [pokemonTypes.ELECTRIC]: 0.5,
    [pokemonTypes.ICE]: 2,
    [pokemonTypes.ROCK]: 2,
    [pokemonTypes.STEEL]: 0.5,
    [pokemonTypes.FAIRY]: 2,
  },
  [pokemonTypes.FAIRY]: {
    [pokemonTypes.FIRE]: 0.5,
    [pokemonTypes.FIGHTING]: 2,
    [pokemonTypes.POISON]: 0.5,
    [pokemonTypes.DRAGON]: 2,
    [pokemonTypes.DARK]: 2,
    [pokemonTypes.STEEL]: 0.5,
  },
};

// unqiue status conditions
/** @typedef {Enum<statusConditions>} StatusConditionEnum */
const statusConditions = {
  BURN: "Burn",
  FREEZE: "Freeze",
  PARALYSIS: "Paralysis",
  POISON: "Poison",
  SLEEP: "Sleep",
  BADLY_POISON: "Badly Poison",
};

// unique weather conditions
/** @typedef {Enum<weatherConditions>} WeatherConditionEnum */
const weatherConditions = {
  RAIN: "Rain",
  SUN: "Sun",
  SANDSTORM: "Sandstorm",
  HAIL: "Hail",
};

/**
 *
 * @param {Move} move
 * @param {BattlePokemon} source
 * @param {BattlePokemon} target
 * @param {boolean} miss
 * @param {*} param4
 * @returns
 */
const calculateDamage = (
  move,
  source,
  target,
  miss = false,
  {
    atkStat = null,
    attack = null,
    defStat = null,
    defense = null,
    power = null,
    type = null,
    moveType = null,
  } = {}
) =>
  source.calculateMoveDamage({
    move,
    target,
    primaryTarget: source.currentPrimaryTarget,
    allTargets: source.currentAllTargets,
    missedTargets: miss ? [target] : [],
    atkDamageTypeOverride: atkStat,
    attackOverride: attack,
    defDamageTypeOverride: defStat,
    defenseOverride: defense,
    powerOverride: power,
    typeEffectivenessOverride: type,
    moveTypeOverride: moveType,
  });

/** @typedef {Enum<targetTypes>} TargetTypeEnum */
const targetTypes = Object.freeze({
  ALLY: "Ally",
  ENEMY: "Enemy",
  ANY: "Any",
});
/** @typedef {Enum<targetPositions>} TargetPositionEnum */
const targetPositions = Object.freeze({
  SELF: "Self",
  NON_SELF: "Non-self",
  ANY: "Any",
  FRONT: "Front",
  BACK: "Back",
});
/** @typedef {Enum<targetPatterns>} TargetPatternEnum */
const targetPatterns = Object.freeze({
  SINGLE: "Single",
  ALL: "All",
  ALL_EXCEPT_SELF: "All-except-self",
  ROW: "Row",
  COLUMN: "Column",
  RANDOM: "Random",
  SQUARE: "Square",
  CROSS: "Cross",
  X: "X-shape",
});

const statIndexToBattleStat = /** @type {const} */ ([
  "hp",
  "atk",
  "def",
  "spa",
  "spd",
  "spe",
]);
const statIndexToBaseStat = /** @type {const} */ ([
  "maxHp",
  "batk",
  "bdef",
  "bspa",
  "bspd",
  "bspe",
]);
/**
 * @param {StatId} stat
 */
const battleStatToBaseStat = function (stat) {
  return statIndexToBaseStat[statIndexToBattleStat.indexOf(stat)];
};

/** @typedef {Enum<effectTypes>} EffectTypeEnum */
const effectTypes = Object.freeze({
  BUFF: "Buff",
  DEBUFF: "Debuff",
  NEUTRAL: "Neutral",
});

/** @typedef {Keys<effectConfig>} LegacyEffectIdEnum */
const effectConfig = Object.freeze({
  greaterAtkUp: {
    name: "Greater Atk. Up",
    description: "The target's Attack greatly increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if atkUp exists on target, remove atkUp and refresh greaterAtkUp
      if (target.effectIds.atkUp) {
        const currentDuration = target.effectIds.atkUp.duration;
        delete target.effectIds.atkUp;
        if (target.effectIds.greaterAtkUp.duration < currentDuration) {
          target.effectIds.greaterAtkUp.duration = currentDuration;
        }
        target.addStatMult("atk", -0.5);
      }
      battle.addToLog(`${target.name}'s Attack rose sharply!`);
      target.addStatMult("atk", 0.8);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Attack boost wore off!`);
      target.addStatMult("atk", -0.8);
    },
  },
  atkDown: {
    name: "Atk. Down",
    description: "The target's Attack decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterAtkDown exists on target, remove atkDown and refresh greaterAtkDown
      if (target.effectIds.greaterAtkDown) {
        const currentDuration = target.effectIds.atkDown.duration;
        delete target.effectIds.atkDown;
        if (target.effectIds.greaterAtkDown.duration < currentDuration) {
          target.effectIds.greaterAtkDown.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Attack fell!`);
        target.addStatMult("atk", -0.33);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Attack drop faded!`);
      target.addStatMult("atk", 0.33);
    },
  },
  greaterAtkDown: {
    name: "Greater Atk. Down",
    description: "The target's Attack greatly decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if atkDown exists on target, remove atkDown and refresh atkDown
      if (target.effectIds.atkDown) {
        const currentDuration = target.effectIds.atkDown.duration;
        delete target.effectIds.atkDown;
        if (target.effectIds.greaterAtkDown.duration < currentDuration) {
          target.effectIds.greaterAtkDown.duration = currentDuration;
        }
      }
      battle.addToLog(`${target.name}'s Attack fell sharply!`);
      target.addStatMult("atk", -0.5);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Attack drop faded!`);
      target.addStatMult("atk", 0.5);
    },
  },
  defUp: {
    name: "Def. Up",
    description: "The target's Defense increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterDefUp exists on target, remove defUp and refresh greaterDefUp
      if (target.effectIds.greaterDefUp) {
        const currentDuration = target.effectIds.defUp.duration;
        delete target.effectIds.defUp;
        if (target.effectIds.greaterDefUp.duration < currentDuration) {
          target.effectIds.greaterDefUp.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Defense rose!`);
        target.addStatMult("def", 0.5);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Defense boost faded!`);
      target.addStatMult("def", -0.5);
    },
  },
  greaterDefUp: {
    name: "Greater Def. Up",
    description: "The target's Defense sharply increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Defense sharply rose!`);
      // if defUp exists on target, remove defUp and refresh greaterDefUp
      if (target.effectIds.defUp) {
        const currentDuration = target.effectIds.defUp.duration;
        delete target.effectIds.defUp;
        if (target.effectIds.greaterDefUp.duration < currentDuration) {
          target.effectIds.greaterDefUp.duration = currentDuration;
        }
        target.addStatMult("def", -0.5);
      }
      target.addStatMult("def", 0.8);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Defense boost faded!`);
      target.addStatMult("def", -0.8);
    },
  },
  defDown: {
    name: "Def. Down",
    description: "The target's Defense decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterDefDown exists on target, remove defDown and refresh greaterDefDown
      if (target.effectIds.greaterDefDown) {
        const currentDuration = target.effectIds.defDown.duration;
        delete target.effectIds.defDown;
        if (target.effectIds.greaterDefDown.duration < currentDuration) {
          target.effectIds.greaterDefDown.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Defense fell!`);
        target.addStatMult("def", -0.33);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Defense drop faded!`);
      target.addStatMult("def", 0.33);
    },
  },
  greaterDefDown: {
    name: "Greater Def. Down",
    description: "The target's Defense sharply decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Defense sharply fell!`);
      // if defDown exists on target, remove defDown and refresh greaterDefDown
      if (target.effectIds.defDown) {
        const currentDuration = target.effectIds.defDown.duration;
        delete target.effectIds.defDown;
        if (target.effectIds.greaterDefDown.duration < currentDuration) {
          target.effectIds.greaterDefDown.duration = currentDuration;
        }
        target.addStatMult("def", 0.33);
      }
      target.addStatMult("def", -0.5);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Defense drop faded!`);
      target.addStatMult("def", 0.5);
    },
  },
  spaUp: {
    name: "Sp. Atk. Up",
    description: "The target's Special Attack increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterSpaUp exists on target, remove spaUp and refresh greaterSpaUp
      if (target.effectIds.greaterSpaUp) {
        const currentDuration = target.effectIds.spaUp.duration;
        delete target.effectIds.spaUp;
        if (target.effectIds.greaterSpaUp.duration < currentDuration) {
          target.effectIds.greaterSpaUp.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Special Attack rose!`);
        target.addStatMult("spa", 0.5);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Attack boost faded!`);
      target.addStatMult("spa", -0.5);
    },
  },
  greaterSpaUp: {
    name: "Greater Sp. Atk. Up",
    description: "The target's Special Attack sharply increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Special Attack sharply rose!`);
      // if spaUp exists on target, remove spaUp and refresh greaterSpaUp
      if (target.effectIds.spaUp) {
        const currentDuration = target.effectIds.spaUp.duration;
        delete target.effectIds.spaUp;
        if (target.effectIds.greaterSpaUp.duration < currentDuration) {
          target.effectIds.greaterSpaUp.duration = currentDuration;
        }
        target.addStatMult("spa", -0.5);
      }
      target.addStatMult("spa", 0.8);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Attack boost faded!`);
      target.addStatMult("spa", -0.8);
    },
  },
  spaDown: {
    name: "Sp. Atk. Down",
    description: "The target's Special Attack decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterSpaDown exists on target, remove spaDown and refresh greaterSpaDown
      if (target.effectIds.greaterSpaDown) {
        const currentDuration = target.effectIds.spaDown.duration;
        delete target.effectIds.spaDown;
        if (target.effectIds.greaterSpaDown.duration < currentDuration) {
          target.effectIds.greaterSpaDown.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Special Attack fell!`);
        target.addStatMult("spa", -0.33);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Attack drop faded!`);
      target.addStatMult("spa", 0.33);
    },
  },
  greaterSpaDown: {
    name: "Greater Sp. Atk. Down",
    description: "The target's Special Attack sharply decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Special Attack sharply fell!`);
      // if spaDown exists on target, remove spaDown and refresh greaterSpaDown
      if (target.effectIds.spaDown) {
        const currentDuration = target.effectIds.spaDown.duration;
        delete target.effectIds.spaDown;
        if (target.effectIds.greaterSpaDown.duration < currentDuration) {
          target.effectIds.greaterSpaDown.duration = currentDuration;
        }
        target.addStatMult("spa", 0.33);
      }
      target.addStatMult("spa", -0.5);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Attack drop faded!`);
      target.addStatMult("spa", 0.5);
    },
  },
  spdUp: {
    name: "Sp. Def. Up",
    description: "The target's Special Defense increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterSpdUp exists on target, remove spdUp and refresh greaterSpdUp
      if (target.effectIds.greaterSpdUp) {
        const currentDuration = target.effectIds.spdUp.duration;
        delete target.effectIds.spdUp;
        if (target.effectIds.greaterSpdUp.duration < currentDuration) {
          target.effectIds.greaterSpdUp.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Special Defense rose!`);
        target.addStatMult("spd", 0.5);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Defense boost faded!`);
      target.addStatMult("spd", -0.5);
    },
  },
  greaterSpdUp: {
    name: "Greater Sp. Def. Up",
    description: "The target's Special Defense sharply increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Special Defense sharply rose!`);
      // if spdUp exists on target, remove spdUp and refresh greaterSpdUp
      if (target.effectIds.spdUp) {
        const currentDuration = target.effectIds.spdUp.duration;
        delete target.effectIds.spdUp;
        if (target.effectIds.greaterSpdUp.duration < currentDuration) {
          target.effectIds.greaterSpdUp.duration = currentDuration;
        }
        target.addStatMult("spd", -0.5);
      }
      target.addStatMult("spd", 0.8);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Defense boost faded!`);
      target.addStatMult("spd", -0.8);
    },
  },
  spdDown: {
    name: "Sp. Def. Down",
    description: "The target's Special Defense decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterSpdDown exists on target, remove spdDown and refresh greaterSpdDown
      if (target.effectIds.greaterSpdDown) {
        const currentDuration = target.effectIds.spdDown.duration;
        delete target.effectIds.spdDown;
        if (target.effectIds.greaterSpdDown.duration < currentDuration) {
          target.effectIds.greaterSpdDown.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Special Defense fell!`);
        target.addStatMult("spd", -0.33);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Defense drop faded!`);
      target.addStatMult("spd", 0.33);
    },
  },
  greaterSpdDown: {
    name: "Greater Sp. Def. Down",
    description: "The target's Special Defense sharply decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Special Defense sharply fell!`);
      // if spdDown exists on target, remove spdDown and refresh greaterSpdDown
      if (target.effectIds.spdDown) {
        const currentDuration = target.effectIds.spdDown.duration;
        delete target.effectIds.spdDown;
        if (target.effectIds.greaterSpdDown.duration < currentDuration) {
          target.effectIds.greaterSpdDown.duration = currentDuration;
        }
        target.addStatMult("spd", 0.33);
      }
      target.addStatMult("spd", -0.5);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Special Defense drop faded!`);
      target.addStatMult("spd", 0.5);
    },
  },
  speUp: {
    name: "Spe. Up",
    description: "The target's Speed increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterSpeUp exists on target, remove speUp and refresh greaterSpeUp
      if (target.effectIds.greaterSpeUp) {
        const currentDuration = target.effectIds.speUp.duration;
        delete target.effectIds.speUp;
        if (target.effectIds.greaterSpeUp.duration < currentDuration) {
          target.effectIds.greaterSpeUp.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Speed rose!`);
        target.addStatMult("spe", 0.4);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Speed boost faded!`);
      target.addStatMult("spe", -0.4);
    },
  },
  greaterSpeUp: {
    name: "Greater Spe. Up",
    description: "The target's Speed sharply increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Speed sharply rose!`);
      // if speUp exists on target, remove speUp and refresh greaterSpeUp
      if (target.effectIds.speUp) {
        const currentDuration = target.effectIds.speUp.duration;
        delete target.effectIds.speUp;
        if (target.effectIds.greaterSpeUp.duration < currentDuration) {
          target.effectIds.greaterSpeUp.duration = currentDuration;
        }
        target.addStatMult("spe", -0.4);
      }
      target.addStatMult("spe", 0.65);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Speed boost faded!`);
      target.addStatMult("spe", -0.65);
    },
  },
  speDown: {
    name: "Spe. Down",
    description: "The target's Speed decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      // if greaterSpeDown exists on target, remove speDown and refresh greaterSpeDown
      if (target.effectIds.greaterSpeDown) {
        const currentDuration = target.effectIds.speDown.duration;
        delete target.effectIds.speDown;
        if (target.effectIds.greaterSpeDown.duration < currentDuration) {
          target.effectIds.greaterSpeDown.duration = currentDuration;
        }
      } else {
        battle.addToLog(`${target.name}'s Speed fell!`);
        target.addStatMult("spe", -0.25);
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Speed drop faded!`);
      target.addStatMult("spe", 0.25);
    },
  },
  greaterSpeDown: {
    name: "Greater Spe. Down",
    description: "The target's Speed sharply decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Speed sharply fell!`);
      // if speDown exists on target, remove speDown and refresh greaterSpeDown
      if (target.effectIds.speDown) {
        const currentDuration = target.effectIds.speDown.duration;
        delete target.effectIds.speDown;
        if (target.effectIds.greaterSpeDown.duration < currentDuration) {
          target.effectIds.greaterSpeDown.duration = currentDuration;
        }
        target.addStatMult("spe", 0.25);
      }
      target.addStatMult("spe", -0.4);
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Speed drop faded!`);
      target.addStatMult("spe", 0.4);
    },
  },
  accDown: {
    name: "Acc. Down",
    description: "The target's Accuracy decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
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
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Accuracy drop faded!`);
      target.acc += 30;
    },
  },
  greaterAccDown: {
    name: "Greater Acc. Down",
    description: "The target's Accuracy sharply decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
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
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Accuracy drop faded!`);
      target.acc += 50;
    },
  },
  evaUp: {
    name: "Eva. Up",
    description: "The target's Evasion increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
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
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Evasion boost faded!`);
      target.eva -= 50;
    },
  },
  greaterEvaUp: {
    name: "Greater Eva. Up",
    description: "The target's Evasion sharply increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
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
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Evasion boost faded!`);
      target.eva -= 75;
    },
  },
  evaDown: {
    name: "Eva. Down",
    description: "The target's Evasion decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
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
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Evasion drop faded!`);
      target.eva += 25;
    },
  },
  greaterEvaDown: {
    name: "Greater Eva. Down",
    description: "The target's Evasion sharply decreased.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
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
    effectRemove(battle, target) {
      battle.addToLog(`${target.name}'s Evasion drop faded!`);
      target.eva += 40;
    },
  },
  confused: {
    name: "Confused",
    description: "The target is confused.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const inflictedPokemon = initialArgs.pokemon;
          const sourcePokemon = args.source;
          if (inflictedPokemon !== sourcePokemon) {
            return;
          }
          // 33% chance to hurt self
          if (Math.random() < 0.33) {
            const damage = calculateDamage(
              {
                power: 40,
                damageType: damageTypes.PHYSICAL,
                type: pokemonTypes.UNKNOWN,
              },
              inflictedPokemon,
              inflictedPokemon,
              false
            );
            battle.addToLog(
              `${inflictedPokemon.name} hurt itself in its confusion!`
            );
            inflictedPokemon.dealDamage(damage, inflictedPokemon, {
              type: "confusion",
            });

            // disable ability to use move
            args.canUseMove = false;
          }
        },
      };
      battle.addToLog(`${target.name} became confused!`);
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_MOVE,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} snapped out of its confusion!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  counter: {
    name: "Counter",
    description: "The target will counter physical moves used against it.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // filter for physical moves
          if (args.damageInfo.type !== "move") {
            return;
          }
          const moveData = getMove(args.damageInfo.moveId);
          if (!moveData || moveData.damageType !== damageTypes.PHYSICAL) {
            return;
          }

          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          const damage = calculateDamage(
            {
              power: moveData.power ? moveData.power * 1.5 : 40,
              damageType: damageTypes.PHYSICAL,
              type: pokemonTypes.FIGHTING,
            },
            targetPokemon,
            sourcePokemon,
            false
          );
          battle.addToLog(
            `${targetPokemon.name} countered ${sourcePokemon.name}'s ${moveData.name}!`
          );
          targetPokemon.dealDamage(damage, sourcePokemon, {
            type: "counter",
          });
        },
      };
      battle.addToLog(`${target.name} assumes a counter stance!`);
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} lowers its counter stance!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  mirrorCoat: {
    name: "Mirror Coat",
    description: "The target will reflect special moves used against it.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // filter for special moves
          if (args.damageInfo.type !== "move") {
            return;
          }
          const moveData = getMove(args.damageInfo.moveId);
          if (!moveData || moveData.damageType !== damageTypes.SPECIAL) {
            return;
          }

          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          const damage = calculateDamage(
            {
              power: moveData.power ? moveData.power * 1.5 : 40,
              damageType: damageTypes.SPECIAL,
              type: pokemonTypes.PSYCHIC,
            },
            targetPokemon,
            sourcePokemon,
            false
          );
          battle.addToLog(
            `${targetPokemon.name} reflected ${sourcePokemon.name}'s ${moveData.name}!`
          );
          targetPokemon.dealDamage(damage, sourcePokemon, {
            type: "mirrorCoat",
          });
        },
      };
      battle.addToLog(`${target.name} puts up a reflective field!`);
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name}'s reflective field fades!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  flinched: {
    name: "Flinched",
    description: "The target flinched.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} flinched!`);
      target.incapacitated = true;
    },
    effectRemove(_battle, target) {
      target.incapacitated = false;
    },
  },
  recharge: {
    name: "Recharge",
    description: "The target must recharge.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} must recharge!`);
      target.incapacitated = true;
    },
    effectRemove(_battle, target) {
      target.incapacitated = false;
    },
  },
  restricted: {
    name: "Restricted",
    description: "The target cannot gain combat readiness.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(
        `${target.name} is restricted and cannot gain combat readiness via boosts!`
      );
      target.restricted = true;
    },
    effectRemove(_battle, target) {
      target.restricted = false;
    },
  },
  immortal: {
    name: "Immortal",
    description: "The target's HP cannot be reduced below 1.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is immortal!`);
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const immortalPokemon = initialArgs.pokemon;
          const damagedPokemon = args.target;
          if (immortalPokemon !== damagedPokemon) {
            return;
          }

          // if damage would reduce HP below 1, set damage to HP - 1
          if (args.damage >= damagedPokemon.hp) {
            immortalPokemon.battle.addToLog(
              `${immortalPokemon.name} cannot be reduced below 1 HP!`
            );
            args.damage = damagedPokemon.hp - 1;
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  moveInvulnerable: {
    name: "Move Invuln.",
    description: "The target can't take damage from moves.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} protected itself!`);
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
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
          invulnPokemon.battle.addToLog(
            `${invulnPokemon.name} protected itself!`
          );
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },

  superStretchy: {
    name: "Super Stretchy",
    description: "The target stretches to its attacks.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} stretches to its attacks!`);
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const invulnPokemon = initialArgs.pokemon;
          const damagedPokemon = args.target;
          const sourcePokemon = args.source;
          if (invulnPokemon !== damagedPokemon) {
            return;
          }

          // set damage to 0
          const oldDamage = args.damage;
          args.damage = 0;
          args.maxDamage = Math.min(args.maxDamage, args.damage);
          invulnPokemon.battle.addToLog(
            `${invulnPokemon.name} is super stretchy!`
          );

          // get move data
          const { moveId } = args.damageInfo;
          // eslint-disable-next-line no-use-before-define
          const moveData = getMove(moveId);
          if (!moveData) {
            return;
          }
          const moveType = moveData.damageType;
          if (moveType === damageTypes.PHYSICAL) {
            // heal for the amount of damage taken
            const healAmount = oldDamage;
            invulnPokemon.giveHeal(healAmount, invulnPokemon, {
              type: "superStretchy",
            });
          } else if (moveType === damageTypes.SPECIAL) {
            // reflect move back at attacker
            invulnPokemon.battle.addToLog(
              `${invulnPokemon.name} reflected the move back at ${sourcePokemon.name}!`
            );
            invulnPokemon.executeMove({
              moveId,
              primaryTarget: sourcePokemon,
              allTargets: [sourcePokemon],
              missedTargets: [],
            });
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  wideGuard: {
    name: "Wide Guard",
    description: "The user is protecting its allies from AoE moves.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, source) {
      battle.addToLog(`${source.name} is protecting its allies!`);
      const listener = {
        initialArgs: {
          pokemon: source,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }
          const moveData = getMove(args.damageInfo.moveId);
          let multiplier = 0.7;
          if (moveData.targetPattern === targetPatterns.SINGLE) {
            multiplier = 0.4;
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
          wideGuardPokemon.battle.addToLog(
            `${wideGuardPokemon.name} is protecting its allies!`
          );
          args.damage = Math.max(Math.floor(args.damage * multiplier), 1);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  moneyBags: {
    name: "Money Bags",
    description:
      "When the user takes damage, heal other allies by half the damage taken.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, source) {
      battle.addToLog(`${source.name} is sharing the wealth!`);
      const listener = {
        initialArgs: {
          pokemon: source,
        },
        execute(initialArgs, args) {
          const moneyBagsPokemon = initialArgs.pokemon;
          if (moneyBagsPokemon.isFainted) {
            return;
          }
          const damagedPokemon = args.target;
          if (moneyBagsPokemon !== damagedPokemon) {
            return;
          }

          const { damage } = args;
          const allyParty =
            moneyBagsPokemon.battle.parties[moneyBagsPokemon.teamName];
          const moneyBagsAllies = moneyBagsPokemon.getPatternTargets(
            allyParty,
            targetPatterns.ALL_EXCEPT_SELF,
            moneyBagsPokemon.position
          );

          moneyBagsPokemon.battle.addToLog(
            `Coins drop from ${moneyBagsPokemon.name}'s wallet!`
          );
          for (const ally of moneyBagsAllies) {
            const healAmount = Math.floor(damage / 2);
            moneyBagsPokemon.giveHeal(healAmount, ally, {
              type: "moneyBags",
            });
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  statusImmunity: {
    name: "Status Immunity",
    description: "The target is immune to status conditions.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is immune to status conditions!`);
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (initialArgs.pokemon !== targetPokemon) {
            return;
          }

          args.canApply = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name} is immune to status conditions!`
          );
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_STATUS_APPLY,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(
        `${target.name} is no longer immune to status conditions!`
      );
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  delayedHeal: {
    name: "Delayed Heal",
    description: "The target will be healed at the end of the duration.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd() {},
    effectRemove(battle, target, _args, initialArgs) {
      const effect = target.effectIds.delayedHeal;
      if (effect && effect.duration > 0) {
        return;
      }

      battle.addToLog(`${target.name} was healed by ${effect.source.name}!`);
      const { healAmount } = initialArgs;
      effect.source.giveHeal(healAmount, target, {
        type: "delayedHeal",
      });
    },
  },
  regeneration: {
    name: "Regen",
    description: "The target will be healed at the end of each turn.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target, initialArgs) {
      const listener = {
        initialArgs: {
          pokemon: target,
          healAmount: initialArgs.healAmount,
        },
        execute(initialArgs) {
          const regenPokemon = initialArgs.pokemon;
          if (regenPokemon !== regenPokemon.battle.activePokemon) {
            return;
          }

          regenPokemon.battle.addToLog(
            `${regenPokemon.name} regenerated some health!`
          );
          const { healAmount } = initialArgs;
          regenPokemon.takeHeal(healAmount, regenPokemon, {
            type: "regeneration",
          });
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );
      battle.addToLog(`${target.name} is regenerating health!`);
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  dot: {
    name: "DoT",
    description: "The target will take damage at the end of each turn.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target, args) {
      const listener = {
        initialArgs: {
          source,
          pokemon: target,
          damage: args.damage,
        },
        execute(initialArgs) {
          const dotPokemon = initialArgs.pokemon;
          if (dotPokemon !== dotPokemon.battle.activePokemon) {
            return;
          }

          dotPokemon.battle.addToLog(
            `${dotPokemon.name} took damage from the DoT!`
          );
          const { damage } = initialArgs;
          dotPokemon.takeDamage(damage, initialArgs.source, {
            type: "dot",
          });
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );
      battle.addToLog(`${target.name} is taking damage from a DoT effect!`);
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  leechSeed: {
    name: "Leech Seed",
    description:
      "The target will take damage at the end of each turn and the source will be healed by the damage dealt.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      const listener = {
        initialArgs: {
          source,
          pokemon: target,
        },
        execute(initialArgs) {
          const dotPokemon = initialArgs.pokemon;
          if (dotPokemon !== dotPokemon.battle.activePokemon) {
            return;
          }

          dotPokemon.battle.addToLog(
            `${dotPokemon.name} took damage from the Leech Seed!`
          );
          const damage = Math.floor(dotPokemon.maxHp / 4);
          const damageTaken = dotPokemon.takeDamage(
            damage,
            initialArgs.source,
            {
              type: "leechSeed",
            }
          );
          initialArgs.source.giveHeal(damageTaken, initialArgs.source, {
            type: "leechSeed",
          });
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );
      battle.addToLog(`${target.name} is affected by a Leech Seed!`);
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer affected by Leech Seed!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  extraTurn: {
    name: "Extra Turn",
    description: "At the end of each turn, give the target an extra turn.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs) {
          const targetPokemon = initialArgs.pokemon;
          if (targetPokemon !== targetPokemon.battle.activePokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name} takes an additional turn!`
          );
          targetPokemon.boostCombatReadiness(targetPokemon, 100);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );
      battle.addToLog(`${target.name} is taking extra turns!!`);
      return {
        listenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  stealthRock: {
    name: "Stealth Rock",
    description: "The target is affected by Stealth Rock.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      const listener = {
        initialArgs: {
          source,
          pokemon: target,
        },
        execute(initialArgs, args) {
          const affectedPokemon = initialArgs.pokemon;
          const targetPokemon = args.target;
          if (affectedPokemon !== targetPokemon) {
            return;
          }
          // only allow buffs to trigger
          if (
            args.effectId &&
            getEffect(args.effectId).type !== effectTypes.BUFF
          ) {
            return;
          }

          // get damage multiplier
          let mult = targetPokemon.getTypeDamageMultiplier(
            pokemonTypes.ROCK,
            targetPokemon
          );
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
          const damage = Math.floor((targetPokemon.maxHp * mult) / 12);
          initialArgs.source.dealDamage(damage, affectedPokemon, {
            type: "effect",
            id: "stealthRock",
          });
        },
      };

      const crListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_CR_GAINED,
        listener
      );
      const buffListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_EFFECT_ADD,
        listener
      );
      return {
        crListenerId,
        buffListenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { crListenerId } = args;
      battle.eventHandler.unregisterListener(crListenerId);
      const { buffListenerId } = args;
      battle.eventHandler.unregisterListener(buffListenerId);
    },
    tags: ["hazard"],
  },
  spikes: {
    name: "Spikes",
    description: "The target is affected by Spikes.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      const crListener = {
        initialArgs: {
          source,
          pokemon: target,
        },
        execute(initialArgs, args) {
          const affectedPokemon = initialArgs.pokemon;
          const targetPokemon = args.target;
          if (affectedPokemon !== targetPokemon) {
            return;
          }

          // calculate damage
          battle.addToLog(`${targetPokemon.name} was hurt by Spikes!`);
          const damage = Math.floor(targetPokemon.maxHp / 12);
          initialArgs.source.dealDamage(damage, affectedPokemon, {
            type: "effect",
            id: "spikes",
          });
        },
      };
      const beforeMoveListener = {
        initialArgs: {
          source,
          pokemon: target,
        },
        execute(initialArgs, args) {
          const affectedPokemon = initialArgs.pokemon;
          const sourcePokemon = args.source;
          if (affectedPokemon !== sourcePokemon) {
            return;
          }

          // calculate damage
          battle.addToLog(`${sourcePokemon.name} was hurt by Spikes!`);
          const damage = Math.floor(sourcePokemon.maxHp / 12);
          initialArgs.source.dealDamage(damage, affectedPokemon, {
            type: "effect",
            id: "spikes",
          });
        },
      };

      const crListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_CR_GAINED,
        crListener
      );
      const beforeMoveListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_MOVE,
        beforeMoveListener
      );
      return {
        crListenerId,
        beforeMoveListenerId,
      };
    },
    effectRemove(battle, _target, args) {
      const { crListenerId } = args;
      battle.eventHandler.unregisterListener(crListenerId);
      const { beforeMoveListenerId } = args;
      battle.eventHandler.unregisterListener(beforeMoveListenerId);
    },
    tags: ["hazard"],
  },
  disable: {
    name: "Disable",
    description: "The target's ultimate move(s) are disabled.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      const disabledMoves = [];
      // disable ultimate moves
      for (const moveId of Object.keys(target.moveIds)) {
        const moveData = getMove(moveId);
        if (moveData.tier === moveTiers.ULTIMATE) {
          target.disableMove(moveId, source);
          disabledMoves.push(moveData.name);
        }
      }
      if (disabledMoves.length > 0) {
        battle.addToLog(
          `${target.name}'s ${disabledMoves.join(", ")} was disabled!`
        );
      } else {
        battle.addToLog(`${target.name} has no ultimate moves!`);
      }
      return {
        source,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name}'s ultimate moves are now available!`);
      // enable ultimate moves
      for (const moveId of Object.keys(target.moveIds)) {
        const moveData = getMove(moveId);
        if (moveData.tier === moveTiers.ULTIMATE) {
          target.enableMove(moveId, args.source);
        }
      }
    },
  },
  silenced: {
    name: "Silenced",
    description: "The target can only use basic moves.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      battle.addToLog(
        `${target.name} is silenced and can only use basic moves!`
      );
      for (const moveId in target.moveIds) {
        const moveData = getMove(moveId);
        if (moveData.tier !== moveTiers.BASIC) {
          target.disableMove(moveId, source);
        }
      }
      return {
        source,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer silenced!`);
      for (const moveId in target.moveIds) {
        const moveData = getMove(moveId);
        if (moveData.tier !== moveTiers.BASIC) {
          target.enableMove(moveId, args.source);
        }
      }
    },
  },
  taunt: {
    name: "Taunt",
    description: "The target is taunted.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      battle.addToLog(`${target.name} was taunted!`);
      // disable moves with no power
      for (const moveId of Object.keys(target.moveIds)) {
        const moveData = getMove(moveId);
        if (!moveData.power) {
          target.disableMove(moveId, source);
        }
      }
      return {
        source,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer taunted!`);
      // enable moves with no power
      for (const moveId of Object.keys(target.moveIds)) {
        const moveData = getMove(moveId);
        if (!moveData.power) {
          target.enableMove(moveId, args.source);
        }
      }
    },
  },
  reverseTaunt: {
    name: "Reverse Taunt",
    description: "The target is reverse-taunted.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      battle.addToLog(`${target.name} was reverse-taunted!`);
      // disable moves with power
      for (const moveId of Object.keys(target.moveIds)) {
        const moveData = getMove(moveId);
        if (moveData.power) {
          target.disableMove(moveId, source);
        }
      }
      return {
        source,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer reverse-taunted!`);
      // enable moves with no power
      for (const moveId of Object.keys(target.moveIds)) {
        const moveData = getMove(moveId);
        if (moveData.power) {
          target.enableMove(moveId, args.source);
        }
      }
    },
  },
  redirect: {
    name: "Redirect",
    description: "Moves are redirected to this target.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is redirecting moves!`);
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // if redirect user isnt targetable, ignore
          if (!args.user.battle.isPokemonTargetable(initialArgs.pokemon)) {
            return;
          }

          // check that enemy used non-ally move
          const moveUser = args.user;
          const moveData = getMove(args.moveId);
          if (moveUser.teamName === initialArgs.pokemon.teamName) {
            return;
          }
          if (moveData.targetType === targetTypes.ALLY) {
            return;
          }

          args.eligibleTargets.push(initialArgs.pokemon);
          args.shouldReturn = true;
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.GET_ELIGIBLE_TARGETS,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer redirecting moves!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  charge: {
    name: "Charge",
    description: "The target is charging its Electric moves.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is charging its Electric moves!`);
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const { type } = args.damageInfo;
          if (type !== "move") {
            return;
          }
          const { moveId } = args.damageInfo;
          const moveData = getMove(moveId);
          if (moveData.type !== pokemonTypes.ELECTRIC) {
            return;
          }

          const sourcePokemon = args.source;
          if (sourcePokemon !== initialArgs.pokemon) {
            return;
          }

          args.damage = Math.floor(args.damage * 1.5);
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer charging!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  loseFlying: {
    name: "No Flying Type",
    description: "The target loses its Flying type.",
    type: effectTypes.NEUTRAL,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} lost its Flying type!`);
      // if pure flying, change to pure normal
      if (target.type1 === pokemonTypes.FLYING && target.type2 === null) {
        target.type1 = pokemonTypes.NORMAL;
        return {
          typeSlot: "type1",
        };
        // else
      }
      if (target.type1 === pokemonTypes.FLYING) {
        target.type1 = null;
        return {
          typeSlot: "type1",
        };
      }
      if (target.type2 === pokemonTypes.FLYING && target.type1 === null) {
        target.type2 = pokemonTypes.NORMAL;
        return {
          typeSlot: "type2",
        };
      }
      if (target.type2 === pokemonTypes.FLYING) {
        target.type2 = null;
        return {
          typeSlot: "type2",
        };
      }
      return {};
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} regained its Flying type!`);
      if (args.typeSlot) target[args.typeSlot] = pokemonTypes.FLYING;
    },
  },
  absorbLight: {
    name: "Absorbing Light",
    description: "The target absorbs light, preparing a powerful Solar Beam.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is absorbing light!`);
      // disable non-solar beam moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m76") {
          target.disableMove(moveId, target);
        }
      }
    },
    effectRemove(_battle, target) {
      // enable non-solar beam moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m76") {
          target.enableMove(moveId, target);
        }
      }
    },
  },
  projectingSpirit: {
    name: "Projecting Spirit",
    description:
      "The target is projecting its spirit in preparation for a powerful Ashura Bakkei.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is projecting its spirit!`);
      // disable non-ashura bakkei moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m331-1") {
          target.disableMove(moveId, target);
        }
      }
    },
    effectRemove(_battle, target) {
      // enable non-ashura bakkei moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m331-1") {
          target.enableMove(moveId, target);
        }
      }
    },
  },
  skyCharge: {
    name: "Sky Charge",
    description: "The target is charging a powerful Sky Attack.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} becomes cloaked in a harsh light!`);
      // disable non-sky attack moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m143") {
          target.disableMove(moveId, target);
        }
      }
    },
    effectRemove(_battle, target) {
      // enable non-sky attack moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m143") {
          target.enableMove(moveId, target);
        }
      }
    },
  },
  burrowed: {
    name: "Burrowed",
    description: "The target has burrowed underground.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
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
    effectRemove(_battle, target) {
      // enable non-dig moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m91") {
          target.enableMove(moveId, target);
        }
      }
      // make targetable and hittable
      target.targetable = true;
      target.hittable = true;
    },
  },
  sprungUp: {
    name: "Sprung Up",
    description: "The target has sprung up into the sky.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
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
    effectRemove(_battle, target) {
      // enable non-bounce moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m340") {
          target.enableMove(moveId, target);
        }
      }
      // make targetable and hittable
      target.targetable = true;
      target.hittable = true;
    },
  },
  outrage: {
    name: "Outrage",
    description: "The target is enraged, attacking wildly.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is enraged!`);
      // disable non-outrage moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m200") {
          target.disableMove(moveId, target);
        }
      }
    },
    effectRemove(battle, target) {
      battle.addToLog(`${target.name} calmed down!`);
      // enable non-outrage moves
      for (const moveId in target.moveIds) {
        if (moveId !== "m200") {
          target.enableMove(moveId, target);
        }
      }
    },
  },
  futureSight: {
    name: "Future Sight",
    description: "The target is foreseeing an attack.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      battle.addToLog(
        `${source.name} is foreseeing an attack against ${target.name}!`
      );
    },
    effectRemove(battle, target) {
      const effect = target.effectIds.futureSight;
      if (!effect) return;
      const { source } = effect;
      if (!source) return;
      const remainingDuration = effect.duration;
      if (remainingDuration === undefined) return;

      battle.addToLog(
        `${target.name} was hit by ${source.name}'s Future Sight!`
      );
      const damageCalc = calculateDamage(getMove("m248"), source, target);
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
        type: "move",
        moveId: "m248",
      });
    },
  },
  yawn: {
    name: "Yawn",
    description: "The target is falling asleep.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, source, target) {
      battle.addToLog(`${source.name} is making ${target.name} drowsy!`);
    },
    effectRemove(battle, target) {
      const effect = target.effectIds.yawn;
      if (!effect) return;
      const { source } = effect;
      if (!source) return;
      const remainingDuration = effect.duration;
      if (remainingDuration === undefined) return;

      // if duration 0, target falls asleep
      if (remainingDuration === 0) {
        target.applyStatus(statusConditions.SLEEP, source);
      } else {
        battle.addToLog(`${target.name} is no longer drowsy!`);
      }
    },
  },
  perishSong: {
    name: "Perish Song",
    description: "The target is doomed to faint in 3 turns.",
    type: effectTypes.DEBUFF,
    dispellable: true,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is doomed to faint!`);
    },
    effectRemove(battle, target) {
      const effect = target.effectIds.perishSong;
      if (!effect) return;
      const remainingDuration = effect.duration;
      if (remainingDuration === undefined) return;

      if (remainingDuration === 0) {
        battle.addToLog(`${target.name} fell victim to Perish Song!`);
        target.takeFaint(effect.source);
      }
    },
  },
  rollout: {
    name: "Rollout",
    description: "The target is rolling out of control.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is rolling out of control!`);
    },
    effectRemove() {},
  },
  furyCutter: {
    name: "Fury Cutter",
    description: "The target is being honing its claws.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is honing its claws!`);
    },
    effectRemove() {},
  },
  grudge: {
    name: "Grudge",
    description: "If the target faints, silence all enemies for 2 turns.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} is filled with a vengeful spirit!`);
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // if not grudge user, ignore
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const teamNames = Object.keys(targetPokemon.battle.parties);
          const enemyTeamName =
            teamNames[0] === targetPokemon.teamName
              ? teamNames[1]
              : teamNames[0];
          const enemyPokemons = targetPokemon.getPatternTargets(
            targetPokemon.battle.parties[enemyTeamName],
            targetPatterns.ALL,
            1
          );
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s holds a grudge!`
          );
          for (const enemyPokemon of enemyPokemons) {
            enemyPokemon.applyEffect("silenced", 2, targetPokemon);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_FAINT,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer holding a grudge!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  destinyBond: {
    name: "Destiny Bond",
    description: "If the target faints, the chosen Pokemon faints as well.",
    type: effectTypes.BUFF,
    dispellable: true,
    effectAdd(battle, _source, target, initialArgs) {
      battle.addToLog(
        `${target.name} binds ${initialArgs.boundPokemon.name} by a vow!`
      );
      const listener = {
        initialArgs: {
          pokemon: target,
          boundPokemon: initialArgs.boundPokemon,
        },
        execute(initialArgs, args) {
          // if not destiny bond user, ignore
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name} is bound by a vow!`
          );
          const { boundPokemon } = initialArgs;
          boundPokemon.takeFaint(targetPokemon);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_FAINT,
        listener
      );
      return {
        listenerId,
      };
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} is no longer bound by a vow!`);
      const { listenerId } = args;
      battle.eventHandler.unregisterListener(listenerId);
    },
  },
  mimic: {
    name: "Mimic",
    description: "The target is mimicking a move.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target, initialArgs) {
      const mimicMoveId = initialArgs.moveId;
      const moveData = getMove(mimicMoveId);
      if (!mimicMoveId) return;
      if (!moveData) return;
      // if target already knows move, ignore
      if (target.moveIds[mimicMoveId]) {
        battle.addToLog(`${target.name} already knows ${moveData.name}!`);
        initialArgs.noRemove = true;
        target.removeEffect("mimic");
        return;
      }

      const { oldMoveId } = initialArgs;
      if (!oldMoveId) return;

      delete target.moveIds[oldMoveId];
      target.removeMoveCooldown(mimicMoveId, target);
      target.enableMove(mimicMoveId, target);
      battle.addToLog(`${target.name} is mimicking ${moveData.name}!`);
    },
    effectRemove(_battle, target, _args, initialArgs) {
      if (initialArgs.noRemove) return;
      const mimicMoveId = initialArgs.moveId;
      const { oldMoveId } = initialArgs;

      delete target.moveIds[mimicMoveId];
      target.removeMoveCooldown(oldMoveId, target);
      target.enableMove(oldMoveId, target);
    },
  },
  gearFive: {
    name: "Gear 5",
    description: "The target has awakened Gear 5.",
    type: effectTypes.BUFF,
    dispellable: false,
    effectAdd(battle, _source, target) {
      battle.addToLog(`${target.name} has awakened Gear 5!`);

      // remember old: species ID, move IDs, ability ID
      const rv = {
        oldSpeciesId: target.speciesId,
        oldMoveIds: Object.keys(target.moveIds),
        oldAbilityId: target.ability.abilityId,
      };

      // transform into Gear 5
      target.transformInto("392-2");

      return rv;
    },
    effectRemove(battle, target, args) {
      battle.addToLog(`${target.name} has lost Gear 5!`);

      target.transformInto(args.oldSpeciesId, {
        abilityId: args.oldAbilityId,
        moveIds: args.oldMoveIds,
      });

      // if knows Gear Fifth, set cooldown to max
      const gearFifthMoveId = "m20010";
      const moveData = getMove(gearFifthMoveId);
      if (target.moveIds[gearFifthMoveId]) {
        target.moveIds[gearFifthMoveId].cooldown = moveData.cooldown;
      }
    },
  },
});

/** @typedef {Keys<moveConfig>} LegacyMoveIdEnum */
const moveConfig = Object.freeze({
  m6: {
    name: "Pay Day",
    type: pokemonTypes.NORMAL,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "Numerous coins are hurled at the target to inflict damage. Reduces the cooldowns of a random other ally by 1, and increases money earned after battle.",
  },
  "m6-1": {
    name: "Gold Rush",
    type: pokemonTypes.NORMAL,
    power: 35,
    accuracy: 80,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "Coins are rained down upon all enemy targets. Reduces the cooldowns of a random ally by 1 and increases money earned after battle for each enemy hit.",
  },
  "m7-1": {
    name: "Red Hawk",
    type: pokemonTypes.FIRE,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user ignites a stretched arm, delivering a powerful flaming punch. Removes the targets defensive buffs before dealing damage, then leaves the target with a burn.",
  },
  m10: {
    name: "Scratch",
    type: pokemonTypes.NORMAL,
    power: 55,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "Hard, pointed, sharp claws rake the target to inflict damage.",
  },
  m14: {
    name: "Swords Dance",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat for 5 turns, and grants the user 60% combat readiness.",
  },
  m16: {
    name: "Gust",
    type: pokemonTypes.FLYING,
    power: 55,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "A gust of wind is whipped up by wings and launched at the target to inflict damage.",
  },
  m17: {
    name: "Wing Attack",
    type: pokemonTypes.FLYING,
    power: 60,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is struck with large, imposing wings spread wide to inflict damage.",
  },
  m21: {
    name: "Slam",
    type: pokemonTypes.NORMAL,
    power: 100,
    accuracy: 90,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is slammed with a long tail, vines, etc., to inflict damage.",
  },
  m23: {
    name: "Stomp",
    type: pokemonTypes.NORMAL,
    power: 90,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is stomped with a big foot. This may also make the target flinch with a 30% chance.",
  },
  m30: {
    name: "Horn Attack",
    type: pokemonTypes.NORMAL,
    power: 90,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is jabbed with a sharply pointed horn to inflict damage.",
  },
  m33: {
    name: "Tackle",
    type: pokemonTypes.NORMAL,
    power: 55,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "A physical attack in which the user charges and slams into the target with its whole ass body.",
  },
  m34: {
    name: "Body Slam",
    type: pokemonTypes.NORMAL,
    power: 95,
    accuracy: 85,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user drops onto the target with its full body weight. This has a 30% chance to leave the target with paralysis.",
  },
  "m34-1": {
    name: "Groggy Slam",
    type: pokemonTypes.NORMAL,
    power: 70,
    accuracy: 75,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user rolls over in its slumber, dropping onto targets with its full body weight. This has a 30% chance to leave the targets with paralysis.",
  },
  m35: {
    name: "Wrap",
    type: pokemonTypes.NORMAL,
    power: 25,
    accuracy: 90,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is wrapped in thin, sharp vines to inflict damage over time for 2 turns.",
  },
  m36: {
    name: "Take Down",
    type: pokemonTypes.NORMAL,
    power: 110,
    accuracy: 85,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "A reckless, full-body charge attack for slamming into the target. This also damages the user by a fourth of the damage dealt.",
  },
  m38: {
    name: "Double-Edge",
    type: pokemonTypes.NORMAL,
    power: 140,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "A reckless, life-risking tackle. This also damages the user by a third of the damage dealt.",
  },
  m40: {
    name: "Poison Sting",
    type: pokemonTypes.POISON,
    power: 20,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is stabbed with a toxic barb, poisoning with a 75% chance.",
  },
  m43: {
    name: "Leer",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The target is stared down with intimidating eyes, lowering its defense for 4 turns.",
  },
  m46: {
    name: "Roar",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The target is scared off, fully reducing its combat readiness and removing all buffs.",
  },
  m47: {
    name: "Sing",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 75,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "A soothing lullaby is sung in a calming voice that puts targets into a deep slumber.",
  },
  m50: {
    name: "Disable",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description: "Disables the target's ultimate move for 1 turn.",
  },
  m51: {
    name: "Acid",
    type: pokemonTypes.POISON,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is sprayed with a harsh, dissolving acid that has a 20% chance to lower the target's Sp. Def for 2 turns.",
  },
  m52: {
    name: "Ember",
    type: pokemonTypes.FIRE,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is attacked with small flames. This has a 20% chance to leave the target with a burn.",
  },
  m53: {
    name: "Flamethrower",
    type: pokemonTypes.FIRE,
    power: 65,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is scorched with an intense blast of fire. This has a 20% chance to leave targets with a burn.",
  },
  m55: {
    name: "Water Gun",
    type: pokemonTypes.WATER,
    power: 55,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description: "The target is blasted with a forceful shot of water.",
  },
  m56: {
    name: "Hydro Pump",
    type: pokemonTypes.WATER,
    power: 100,
    accuracy: 80,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The target row is blasted by a huge volume of water launched under great pressure, reducing their combat readiness by 15%.",
  },
  "m56-1": {
    name: "Hydro Artilery Pump",
    type: pokemonTypes.WATER,
    power: 90,
    accuracy: 80,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The target area is blasted by a huge volume of water launched precisely under great pressure, reducing their combat readiness by 15%. This move is 1.5x effective if there's only one target.",
  },
  "m56-2": {
    name: "Holy Pump",
    type: pokemonTypes.PSYCHIC,
    power: 110,
    accuracy: 60,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The target row is blasted by a huge volume of holy energy, reducing their attack and special attack for 1 turn. Effects apply even if the attack misses.",
  },
  m57: {
    name: "Surf",
    type: pokemonTypes.WATER,
    power: 65,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "All enemies are hit by a huge wave. Has 5 less base power for each additional enemy targetted (not including the first).",
  },
  m58: {
    name: "Ice Beam",
    type: pokemonTypes.ICE,
    power: 70,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is struck with an icy-cold beam of energy. This has a 25% chance to freeze the targets.",
  },
  m59: {
    name: "Blizzard",
    type: pokemonTypes.ICE,
    power: 65,
    accuracy: 70,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "A howling blizzard is summoned to strike all enemies. This has a 30% chance to freeze the targets.",
  },
  m60: {
    name: "Psybeam",
    type: pokemonTypes.PSYCHIC,
    power: 85,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is attacked with a peculiar ray. This has a 50% chance to confuse the target for 2 turns.",
  },
  m63: {
    name: "Hyper Beam",
    type: pokemonTypes.NORMAL,
    power: 160,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is attacked with a powerful beam. This does 50% damage to non-primary targets. The user must rest on the next turn.",
  },
  m64: {
    name: "Peck",
    type: pokemonTypes.FLYING,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description: "The target is jabbed with a sharply pointed beak or horn.",
  },
  m65: {
    name: "Drill Peck",
    type: pokemonTypes.FLYING,
    power: 95,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is repeatedly jabbed with a sharply pointed beak or horn.",
  },
  m68: {
    name: "Counter",
    type: pokemonTypes.FIGHTING,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user assumes a countering stance for 2 turns. When damaged by a physical move, the user retaliates with a physical attack 1.5x the power.",
  },
  m70: {
    name: "Strength",
    type: pokemonTypes.NORMAL,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is attacked with a powerful blow. This deals a small amount of additional true damage based on user's attack.",
  },
  m71: {
    name: "Absorb",
    type: pokemonTypes.GRASS,
    power: 45,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is attacked with a peculiar ray. The user gains 50% of the damage dealt as HP.",
  },
  m73: {
    name: "Leech Seed",
    type: pokemonTypes.GRASS,
    power: null,
    accuracy: 90,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "A seed is planted on the target for 5 turns. It steals 1/4 of the target's max HP every turn.",
  },
  m76: {
    name: "Solar Beam",
    type: pokemonTypes.GRASS,
    power: 150,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "A two-turn attack. The user gathers light, then blasts a bundled beam on the next turn.",
    silenceIf(battle, pokemon) {
      return (
        pokemon.effectIds.absorbLight === undefined &&
        !battle.isWeatherNegated() &&
        battle.weather.weatherId !== weatherConditions.SUN
      );
    },
    tags: ["charge"],
    chargeMoveEffectId: "absorbLight",
  },
  m77: {
    name: "Poison Powder",
    type: pokemonTypes.POISON,
    power: null,
    accuracy: 80,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user scatters a cloud of poisonous dust on the target, poisoning the target.",
  },
  m79: {
    name: "Sleep Powder",
    type: pokemonTypes.GRASS,
    power: null,
    accuracy: 75,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user scatters a big cloud of sleep-inducing dust around the target.",
  },
  m81: {
    name: "String Shot",
    type: pokemonTypes.BUG,
    power: null,
    accuracy: 95,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The target is sprayed with a sticky string that lowers their combat readiness by 30% and sharply lowers their speed for 1 turn.",
  },
  m84: {
    name: "Thunder Shock",
    type: pokemonTypes.ELECTRIC,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "A jolt of electricity is hurled at the target to inflict damage. This has a 10% chance to paralyze the target.",
  },
  m85: {
    name: "Thunderbolt",
    type: pokemonTypes.ELECTRIC,
    power: 95,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "A strong electric blast is loosed at the target. This has a 25% chance to paralyze the target.",
  },
  m86: {
    name: "Thunder Wave",
    type: pokemonTypes.ELECTRIC,
    power: null,
    accuracy: 60,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "A weak electric charge is launched at the target row, paralyzing them. If the user is electric type and the opponent isn't ground type, will paralyze the primary target regardless of missing.",
  },
  m87: {
    name: "Thunder",
    type: pokemonTypes.ELECTRIC,
    power: 90,
    accuracy: 70,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "A wicked thunderbolt is dropped on the target to inflict damage. This has a 30% chance to paralyze targets.",
  },
  "m87-1": {
    name: "Thunder Charge",
    type: pokemonTypes.ELECTRIC,
    power: 120,
    accuracy: 80,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user charges a wicked thunderbolt to be dropped on the target. The user suffers decreased speed for 1 turn.",
  },
  m88: {
    name: "Rock Throw",
    type: pokemonTypes.ROCK,
    power: 65,
    accuracy: 70,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user picks up and throws a small rock at the target to inflict damage.",
  },
  m89: {
    name: "Earthquake",
    type: pokemonTypes.GROUND,
    power: 100,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user sets off an earthquake that hits all enemy Pokemon. Has 7 less base power for each additional enemy targetted (not including the first).",
  },
  m91: {
    name: "Dig",
    type: pokemonTypes.GROUND,
    power: 100,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user burrows into the ground, becoming untargetable and unhittable 1 turn. The user then attacks on the next turn.",
    silenceIf(_battle, pokemon) {
      return pokemon.effectIds.burrowed === undefined;
    },
    tags: ["charge"],
    chargeMoveEffectId: "burrowed",
  },
  m92: {
    name: "Toxic",
    type: pokemonTypes.POISON,
    power: null,
    accuracy: 80,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.X,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "A move that leaves the targets badly poisoned. Its poison damage worsens every turn. If the user is Poison type and the target isn't Steel type, ignore miss on the primary target.",
  },

  m97: {
    name: "Agility",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user relaxes and lightens its body to move faster. This sharply raises the user's Speed for 5 turns and boosts combat readiness by 80%.",
  },
  "m97-1": {
    name: "Ifrit Jambe",
    type: pokemonTypes.FIRE,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user rapidly spins its body to move blazingly fast. This raises the user's Attack and Speed for 4 turns and boosts combat readiness by 80%. If the user isn't Fire type, permanently change its secondary type to Fire.",
  },
  m98: {
    name: "Quick Attack",
    type: pokemonTypes.NORMAL,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user lunges at the target at a speed that makes it almost invisible. Also boosts the user's combat readiness by 30%.",
  },
  m100: {
    name: "Teleport",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user teleports away, boosting the ally with the most combat readiness to 100.",
  },
  m101: {
    name: "Night Shade",
    type: pokemonTypes.GHOST,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks the target with a shadowy blob. The damage dealt is equal to 1.5x the user's level.",
  },
  m102: {
    name: "Mimic",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ANY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user copies the target's ultimate move for 3 turns, then gain 50% combat readiness. Fails if the target has no ultimate move. If the user doesn't know mimic, replaces the move in the first slot.",
  },
  m103: {
    name: "Screech",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 80,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user emits a screech harsh enough to sharply lower the targets' Defense for 3 turns.",
  },
  m105: {
    name: "Recover",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description: "The user recovers 50% of its max HP.",
  },
  m106: {
    name: "Harden",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user stiffens all the muscles in its body to raise its Defense for 2 turns. Also gains 15% def as shield.",
  },
  m108: {
    name: "Smokescreen",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user releases an obscuring cloud of smoke or ink. This sharply lowers the targets' Accuracy for 3 turns.",
  },
  "m108-1": {
    name: "Rocket Smokescreen",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user releases an obscuring cloud of smoke or ink. This sharply raises allies' evasion for 3 turns.",
  },
  m110: {
    name: "Withdraw",
    type: pokemonTypes.WATER,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user withdraws its body into its hard shell, raising its Defense for 2 turns and gaining 15% defense as shield.",
  },
  m111: {
    name: "Defense Curl",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user curls up to conceal weak spots and raise its Defense for 4 turns and boost the power of Rollout. Also gains 10% defense as shield.",
  },
  m113: {
    name: "Light Screen",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user creates a wall of light, sharply raising the Special Defense of targeted allies for 3 turns, and raising the Special Defense of other allies.",
  },
  m115: {
    name: "Reflect",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user creates a wall of light, sharply raising the Defense of targeted allies for 3 turns, and raising the Defense of other allies.",
  },
  m116: {
    name: "Focus Energy",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user takes a deep breath and focuses, sharply raising the user's attack for 1 turn and gaining 60% combat readiness.",
  },
  m118: {
    name: "Metronome",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user waggles a finger and stimulates its brain into randomly using any basic move.",
  },
  m122: {
    name: "Lick",
    type: pokemonTypes.GHOST,
    power: 25,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user licks the target with its tongue, dealing damage and having a 30% to paralyze it.",
  },
  m123: {
    name: "Smog",
    type: pokemonTypes.POISON,
    power: 40,
    accuracy: 70,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user emits a cloud of poison gas. This may also poison the target with a 50% chance.",
  },
  m126: {
    name: "Fire Blast",
    type: pokemonTypes.FIRE,
    power: 100,
    accuracy: 85,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.X,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user launches a huge fireball at the target. This may also burn targets with a 30% chance.",
  },
  m127: {
    name: "Waterfall",
    type: pokemonTypes.WATER,
    power: 110,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user charges at the target and may make it flinch with 20% chance. This chance increases in proportion to how much more attack the user has compared to the target.",
  },
  m134: {
    name: "Kinesis",
    type: pokemonTypes.PSYCHIC,
    power: 50,
    accuracy: 80,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user distracts the target by bending a spoon. This lowers the target's accuracy for 1 turn.",
  },
  m135: {
    name: "Soft-Boiled",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user sacrifices 10% of its HP to heal the target by 50% of the user's max HP. If the target is fully healed, reduce this cooldown by 1.",
  },
  m136: {
    name: "High Jump Kick",
    type: pokemonTypes.FIGHTING,
    power: 175,
    accuracy: 80,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user jumps high into the air and slams down on the target. If the user misses, it takes 50% damage as recoil.",
  },
  m137: {
    name: "Glare",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user glares at the target, paralyzing it. Grants the user 80% combat readiness.",
  },
  "m137-1": {
    name: "Rocket Glare",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description: "The user glares at the targets, paralyzing those hit.",
  },
  m143: {
    name: "Sky Attack",
    type: pokemonTypes.FLYING,
    power: 250,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "A second-turn attack move. If this defeats the target, all enemies have a 30% chance to flinch, boosted by 10% of the user's speed, up to a max of 75%.",
    silenceIf(_battle, pokemon) {
      return pokemon.effectIds.skyCharge === undefined;
    },
    tags: ["charge"],
    chargeMoveEffectId: "skyCharge",
  },
  m147: {
    name: "Spore",
    type: pokemonTypes.GRASS,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user scatters bursts of spores that can't miss and cause the target to fall asleep.",
  },
  m150: {
    name: "Splash",
    type: pokemonTypes.WATER,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description: "The user flops and splashes around to no effect at all...",
  },
  m152: {
    name: "Crabhammer",
    type: pokemonTypes.WATER,
    power: 90,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks the target column with its pincers. If hit, deals a small amount of true damage proportional to the user's attack.",
  },
  m153: {
    name: "Explosion",
    type: pokemonTypes.NORMAL,
    power: 200,
    accuracy: 100,
    cooldown: 6,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user explodes, dealing damage to enemies. This also deals 1/3rd damage to surrounding allies, and causes the user to faint. Power increases proportional to percent remaining HP.",
  },
  "m154-1": {
    name: "Paws of Fury",
    type: pokemonTypes.FIRE,
    power: 20,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks the target square with its paws like it attacks trucks. This attack hits twice; the first lowering defense for 1 turn and the second dealing double damage.",
  },
  m156: {
    name: "Rest",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user goes to sleep. This fully restores the user's HP and removes all status effects and debuffs. Fails if the user is already asleep or at max HP",
  },
  m157: {
    name: "Rock Slide",
    type: pokemonTypes.ROCK,
    power: 70,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "Large boulders are hurled at the target to inflict damage. This also has a 70% chance to make the target flinch for 1 turn.",
  },
  m162: {
    name: "Super Fang",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user chomps hard on the target with its sharp front fangs. This deals damage equal to 50% of the target's current HP and can't miss.",
  },
  m167: {
    name: "Triple Kick",
    type: pokemonTypes.FIGHTING,
    power: 33,
    accuracy: 66,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "A consecutive spinning three-kick attack. Deals damage 3 times.",
  },
  m168: {
    name: "Thief",
    type: pokemonTypes.DARK,
    power: 65,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks and steals the target's buffs simultaneously.",
  },
  m175: {
    name: "Flail",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user flails about aimlessly to attack. This move's power increases the lower the user's HP.",
  },
  m177: {
    name: "Aeroblast",
    type: pokemonTypes.FLYING,
    power: 100,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "A vortex of air is shot to inflict damage. This only deals most damage to up to 3 random targets in the area, deals extra true damage proportional to the user's HP to any targets hit.",
  },
  "m177-1": {
    name: "Shadowblast",
    type: pokemonTypes.FLYING,
    power: 75,
    accuracy: 75,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "A vortex of dark energy is shot to inflict damage. If hit, always super effective.",
  },
  m182: {
    name: "Protect",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user becomes invulnerable to moves, statuses, and debuffs for 1 turn.",
  },
  "m182-1": {
    name: "Stretchy Defense",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user becomes invulnerable to moves for 1 turn. If hit by Physical attacks, the user stretches its body to the shape of the attack, healing what damage it would have taken. If hit by a Special attack, the user reflects the attack.",
  },
  m183: {
    name: "Mach Punch",
    type: pokemonTypes.FIGHTING,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user throws a punch at blinding speed, increasing the user's combat readiness by 30%.",
  },
  "m183-1": {
    name: "Mach Pistol",
    type: pokemonTypes.FIGHTING,
    power: 45,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user stretches its arm back, then throws a punch at blinding speed, increasing the user's combat readiness by 40%.",
  },
  m186: {
    name: "Sweet Kiss",
    type: pokemonTypes.FAIRY,
    power: null,
    accuracy: 85,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user kisses the target with a sweet, angelic cuteness that causes confusion for 3 turns.",
  },
  m187: {
    name: "Belly Drum",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user permanently doubles its Attack stat in exchange for HP equal to half its max HP. Then, gain another turn.",
  },
  m188: {
    name: "Sludge Bomb",
    type: pokemonTypes.POISON,
    power: 65,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "Unsanitary sludge is hurled at the target. This has a 30% poison the targets.",
  },
  m189: {
    name: "Mud Slap",
    type: pokemonTypes.GROUND,
    power: 35,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user hurls mud in the target's face to inflict damage and lower its accuracy for 1 turn.",
  },
  m191: {
    name: "Spikes",
    type: pokemonTypes.GROUND,
    power: null,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user lays a trap of spikes at the opposing team's feet. The trap hurts opposing Pokémon that have their combat readiness boosted and before they move.",
  },
  m192: {
    name: "Zap Cannon",
    type: pokemonTypes.ELECTRIC,
    power: 150,
    accuracy: 50,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user fires an electric blast like a cannon to inflict damage and paralyze the target if hit.",
  },
  m194: {
    name: "Destiny Bond",
    type: pokemonTypes.GHOST,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user enters in to a dark pact with the target. If the user faints in the next turn, the target Pokemon also faints.",
  },
  m195: {
    name: "Perish Song",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 7,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user sings an ancient song that causes targets AND surrounding allies to faint in 3 turns.",
  },
  m199: {
    name: "Lock-On",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ANY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user takes aim at the target, forcing them to redirect moves and sharply reducing their evasion for 1 turn.",
  },
  m200: {
    name: "Outrage",
    type: pokemonTypes.DRAGON,
    power: 130,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.RANDOM,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user rampages and attacks randomly for 3 turns. The user then becomes confused for 2 turns.",
  },
  m202: {
    name: "Giga Drain",
    type: pokemonTypes.GRASS,
    power: 90,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "A nutrient-draining attack. The user's HP is restored by half the damage taken by the target.",
  },
  m203: {
    name: "Endure",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description: "Applies Immortality to the user for 1 turn.",
  },
  m204: {
    name: "Charm",
    type: pokemonTypes.FAIRY,
    power: null,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user gazes at the target rather charmingly, making it less wary. This sharply lowers the target's attack stat for 3 turns.",
  },
  m205: {
    name: "Rollout",
    type: pokemonTypes.ROCK,
    power: 50,
    accuracy: 90,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user continually rolls into the target. If it hits, the next turn's rollout has base 100 power.",
  },
  m208: {
    name: "Milk Drink",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user restores the target by 40% of the user's max HP, as well as cleansing all debuffs and status conditions. Increases healing by 10% for each effect cleansed.",
  },
  "m208-1": {
    name: "Shuron Hakke",
    type: pokemonTypes.POISON,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "By consuming a strange liquid substance, the user raises all its stats for 1 turn and restors 25% of its max HP.",
  },
  m210: {
    name: "Fury Cutter",
    type: pokemonTypes.BUG,
    power: 50,
    accuracy: 90,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is slashed with scythes or claws. If it hits, the next turn's fury cutter has base 100 power.",
  },
  m212: {
    name: "Mean Look",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user pins targets with a dark, arresting look. Enemies lose 50% combat readiness and can't gain boosted combat readiness for 2 turns.",
  },
  "m212-1": {
    name: "Slow Down!",
    type: pokemonTypes.FAIRY,
    power: null,
    accuracy: 75,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The causes enemies to slow to a crawl, sharply reducing their speed for 2 turns.",
  },
  m214: {
    name: "Sleep Talk",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user talks in its sleep, using a random other move against a random target. Ignores cooldowns and missing. Fails if the user is not asleep.",
  },
  m215: {
    name: "Heal Bell",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user makes a soothing bell chime to heal the status conditions of all the party Pokémon. Also heals targets for 10% of their max HP, boosted to 20% if a condition is removed.",
  },
  m216: {
    name: "Return",
    type: pokemonTypes.NORMAL,
    power: 102,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks with a happy burst of energy. Has 20 less base power if user is damaged.",
  },
  m219: {
    name: "Safeguard",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user creates a protective field that prevents allies from receiving status conditions for 3 turns.",
  },
  m221: {
    name: "Sacred Fire",
    type: pokemonTypes.FIRE,
    power: 100,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is razed with a mystical fire of great intensity. This only damages up to 3 random targets in the area, but has a 50% chance of burning all targets.",
  },
  m223: {
    name: "Dynamic Punch",
    type: pokemonTypes.FIGHTING,
    power: 140,
    accuracy: 50,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user punches the target with full, concentrated power. If hit, this also confuses surrounding targets for 2 turns.",
  },
  m224: {
    name: "Megahorn",
    type: pokemonTypes.BUG,
    power: 130,
    accuracy: 85,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "Using its tough and impressive horn, the user rams into the target with no letup.",
  },
  m226: {
    name: "Baton Pass",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user boosts an ally's combat readiness to 100%, passing along ALL dispellable effects.",
  },
  "m226-1": {
    name: "Attack Cuisine",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user prepares a delicious meal for an ally, their combat readiness to 100% and giving them sharply increased Attack and Defense for 2 turns.",
  },
  m229: {
    name: "Rapid Spin",
    type: pokemonTypes.NORMAL,
    power: 50,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "A spin attack that can also dispells debuffs from the user and surrounding allies.",
  },
  m231: {
    name: "Iron Tail",
    type: pokemonTypes.STEEL,
    power: 90,
    accuracy: 75,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slams the target with its steel-hard tail lowering the target's Defense stat for 2 turns. If the user has higher defense than the target, the effect occurs before damage is dealt.",
  },
  m235: {
    name: "Synthesis",
    type: pokemonTypes.GRASS,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user restores its own HP by 33% and gain 50% combat readiness. In sun, boost the users Special Attack and Special Defense for 3 turns. In other weather, this restores 25% HP.",
  },
  m236: {
    name: "Moonlight",
    type: pokemonTypes.FAIRY,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user restores its own HP by 50%. In sun, this restores 66% HP. In other weather, this restores 25% HP",
  },
  m238: {
    name: "Cross Chop",
    type: pokemonTypes.FIGHTING,
    power: 80,
    accuracy: 80,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.X,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user delivers a double chop with its forearms crossed. Deals half damage to non-primary targets.",
  },
  m239: {
    name: "Twister",
    type: pokemonTypes.DRAGON,
    power: 45,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user whips up a vicious twister to tear at the opposing team. This may also make the target flinch with a 30% chance.",
  },
  m240: {
    name: "Rain Dance",
    type: pokemonTypes.WATER,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user summons a heavy rain, powering up Water-type moves. Then gains 50% combat readiness.",
  },
  m241: {
    name: "Sunny Day",
    type: pokemonTypes.FIRE,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user intensifies the sun, powering up Fire-type moves. Then gains 50% combat readiness.",
  },
  m242: {
    name: "Crunch",
    type: pokemonTypes.DARK,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user crunches up the target with sharp fangs. This may also lower the target's defense for 3 turns with a 85% chance.",
  },
  m243: {
    name: "Mirror Coat",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user creates a reflective field for 2 turns. When damaged by a Special move, deals damage back to the target with 1.5x base power.",
  },
  m245: {
    name: "Extreme Speed",
    type: pokemonTypes.NORMAL,
    power: 80,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user charges the target at blinding speed, raising the user's combat readiness by 80%.",
  },
  m246: {
    name: "Ancient Power",
    type: pokemonTypes.ROCK,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks with a prehistoric power. This has a 50% chance to raise the user's highest non-hp base stat for 1 turn.",
  },
  m247: {
    name: "Shadow Ball",
    type: pokemonTypes.GHOST,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user hurls a shadowy blob at the target. This may also lower the target's Sp. Def stat for 3 turns with a 85% chance.",
  },
  m248: {
    name: "Future Sight",
    type: pokemonTypes.PSYCHIC,
    power: 100,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "Two turns after this move is used, a hunk of psychic energy attacks targets. If the Future Sight debuff is cleansed early, deals less damage.",
  },
  m249: {
    name: "Rock Smash",
    type: pokemonTypes.FIGHTING,
    power: 45,
    accuracy: 80,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user smashes into the target with a rock-hard fist. This may also lower the target's defense for 2 turns with a 70% chance.",
  },
  m252: {
    name: "Fake Out",
    type: pokemonTypes.NORMAL,
    power: 50,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user strikes the target with a quick jolt of electricity, causing the target to flinch for 1 turn. Also boosts the user's combat readiness by 60%.",
  },
  m257: {
    name: "Heat Wave",
    type: pokemonTypes.FIRE,
    power: 80,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks by exhaling hot breath on the opposing team. This only deals damage to the target row, but has a 30% of burning all targets",
  },
  m258: {
    name: "Hail",
    type: pokemonTypes.ICE,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user summons a vicious hailstorm. The user also gains 50% combat readiness.",
  },
  m262: {
    name: "Memento",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user faints, but sharply lowers the enemy teams' Attack and Special Attack for 3 turns.",
  },
  m266: {
    name: "Follow Me",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user redirects all enemy attacks to itself and gains increased defenses for 1 turn.",
  },
  m268: {
    name: "Charge",
    type: pokemonTypes.ELECTRIC,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user boosts its Special Defense and Electric moves for 2 turns.",
  },
  m269: {
    name: "Taunt",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user taunts the target into only using moves with base power for 3 turns.",
  },
  "m269-1": {
    name: "Reverse Taunt",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user taunts the target into only using moves WITHOUT base power for 2 turns.",
  },
  m270: {
    name: "Helping Hand",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user assists an ally by boosting their attacking stats for 1 turn, and their combat readiness by 25%.",
  },
  m273: {
    name: "Wish",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user makes a wish to heal an ally for 50% of the user's max HP after 1 turn.",
  },
  m276: {
    name: "Superpower",
    type: pokemonTypes.FIGHTING,
    power: 130,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks the target with great power. However, this also lowers the user's Attack and Defense stats for 1 turn.",
  },
  m281: {
    name: "Yawn",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user lets loose a huge yawn that lulls targets into falling asleep in 1 turn. If the user is asleep, apply sleep immediately.",
  },
  m282: {
    name: "Knock Off",
    type: pokemonTypes.DARK,
    power: 65,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slaps down the target, removing all buffs. For each buff removed, deals 25% more damage, up to 75% more damage.",
  },
  m283: {
    name: "Endeavor",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "An attack move that cuts down the target's HP to equal the user's HP.",
  },
  m284: {
    name: "Eruption",
    type: pokemonTypes.FIRE,
    power: 150,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks opposing Pokémon with explosive fury. The power of this move decreases proportional to HP lost.",
  },
  m288: {
    name: "Grudge",
    type: pokemonTypes.GHOST,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "If the user faints in the next turn, silence all enemies for 2 turns.",
  },
  m295: {
    name: "Luster Purge",
    type: pokemonTypes.PSYCHIC,
    power: 75,
    accuracy: 80,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user lets loose a damaging burst of light. This also lowers the target's Sp. Def for 2 turns. If an ally has Mist Ball on cooldown, this hits all enemies and ignores miss.",
  },
  m296: {
    name: "Mist Ball",
    type: pokemonTypes.PSYCHIC,
    power: 60,
    accuracy: 80,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user creates a misty explosion around the target. This also lowers the target's Sp. Atk for 1 turn. If an ally has Luster Purge on cooldown, instead lower Atk and Sp. Atk for 2 turns, and ignore miss.",
  },
  m299: {
    name: "Blaze Kick",
    type: pokemonTypes.FIRE,
    power: 85,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user launches a fiery kick that leaves the target with a burn.",
  },
  m303: {
    name: "Slack Off",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user slacks off, restoring 50% of its max HP and increasing its defense for 3 turns.",
  },
  m304: {
    name: "Hyper Voice",
    type: pokemonTypes.NORMAL,
    power: 50,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user lets loose a horribly echoing shout with the power to inflict damage. Deals addtional true damage to all hit targets proportional to the user's special attack and HP.",
  },
  m305: {
    name: "Poison Fang",
    type: pokemonTypes.POISON,
    power: 50,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user bites the target with toxic fangs. This may also leave the target badly poisoned with a 75% chance.",
  },
  m309: {
    name: "Meteor Mash",
    type: pokemonTypes.STEEL,
    power: 90,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is hit with a hard punch fired like a meteor. This also raises the users attack for 2 turns before attacking. If the target doesn't faint, remove the buff.",
  },
  m311: {
    name: "Weather Ball",
    type: pokemonTypes.NORMAL,
    power: 55,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "This move's type changes depending on the weather, and power is doubled in any weather.",
  },
  m316: {
    name: "Aromatherapy",
    type: pokemonTypes.GRASS,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user releases a soothing scent that heals all allies by 25% HP, removing status conditions and debuffs.",
  },
  m317: {
    name: "Rock Tomb",
    type: pokemonTypes.ROCK,
    power: 80,
    accuracy: 95,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "Boulders are hurled at the target. This also lowers the target's Speed stat for 3 turns.",
  },
  "m317-1": {
    name: "Holy Tomb",
    type: pokemonTypes.ROCK,
    power: 100,
    accuracy: 70,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "Boulders of biblical proportion are hurled at the target. This also lowers the target's Speed stat for 2 turns, even when the attack misses.",
  },
  m322: {
    name: "Cosmic Power",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user absorbs a mystical power from space to raise its defense and special defense for 3 turns. Gives itself 10% of its defenses as a shield.",
  },
  m325: {
    name: "Shadow Punch",
    type: pokemonTypes.GHOST,
    power: 75,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user throws a punch from the shadows. This move never misses.",
  },
  m330: {
    name: "Muddy Water",
    type: pokemonTypes.WATER,
    power: 50,
    accuracy: 70,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks by shooting a wave of muddy water at the opposing team. This may also lower their accuracy for 2 turns with a 50% chance.",
  },
  m331: {
    name: "Bullet Seed",
    type: pokemonTypes.GRASS,
    power: 30,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user forcefully shoots seeds at random targets, hitting 5 times.",
  },
  "m331-1": {
    name: "Ashura Bakkei",
    type: pokemonTypes.DARK,
    power: 15,
    accuracy: 80,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user takes a turn to charge up, then forcefully slashes at random targets, hitting 9 times. Targets who are successfully hit take an additional 5% max HP true damage.",
    silenceIf(_battle, pokemon) {
      return pokemon.effectIds.projectingSpirit === undefined;
    },
    tags: ["charge"],
    chargeMoveEffectId: "projectingSpirit",
  },
  m332: {
    name: "Aerial Ace",
    type: pokemonTypes.FLYING,
    power: 80,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user confounds the target with speed, then slashes. This attack never misses.",
  },
  m334: {
    name: "Iron Defense",
    type: pokemonTypes.STEEL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user hardens its body's surface like iron, sharply raising its Defense stat for 3 turns and gaining 15% defense as shield.",
  },
  "m334-1": {
    name: "Titanium Defense",
    type: pokemonTypes.STEEL,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user hardens its teammates' bodies like titanium, sharply raising its Defense stat for 2 turns and raising surrounding allies Defense stat for 2 turns. Gives itself 20% defense as shield and allies 5% user def as shield.",
  },
  "m334-2": {
    name: "Genetic Defense",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user hardens its genetic code and experimental armor, sacrificing speed but sharply raising its Defense and Special Defense for 2 turns.",
  },
  m336: {
    name: "Howl",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user howls loudly to raise the spirit of itself and its allies, boosting their combat readiness by 15% and raising Attack for 1 turn.",
  },
  m340: {
    name: "Bounce",
    type: pokemonTypes.FLYING,
    power: 110,
    accuracy: 85,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user bounces up high, then drops on the target on the second turn. This has a 30% chance to leave the target with paralysis.",
    silenceIf(_battle, pokemon) {
      return pokemon.effectIds.sprungUp === undefined;
    },
    tags: ["charge"],
    chargeMoveEffectId: "sprungUp",
  },
  m344: {
    name: "Volt Tackle",
    type: pokemonTypes.ELECTRIC,
    power: 80,
    accuracy: 80,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user electrifies itself, then charges. This also damages the user by 25% of the damage dealt. This may leave the target with paralysis with a 20% chance.",
  },
  m347: {
    name: "Calm Mind",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user quietly focuses its mind and calms its spirit to raise its Special Attack and Special Defense for 3 turns and gaining 50% combat readiness.",
  },
  m348: {
    name: "Leaf Blade",
    type: pokemonTypes.GRASS,
    power: 70,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user handles a sharp leaf like a sword and attacks by cutting its target. Deals extra true damage based on attack, and only deals 50% damage to other targets.",
  },
  m349: {
    name: "Dragon Dance",
    type: pokemonTypes.DRAGON,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user vigorously performs a mystic, powerful dance that raises its Attack and Speed stats for 3 turns and gaining 50% combat readiness.",
  },
  m352: {
    name: "Water Pulse",
    type: pokemonTypes.WATER,
    power: 60,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks the target with a pulsing blast of water. This has a 25% chance to confuse targets for 2 turns.",
  },
  m354: {
    name: "Psycho Boost",
    type: pokemonTypes.PSYCHIC,
    power: 20,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user enhances its allies with alien power, sharply raising their highest stat for 2 turns. Then, attacks all enemies.",
  },
  "m354-1": {
    name: "Psycho Boost - Attack",
    type: pokemonTypes.PSYCHIC,
    power: 100,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user performs an all-out attack, dealing damage based on the higher of its attacking stats, then sharply lowers that stat for 2 turns.",
  },
  "m354-2": {
    name: "Psycho Boost - Defense",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user protects an ally, granting them a shield equal to to 25% of the user's defenses for 3 turns.",
  },
  "m354-3": {
    name: "Psycho Boost - Speed",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 7,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user warps time and space at light speed, giving itself 2 additional turns.",
  },
  m355: {
    name: "Roost",
    type: pokemonTypes.FLYING,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user lands and rests its body, removing its Flying type for one turn. It restores the user's HP by up to half of its max HP.",
  },
  m359: {
    name: "Hammer Arm",
    type: pokemonTypes.FIGHTING,
    power: 80,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user swings and hits with its strong and heavy fist. This lowers the user's Speed for 1 turn.",
  },
  m361: {
    name: "Healing Wish",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user faints and the target Pokemon has their health and combat readiness entirely restored.",
  },
  m366: {
    name: "Tailwind",
    type: pokemonTypes.FLYING,
    power: null,
    accuracy: null,
    cooldown: 6,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user whips up a turbulent whirlwind that sharply raises the Speed of all party Pokémon for 2 turns and boosting combat readiness of the target row by 15%.",
  },
  m369: {
    name: "U-Turn",
    type: pokemonTypes.BUG,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "After making its attack, the user rushes back, boosting a random party Pokemon's combat readiness to max.",
  },
  m370: {
    name: "Close Combat",
    type: pokemonTypes.FIGHTING,
    power: 120,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user fights the target up close without guarding itself. This also lowers the user's Defense and Special Defense for 1 turn.",
  },
  "m370-1": {
    name: "Gattling Combat",
    type: pokemonTypes.FIGHTING,
    power: 85,
    accuracy: 80,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user moves horizontally in a rapid fashion, sretching its fists to attack rapidly. This also sharply lowers the user's Defense and Special Defense for 1 turn.",
  },
  m387: {
    name: "Last Resort",
    type: pokemonTypes.NORMAL,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks the target with full force. This move has 40 additional base power for each additional move on cooldown.",
  },
  m392: {
    name: "Aqua Ring",
    type: pokemonTypes.WATER,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user envelops allies in a veil made of water, restoring 18% of the user's max HP for 3 turns and boosting defense for 2 turns.",
  },
  m394: {
    name: "Flare Blitz",
    type: pokemonTypes.FIRE,
    power: 110,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user cloaks itself in fire and charges at the target, and damaging it and dealing 50% damage to adjacent targets. This also damages the user by a third of the damage dealt, and has a 10% chance to leave targets with a burn.",
  },
  "m394-1": {
    name: "Dark Blitz",
    type: pokemonTypes.FIRE,
    power: 85,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.X,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user cloaks itself in sinister flames and charges at the target. Type effectiveness is calculated as the best of Fire and Dark. This also damages the user by a third of the damage dealt.",
  },
  m396: {
    name: "Aura Sphere",
    type: pokemonTypes.FIGHTING,
    power: 115,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user lets loose a blast of aura power from deep within its body at the target. This move never misses.",
  },
  m398: {
    name: "Poison Jab",
    type: pokemonTypes.POISON,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user stabs the target with a poisonous stinger. This has a 80% chance to poison the target.",
  },
  m399: {
    name: "Dark Pulse",
    type: pokemonTypes.DARK,
    power: 65,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user releases a horrible aura imbued with dark thoughts. This has a 25% chance to flinch targets for 1 turn.",
  },
  m402: {
    name: "Seed Bomb",
    type: pokemonTypes.GRASS,
    power: 70,
    accuracy: 80,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slams a barrage of hard-shelled seeds down on the target from above. Adjacent targets take 50% damage.",
  },
  m403: {
    name: "Air Slash",
    type: pokemonTypes.FLYING,
    power: 65,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks with a blade of air that slices even the sky. This has a 25% chance to flinch the target.",
  },
  m404: {
    name: "X-Scissor",
    type: pokemonTypes.BUG,
    power: 40,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.X,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slashes at the target by crossing its scythes or claws as if they were a pair of scissors. The primary target is hit a second time with an attack that deals 2x damage.",
  },
  m405: {
    name: "Bug Buzz",
    type: pokemonTypes.BUG,
    power: 70,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user generates a damaging sound wave by vibration. This also has a 80% chance to lower targets Sp. Defense for two turns BEFORE dealing damage.",
  },
  m406: {
    name: "Dragon Pulse",
    type: pokemonTypes.DRAGON,
    power: 70,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is attacked with a shock wave generated by the user's gaping mouth.",
  },
  m407: {
    name: "Dragon Rush",
    type: pokemonTypes.DRAGON,
    power: 120,
    accuracy: 75,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.RANDOM,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user tackles the target while exhibiting overwhelming menace. This also has a 30% chance to make the target flinch for 1 turn.",
  },
  m409: {
    name: "Drain Punch",
    type: pokemonTypes.FIGHTING,
    power: 90,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "An energy-draining punch. The user's HP is restored by half the damage taken by the target.",
  },
  m412: {
    name: "Energy Ball",
    type: pokemonTypes.GRASS,
    power: 100,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user draws power from nature and fires it at the target. This has a 85% chance to lower the target's Sp. Defense for 4 turn.",
  },
  m413: {
    name: "Brave Bird",
    type: pokemonTypes.FLYING,
    power: 110,
    accuracy: 80,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user tucks in its wings and charges from a low altitude. This also damages the user by a third of the damage dealt.",
  },
  m414: {
    name: "Earth Power",
    type: pokemonTypes.GROUND,
    power: 60,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user makes the ground under the target erupt with power. This also has a 30% chance to lower targets' Sp. Defense for 3 turns.",
  },
  m416: {
    name: "Giga Impact",
    type: pokemonTypes.NORMAL,
    power: 160,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user charges at the target using every bit of its power, dealing damage to the primary target and 50% damage to other targets. The user must rest on the next turn.",
  },
  "m416-1": {
    name: "Galaxy Impact",
    type: pokemonTypes.NORMAL,
    power: 130,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The launches an attack at the target using every bit of its willpower, dealing damage to the primary target and 50% damage to other targets. The user's speed is greatly lowered for 1 turn.",
  },
  m417: {
    name: "Nasty Plot",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user stimulates its brain by thinking bad thoughts. This sharply raises the user's Sp. Attack stat for 5 turns, and gives it 60% combat readiness.",
  },
  "m417-1": {
    name: "Uncontrollable Joy",
    type: pokemonTypes.FAIRY,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user stimulates the an ally's brain by thinking happy thoughts. This sharply raises the target's Sp. Attack and Evasion for 2 turns, and gives it 60% combat readiness.",
  },
  m418: {
    name: "Bullet Punch",
    type: pokemonTypes.STEEL,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user strikes the target with tough punches as fast as bullets, dealing damage and increasing its own combat readiness by 30%.",
  },
  m420: {
    name: "Ice Shard",
    type: pokemonTypes.ICE,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user launches sharp icicles at the target, dealing damage and increasing its own combat readiness by 30%.",
  },
  m424: {
    name: "Fire Fang",
    type: pokemonTypes.FIRE,
    power: 75,
    accuracy: 95,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user bites the target with flame-cloaked fangs, dealing damage and has a 25% chance to flinch and 25% chance to leave the target with a burn.",
  },
  m425: {
    name: "Shadow Sneak",
    type: pokemonTypes.GHOST,
    power: 40,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user extends its shadow and attacks the target from behind. This deals damage and increases the user's combat readiness by 30%.",
  },
  m428: {
    name: "Zen Headbutt",
    type: pokemonTypes.PSYCHIC,
    power: 110,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user focuses its willpower to its head and attacks the target. This also causes the target to flinch for 1 turn.",
  },
  m430: {
    name: "Flash Cannon",
    type: pokemonTypes.STEEL,
    power: 65,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user gathers all its light energy and releases it at once, dealing damage and has a 40% chance to lower targets Sp. Defense for two turns.",
  },
  m432: {
    name: "Defog",
    type: pokemonTypes.FLYING,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user blows a powerful gust that dispells buffs from enemies and debuffs from allies.",
  },
  // TODO: possibly rework this move
  m433: {
    name: "Trick Room",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user creates a bizarre area in which Pokemon recieve speed buffs or debuffs inversely based on how fast they are for 3 turns.",
  },
  m435: {
    name: "Discharge",
    type: pokemonTypes.ELECTRIC,
    power: 60,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user fires a powerful electric blast at the target, dealing damage and has a 35% chance to paralyze targets.",
  },
  "m435-1": {
    name: "Volt Discharge",
    type: pokemonTypes.ELECTRIC,
    power: 70,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user discharges its debuffs as a powerful electric blast at the target, dealing damage and transferring one dispellable debuff per-target.",
  },
  m437: {
    name: "Leaf Storm",
    type: pokemonTypes.GRASS,
    power: 100,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user whips up a storm of leaves around the target, dealing damage and sharply lowers the user's Sp. Attack for 2 turns.",
  },
  m441: {
    name: "Gunk Shot",
    type: pokemonTypes.POISON,
    power: 95,
    accuracy: 70,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user fires a filthy shot at the target to inflict damage and has a 50% chance to poison targets. If already poisoned, deals 1.5x damage.",
  },
  m444: {
    name: "Stone Edge",
    type: pokemonTypes.ROCK,
    power: 80,
    accuracy: 80,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user stabs the target column with sharpened stones from below.",
  },
  m446: {
    name: "Stealth Rock",
    type: pokemonTypes.ROCK,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user lays a trap of levitating stones around the target for 5 turns. The trap hurts opposing Pokemon that have their combat readiness boosted or receive buffs.",
  },
  m450: {
    name: "Bug Bite",
    type: pokemonTypes.BUG,
    power: 90,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user bites the target with its sharp teeth, dealing damage and stealing one buff from the target.",
  },
  m453: {
    name: "Aqua Jet",
    type: pokemonTypes.WATER,
    power: 45,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user charges at the target with blinding speed, dealing damage and raising the user's combat readiness by 30%.",
  },
  m469: {
    name: "Wide Guard",
    type: pokemonTypes.ROCK,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user and its allies take 30% less damage, increased to 60% damage from non-single-target attacks for 3 turns.",
  },
  m476: {
    name: "Rage Powder",
    type: pokemonTypes.BUG,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user scatters a cloud of irritating powder to draw attention to itself and raise its defenses. Enemies can only attack the user for a turn.",
  },
  m479: {
    name: "Smack Down",
    type: pokemonTypes.ROCK,
    power: 60,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user throws a stone or projectile to the target, dealing damage and knocking the target to the ground. Able to hit flying targets.",
  },
  m482: {
    name: "Sludge Wave",
    type: pokemonTypes.POISON,
    power: 80,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user strikes everything around it by swamping the area with a giant sludge wave. This only deals damage to the target row, but has a 50% of poisoning all targets.",
  },
  m483: {
    name: "Quiver Dance",
    type: pokemonTypes.BUG,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user lightly performs a beautiful, mystic dance. This boosts the user's Special Attack, Special Defense, and Speed stats for 4 turns. Boost the user's combat readiness by 50%.",
  },
  m484: {
    name: "Heavy Slam",
    type: pokemonTypes.STEEL,
    power: null,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slams into the target with its heavy body. Power increases in proportion to how slow the user is and user max HP.",
  },
  m492: {
    name: "Foul Play",
    type: pokemonTypes.DARK,
    power: 95,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks the target using the target's own power. Calculates damage using the target's attack stat.",
  },
  m503: {
    name: "Scald",
    type: pokemonTypes.WATER,
    power: 100,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user shoots boiling hot water at its target. This may also leave the target with a burn with a 75% chance.",
  },
  m505: {
    name: "Heal Pulse",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user emits a healing pulse which restores the target's HP by 50%.",
  },
  m506: {
    name: "Hex",
    type: pokemonTypes.GHOST,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user places a curse on the target. If the target is debuffed or has a status condition, this move's base power is increased by 25.",
  },
  m521: {
    name: "Volt Switch",
    type: pokemonTypes.ELECTRIC,
    power: 80,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "After dealing damage, the user switches, increasing the combat readiness of a random ally to 100%.",
  },
  m523: {
    name: "Bulldoze",
    type: pokemonTypes.GROUND,
    power: 25,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user stomps down on the ground and attacks everything in the area. This lowers the Speed of all targets for 1 turn.",
  },
  m525: {
    name: "Dragon Tail",
    type: pokemonTypes.DRAGON,
    power: 75,
    accuracy: 90,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is knocked away, reducing its combat readiness by 50%.",
  },
  m526: {
    name: "Work Up",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user is roused, raising its Attack and Special Attack for 3 turns.",
  },
  m527: {
    name: "Electroweb",
    type: pokemonTypes.ELECTRIC,
    power: 50,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user captures and attacks everything in the area with electricity. This lowers the Speed of targets for 2 turns.",
  },
  m528: {
    name: "Wild Charge",
    type: pokemonTypes.ELECTRIC,
    power: 100,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user shrouds itself in electricity and smashes into the target, increasing base power by 20% of user's speed. This also damages the user by 25% of damage dealt.",
  },
  m529: {
    name: "Drill Run",
    type: pokemonTypes.GROUND,
    power: 100,
    accuracy: 95,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user crashes into its target while rotating its body like a drill.",
  },
  m534: {
    name: "Razor Shell",
    type: pokemonTypes.WATER,
    power: 90,
    accuracy: 95,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user cuts its target with sharp shells. This move has additional power proportional to the user's defense, and may also lower the target's Defense stat for 2 turns with a 50% chance.",
  },
  m540: {
    name: "Psystrike",
    type: pokemonTypes.PSYCHIC,
    power: 90,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user creates a powerful blast of psychic energy, dealing damage to the target and 50% damage to surrounding Pokemon. Uses the target's Defense stat.",
  },
  "m540-1": {
    name: "Divine Departure",
    type: pokemonTypes.PSYCHIC,
    power: 85,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user slashes through the target at a blinding speed, dealing damage to the target and 50% damage to other Pokemon, increasing its combat readiness by 30% for each Pokemon defated. Uses the target's Defense stat.",
  },
  m542: {
    name: "Hurricane",
    type: pokemonTypes.FLYING,
    power: 65,
    accuracy: 70,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks by wrapping opponents in a fierce wind that flies up into the sky. This also has a 30% chance to leave targets confused for 2 turns.",
  },
  "m542-1": {
    name: "Shadow Storm",
    type: pokemonTypes.GHOST,
    power: 40,
    accuracy: 80,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks by wrapping opponents in fierce winds of corruption. If hit, always super effective. This also has a 30% chance to flinch targets.",
  },
  m564: {
    name: "Sticky Web",
    type: pokemonTypes.BUG,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user weaves a sticky net around the opposing team, which lowers their Speed stat and restricts them for 2 turns.",
  },
  m565: {
    name: "Fell Stinger",
    type: pokemonTypes.BUG,
    power: 110,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks the target with full force, sharply raising attack for 3 turns. If the target is knocked out, gain another turn.",
  },
  m568: {
    name: "Noble Roar",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 75,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user roars loudly to intimidate the target, which lowers their attack and special attack for 1 turn. Ignores miss on the primary target.",
  },
  m573: {
    name: "Freeze-Dry",
    type: pokemonTypes.ICE,
    power: 85,
    accuracy: 85,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user rapidly cools the target with a 30% chance to freeze. Against water types, is super effective, ignores miss, with 100% chance to freeze.",
  },
  m572: {
    name: "Petal Blizzard",
    type: pokemonTypes.GRASS,
    power: 85,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user stirs up a violent petal blizzard and attacks everything around it. Has 5 less base power for each additional target hit.",
  },
  m574: {
    name: "Disarming Voice",
    type: pokemonTypes.FAIRY,
    power: 50,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks the target with a soothing voice, dealing damage with no chance to miss.",
  },
  m583: {
    name: "Play Rough",
    type: pokemonTypes.FAIRY,
    power: 95,
    accuracy: 90,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user plays rough with the target and attacks it. This may also lower the target's attack and speed for 2 turns with a 70% chance.",
  },
  m585: {
    name: "Moonblast",
    type: pokemonTypes.FAIRY,
    power: 80,
    accuracy: 70,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks the target with a moonblast. This also sharply lowers targets' special attack for 2 turns.",
  },
  m586: {
    name: "Boomburst",
    type: pokemonTypes.NORMAL,
    power: 120,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks everything around it with the destructive power of a terrible, explosive sound. This user also sacrifices 50% of its remaining HP.",
  },
  m605: {
    name: "Dazzling Gleam",
    type: pokemonTypes.FAIRY,
    power: 75,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description: "The user damages the targets by emitting a powerful flash.",
  },
  m618: {
    name: "Origin Pulse",
    type: pokemonTypes.WATER,
    power: 45,
    accuracy: 85,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user summons a huge wave that crashes down on the opposing team. Increases the user's Special Attack and Special Defense for 1 turn BEFORE dealing damage.",
  },
  m619: {
    name: "Precipice Blades",
    type: pokemonTypes.GROUND,
    power: 50,
    accuracy: 85,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks opposing Pokémon by manifesting the power of the land in fearsome blades of stone. Increases the user's Attack and Defense for 1 turn BEFORE dealing damage.",
  },
  m620: {
    name: "Dragon Ascent",
    type: pokemonTypes.FLYING,
    power: 75,
    accuracy: 100,
    cooldown: 6,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user soars upward with powerful wings and charges at the target at a steep angle. This calculates damage based off the lower of the targets' defense or special defense. Grants the user another turn but lowers its defenses for 2 turns.",
  },
  "m620-1": {
    name: "Bolo Breath",
    type: pokemonTypes.DRAGON,
    power: 90,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user launches a blast of fire from its mouth. This calculates damage based off the lower of the targets' defense or special defense. Then, heals the user 5% of its max HP for each target hit.",
  },
  m668: {
    name: "Strength Sap",
    type: pokemonTypes.GRASS,
    power: null,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user restores its HP by the same amount as the target's Attack stat. This also sharply lowers the target's Attack stat for 2 turns.",
  },
  m672: {
    name: "Toxic Thread",
    type: pokemonTypes.POISON,
    power: null,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user shoots poisonous threads to badly poison targets and lower their combat readiness by 100%.",
  },
  m710: {
    name: "Liquidation",
    type: pokemonTypes.WATER,
    power: 90,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slams into the target using a full-force blast of water. This may also lower the target's defense stat for 3 turns with a 85% chance.",
  },
  m719: {
    name: "10,000,000 Volt Thunderbolt",
    type: pokemonTypes.ELECTRIC,
    power: 99,
    accuracy: 99,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user unleashes a powerful beam of electricity. This ONLY deals damage to the primary target and 2 additional random enemies, but has a 20% chance to paralyze all targets.",
  },
  m742: {
    name: "Double Iron Bash",
    type: pokemonTypes.STEEL,
    power: 60,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user rotates, centering the hex nut in its chest, and then strikes with its arms twice in a row. This move hits twice; once in a row and once in a column, each with a 30% chance to flinch.",
  },
  m814: {
    name: "Dual Wingbeat",
    type: pokemonTypes.FLYING,
    power: 55,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slams targets with its wings. The primary target is hit twice in a row.",
  },
  m876: {
    name: "Pound",
    type: pokemonTypes.NORMAL,
    power: 55,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description: "The user pounds the target with its forelegs or tail.",
  },
  m20001: {
    name: "Democracy",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user votes for the primary target, causing it to gain 100% combat readiness and increased speed for 2 turns. All other enemies lose 30% combat readiness and have decreased speed for 1 turn. Ignores miss on the primary target.",
  },
  m20002: {
    name: "HM Master",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user sharply raises its attacking stats for 1 turn. The user then uses all available HM moves against the target. If the HM move is on cooldown, reset the cooldown instead of using the move.",
  },
  m20003: {
    name: "Rocket Thievery",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: null,
    cooldown: 7,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user attempts to steal a random fainted enemy Pokemon, reviving it with 50% HP. Fails if the enemy has no fainted Pokemon, or if the user's party has no empty positions.",
  },
  m20004: {
    name: "Time Dilation",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user distorts time, increasing ally speed for 2 turns and decreasing enemy speed for 2 turns. The user gains another turn.",
  },
  m20005: {
    name: "Stoke the Fire!",
    type: pokemonTypes.FIRE,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user re-empowers its flames, healing itself for 40% HP and gaining another turn.",
  },
  m20006: {
    name: "Destructor Beam",
    type: pokemonTypes.DARK,
    power: 50,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user fires a beam of dark energy at the target, dealing damage and dispelling all buffs.",
  },
  m20007: {
    name: "Scammed!",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user makes an unfair deal with the enemy team, increasing enemies' combat readiness by 10%, in exchange for increasing all ally combat readiness by 30%.",
  },
  m20008: {
    name: "All-In",
    type: pokemonTypes.GHOST,
    power: null,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user goes all-in, sacrificing all its wealth, sharply reducing its defenses for 1 turn and reducing its health by 50%. In exchange, increases the duration of all ally buffs by 1 turn.",
  },
  m20009: {
    name: "King of Hell",
    type: pokemonTypes.DARK,
    power: 44,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user lets its swords draw from its own power, then slices three times at the target. Successful hits deal an additional 10% of the target's max HP true damage. If the primary target is defeated, targets random enemies without missing.",
  },
  m20010: {
    name: "Gear Fifth",
    type: pokemonTypes.FAIRY,
    power: null,
    accuracy: null,
    cooldown: 7,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "If under 25% HP, the user activates Gear Fifth, transforming into Sun God Infernape for 3 turns, then gives itself another turn and 50% HP. FAILS if the user is not under 25% HP.",
  },
  m20011: {
    name: "Dawn Rocket",
    type: pokemonTypes.FAIRY,
    power: 100,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user bends the environment to propel itself through the opponent. Uses the minimum of the user and opponent's Special Defense to calculate damage.",
  },
  m20012: {
    name: "Monkey God Gun",
    type: pokemonTypes.FIGHTING,
    power: 80,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user inflates its fist to the size of an island, then crashes it down on the enemy team.",
  },
  m20013: {
    name: "ZA WATER!!!",
    type: pokemonTypes.WATER,
    power: null,
    accuracy: null,
    cooldown: 6,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user activates its Stand, ZA WATER!!!, forcing time to stop for all other Pokemon. This provides the user a buff granting it 2 extra turns.",
  },
});

/**
 * @callback LegacyMoveExecute
 * @param {Battle} battle
 * @param {BattlePokemon} source
 * @param {BattlePokemon} primaryTarget
 * @param {BattlePokemon[]} allTargets
 * @param {BattlePokemon[]} missedTargets
 * @returns {void}
 */
/**
 * @type {Record<LegacyMoveIdEnum, LegacyMoveExecute>}
 */
const moveExecutes = {
  m6(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m6";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        missedTargets.includes(target)
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // reduce random non-self party pokemon cooldowns by 1
    const party = battle.parties[source.teamName];
    const pokemons = source.getPatternTargets(
      party,
      targetPatterns.ALL_EXCEPT_SELF,
      source.position
    );
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
  "m6-1": function (battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m6-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
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
  "m7-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m7-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // if not miss, attempt to remove defUp, greaterDefUp, spdUp, greaterSpdUp
      if (!miss) {
        const buffsToRemove = [
          "defUp",
          "greaterDefUp",
          "spdUp",
          "greaterSpdUp",
        ];
        for (const buffId of buffsToRemove) {
          target.dispellEffect(buffId);
        }
      }
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, burn
      if (!miss) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m10(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m10";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        missedTargets.includes(target)
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m14(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply greater atk up for 3 turns
      target.applyEffect("greaterAtkUp", 5, source);
      // gain 60% cr
      source.boostCombatReadiness(source, 60);
    }
  },
  m16(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m16";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // if sprungUp, have 2x power
      const sprungUp = target.effectIds.sprungUp !== undefined;
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: moveData.power * (sprungUp ? 2 : 1),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m17(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m17";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        missedTargets.includes(target)
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m21(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m21";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m23(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m23";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, flinch with 30% chance
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m30(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m30";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m33(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m33";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m34(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m34";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% chance to paralyze
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  "m34-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m34-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% chance to paralyze
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  m35(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m35";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, apply 1/8 hp DoT for 2 turns
      if (!miss) {
        target.applyEffect("dot", 2, source, {
          damage: Math.max(Math.floor(target.maxHp / 8), 1),
        });
      }
    }
  },
  m36(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m36";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
    // recoil damage to self
    battle.addToLog(`${source.name} is affected by recoil!`);
    const damageToDeal = Math.max(Math.floor(damageDealt / 4), 1);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  m38(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m38";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        missedTargets.includes(target)
      );
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
    // recoil damage to self
    battle.addToLog(`${source.name} is affected by recoil!`);
    const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  m40(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m40";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit 75% chance to poison
      if (!miss && Math.random() < 0.75) {
        target.applyStatus(statusConditions.POISON, source);
      }
    }
  },
  m43(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (!miss) {
        // def down 4 turns
        target.applyEffect("defDown", 4, source);
      }
    }
  },
  m46(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // remove all buffs
      for (const effectId of Object.keys(target.effectIds)) {
        const effectData = getEffect(effectId);
        if (effectData.type === effectTypes.BUFF) {
          target.dispellEffect(effectId);
        }
      }
      // decrease combat readiness fully
      target.reduceCombatReadiness(source, 100);
    }
  },
  m47(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (!miss) {
        target.applyStatus(statusConditions.SLEEP, source);
      }
    }
  },
  m50(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (!miss) {
        target.applyEffect("disable", 1, source);
      }
    }
  },
  m51(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m51";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 20% chance spd down 2 turn
      if (!miss && Math.random() < 0.2) {
        target.applyEffect("spdDown", 2, source);
      }
    }
  },
  m52(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m52";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 20% chance to burn
      if (!miss && Math.random() < 0.2) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m53(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m53";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 20% chance to burn
      if (!miss && Math.random() < 0.2) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m55(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m55";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m56(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m56";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, reduce cr by 15%
      if (!miss) {
        target.reduceCombatReadiness(source, 15);
      }
    }
  },
  "m56-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m56-1";
    const moveData = getMove(moveId);
    const multiplier = allTargets.length === 1 ? 1.5 : 1;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(Math.floor(damageToDeal * multiplier), target, {
        type: "move",
        moveId,
      });

      // if not miss, reduce cr by 15%
      if (!miss) {
        target.reduceCombatReadiness(source, Math.floor(15 * multiplier));
      }
    }
  },
  "m56-2": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m56-2";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // reduce atk and spa for 1 turn
      target.applyEffect("atkDown", 1, source);
      target.applyEffect("spaDown", 1, source);
    }
  },
  m57(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m57";
    const moveData = getMove(moveId);
    // deal less damage if more targets
    const numTargets = allTargets.length;
    const power = moveData.power - (numTargets - 1) * 5;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m58(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m58";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, freeze target with 25% chance
      if (!miss && Math.random() < 0.25) {
        target.applyStatus(statusConditions.FREEZE, source);
      }
    }
  },
  m59(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m59";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, freeze target with 30% chance
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.FREEZE, source);
      }
    }
  },
  m60(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m60";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 50% chance to confuse for 2 turn
      if (!miss && Math.random() < 0.5) {
        target.applyEffect("confused", 2, source);
      }
    }
  },
  m63(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m63";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      // deal 50% to non primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );
    }
    // apply recharge to self
    source.applyEffect("recharge", 1, source);
  },
  m64(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m64";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m65(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m65";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m68(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply counter 2 turn
      target.applyEffect("counter", 2, source);
    }
  },
  m70(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m70";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // 5% of atk true damage
      const damageToDeal =
        calculateDamage(moveData, source, target, miss) +
        Math.floor(source.getStat("atk") * 0.07);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m71(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m71";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // heal half damage dealt
    source.giveHeal(Math.floor(damageDealt / 2), source, {
      type: "move",
      moveId,
    });
  },
  m73(battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      // check if target is grass type
      if (
        target.type1 === pokemonTypes.GRASS ||
        target.type2 === pokemonTypes.GRASS
      ) {
        battle.addToLog(
          `${target.name}'s Grass type renders it immune to Leech Seed!`
        );
        continue;
      }

      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      // apply leech seed 5 turns
      target.applyEffect("leechSeed", 5, source);
    }
  },
  m76(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m76";
    const moveData = getMove(moveId);
    // if pokemon doesnt have "abosrb light" buff, apply it
    if (
      source.effectIds.absorbLight === undefined &&
      !battle.isWeatherNegated() &&
      battle.weather.weatherId !== weatherConditions.SUN
    ) {
      source.applyEffect("absorbLight", 1, source);
      // remove solar beam cd
      source.moveIds[moveId].cooldown = 0;
    } else {
      // if pokemon has "absorb light" buff, remove it and deal damage
      source.removeEffect("absorbLight");
      for (const target of allTargets) {
        const miss = missedTargets.includes(target);
        const mult =
          battle.weather.weatherId !== weatherConditions.SUN &&
          battle.weather.weatherId !== null &&
          !battle.isWeatherNegated()
            ? 0.5
            : 1;
        const damageToDeal = calculateDamage(moveData, source, target, miss, {
          power: Math.floor(moveData.power * mult),
        });
        source.dealDamage(damageToDeal, target, {
          type: "move",
          moveId,
        });
      }
    }
  },
  m77(battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      // check if target is grass type
      if (
        target.type1 === pokemonTypes.GRASS ||
        target.type2 === pokemonTypes.GRASS
      ) {
        battle.addToLog(
          `${target.name}'s Grass type renders it immune to spore moves!`
        );
        continue;
      }

      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      target.applyStatus(statusConditions.POISON, source);
    }
  },
  m79(battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      // check if target is grass type
      if (
        target.type1 === pokemonTypes.GRASS ||
        target.type2 === pokemonTypes.GRASS
      ) {
        battle.addToLog(
          `${target.name}'s Grass type renders it immune to spore moves!`
        );
        continue;
      }

      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      target.applyStatus(statusConditions.SLEEP, source);
    }
  },
  m81(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      // sharply lower speed for 1 turn
      target.applyEffect("greaterSpeDown", 1, source);
      // lower cr by 30%
      target.reduceCombatReadiness(source, 30);
    }
  },
  m84(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m84";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 10% chance to paralyze
      if (!miss && Math.random() < 0.1) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  m85(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m85";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 25% chance to paralyze
      if (!miss && Math.random() < 0.25) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  m86(_battle, source, primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      // special condition: user is electric and opponent isn't ground
      const specialCondition =
        target === primaryTarget &&
        (source.type1 === pokemonTypes.ELECTRIC ||
          source.type2 === pokemonTypes.ELECTRIC) &&
        target.type1 !== pokemonTypes.GROUND &&
        target.type2 !== pokemonTypes.GROUND;

      const miss = missedTargets.includes(target);
      if (miss && !specialCondition) {
        continue;
      }

      target.applyStatus(statusConditions.PARALYSIS, source);
    }
  },
  m87(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m87";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // if sprungUp, have 2x power
      const sprungUp = target.effectIds.sprungUp !== undefined;
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: moveData.power * (sprungUp ? 2 : 1),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% chance to paralyze
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  "m87-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m87-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // if sprungUp, have 2x power
      const sprungUp = target.effectIds.sprungUp !== undefined;
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: moveData.power * (sprungUp ? 2 : 1),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // add spe down to user 1 turn
    source.applyEffect("speDown", 1, source);
  },
  m88(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m88";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m89(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m89";
    const moveData = getMove(moveId);
    // deal less damage if more targets
    const numTargets = allTargets.length;
    const power = moveData.power - (numTargets - 1) * 7;
    for (const target of allTargets) {
      const dig = target.effectIds.burrowed !== undefined;
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        dig ? false : miss,
        {
          power: power * (dig ? 2 : 1),
        }
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },

  m91(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m91";
    const moveData = getMove(moveId);
    // if pokemon doesnt have "burrowed" buff, apply it
    if (source.effectIds.burrowed === undefined) {
      source.applyEffect("burrowed", 1, source);
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
          moveId,
        });
      }
    }
  },
  m92(_battle, source, primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      // if not miss or user poison, apply badly poisoned
      const miss = missedTargets.includes(target);
      // primary target, user is poison, target is not steel
      const specialCondition =
        target === primaryTarget &&
        (source.type1 === pokemonTypes.POISON ||
          source.type2 === pokemonTypes.POISON) &&
        target.type1 !== pokemonTypes.STEEL &&
        target.type2 !== pokemonTypes.STEEL;
      if (!miss || specialCondition) {
        target.applyStatus(statusConditions.BADLY_POISON, source);
      }
    }
  },
  m97(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply greaterSpeUp buff
      target.applyEffect("greaterSpeUp", 5, source);
      // boost combat readiness by 80
      target.boostCombatReadiness(source, 80);
    }
  },
  "m97-1": function (_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply atkUp, speUp buff
      target.applyEffect("atkUp", 4, source, undefined);
      target.applyEffect("speUp", 4, source, undefined);

      // boost combat readiness by 60
      target.boostCombatReadiness(source, 80);
    }
    // if user not fire, change second type to fire
    if (
      source.type1 !== pokemonTypes.FIRE &&
      source.type2 !== pokemonTypes.FIRE
    ) {
      source.type2 = pokemonTypes.FIRE;
    }
  },
  m98(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveData = getMove("m98");
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId: "m98",
      });
    }

    // boost cr by 30
    source.boostCombatReadiness(source, 30);
  },
  m100(battle, source) {
    // boost highest cr non-self party pokemon cr to 100
    const party = battle.parties[source.teamName];
    const pokemons = source.getPatternTargets(
      party,
      targetPatterns.ALL_EXCEPT_SELF,
      source.position
    );
    if (pokemons.length > 0) {
      const pokemon = pokemons.reduce((a, b) =>
        a.combatReadiness > b.combatReadiness ? a : b
      );
      pokemon.boostCombatReadiness(source, 100);
    }
  },
  m101(_battle, source, _primaryTarget, allTargets) {
    const moveId = "m101";
    for (const target of allTargets) {
      const damageToDeal = Math.floor(source.level * 1.5);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m102(battle, source, _primaryTarget, allTargets) {
    const moveId = "m102";
    // get mimic index
    const mimicIndex = Math.max(Object.keys(source.moveIds).indexOf(moveId), 0);
    const oldMoveId = Object.keys(source.moveIds)[mimicIndex];
    for (const target of allTargets) {
      // attempt to get targets ultimate move
      const ultimateMoveIds = Object.keys(target.moveIds).filter(
        (moveId) => getMove(moveId).tier === moveTiers.ULTIMATE
      );
      if (ultimateMoveIds.length === 0) {
        battle.addToLog(`But if failed!`);
        return;
      }
      const ultimateMoveId = ultimateMoveIds[0];

      // replace move with ultimate move
      source.applyEffect("mimic", 3, source, {
        moveId: ultimateMoveId,
        oldMoveId,
      });

      // boost cr 50%
      source.boostCombatReadiness(source, 50);
    }
  },
  m103(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (!miss) {
        // greater def down for 3 turns
        target.applyEffect("greaterDefDown", 3, source);
      }
    }
  },
  m105(_battle, source, _primaryTarget, allTargets) {
    const moveId = "m105";
    for (const target of allTargets) {
      // heal 50%
      const healAmount = Math.floor(target.maxHp * 0.5);
      source.giveHeal(healAmount, target, {
        type: "move",
        moveId,
      });
    }
  },
  m106(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // def up for 2 turns
      target.applyEffect("defUp", 2, source);
      // gain 15% def as shield
      target.applyEffect("shield", 2, source, {
        shield: Math.floor(target.getStat("def") * 0.15),
      });
    }
  },
  m108(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // if not miss, greater acc down 3 turns
      if (!miss) {
        target.applyEffect("greaterAccDown", 3, source);
      }
    }
  },
  "m108-1": function (_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // greater eva up 3 turns
      target.applyEffect("greaterEvaUp", 3, source);
    }
  },
  m110(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // def up for 2 turns
      target.applyEffect("defUp", 2, source);
      // gain 15% def as shield
      target.applyEffect("shield", 2, source, {
        shield: Math.floor(target.getStat("def") * 0.15),
      });
    }
  },
  m111(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // def up for 4 turns
      target.applyEffect("defUp", 4, source);
      // rollout 4 turns
      target.applyEffect("rollout", 4, source);
      // gain 10% def as shield
      target.applyEffect("shield", 2, source, {
        shield: Math.floor(target.getStat("def") * 0.1),
      });
    }
  },
  m113(battle, source, primaryTarget, allTargets) {
    // get target row
    const allyParty = battle.parties[source.teamName];
    const targetRow = source.getPatternTargets(
      allyParty,
      targetPatterns.ROW,
      primaryTarget.position
    );
    for (const target of allTargets) {
      if (targetRow.includes(target)) {
        // greater spd up for 3 turns
        target.applyEffect("greaterSpdUp", 3, source);
      } else {
        // spd up for 3 turns
        target.applyEffect("spdUp", 3, source);
      }
    }
  },
  m115(battle, source, primaryTarget, allTargets) {
    // get target row
    const allyParty = battle.parties[source.teamName];
    const targetRow = source.getPatternTargets(
      allyParty,
      targetPatterns.ROW,
      primaryTarget.position
    );
    for (const target of allTargets) {
      if (targetRow.includes(target)) {
        // greater def up for 3 turns
        target.applyEffect("greaterDefUp", 3, source);
      } else {
        // def up for 3 turns
        target.applyEffect("defUp", 3, source);
      }
    }
  },
  m116(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // greater atk up for 1 turn
      target.applyEffect("greaterAtkUp", 1, source);

      // boost 60% cr
      target.boostCombatReadiness(source, 60);
    }
  },
  m118(battle, source) {
    // get random basic moves
    const basicMoves = getMoveIds({
      fieldFilter: { tier: moveTiers.BASIC },
    });
    const randomMoveId =
      basicMoves[Math.floor(Math.random() * basicMoves.length)];
    const randomMoveData = getMove(randomMoveId);
    battle.addToLog(`${source.name} used ${randomMoveData.name}!`);

    // get eligible targets
    const eligibleTargets = battle.getEligibleTargets(source, randomMoveId);
    if (eligibleTargets.length === 0) {
      battle.addToLog(`${randomMoveData.name} has no eligible targets!`);
      return;
    }

    // get random target & use move
    const randomTarget =
      eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
    source.executeMove({
      moveId: randomMoveId,
      primaryTarget: randomTarget,
      allTargets: [randomTarget],
      missedTargets: [],
    });
  },
  m122(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m122";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% chance to paralyze
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  m123(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m123";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit 50% chance to poison
      if (!miss && Math.random() < 0.5) {
        target.applyStatus(statusConditions.POISON, source);
      }
    }
  },
  m126(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m126";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 30% chance to burn
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m127(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m127";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 20% + sourceatk/enemyatk chance to flinch
      const flinchChance =
        source.getStat("atk") > target.getStat("atk")
          ? 0.2 + (source.getStat("atk") / target.getStat("atk") - 1)
          : 0.2;
      if (!miss && Math.random() < flinchChance) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m134(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m134";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, apply accDown
      if (!miss) {
        target.applyEffect("accDown", 1, source);
      }
    }
  },
  m135(_battle, source, _primaryTarget, allTargets) {
    const moveId = "m135";
    // sac 10% hp
    const damageToDeal = Math.floor(source.hp * 0.1);
    source.dealDamage(damageToDeal, source, {
      type: "sacrifice",
    });
    for (const target of allTargets) {
      // heal 50% of source max hp
      const healAmount = Math.floor(source.maxHp * 0.5);
      source.giveHeal(healAmount, target, {
        type: "move",
        moveId,
      });

      // if target hp is max, reduce cd by 1
      if (target.hp === target.maxHp) {
        source.reduceMoveCooldown(moveId, 1, source);
      }
    }
  },
  m136(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m136";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      const damageDealt = source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if miss, take 50% damage recoil
      if (miss) {
        const recoilDamage = Math.floor(damageDealt * 0.5);
        source.dealDamage(recoilDamage, source, {
          type: "recoil",
        });
      }
    }
  },
  m137(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      target.applyStatus(statusConditions.PARALYSIS, source);
    }

    // give user 80% cr
    source.boostCombatReadiness(source, 80);
  },
  "m137-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      target.applyStatus(statusConditions.PARALYSIS, source);
    }
  },
  m143(battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m143";
    const moveData = getMove(moveId);
    let defeatedEnemy = false;
    // two turn move logic
    if (source.effectIds.skyCharge === undefined) {
      source.applyEffect("skyCharge", 1, source);
      // remove sky attack cd
      source.moveIds[moveId].cooldown = 0;
    } else {
      source.removeEffect("skyCharge");
      for (const target of allTargets) {
        const miss = missedTargets.includes(target);
        const damageToDeal = calculateDamage(moveData, source, target, miss);
        source.dealDamage(damageToDeal, target, {
          type: "move",
          moveId,
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
    const surroundingTargets = source.getPatternTargets(
      targetParty,
      targetPatterns.ALL,
      primaryTarget.position
    );
    for (const target of surroundingTargets) {
      // flinch chance = (30 + source speed/10)
      const flinchChance = Math.min(
        0.3 + source.getStat("spe") / 10 / 100,
        0.75
      );
      if (Math.random() < flinchChance) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m147(battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      // check if target is grass type
      if (
        target.type1 === pokemonTypes.GRASS ||
        target.type2 === pokemonTypes.GRASS
      ) {
        battle.addToLog(
          `${target.name}'s Grass type renders it immune to spore moves!`
        );
        continue;
      }

      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      target.applyStatus(statusConditions.SLEEP, source);
    }
  },
  m150(battle, source, _primaryTarget, allTargets) {
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
  m152(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m152";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // 5% of atk true damage
      const damageToDeal =
        calculateDamage(moveData, source, target, miss) +
        (miss ? 0 : Math.floor(source.getStat("atk") * 0.05));
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m153(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m153";
    const moveData = getMove(moveId);
    // power = base power + percent hp * 100
    const power = moveData.power + (source.hp / source.maxHp) * 100;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // also deal 1/3rd damage to surrounding allies
    const allyParty = battle.parties[source.teamName];
    const allyTargets = source.getPatternTargets(
      allyParty,
      targetPatterns.SQUARE,
      source.position
    );
    for (const target of allyTargets) {
      if (target !== source) {
        const damageToDeal = Math.floor(
          calculateDamage(moveData, source, target, false, {
            power,
          }) * 0.33
        );
        source.dealDamage(Math.max(damageToDeal, 1), target, {
          type: "move",
          moveId,
        });
      }
    }

    // append ally targets to all targets
    allTargets.push(...allyTargets);

    // cause self to faint
    source.takeFaint(source);
  },
  "m154-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m154-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, lower def 1 turn
      if (!miss) {
        target.applyEffect("defDown", 1, source);
      }
    }

    for (const target of allTargets) {
      if (target.isFainted) {
        continue;
      }
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal * 2, target, {
        type: "move",
        moveId,
      });
    }
  },
  m156(battle, source, _primaryTarget, allTargets) {
    const moveId = "m156";
    const moveData = getMove(moveId);

    // if source asleep or max HP, fail
    if (
      source.status.statusId === statusConditions.SLEEP ||
      source.hp === source.maxHp
    ) {
      battle.addToLog(
        `${source.name} tried to use ${moveData.name}, but it failed!`
      );
      return;
    }

    for (const target of allTargets) {
      // remove all debuffs
      for (const effectId of Object.keys(target.effectIds)) {
        const effectData = getEffect(effectId);
        if (effectData.type === effectTypes.DEBUFF) {
          target.removeEffect(effectId);
        }
      }
      // remove status
      target.removeStatus();
      // fully heal
      source.giveHeal(source.maxHp, source, {
        type: "move",
        moveId,
      });

      // apply sleep for longer
      target.applyStatus(statusConditions.SLEEP, source, { startingTurns: -1 });
    }
  },
  m157(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m157";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 70% chance to flinch for 1 turn
      if (!miss && Math.random() < 0.7) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m162(_battle, source, _primaryTarget, allTargets) {
    const moveId = "m162";
    for (const target of allTargets) {
      // deal half targets health as damage
      const damageToDeal = Math.floor(target.hp * 0.5);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m167(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m167";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      let damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
      damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
      damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m168(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m168";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, attempt to steal all buffs
      if (!miss) {
        const possibleBuffs = Object.keys(target.effectIds).filter(
          (effectId) => {
            const effectData = getEffect(effectId);
            return (
              effectData.type === effectTypes.BUFF && effectData.dispellable
            );
          }
        );
        if (possibleBuffs.length === 0) {
          return;
        }

        for (const buffIdToSteal of possibleBuffs) {
          const buffToSteal = target.effectIds[buffIdToSteal];
          // steal buff
          const dispelled = target.dispellEffect(buffIdToSteal);
          if (!dispelled) {
            continue;
          }
          // apply buff to self
          source.applyEffect(
            buffIdToSteal,
            buffToSteal.duration,
            buffToSteal.source,
            buffToSteal.initialArgs
          );
        }
      }
    }
  },
  m175(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m175";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // calculate power (lower hp = higher power)
      const n = Math.floor((source.hp / source.maxHp) * 100);
      let power = 0;
      if (n >= 67) {
        power = 50;
      } else if (n >= 50) {
        power = 60;
      } else if (n >= 33) {
        power = 70;
      } else if (n >= 10) {
        power = 90;
      } else {
        power = 120;
      }
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m177(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m177";
    const moveData = getMove(moveId);
    // filter out allTargets => just the primary target and up to 2 random other targets
    let damagedTargets = [];
    if (allTargets.length > 3) {
      const newTargets = [primaryTarget];
      const otherTargets = allTargets.filter((t) => t !== primaryTarget);
      for (let i = 0; i < 2; i += 1) {
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
      let damageToDeal = 0;
      if (damagedTargets.includes(target)) {
        damageToDeal += calculateDamage(moveData, source, target, miss);
      }
      if (!miss) {
        // true damage based on 1/10 self hp
        damageToDeal += Math.floor(source.hp * 0.1);
      }

      if (damageToDeal > 0) {
        source.dealDamage(damageToDeal, target, {
          type: "move",
          moveId,
        });
      }
    }
  },
  "m177-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m177-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      let type = source.getTypeDamageMultiplier(moveData.type, target);
      // if not miss, make at least super effective
      if (!miss) {
        type = Math.max(type, 2);
      }
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        type,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m182(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply move invulnerable
      target.applyEffect("moveInvulnerable", 1, source);
      target.applyEffect("statusImmunity", 1, source);
      target.applyEffect(effectIdEnum.DEBUFF_IMMUNITY, 1, source);
    }
  },
  "m182-1": function (_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply super stretchy
      target.applyEffect("superStretchy", 1, source);
    }
  },
  m183(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m183";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost self cr by 30
    source.boostCombatReadiness(source, 30);
  },
  "m183-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m183-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost self cr by 40
    source.boostCombatReadiness(source, 40);
  },
  m186(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (!miss) {
        // apply confused for 3 turns
        target.applyEffect("confused", 3, source);
      }
    }
  },
  m187(battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      const halfHp = Math.floor(target.maxHp * 0.5);
      if (target.hp <= halfHp) {
        battle.addToLog("But it failed!");
        return;
      }

      target.dealDamage(halfHp, target, {
        type: "bellyDrum",
      });
      target.multiplyStatMult("atk", 2);
      battle.addToLog(`${target.name} doubled its attack!`);

      // give 100 cr
      target.boostCombatReadiness(source, 100);
    }
  },
  m188(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m188";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not missed, 30% chance to poison
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.POISON, source);
      }
    }
  },
  m189(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m189";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not missed, acc down
      if (!miss) {
        target.applyEffect("accDown", 1, source);
      }
    }
  },
  m191(battle, source, primaryTarget, allTargets, missedTargets) {
    // spikes log
    battle.addToLog(
      `Spikes were scattered around ${primaryTarget.name}'s surroundings!`
    );
    for (const target of allTargets) {
      // if not miss, apply spikes 5 turns
      if (!missedTargets.includes(target)) {
        target.applyEffect("spikes", 5, source);
      }
    }
  },
  m192(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m192";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not missed, paralyze
      if (!miss) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  m194(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply destiny bond 1 turn to user
      source.applyEffect("destinyBond", 1, source, {
        boundPokemon: target,
      });
    }
  },
  m195(battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      // if not miss, apply perish song 3 turns
      if (!missedTargets.includes(target)) {
        target.applyEffect("perishSong", 3, source);
      }
    }

    // apply perish song to surrounding allies for 3 turns
    const allyParty = battle.parties[source.teamName];
    const allyTargets = source.getPatternTargets(
      allyParty,
      targetPatterns.SQUARE,
      source.position
    );
    for (const target of allyTargets) {
      target.applyEffect("perishSong", 3, source);
    }

    // append ally targets to all targets
    allTargets.push(...allyTargets);
  },
  m199(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply redirect and greaterEvaDown 1 turn
      target.applyEffect("redirect", 1, source);
      target.applyEffect("greaterEvaDown", 1, source);
    }
  },
  m200(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m200";
    const moveData = getMove(moveId);
    // if source doesn't have outrage, apply it
    if (source.effectIds.outrage === undefined) {
      source.applyEffect("outrage", 2, source);
    }

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // if outrage duration > 1, reset cooldown
    if (source.effectIds.outrage.duration > 1) {
      source.moveIds[moveId].cooldown = 0;
    } else {
      // remove outrage
      source.removeEffect("outrage");
      // confuse self
      source.applyEffect("confused", 2, source);
    }
  },
  m202(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m202";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // heal half damage dealt
    source.giveHeal(Math.floor(damageDealt / 2), source, {
      type: "move",
      moveId,
    });
  },
  m203(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply 1 turn immortality
      target.applyEffect("immortal", 1, source);
    }
  },
  m204(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (!miss) {
        // greater atk down for 3 turns
        target.applyEffect("greaterAtkDown", 3, source);
      }
    }
  },
  m205(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m205";
    const moveData = getMove(moveId);
    let targetHit = false;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const hasRollout = source.effectIds.rollout !== undefined;
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: moveData.power * (hasRollout ? 2 : 1),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      if (!miss) {
        targetHit = true;
      }
    }

    if (targetHit) {
      // add rollout for 1 turn
      source.applyEffect("rollout", 1, source);
    }
  },
  m208(_battle, source, _primaryTarget, allTargets) {
    const moveId = "m208";
    for (const target of allTargets) {
      let effects = 0;
      // remove all debuffs
      for (const effectId of Object.keys(target.effectIds)) {
        const effectData = getEffect(effectId);
        if (effectData.type === effectTypes.DEBUFF) {
          if (target.dispellEffect(effectId)) {
            effects += 1;
          }
        }
      }
      // remove status
      if (target.removeStatus()) {
        effects += 1;
      }
      // heal
      source.giveHeal(
        Math.floor(source.maxHp * (0.4 + 0.1 * effects)),
        source,
        {
          type: "move",
          moveId,
        }
      );
    }
  },
  "m208-1": function (_battle, source, _primaryTarget, allTargets) {
    const moveId = "m208-1";
    for (const target of allTargets) {
      // give all stats up 1 turn
      target.applyEffect("atkUp", 1, source);
      target.applyEffect("defUp", 1, source);
      target.applyEffect("spaUp", 1, source);
      target.applyEffect("spdUp", 1, source);
      target.applyEffect("speUp", 1, source);

      // heal
      source.giveHeal(Math.floor(source.maxHp * 0.25), source, {
        type: "move",
        moveId,
      });
    }
  },
  m210(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m210";
    const moveData = getMove(moveId);
    let targetHit = false;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const hasFuryCutter = source.effectIds.furyCutter !== undefined;
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: moveData.power * (hasFuryCutter ? 2 : 1),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      if (!miss) {
        targetHit = true;
      }
    }

    if (targetHit) {
      // add fury cutter for 1 turn
      source.applyEffect("furyCutter", 1, source);
    }
  },
  m212(_battle, source, _primaryTarget, allTargets, missedTargets) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);

      // if not miss, cr down 50% and restrict 2 turns
      if (!miss) {
        target.reduceCombatReadiness(source, 50);
        target.applyEffect("restricted", 2, source);
      }
    }
  },
  "m212-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);

      // if not miss, greater spe down 2 turns
      if (!miss) {
        target.applyEffect("greaterSpeDown", 2, source);
      }
    }
  },
  m214(battle, source) {
    const moveId = "m214";
    // if not asleep, fail
    if (source.status.statusId !== statusConditions.SLEEP) {
      battle.addToLog(`${source.name} is not asleep!`);
      return;
    }

    // choose random non-sleep talk move
    const sleepTalkMoves = Object.keys(source.moveIds).filter(
      (mId) => mId !== moveId
    );
    // if no moves, return
    if (sleepTalkMoves.length === 0) {
      battle.addToLog(`${source.name} has no moves to use!`);
      return;
    }
    const randomMoveId =
      sleepTalkMoves[Math.floor(Math.random() * sleepTalkMoves.length)];
    const randomMoveData = getMove(randomMoveId);
    battle.addToLog(`${source.name} used ${randomMoveData.name}!`);

    // get valid targets
    const validTargets = battle.getEligibleTargets(source, randomMoveId);
    // if no valid targets, return
    if (validTargets.length === 0) {
      battle.addToLog(`${randomMoveData.name} has no valid targets!`);
      return;
    }

    // choose random target (exception: self moves must target self)
    const randomTarget =
      randomMoveData.targetPosition === targetPositions.SELF
        ? source
        : validTargets[Math.floor(Math.random() * validTargets.length)];
    const targetParty = battle.parties[randomTarget.teamName];
    const targets = source.getPatternTargets(
      targetParty,
      randomMoveData.targetPattern,
      randomTarget.position,
      randomMoveId
    );
    // use move against target
    battle.addToLog(`${randomMoveData.name} hit ${randomTarget.name}!`);
    source.executeMove({
      moveId: randomMoveId,
      primaryTarget: randomTarget,
      allTargets: targets,
      missedTargets: [],
    });

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
  m215(_battle, source, _primaryTarget, allTargets) {
    const moveId = "m215";
    for (const target of allTargets) {
      // remove status conditions
      const statusRemoved = target.removeStatus();

      // heal 10% max HP, boosted to 20% if condition removed
      const healAmount = Math.floor(target.maxHp * (statusRemoved ? 0.2 : 0.1));
      source.giveHeal(healAmount, target, {
        type: "move",
        moveId,
      });
    }
  },
  m216(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m216";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // 20 less bp if source is damaged
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: moveData.power - (source.hp < source.maxHp ? 20 : 0),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m219(_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // apply status immunity for 3 turns
      target.applyEffect("statusImmunity", 3, source);
    }
  },
  m221(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m221";
    const moveData = getMove(moveId);
    // filter out allTargets => just the primary target and up to 2 random other targets
    let damagedTargets = [];
    if (allTargets.length > 3) {
      const newTargets = [primaryTarget];
      const otherTargets = allTargets.filter((t) => t !== primaryTarget);
      for (let i = 0; i < 2; i += 1) {
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
          moveId,
        });
      }

      // if not miss, 50% chance to burn
      if (!miss && Math.random() < 0.5) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m223(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m223";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, confuse for 2 turns
      if (!miss) {
        const enemyParty = source.getEnemyParty();
        const enemyTargets = source.getPatternTargets(
          enemyParty,
          targetPatterns.SQUARE,
          target.position,
          moveId
        );
        for (const enemyTarget of enemyTargets) {
          enemyTarget.applyEffect("confused", 2, source);
        }
      }
    }
  },
  m224(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m224";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m226(_battle, source, _primaryTarget, allTargets) {
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
        target.applyEffect(
          effectId,
          effect.duration,
          effect.source,
          effect.initialArgs
        );
      }
    }
  },
  "m226-1": function (_battle, source, _primaryTarget, allTargets) {
    for (const target of allTargets) {
      // boost cr to 100
      target.boostCombatReadiness(source, 100);

      // give greater atkup, defup 2 turns
      target.applyEffect("greaterAtkUp", 2, source);
      target.applyEffect("greaterDefUp", 2, source);
    }
  },
  m229(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m229";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // for all adjacent allies and self, dispell all debuffs
    const allyParty = battle.parties[source.teamName];
    const allyTargets = source.getPatternTargets(
      allyParty,
      targetPatterns.SQUARE,
      source.position
    );
    for (const ally of allyTargets) {
      for (const effectId of Object.keys(ally.effectIds)) {
        const effectData = getEffect(effectId);
        if (effectData.type !== effectTypes.DEBUFF) {
          continue;
        }

        ally.dispellEffect(effectId);
      }
    }

    // append ally targets to all targets
    allTargets.push(...allyTargets);
  },
  m231(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m231";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // check if user def is higher, if so apply effects before damage
      const beforeDamage = source.getStat("def") > target.getStat("def");
      if (!miss && beforeDamage) {
        // apply def down 2 turns
        target.applyEffect("defDown", 2, source);
      }
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      if (!miss && !beforeDamage) {
        // apply def down 2 turns
        target.applyEffect("defDown", 2, source);
      }
    }
  },
  m235(battle, source, _primaryTarget, allTargets) {
    const moveId = "m235";
    for (const target of allTargets) {
      let fraction = 0.33;
      if (!battle.isWeatherNegated()) {
        // fraction based on weather
        if (battle.weather.weatherId === null) {
          fraction = 0.33;
        } else if (battle.weather.weatherId === weatherConditions.SUN) {
          fraction = 0.33;

          // gain 3 turns spa, spd up
          target.applyEffect("spaUp", 3, source);
          target.applyEffect("spdUp", 3, source);
        } else {
          fraction = 0.25;
        }
      }
      source.giveHeal(Math.floor(target.maxHp * fraction), target, {
        type: "move",
        moveId,
      });

      // gain 50% cr
      target.boostCombatReadiness(source, 50);
    }
  },
  m236(battle, source, _primaryTarget, allTargets) {
    const moveId = "m236";
    for (const target of allTargets) {
      let fraction = 0.5;
      if (!battle.isWeatherNegated()) {
        // fraction based on weather
        if (battle.weather.weatherId === null) {
          fraction = 0.5;
        } else if (battle.weather.weatherId === weatherConditions.SUN) {
          fraction = 0.67;
        } else {
          fraction = 0.33;
        }
      }
      source.giveHeal(Math.floor(target.maxHp * fraction), target, {
        type: "move",
        moveId,
      });
    }
  },
  m238(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m238";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      // deal half damage if target is not primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );
    }
  },
  m239(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m239";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not missed, 30% chance to flinch
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m240(battle, source) {
    // rain weather
    battle.createWeather(weatherConditions.RAIN, source);
    // gain 50 combat readiness
    source.boostCombatReadiness(source, 50);
  },
  m241(battle, source) {
    // sun weather
    battle.createWeather(weatherConditions.SUN, source);
    // gain 50 combat readiness
    source.boostCombatReadiness(source, 50);
  },
  m242(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m242";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 85% chance to reduce def
      if (!miss && Math.random() < 0.85) {
        target.applyEffect("defDown", 3, source);
      }
    }
  },
  m243(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m243";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply mirror coat 2 turn
      target.applyEffect("mirrorCoat", 2, source);
    }
  },
  m245(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m245";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // raise own cr by 80%
    source.boostCombatReadiness(source, 80);
  },
  m246(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m246";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // 50% chance to boost highest stat
    if (Math.random() > 0.5) {
      return;
    }

    // get highest non-hp base stat
    const statValues = [
      source.batk,
      source.bdef,
      source.bspa,
      source.bspd,
      source.bspe,
    ];
    // argmax
    const highestStatIndex = statValues.reduce(
      (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
      0
    );
    switch (highestStatIndex + 1) {
      case 1:
        source.applyEffect("atkUp", 1, source);
        break;
      case 2:
        source.applyEffect("defUp", 1, source);
        break;
      case 3:
        source.applyEffect("spaUp", 1, source);
        break;
      case 4:
        source.applyEffect("spdUp", 1, source);
        break;
      case 5:
        source.applyEffect("speUp", 1, source);
        break;
      default:
        break;
    }
  },
  m247(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m247";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 85% chance to reduce sp def
      if (!miss && Math.random() < 0.85) {
        target.applyEffect("spdDown", 3, source);
      }
    }
  },
  m248(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m248";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      // apply 2 turns future sight
      target.applyEffect("futureSight", 2, source);
    }
  },
  m249(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m249";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, def down 2 turns 70% chance
      if (!miss && Math.random() < 0.7) {
        target.applyEffect("defDown", 2, source);
      }
    }
  },
  m252(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m252";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, flinch for 1 turn
      if (!miss) {
        target.applyEffect("flinched", 1, source);
      }
    }

    // boost source cr by 60
    source.boostCombatReadiness(source, 60);
  },
  m257(battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m257";
    const moveData = getMove(moveId);

    // get only target row
    const targetParty = battle.parties[primaryTarget.teamName];
    const damageTargets = source.getPatternTargets(
      targetParty,
      targetPatterns.ROW,
      primaryTarget.position
    );

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // only deal damage if target is primary target row
      if (damageTargets.includes(target)) {
        const damageToDeal = calculateDamage(moveData, source, target, miss);
        source.dealDamage(damageToDeal, target, {
          type: "move",
          moveId,
        });
      }

      // if not miss, 30% chance to burn
      if (!miss && Math.random() < 0.3) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m258(battle, source, _primaryTarget, _allTargets, _missedTargets) {
    const moveId = "m258";
    const moveData = getMove(moveId);

    // hail weather
    battle.createWeather(weatherConditions.HAIL, source);
    // gain 50 combat readiness
    source.boostCombatReadiness(source, 50);
  },
  m266(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m266";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply redirect for 1 turn
      target.applyEffect("redirect", 1, source);
      // apple def and spd up for 1 turn
      target.applyEffect("defUp", 1, source);
      target.applyEffect("spdUp", 1, source);
    }
  },
  m262(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m262";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (!miss) {
        // give 3 turns greater atk, spa down
        target.applyEffect("greaterAtkDown", 3, source);
        target.applyEffect("greaterSpaDown", 3, source);
      }
    }
    // cause self to faint
    source.takeFaint(source);
  },
  m268(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m268";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply charge for 2 turn
      target.applyEffect("charge", 2, source);
      // apply spd up for 2 turn
      target.applyEffect("spdUp", 2, source);
    }
  },
  m269(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m269";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      // add taunt for 3 turns
      target.applyEffect("taunt", 3, source);
    }
  },
  "m269-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m269-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      if (miss) {
        continue;
      }

      // add reverse taunt for 2 turns
      target.applyEffect("reverseTaunt", 2, source);
    }
  },
  m270(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m270";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply atk up and spa up 1 turn
      target.applyEffect("atkUp", 1, source);
      target.applyEffect("spaUp", 1, source);
      // boost 25 cr
      target.boostCombatReadiness(source, 25);
    }
  },
  m273(battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m273";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // give delayed heal
      battle.addToLog(`${target.name} recieved ${source.name}'s wish!`);
      target.applyEffect("delayedHeal", 1, source, {
        healAmount: Math.floor(source.maxHp * 0.5),
      });
    }
  },
  m276(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m276";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
    // reduce source atk and def
    source.applyEffect("atkDown", 1, source);
    source.applyEffect("defDown", 1, source);
  },
  m281(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m281";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // if not miss  apply yawn debuff
      const miss = missedTargets.includes(target);
      if (!miss) {
        // if source is sleep, apply sleep
        if (source.status.statusId === statusConditions.SLEEP) {
          target.applyStatus(statusConditions.SLEEP, source);
        } else {
          target.applyEffect("yawn", 1, source);
        }
      }
    }
  },
  m282(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m282";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);

      let buffsRemoved = 0;
      // if not miss, remove all buffs
      if (!miss) {
        for (const effectId of Object.keys(target.effectIds)) {
          const effectData = getEffect(effectId);
          if (effectData.type !== effectTypes.BUFF) {
            continue;
          }

          if (target.dispellEffect(effectId)) {
            buffsRemoved += 1;
          }
        }
      }

      // damage bonus = 0.25 * buffs up to 0.75
      const damageBonus = Math.min(0.75, 0.25 * buffsRemoved);
      const damageToDeal = Math.floor(
        calculateDamage(moveData, source, target, miss) * (1 + damageBonus)
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m283(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m283";
    const moveData = getMove(moveId);
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
        moveId,
      });
    }
  },
  m284(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m284";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // power = power * proportion source HP
      const power = Math.floor(moveData.power * (source.hp / source.maxHp));
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m288(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m288";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply grudge for 1 turn
      target.applyEffect("grudge", 1, source);
    }
  },
  m295(battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m295";
    const moveData = getMove(moveId);

    // check if ally has mist ball on cooldown
    const allyPokemons = Object.values(battle.allPokemon).filter(
      (pokemon) => pokemon.teamName === source.teamName
    );
    let mistBallCooldown = false;
    for (const allyPokemon of allyPokemons) {
      const mistBall = allyPokemon.moveIds.m296;
      if (mistBall && mistBall.cooldown > 0) {
        mistBallCooldown = true;
        break;
      }
    }

    // if mistBall, set allTargets to all enemies
    if (mistBallCooldown) {
      const enemyParty = source.getEnemyParty();
      allTargets = source.getPatternTargets(
        enemyParty,
        targetPatterns.ALL,
        primaryTarget.position,
        moveId
      );
    }

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        !mistBallCooldown && miss
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss or mist ball, spd down
      if (!miss || mistBallCooldown) {
        target.applyEffect("spdDown", 2, source);
      }
    }
  },
  m296(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m296";
    const moveData = getMove(moveId);

    // check if ally has luster purge on cooldown
    const allyPokemons = Object.values(battle.allPokemon).filter(
      (pokemon) => pokemon.teamName === source.teamName
    );
    let lusterPurgeCooldown = false;
    for (const allyPokemon of allyPokemons) {
      const lusterPurge = allyPokemon.moveIds.m295;
      if (lusterPurge && lusterPurge.cooldown > 0) {
        lusterPurgeCooldown = true;
        break;
      }
    }

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        !lusterPurgeCooldown && miss
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      if (lusterPurgeCooldown) {
        target.applyEffect("atkDown", 2, source);
        target.applyEffect("spaDown", 2, source);
      } else if (!miss) {
        target.applyEffect("spaDown", 1, source);
      }
    }
  },
  m299(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m299";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, apply burn
      if (!miss) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m303(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m303";
    const moveData = getMove(moveId);
    for (const _target of allTargets) {
      // heal 50%
      const healAmount = Math.floor(source.maxHp * 0.5);
      source.giveHeal(healAmount, source, {
        type: "move",
        moveId,
      });

      // apply def up 3 turns
      source.applyEffect("defUp", 3, source);
    }
  },
  m304(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m304";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      let damageToDeal = calculateDamage(moveData, source, target, miss);
      // if not miss, deal 5% true damage user spa + hp
      if (!miss) {
        damageToDeal += Math.floor((source.getStat("spa") + source.hp) * 0.05);
      }
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m305(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m305";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, badly poison 75% chance
      if (!miss && Math.random() < 0.75) {
        target.applyStatus(statusConditions.BADLY_POISON, source);
      }
    }
  },
  m309(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m309";
    const moveData = getMove(moveId);

    // raise user atk for 2 turn
    source.applyEffect("atkUp", 2, source);

    let fainted = false;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
      if (target.isFainted) {
        fainted = true;
      }
    }

    if (!fainted) {
      // remove attack up
      source.dispellEffect("atkUp");
    }
  },
  m311(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m311";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      let { type } = moveData;
      if (!battle.isWeatherNegated()) {
        if (battle.weather.weatherId === weatherConditions.SUN) {
          type = pokemonTypes.FIRE;
        } else if (battle.weather.weatherId === weatherConditions.RAIN) {
          type = pokemonTypes.WATER;
        } else if (battle.weather.weatherId === weatherConditions.SANDSTORM) {
          type = pokemonTypes.ROCK;
        } else if (battle.weather.weatherId === weatherConditions.HAIL) {
          type = pokemonTypes.ICE;
        }
      }
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        moveType: type,
        power:
          moveData.power *
          (battle.weather.weatherId !== null && !battle.isWeatherNegated()
            ? 2
            : 1),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m316(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m316";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // remove status conditions
      target.removeStatus();
      // remove debuffs
      for (const effectId of Object.keys(target.effectIds)) {
        const effectData = getEffect(effectId);
        if (effectData.type !== effectTypes.DEBUFF) {
          continue;
        }

        target.dispellEffect(effectId);
      }

      // heal 25% max hp
      const healAmount = Math.floor(target.maxHp * 0.25);
      source.giveHeal(healAmount, target, {
        type: "move",
        moveId,
      });
    }
  },
  m317(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m317";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, spe down for 3 turns
      if (!miss) {
        target.applyEffect("speDown", 3, source);
      }
    }
  },
  "m317-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m317-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // spe down 2 turns
      target.applyEffect("speDown", 2, source);
    }
  },
  m322(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveData = getMove("m322");
    for (const target of allTargets) {
      // raise def, spd
      target.applyEffect("defUp", 3, source);
      target.applyEffect("spdUp", 3, source);
      // get 10% defenses as shield
      target.applyEffect("shield", 3, source, {
        shield: Math.floor(
          target.getStat("def") * 0.1 + target.getStat("spd") * 0.1
        ),
      });
    }
  },
  m325(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m325";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // ignore miss
      const damageToDeal = calculateDamage(moveData, source, target, false);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m330(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m330";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 50% acc down 2 turns
      if (!miss && Math.random() < 0.5) {
        target.applyEffect("accDown", 2, source);
      }
    }
  },
  m331(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m331";
    const moveData = getMove(moveId);
    // loop 5 times, hitting random non-fainted target
    for (let i = 0; i < 5; i += 1) {
      allTargets = allTargets.filter((target) => !target.isFainted);
      if (allTargets.length === 0) {
        break;
      }

      const target = allTargets[Math.floor(Math.random() * allTargets.length)];
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  "m331-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m331-1";
    const moveData = getMove(moveId);
    // if pokemon doesnt have "projectingSpirit" buff, apply it
    if (source.effectIds.projectingSpirit === undefined) {
      source.applyEffect("projectingSpirit", 1, source);
      // remove cd
      source.moveIds[moveId].cooldown = 0;
    } else {
      // if pokemon has "projectingSpirit" buff, remove it and deal damage
      source.removeEffect("projectingSpirit");
      for (let i = 0; i < 9; i += 1) {
        allTargets = allTargets.filter((target) => !target.isFainted);
        if (allTargets.length === 0) {
          break;
        }

        const target =
          allTargets[Math.floor(Math.random() * allTargets.length)];
        const miss = missedTargets.includes(target);
        // if not miss, deal 5% target max hp
        const damageToDeal =
          calculateDamage(moveData, source, target, miss) +
          (miss ? 0 : Math.floor(target.maxHp * 0.05));
        source.dealDamage(damageToDeal, target, {
          type: "move",
          moveId,
        });
      }
    }
  },
  m332(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m332";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // ignore miss
      const damageToDeal = calculateDamage(moveData, source, target, false);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m334(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveData = getMove("m334");
    for (const target of allTargets) {
      // sharply raise def
      target.applyEffect("greaterDefUp", 3, source);
      // get 15% def as shield
      target.applyEffect("shield", 3, source, {
        shield: Math.floor(target.getStat("def") * 0.15),
      });
    }
  },
  "m334-1": function (
    _battle,
    source,
    primaryTarget,
    allTargets,
    _missedTargets
  ) {
    const moveData = getMove("m334-1");
    // put primary target at front of allTargets
    if (allTargets.includes(primaryTarget)) {
      allTargets = allTargets.filter((target) => target !== primaryTarget);
      allTargets.unshift(primaryTarget);
    }
    for (const target of allTargets) {
      // if primary target, greater def up, else def up
      if (target === primaryTarget) {
        target.applyEffect("greaterDefUp", 2, source);
        // get 20% def as shield
        target.applyEffect("shield", 2, source, {
          shield: Math.floor(source.getStat("def") * 0.2),
        });
      } else {
        target.applyEffect("defUp", 2, source);
        // get 5% def as shield
        target.applyEffect("shield", 2, source, {
          shield: Math.floor(source.getStat("def") * 0.05),
        });
      }
    }
  },
  "m334-2": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    _missedTargets
  ) {
    const moveData = getMove("m334-2");
    for (const target of allTargets) {
      // sharply raise def & special def
      target.applyEffect("greaterDefUp", 2, source);
      target.applyEffect("greaterSpdUp", 2, source);
      // lower spe
      target.applyEffect("speDown", 2, source);
    }
  },
  m336(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m336";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // grant atk up 1 turn
      target.applyEffect("atkUp", 1, source);

      // grant 15% CR
      target.boostCombatReadiness(source, 15);
    }
  },
  m340(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m340";
    const moveData = getMove(moveId);
    // if pokemon doesnt have "sprungUp" buff, apply it
    if (source.effectIds.sprungUp === undefined) {
      source.applyEffect("sprungUp", 1, source);
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
          moveId,
        });

        // if hit, 30% chance to paralyze
        if (!miss && Math.random() < 0.3) {
          target.applyStatus(statusConditions.PARALYSIS, source);
        }
      }
    }
  },
  m344(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m344";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 20% chance to paralyze
      if (!miss && Math.random() < 0.2) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }

    battle.addToLog(`${source.name} is affected by recoil!`);
    const damageToDeal = Math.max(Math.floor(damageDealt / 4), 1);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  m347(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m347";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // spa, spd up 3 turns
      target.applyEffect("spaUp", 3, source);
      target.applyEffect("spdUp", 3, source);

      // gain 50% cr
      target.boostCombatReadiness(source, 50);
    }
  },
  m348(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m348";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // 5% atk true damage
      const damageToDeal =
        calculateDamage(moveData, source, target, miss) +
        Math.round(source.getStat("atk") * 0.05);
      // deal half damage if target is not primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );
    }
  },
  m349(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveData = getMove("m349");
    for (const target of allTargets) {
      // raise attack and speed
      target.applyEffect("atkUp", 3, source);
      target.applyEffect("speUp", 3, source);

      // gain 50% cr
      target.boostCombatReadiness(source, 50);
    }
  },
  m352(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m352";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, confuse with 25% chance
      if (!miss && Math.random() < 0.25) {
        target.applyEffect("confused", 2, source);
      }
    }
  },
  m354(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m354";
    const moveData = getMove(moveId);

    const allAllies = battle.parties[source.teamName].pokemons.filter(
      (p) => p && !p.isFainted
    );
    for (const ally of allAllies) {
      // get highest non-hp base stat
      const statValues = [
        ally.batk,
        ally.bdef,
        ally.bspa,
        ally.bspd,
        ally.bspe,
      ];
      // argmax
      const highestStatIndex = statValues.reduce(
        (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
        0
      );
      switch (highestStatIndex + 1) {
        case 1:
          ally.applyEffect("greaterAtkUp", 2, source);
          break;
        case 2:
          ally.applyEffect("greaterDefUp", 2, source);
          break;
        case 3:
          ally.applyEffect("greaterSpaUp", 2, source);
          break;
        case 4:
          ally.applyEffect("greaterSpdUp", 2, source);
          break;
        case 5:
          ally.applyEffect("greaterSpeUp", 2, source);
          break;
        default:
          break;
      }
    }

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  "m354-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m354-1";
    const moveData = getMove(moveId);
    const useAtk = source.getStat("atk") > source.getStat("spa");
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        atkStat: useAtk ? damageTypes.PHYSICAL : damageTypes.SPECIAL,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // lower attack or special attack
    if (useAtk) {
      source.applyEffect("greaterAtkDown", 2, source);
    } else {
      source.applyEffect("greaterSpaDown", 2, source);
    }
  },
  "m354-2": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    _missedTargets
  ) {
    const moveData = getMove("m354-2");
    for (const target of allTargets) {
      // get 25% def, spd as shield
      target.applyEffect("shield", 3, source, {
        shield: Math.floor(
          source.getStat("def") * 0.25 + source.getStat("spd") * 0.25
        ),
      });
    }
  },
  "m354-3": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    _missedTargets
  ) {
    const moveId = "m354-3";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply extra turn buff for 1 (2) turn
      target.applyEffect("extraTurn", 1, source);
    }
  },
  m355(_battle, source, _primaryTarget, allTargets) {
    const moveId = "m355";
    for (const target of allTargets) {
      source.giveHeal(
        Math.min(Math.floor(target.maxHp / 2), target.maxHp - target.hp),
        target,
        {
          type: "move",
          moveId,
        }
      );

      // lose flying type
      target.applyEffect("loseFlying", 1, source);
    }
  },
  m359(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m359";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // source spe down 1 turns
    source.applyEffect("speDown", 1, source);
  },
  m361(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m361";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // fully heal
      source.giveHeal(target.maxHp, target, {
        type: "move",
        moveId,
      });
      // fully restore cr
      target.boostCombatReadiness(source, 100);
    }
    // cause self to faint
    source.takeFaint(source);
  },
  m366(battle, source, primaryTarget, allTargets, _missedTargets) {
    const moveId = "m366";
    const moveData = getMove(moveId);

    // get only target row
    const targetParty = battle.parties[primaryTarget.teamName];
    const boostTargets = source.getPatternTargets(
      targetParty,
      targetPatterns.ROW,
      primaryTarget.position
    );

    for (const target of allTargets) {
      // grant greater spe up for 2 turns
      target.applyEffect("greaterSpeUp", 2, source);

      // grant 15% CR to backmost row
      if (boostTargets.includes(target)) {
        target.boostCombatReadiness(source, 15);
      }
    }
  },
  m369(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m369";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        missedTargets.includes(target)
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost random non-self party pokemon cr to 100
    const party = battle.parties[source.teamName];
    const pokemons = source.getPatternTargets(
      party,
      targetPatterns.ALL_EXCEPT_SELF,
      source.position
    );
    if (pokemons.length > 0) {
      const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
      pokemon.boostCombatReadiness(source, 100);
    }
  },
  m370(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m370";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // lower self def, spd 1 turn
    source.applyEffect("defDown", 1, source);
    source.applyEffect("spdDown", 1, source);
  },
  "m370-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m370-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // sharply lower self def, spd 1 turn
    source.applyEffect("greaterDefDown", 1, source);
    source.applyEffect("greaterSpdDown", 1, source);
  },
  m387(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m387";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // calculate power = base power * moves on cooldown
      const numCooldownMoves = Object.values(source.moveIds).filter(
        (m) => m.cooldown > 0
      ).length;
      const power = moveData.power * numCooldownMoves;
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m392(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m392";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // add regeneration and def up
      target.applyEffect("regeneration", 3, source, {
        healAmount: Math.floor(source.maxHp * 0.18),
      });
      target.applyEffect("defUp", 2, source);
    }
  },
  m394(battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m394";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      // deal half damage if target is not primary target
      damageDealt += source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );

      // 10% chance to burn
      if (!miss && Math.random() < 0.1) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }

    // recoil damage to self
    battle.addToLog(`${source.name} is affected by recoil!`);
    const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  "m394-1": function (
    battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m394-1";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // get max of fire, dark multiplier
      const fireMultiplier = source.getTypeDamageMultiplier(
        pokemonTypes.FIRE,
        target
      );
      const darkMultiplier = source.getTypeDamageMultiplier(
        pokemonTypes.DARK,
        target
      );
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        type: Math.max(fireMultiplier, darkMultiplier),
      });
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // recoil damage to self
    battle.addToLog(`${source.name} is affected by recoil!`);
    const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  m396(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m398";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // ignore miss
      const damageToDeal = calculateDamage(moveData, source, target, false);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m398(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m398";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 80% chance to poison
      if (!miss && Math.random() < 0.8) {
        target.applyStatus(statusConditions.POISON, source);
      }
    }
  },
  m399(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m399";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 25% chance to flinch 1 turn
      if (!miss && Math.random() < 0.35) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m402(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m402";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      // deal half damage if target is not primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );
    }
  },
  m403(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m403";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 25% to flinch 1 turn
      if (!miss && Math.random() < 0.25) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m404(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m404";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
      // if primary target, hit again
      if (target === primaryTarget && !target.isFainted) {
        const secondDamageToDeal = calculateDamage(
          moveData,
          source,
          target,
          miss
        );
        source.dealDamage(secondDamageToDeal * 2, target, {
          type: "move",
          moveId,
        });
      }
    }
  },
  m405(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m405";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // if not miss, 80% to spd down
      if (!miss && Math.random() < 0.8) {
        target.applyEffect("spdDown", 2, source);
      }

      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m406(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m406";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m407(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m407";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% chance to flinch
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m409(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m409";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // heal half damage dealt
    source.giveHeal(Math.floor(damageDealt / 2), source, {
      type: "move",
      moveId,
    });
  },
  m412(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m412";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 85% chance to reduce sp def
      if (!miss && Math.random() < 0.85) {
        target.applyEffect("spdDown", 4, source);
      }
    }
  },
  m413(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m413";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // recoil damage to self
    battle.addToLog(`${source.name} is affected by recoil!`);
    const damageToDeal = Math.max(Math.floor(damageDealt / 3), 1);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  m414(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m414";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% spd down 3 turns
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("spdDown", 3, source);
      }
    }
  },
  m416(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m416";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      // deal 50% to non primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );
    }
    // apply recharge to self
    source.applyEffect("recharge", 1, source);
  },
  "m416-1": function (
    _battle,
    source,
    primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m416-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      // deal 50% to non primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );
    }
    // apply greater spe down to self
    source.applyEffect("greaterSpeDown", 1, source);
  },
  m417(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m417";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // sharply raise spatk
      target.applyEffect("greaterSpaUp", 5, source);

      // boost cr 60%
      source.boostCombatReadiness(source, 60);
    }
  },
  "m417-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    _missedTargets
  ) {
    const moveId = "m417-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // sharply raise spatk, eva
      target.applyEffect("greaterSpaUp", 2, source);
      target.applyEffect("greaterEvaUp", 2, source);

      // boost cr 60%
      source.boostCombatReadiness(source, 60);
    }
  },
  m418(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m418";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost self cr by 30
    source.boostCombatReadiness(source, 30);
  },
  m420(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m420";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost self cr by 30
    source.boostCombatReadiness(source, 30);
  },
  m424(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m424";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 25% chance to burn
      if (!miss && Math.random() < 0.25) {
        target.applyStatus(statusConditions.BURN, source);
      }
      // if not miss, 25% chance to flinch for 1 turn
      if (!miss && Math.random() < 0.25) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m425(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m425";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost self cr by 30
    source.boostCombatReadiness(source, 30);
  },
  m428(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m428";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, flinch for 1 turn
      if (!miss) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m430(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m430";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 40% to spd down
      if (!miss && Math.random() < 0.4) {
        target.applyEffect("spdDown", 2, source);
      }
    }
  },
  m432(battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m432";
    const moveData = getMove(moveId);
    const targets = Object.values(battle.allPokemon).filter((p) =>
      battle.isPokemonHittable(p, moveId)
    );
    // if no targets, return
    if (targets.length === 0) {
      return;
    }

    for (const target of targets) {
      // if ally, dispell debuffs. if enemy, dispell buffs
      if (target.teamName === source.teamName) {
        for (const effectId of Object.keys(target.effectIds)) {
          const effectData = getEffect(effectId);
          if (effectData.type === effectTypes.DEBUFF) {
            target.dispellEffect(effectId);
          }
        }
      } else {
        for (const effectId of Object.keys(target.effectIds)) {
          const effectData = getEffect(effectId);
          if (effectData.type === effectTypes.BUFF) {
            target.dispellEffect(effectId);
          }
        }
      }

      // append to allTargets if not already there
      if (!allTargets.includes(target)) {
        allTargets.push(target);
      }
    }
  },
  m433(battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m433";
    // get all non-fainted, hitable pokemon
    const targets = Object.values(battle.allPokemon).filter((p) =>
      battle.isPokemonHittable(p, moveId)
    );
    // if no targets, return
    if (targets.length === 0) {
      return;
    }

    // get mean spe of all targets
    const meanSpe =
      targets.reduce((acc, p) => acc + p.getStat("spe"), 0) / targets.length;
    // for all targets apply effect:
    // if spe > 1.25 * meanSpe, greater spe down
    // if spe > meanSpe, spe down
    // if spe < meanSpe, spe up
    // if spe < 0.75 * meanSpe, greater spe up
    for (const target of targets) {
      const spe = target.getStat("spe");
      if (spe > 1.25 * meanSpe) {
        target.applyEffect("greaterSpeDown", 3, source);
      } else if (spe > meanSpe) {
        target.applyEffect("speDown", 3, source);
      } else if (spe > meanSpe * 0.75) {
        target.applyEffect("speUp", 3, source);
      } else {
        target.applyEffect("greaterSpeUp", 3, source);
      }

      // append to allTargets if not already in
      if (!allTargets.includes(target)) {
        allTargets.push(target);
      }
    }
  },
  m435(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m435";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 35% chance to paralyze
      if (!miss && Math.random() < 0.35) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  "m435-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m435-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, transfer 1 dispellable debuff
      if (!miss) {
        const possibleDebuffs = Object.keys(source.effectIds).filter(
          (effectId) => {
            const effectData = getEffect(effectId);
            return (
              effectData.type === effectTypes.DEBUFF && effectData.dispellable
            );
          }
        );
        if (possibleDebuffs.length === 0) {
          continue;
        }

        // get random debuff
        const debuffId =
          possibleDebuffs[Math.floor(Math.random() * possibleDebuffs.length)];
        const debuff = source.effectIds[debuffId];
        // remove debuff from source
        const dispelled = source.dispellEffect(debuffId);
        if (!dispelled) {
          continue;
        }

        // apply debuff to target
        target.applyEffect(
          debuffId,
          debuff.duration,
          source,
          debuff.initialArgs
        );
      }
    }
  },
  m437(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m437";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // apply greater spa down to user 2 turns
    source.applyEffect("greaterSpaDown", 2, source);
  },
  m441(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m441";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      let damageToDeal = calculateDamage(
        moveData,
        source,
        primaryTarget,
        false
      );

      // if target poisoned, 1.5x damage
      if (
        primaryTarget.statusCondition === statusConditions.POISON ||
        primaryTarget.statusCondition === statusConditions.BADLY_POISON
      ) {
        damageToDeal = Math.round(damageToDeal * 1.5);
      }

      source.dealDamage(damageToDeal, primaryTarget, {
        type: "move",
        moveId,
      });

      // if not miss, 50% chance to poison
      if (!miss && Math.random() < 0.5) {
        primaryTarget.applyStatus(statusConditions.POISON, source);
      }
    }
  },
  m444(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m444";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m446(battle, source, primaryTarget, allTargets, _missedTargets) {
    const moveId = "m446";
    const moveData = getMove(moveId);
    // stealth rock log
    battle.addToLog(
      `Sharp rocks were scattered on the ground near ${primaryTarget.teamName}'s side!`
    );
    for (const target of allTargets) {
      // give target stealthRock
      target.applyEffect("stealthRock", 5, source);
    }
  },
  m450(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m450";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, attempt to steal a buff
      if (!miss) {
        const possibleBuffs = Object.keys(target.effectIds).filter(
          (effectId) => {
            const effectData = getEffect(effectId);
            return (
              effectData.type === effectTypes.BUFF && effectData.dispellable
            );
          }
        );
        if (possibleBuffs.length === 0) {
          return;
        }

        // get random buff
        const buffIdToSteal =
          possibleBuffs[Math.floor(Math.random() * possibleBuffs.length)];
        const buffToSteal = target.effectIds[buffIdToSteal];
        // steal buff
        const dispelled = target.dispellEffect(buffIdToSteal);
        if (!dispelled) {
          return;
        }
        // apply buff to self
        source.applyEffect(
          buffIdToSteal,
          buffToSteal.duration,
          buffToSteal.source,
          buffToSteal.initialArgs
        );
      }
    }
  },
  m453(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m453";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost cr by 30
    source.boostCombatReadiness(source, 30);
  },
  m469(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m469";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply wide guard 3 turn
      target.applyEffect("wideGuard", 3, source);
    }
  },
  m476(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m476";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply redirect for 1 turn
      target.applyEffect("redirect", 1, source);
      // def and spd up 1 turn
      target.applyEffect("defUp", 1, source);
      target.applyEffect("spdUp", 1, source);
    }
  },
  m479(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m479";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss and target has flying type, apply loseFlying to target
      if (
        !miss &&
        (target.type1 === pokemonTypes.FLYING ||
          target.type2 === pokemonTypes.FLYING)
      ) {
        target.applyEffect("loseFlying", 1, source);
      }
    }
  },
  m482(battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m482";
    const moveData = getMove(moveId);

    // get only target row
    const targetParty = battle.parties[primaryTarget.teamName];
    const damageTargets = source.getPatternTargets(
      targetParty,
      targetPatterns.ROW,
      primaryTarget.position
    );

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // only deal damage if target is primary target row
      if (damageTargets.includes(target)) {
        const damageToDeal = calculateDamage(moveData, source, target, miss);
        source.dealDamage(damageToDeal, target, {
          type: "move",
          moveId,
        });
      }

      // if not miss, 50% chance to poison
      if (!miss && Math.random() < 0.5) {
        target.applyStatus(statusConditions.POISON, source);
      }
    }
  },
  m483(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m483";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // boost spa, spd, spe
      target.applyEffect("spaUp", 4, source);
      target.applyEffect("spdUp", 4, source);
      target.applyEffect("speUp", 4, source);

      // boost cr 50%
      target.boostCombatReadiness(source, 50);
    }
  },
  m484(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m484";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      let speedPower = 0;
      if (source.getStat("spe") < 200) {
        speedPower = 45;
      } else if (source.getStat("spe") < 400) {
        speedPower = 30;
      } else if (source.getStat("spe") < 600) {
        speedPower = 20;
      } else {
        speedPower = 10;
      }
      const hpPower = Math.floor(source.maxHp / 15);
      const power = speedPower + hpPower;

      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m492(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m492";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // use target's attack
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        attack: target.getStat("atk"),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m503(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m503";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // 75% chance to burn
      if (!miss && Math.random() < 0.75) {
        target.applyStatus(statusConditions.BURN, source);
      }
    }
  },
  m505(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m505";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // heal 50%
      const healAmount = Math.floor(target.maxHp / 2);
      source.giveHeal(healAmount, target, {
        type: "move",
        moveId,
      });
    }
  },
  m506(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m506";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);

      let hasDebuff = false;
      for (const effect of Object.keys(target.effectIds)) {
        const effectData = getEffect(effect);
        if (effectData.type === effectTypes.DEBUFF) {
          hasDebuff = true;
          break;
        }
      }
      const hasStatus = target.status.statusId !== null;
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: hasDebuff || hasStatus ? moveData.power + 25 : moveData.power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m521(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m521";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        missedTargets.includes(target)
      );
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // boost random non-self party pokemon cr to 100
    const party = battle.parties[source.teamName];
    const pokemons = source.getPatternTargets(
      party,
      targetPatterns.ALL_EXCEPT_SELF,
      source.position
    );
    if (pokemons.length > 0) {
      const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
      pokemon.boostCombatReadiness(source, 100);
    }
  },
  m523(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m523";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, reduce targets speed for 1 turn
      if (!miss) {
        target.applyEffect("speDown", 1, source);
      }
    }
  },
  m525(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m525";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, reduce target's cr by 50
      if (!miss) {
        target.reduceCombatReadiness(source, 50);
      }
    }
  },
  m526(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m526";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // give atk up and spa up 3 turns
      target.applyEffect("atkUp", 3, source);
      target.applyEffect("spaUp", 3, source);
    }
  },
  m527(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m527";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, reduce targets speed for 2 turn
      if (!miss) {
        target.applyEffect("speDown", 2, source);
      }
    }
  },
  m528(battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m528";
    const moveData = getMove(moveId);
    let damageDealt = 0;
    for (const target of allTargets) {
      const damageToDeal = calculateDamage(
        moveData,
        source,
        target,
        missedTargets.includes(target),
        {
          power: Math.floor(moveData.power + source.getStat("spe") * 0.2),
        }
      );
      damageDealt += source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
    // recoil damage to self
    battle.addToLog(`${source.name} is affected by recoil!`);
    const damageToDeal = Math.max(Math.floor(damageDealt / 4), 1);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  m529(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m529";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m534(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m534";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power: Math.floor(moveData.power + source.getStat("def") * 0.1),
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 50% to def down for 2 turns
      if (!miss && Math.random() < 0.5) {
        target.applyEffect("defDown", 2, source);
      }
    }
  },
  m540(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m540";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        defStat: damageTypes.PHYSICAL,
      });
      // deal half damage if target is not primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );
    }
  },
  "m540-1": function (
    _battle,
    source,
    primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m540-1";
    const moveData = getMove(moveId);
    let targetsFainted = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        defStat: damageTypes.PHYSICAL,
      });
      // deal half damage if target is not primary target
      source.dealDamage(
        Math.round(damageToDeal * (primaryTarget !== target ? 0.5 : 1)),
        target,
        {
          type: "move",
          moveId,
        }
      );

      // if target fainted, increase targets fainted
      if (target.isFainted) {
        targetsFainted += 1;
      }
    }

    // increase cr by 30% for each target fainted
    if (targetsFainted > 0) {
      source.boostCombatReadiness(source, targetsFainted * 30);
    }
  },
  m542(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m542";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, 30% chance to confuse target
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("confused", 2, source);
      }
    }
  },
  "m542-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m542-1";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      let type = source.getTypeDamageMultiplier(moveData.type, target);
      // if not miss, make at least super effective
      if (!miss) {
        type = Math.max(type, 2);
      }
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        type,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, 30% chance to flinch
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m564(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m564";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);

      // if not miss, spe down and restrict 2 turns
      if (!miss) {
        target.applyEffect("speDown", 2, source);
        target.applyEffect("restricted", 2, source);
      }
    }
  },
  m565(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m565";
    const moveData = getMove(moveId);

    // raise atk
    source.applyEffect("greaterAtkUp", 3, source);
    let defeatedEnemy = false;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(
        moveData,
        source,
        primaryTarget,
        false
      );
      source.dealDamage(damageToDeal, primaryTarget, {
        type: "move",
        moveId,
      });

      if (target.isFainted) {
        defeatedEnemy = true;
      }
    }

    // if enemy was defeated, gain another turn
    if (defeatedEnemy) {
      source.boostCombatReadiness(source, 100);
    }
  },
  m568(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m568";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // if not miss or primary target, atk and spa down 1 turn
      if (!miss || target === primaryTarget) {
        target.applyEffect("atkDown", 1, source);
        target.applyEffect("spaDown", 1, source);
      }
    }
  },
  m573(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m573";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // see if target is water type
      const waterType =
        target.type1 === pokemonTypes.WATER ||
        target.type2 === pokemonTypes.WATER;
      const miss = !waterType && missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        type: waterType ? 2 : null,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if hit, 30% chance to freeze target (water = 100%)
      if (!miss && (waterType || Math.random() < 0.3)) {
        target.applyStatus(statusConditions.FREEZE, source);
      }
    }
  },
  m572(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m572";
    const moveData = getMove(moveId);
    // deal less damage if more targets
    const numTargets = allTargets.length;
    const power = moveData.power - (numTargets - 1) * 5;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        power,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m574(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m574";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // ignore miss
      const damageToDeal = calculateDamage(moveData, source, target, false);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m583(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m583";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 70% chance to lower atk
      if (!miss && Math.random() < 0.7) {
        target.applyEffect("atkDown", 2, source);
      }
      // if not miss, 70% chance to lower spe
      if (!miss && Math.random() < 0.7) {
        target.applyEffect("speDown", 2, source);
      }
    }
  },
  m585(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m585";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, sharply lower spatk
      if (!miss) {
        target.applyEffect("greaterSpaDown", 2, source);
      }
    }
  },
  m586(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m586";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // damage user 50% of remaining HP
    const damageToDeal = Math.floor(source.hp * 0.5);
    source.dealDamage(damageToDeal, source, {
      type: "recoil",
    });
  },
  m605(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m605";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m618(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m618";
    const moveData = getMove(moveId);

    // give user spa, spd up
    source.applyEffect("spaUp", 1, source);
    source.applyEffect("spdUp", 1, source);

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m619(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m619";
    const moveData = getMove(moveId);

    // give user atk, def up
    source.applyEffect("atkUp", 1, source);
    source.applyEffect("defUp", 1, source);

    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m620(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m620";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        defStat:
          target.getStat("def") > target.getStat("spd")
            ? damageTypes.SPECIAL
            : damageTypes.PHYSICAL,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }

    // give user 100% cr, def down spd down 2 turns
    source.boostCombatReadiness(source, 100);
    source.applyEffect("defDown", 2, source);
    source.applyEffect("spdDown", 2, source);
  },
  "m620-1": function (
    _battle,
    source,
    _primaryTarget,
    allTargets,
    missedTargets
  ) {
    const moveId = "m620-1";
    const moveData = getMove(moveId);
    let hits = 0;
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss, {
        defStat:
          target.getStat("def") > target.getStat("spd")
            ? damageTypes.SPECIAL
            : damageTypes.PHYSICAL,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      hits += miss ? 0 : 1;
    }

    // heal 5% per-hit
    if (hits > 0) {
      const healAmount = Math.floor(source.maxHp * 0.05 * hits);
      source.giveHeal(healAmount, source, {
        type: "move",
        moveId,
      });
    }
  },
  m668(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m668";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // heal hp equal to targets atk
      const healAmount = target.getStat("atk");
      source.giveHeal(healAmount, source, {
        type: "move",
        moveId,
      });

      // if not miss, apply greater atk down to target 2 turns
      if (!miss) {
        target.applyEffect("greaterAtkDown", 2, source);
      }
    }
  },
  m672(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m672";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      // if not miss, badly poison and fully reduce cr
      if (!miss) {
        target.applyStatus(statusConditions.BADLY_POISON, source);
        target.reduceCombatReadiness(source, 100);
      }
    }
  },
  m710(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m710";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 85% chance to reduce def
      if (!miss && Math.random() < 0.85) {
        target.applyEffect("defDown", 3, source);
      }
    }
  },
  m719(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m719";
    const moveData = getMove(moveId);
    // filter out allTargets => just the primary target and up to 2 random other targets
    let damagedTargets = [];
    if (allTargets.length > 3) {
      const newTargets = [primaryTarget];
      const otherTargets = allTargets.filter((t) => t !== primaryTarget);
      for (let i = 0; i < 2; i += 1) {
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
          moveId,
        });
      }

      // if not miss, 20% chance to paralysis
      if (!miss && Math.random() < 0.2) {
        target.applyStatus(statusConditions.PARALYSIS, source);
      }
    }
  },
  m742(battle, source, primaryTarget, _allTargets, missedTargets) {
    const moveId = "m742";
    const moveData = getMove(moveId);

    // get row targets
    const enemyParty = battle.parties[primaryTarget.teamName];
    const rowTargets = source.getPatternTargets(
      enemyParty,
      targetPatterns.ROW,
      primaryTarget.position,
      moveId
    );
    for (const target of rowTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% chance to flinch
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("flinched", 1, source);
      }
    }

    const columnTargets = source.getPatternTargets(
      enemyParty,
      targetPatterns.COLUMN,
      primaryTarget.position,
      moveId
    );
    for (const target of columnTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      // if not miss, 30% chance to flinch
      if (!miss && Math.random() < 0.3) {
        target.applyEffect("flinched", 1, source);
      }
    }
  },
  m814(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m814";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
      // if primary target, hit again
      if (target === primaryTarget && !target.isFainted) {
        const secondDamageToDeal = calculateDamage(
          moveData,
          source,
          target,
          miss
        );
        source.dealDamage(secondDamageToDeal, target, {
          type: "move",
          moveId,
        });
      }
    }
  },
  m876(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m876";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m20001(_battle, source, primaryTarget, allTargets, missedTargets) {
    const moveId = "m20001";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // if primary target, increase cr to 100% and give spe up 2 turns
      if (target === primaryTarget) {
        target.boostCombatReadiness(source, 100);
        target.applyEffect("speUp", 2, source);
      } else {
        // else, decrease cr by 30% and spe down 1 turn
        const miss = missedTargets.includes(target);
        if (miss) {
          continue;
        }

        target.reduceCombatReadiness(source, 30);
        target.applyEffect("speDown", 1, source);
      }
    }
  },
  m20002(battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m20002";
    const moveData = getMove(moveId);
    // sharply boost atk and spa
    source.applyEffect("greaterAtkUp", 3, source);
    source.applyEffect("greaterSpaUp", 3, source);

    for (const target of allTargets) {
      // use all HM moves
      const hmMoveIds = ["m57", "m70", "m127", "m249"];
      for (const [moveId, move] of Object.entries(source.moveIds)) {
        if (!hmMoveIds.includes(moveId)) {
          continue;
        }

        // if on cooldown, reset cooldown
        if (move.cooldown > 0) {
          source.reduceMoveCooldown(moveId, move.cooldown, source);
        } else {
          const moveData = getMove(moveId);
          // else, use move and set cooldown
          battle.addToLog(`${source.name} used ${moveData.name}!`);
          // get target
          const targetParty = battle.parties[target.teamName];
          const targets = source.getPatternTargets(
            targetParty,
            moveData.targetPattern,
            target.position,
            moveId
          );
          source.executeMove({
            moveId,
            primaryTarget: target,
            allTargets: targets,
            missedTargets: [],
          });

          // set cd
          move.cooldown = moveData.cooldown;
        }
      }
    }
  },
  m20003(battle, source, primaryTarget, _allTargets, _missedTargets) {
    const moveId = "m20003";
    const moveData = getMove(moveId);

    // get random fainted enemy of primary target
    const enemyParty = primaryTarget.getEnemyParty();
    const enemyPokemons = enemyParty.pokemons;
    const faintedPokemons = enemyPokemons.filter((p) => p && p.isFainted);
    if (faintedPokemons.length === 0) {
      battle.addToLog(`But it failed!`);
      return;
    }
    const randomIndex = Math.floor(Math.random() * faintedPokemons.length);
    const randomFaintedPokemon = faintedPokemons[randomIndex];

    // find an empty position in the party
    const allyParty = battle.parties[source.teamName];
    const emptyIndices = allyParty.pokemons
      .map((p, i) => (p ? null : i))
      .filter((i) => i !== null);
    if (emptyIndices.length === 0) {
      battle.addToLog(`But it failed!`);
      return;
    }
    const randomEmptyIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    // attempt to switch positions
    if (
      !randomFaintedPokemon.switchPositions(
        source.userId,
        randomEmptyIndex + 1,
        source
      )
    ) {
      battle.addToLog(`But it failed!`);
      return;
    }

    // revive fainted pokemon with 50% hp
    randomFaintedPokemon.beRevived(
      Math.floor(randomFaintedPokemon.maxHp / 2),
      source
    );
  },
  m20004(battle, source, _primaryTarget, _allTargets, _missedTargets) {
    const moveId = "m20004";
    const moveData = getMove(moveId);
    // get all non-fainted, hitable pokemon
    const targets = Object.values(battle.allPokemon).filter((p) =>
      battle.isPokemonHittable(p, moveId)
    );
    for (const target of targets) {
      const effectId =
        target.teamName === source.teamName ? "speUp" : "speDown";
      target.applyEffect(effectId, 2, source);
    }

    // source cr 100%
    source.boostCombatReadiness(source, 100);
  },
  m20005(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m20005";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // heal 40%
      const healAmount = Math.floor(target.maxHp * 0.4);
      source.giveHeal(healAmount, target, {
        type: "move",
        moveId,
      });

      // give 100% cr
      target.boostCombatReadiness(source, 100);
    }
  },
  m20006(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m20006";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });

      if (!miss) {
        // remove all buffs
        for (const effectId of Object.keys(target.effectIds)) {
          const effectData = getEffect(effectId);
          if (effectData.type === effectTypes.BUFF) {
            target.dispellEffect(effectId);
          }
        }
      }
    }
  },
  m20007(battle, source, _primaryTarget, _allTargets, _missedTargets) {
    const moveId = "m20007";
    const moveData = getMove(moveId);
    // get all non-fainted, hitable pokemon
    const targets = Object.values(battle.allPokemon).filter((p) =>
      battle.isPokemonHittable(p, moveId)
    );
    for (const target of targets) {
      const crBoost = target.teamName === source.teamName ? 30 : 10;
      target.boostCombatReadiness(source, crBoost);
    }
  },
  m20008(battle, source, primaryTarget, allTargets, _missedTargets) {
    const moveId = "m20008";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // if primary, reduce hp by 50% and apply greater def down, spd down 1 turns
      if (target === primaryTarget) {
        source.dealDamage(Math.floor(target.hp / 2), target, {
          type: "move",
          moveId,
        });

        target.applyEffect("greaterDefDown", 1, source);
        target.applyEffect("greaterSpdDown", 1, source);
      }

      // increase all buff durations by 1 if dispellable
      battle.addToLog(`${target.name} is invigorated!`);
      for (const effectId of Object.keys(target.effectIds)) {
        const effectData = getEffect(effectId);
        if (effectData.type === effectTypes.BUFF && effectData.dispellable) {
          target.effectIds[effectId].duration += 1;
        }
      }
    }
  },
  m20009(battle, source, primaryTarget, _allTargets, missedTargets) {
    const moveId = "m20009";
    const moveData = getMove(moveId);
    for (let i = 0; i < 3; i += 1) {
      let target = primaryTarget;
      if (primaryTarget.isFainted) {
        // get random target from enemy party
        const enemyPokemons = source
          .getEnemyParty()
          .pokemons.filter((p) => battle.isPokemonHittable(p, moveId));
        if (enemyPokemons.length === 0) {
          break;
        }
        target =
          enemyPokemons[Math.floor(Math.random() * enemyPokemons.length)];
      }

      // deal damage
      const miss = missedTargets.includes(target);
      // if not miss, deal 10% of target's max hp
      const damageToDeal =
        calculateDamage(moveData, source, target, miss) +
        (miss ? 0 : Math.floor(target.maxHp * 0.1));
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m20010(battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m20010";
    const moveData = getMove(moveId);

    // if source not under 25% hp, do nothing
    if (source.hp > source.maxHp * 0.25) {
      battle.addToLog(`But it failed! ${source.name} is not under 25% HP!`);
      return;
    }

    for (const target of allTargets) {
      // heal 50%
      const healAmount = Math.floor(target.maxHp * 0.5);
      source.giveHeal(healAmount, target, {
        type: "move",
        moveId,
      });
      // apply gear five buff for 3 turns
      target.applyEffect("gearFive", 3, source);
      // boost cr 100%
      target.boostCombatReadiness(source, 100);
    }
  },
  m20011(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m20011";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // ignore miss
      // def is min user, target spd
      const defense = Math.min(source.getStat("spd"), source.getStat("spd"));
      const damageToDeal = calculateDamage(moveData, source, target, false, {
        defense,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m20012(_battle, source, _primaryTarget, allTargets, missedTargets) {
    const moveId = "m20012";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      const miss = missedTargets.includes(target);
      const damageToDeal = calculateDamage(moveData, source, target, miss);
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId,
      });
    }
  },
  m20013(_battle, source, _primaryTarget, allTargets, _missedTargets) {
    const moveId = "m20013";
    const moveData = getMove(moveId);
    for (const target of allTargets) {
      // apply extra turn buff for 1 (2) turn
      target.applyEffect("extraTurn", 1, source);
    }
  },
};

/**
 * @callback LegacyAbilityAdd
 * @param {Battle} battle
 * @param {BattlePokemon} source
 * @param {BattlePokemon} target
 */

/**
 * @callback LegacyAbilityRemove
 * @param {Battle} battle
 * @param {BattlePokemon} source
 * @param {BattlePokemon} target
 * @param {any} properties
 */

/** @typedef {Keys<typeof abilityConfig>} LegacyAbilityIdEnum */

/**
 * @satisfies {Record<string | number | symbol, {
 *  name: string,
 *  description: string,
 *  abilityAdd: LegacyAbilityAdd,
 *  abilityRemove: LegacyAbilityRemove
 * }>}
 */
const abilityConfig = Object.freeze({
  2: {
    name: "Drizzle",
    description: "At the start of battle, stir up a rainy storm.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          if (initialArgs.pokemon.isFainted) {
            return;
          }

          initialArgs.pokemon.battle.createWeather(
            weatherConditions.RAIN,
            initialArgs.pokemon
          );
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "2" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  3: {
    name: "Speed Boost",
    description:
      "At the end of each turn, increase the user's Combat Readiness by 20%, increasing by 20% each turn, up to a maximum of 60%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { activePokemon } = initialArgs.pokemon.battle;
          if (
            initialArgs.pokemon.isFainted ||
            activePokemon !== initialArgs.pokemon
          ) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "3" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // increase cr
          abilityData.turns = abilityData.turns ? abilityData.turns + 1 : 1;
          const crBoost = Math.min(60, abilityData.turns * 20);
          initialArgs.pokemon.battle.addToLog(
            `${initialArgs.pokemon.name}'s Speed Boost increases its combat readiness!`
          );
          initialArgs.pokemon.boostCombatReadiness(
            initialArgs.pokemon,
            crBoost
          );
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );
      return {
        listenerId,
        turns: 0,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "3" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  5: {
    name: "Sturdy",
    description:
      "The first time the user takes fatal damage, the user instead survives with 1 HP and gains invulnerability to direct damage for 1 turn.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (initialArgs.pokemon !== targetPokemon) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "5" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // if fatal damage, set hp to 1
          if (args.damage > targetPokemon.hp) {
            args.damage = targetPokemon.hp - 1;
            args.maxDamage = Math.min(args.maxDamage, args.damage);
            targetPokemon.battle.addToLog(
              `${targetPokemon.name} hung on with Sturdy!`
            );
            // gain move invuln
            target.applyEffect("moveInvulnerable", 1, target, {});
            // remove event listener
            targetPokemon.battle.eventHandler.unregisterListener(
              abilityData.listenerId
            );
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "5" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  7: {
    name: "Limber",
    description: "Prevents the user from paralysis.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.statusId !== statusConditions.PARALYSIS) {
            return;
          }

          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Limber prevents it from being paralyzed!`
          );
          args.canApply = false;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_STATUS_APPLY,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "7" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  9: {
    name: "Static",
    description:
      "When the user takes damage and survives from a physical move, 50% chance to paralyze the attacker.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          // if physical, 50% chance to paralyze
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.damageType === damageTypes.PHYSICAL &&
            Math.random() < 0.5
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Static affects ${sourcePokemon.name}!`
            );
            sourcePokemon.applyStatus(
              statusConditions.PARALYSIS,
              targetPokemon
            );
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "9" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  10: {
    name: "Volt Absorb",
    description:
      "When the user takes damage from an electric move, negate the damage and heal 25% of max HP.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          // if electric, negate damage and heal 25% of max hp
          const moveData = getMove(args.damageInfo.moveId);
          if (moveData.type === pokemonTypes.ELECTRIC) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name} is healed by Volt Absorb!`
            );
            targetPokemon.giveHeal(
              Math.floor(targetPokemon.maxHp * 0.25),
              targetPokemon,
              {
                type: "waterAbsorb",
              }
            );
            args.damage = 0;
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "10" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  11: {
    name: "Water Absorb",
    description:
      "When the user takes damage from a water move, negate the damage and heal 25% of max HP.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          // if water, negate damage and heal 25% of max hp
          const moveData = getMove(args.damageInfo.moveId);
          if (moveData.type === pokemonTypes.WATER) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name} is healed by Water Absorb!`
            );
            targetPokemon.giveHeal(
              Math.floor(targetPokemon.maxHp * 0.25),
              targetPokemon,
              {
                type: "waterAbsorb",
              }
            );
            args.damage = 0;
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "11" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  13: {
    name: "Cloud Nine",
    description: "Negates all weather effects.",
    abilityAdd(battle, _source, target) {
      battle.addToLog(
        `${target.name}'s Cloud Nine ability negates all weather effects!`
      );
    },
    abilityRemove(_battle, _source, _target) {},
  },
  14: {
    name: "Compound Eyes",
    description: "Increases accuracy of moves by 50%.",
    abilityAdd(battle, _source, target) {
      battle.addToLog(
        `${target.name}'s Compound Eyes ability increases its accuracy!`
      );
      target.acc += 50;
    },
    abilityRemove(_battle, _source, target) {
      target.acc -= 50;
    },
  },
  15: {
    name: "Insomnia",
    description: "Prevents the user from sleep.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.statusId !== statusConditions.SLEEP) {
            return;
          }

          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Insomnia prevents it from falling asleep!`
          );
          args.canApply = false;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_STATUS_APPLY,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "15" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  18: {
    name: "Flash Fire",
    description:
      "When the user takes damage from a fire move, negate the damage grant Atk. Up and Spa. Up. for 2 turns.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          // if fire, negate damage and grant atk up, spa up
          const moveData = getMove(args.damageInfo.moveId);
          if (moveData.type === pokemonTypes.FIRE) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Flash Fire was activated by the Fire attack!`
            );
            targetPokemon.applyEffect("atkUp", 2, targetPokemon);
            targetPokemon.applyEffect("spaUp", 2, targetPokemon);
            args.damage = 0;
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "18" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  19: {
    name: "Shield Dust",
    description:
      "Prevents the user from being debuffed by dispellable debuffs.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const { effectId } = args;
          const effectData = getEffect(effectId);
          if (!effectData) {
            return;
          }
          if (
            !effectData.dispellable ||
            effectData.type !== effectTypes.DEBUFF
          ) {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Shield Dust blocks the debuff!`
          );
          args.canAdd = false;
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "19" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  20: {
    name: "Own Tempo",
    description: "Prevents the user from being confused.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.effectId !== "confused") {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Own Tempo prevents confusion!`
          );
          args.canAdd = false;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  22: {
    name: "Intimidate",
    description:
      "At the start of battle, lowers the attack of the enemy Pokemon with the highest attack and the enemy Pokemon with the highest speed for 2 turns.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = initialArgs.pokemon;
          const { battle } = args;
          const enemyParty = sourcePokemon.getEnemyParty();
          const enemyPokemons = enemyParty.pokemons.filter((p) =>
            battle.isPokemonHittable(p)
          );
          if (enemyPokemons.length === 0) {
            return;
          }

          // get pokemon with highest atk
          let highestAtkPokemon = enemyPokemons[0];
          let maxAtk = enemyPokemons[0].getStat("atk");
          for (const pokemon of enemyPokemons) {
            if (pokemon.getStat("atk") > maxAtk) {
              highestAtkPokemon = pokemon;
              maxAtk = pokemon.getStat("atk");
            }
          }
          battle.addToLog(
            `${sourcePokemon.name}'s Intimidate affects ${highestAtkPokemon.name}!`
          );
          highestAtkPokemon.applyEffect("atkDown", 2, sourcePokemon);

          // get pokemon with highest spe
          let highestSpePokemon = enemyPokemons[0];
          let maxSpe = enemyPokemons[0].getStat("spe");
          for (const pokemon of enemyPokemons) {
            if (pokemon.getStat("spe") > maxSpe) {
              highestSpePokemon = pokemon;
              maxSpe = pokemon.getStat("spe");
            }
          }
          if (highestAtkPokemon === highestSpePokemon) {
            return;
          }
          battle.addToLog(
            `${sourcePokemon.name}'s Intimidate affects ${highestSpePokemon.name}!`
          );
          highestSpePokemon.applyEffect("atkDown", 2, sourcePokemon);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "22" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  23: {
    name: "Shadow Tag",
    description: "At the start of battle, restrict all enemies for 1 turn.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = initialArgs.pokemon;
          const { battle } = args;
          const enemyParty = sourcePokemon.getEnemyParty();
          const enemyPokemons = enemyParty.pokemons.filter((p) =>
            battle.isPokemonHittable(p)
          );
          if (enemyPokemons.length === 0) {
            return;
          }
          battle.addToLog(
            `${sourcePokemon.name}'s Shadow Tag restricts all enemies!`
          );

          for (const pokemon of enemyPokemons) {
            pokemon.applyEffect("restricted", 1, sourcePokemon);
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "23" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  25: {
    name: "Wonder Guard",
    description:
      "The user has 75% less HP. The user takes no damage from non-supereffective moves.",
    abilityAdd(battle, source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          if (args.damageInfo.type !== "move") {
            return;
          }
          const { moveId } = args.damageInfo;
          const moveData = getMove(moveId);
          if (!moveData) {
            return;
          }

          const moveType = moveData.type;
          const damageMultiplier = sourcePokemon.getTypeDamageMultiplier(
            moveData.type,
            targetPokemon
          );
          if (damageMultiplier <= 1) {
            sourcePokemon.battle.addToLog(
              `${targetPokemon.name}'s Wonder Guard protects it from ${sourcePokemon.name}'s ${moveData.name}!`
            );
            args.damage = 0;
            args.maxDamage = 0;
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );

      source.maxHp = Math.max(1, Math.floor(source.maxHp * 0.25));
      source.hp = source.maxHp;

      return {
        listenerId,
      };
    },
    abilityRemove(battle, source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "25" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
      source.maxHp *= 4;
    },
  },
  26: {
    name: "Levitate",
    description: "The user evades Ground-type moves and effects.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const { moveType } = args;
          if (moveType !== pokemonTypes.GROUND) {
            return;
          }
          args.multiplier = 0;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.CALCULATE_TYPE_MULTIPLIER,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "26" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  27: {
    name: "Effect Spore",
    description:
      "When the user is damaged by a physical move, the Pokemon that hit the user has a 50% chance of being inflicted with Poison, Paralysis, or Sleep.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          // if physical, 50% chance to status
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.damageType === damageTypes.PHYSICAL &&
            Math.random() < 0.5
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Effect Spore affects ${sourcePokemon.name}!`
            );
            // get status randomly
            const possibleStatusConditions = [
              statusConditions.POISON,
              statusConditions.PARALYSIS,
              statusConditions.SLEEP,
            ];
            const status =
              possibleStatusConditions[
                Math.floor(Math.random() * possibleStatusConditions.length)
              ];
            sourcePokemon.applyStatus(status, targetPokemon);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "27" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  28: {
    name: "Synchronize",
    // TODO: this functionality is different from the game, may need to nerf
    description:
      "When the user is inflicted with a status condition, the Pokemon that inflicted the status condition is also inflicted with the same status condition.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          if (targetPokemon === sourcePokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Synchronize affects ${sourcePokemon.name}!`
          );
          sourcePokemon.applyStatus(args.statusId, targetPokemon);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_STATUS_APPLY,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "28" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  29: {
    name: "Clear Body",
    description: "The user cannot receive dispellable debuffs.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          const { effectId } = /** @type { {effectId: EffectIdEnum} } */ (args);
          const effectData = getEffect(effectId);
          if (
            !effectData ||
            effectData.type !== effectTypes.DEBUFF ||
            effectData.dispellable
          ) {
            return;
          }

          args.canAdd = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Clear Body prevents ${effectData.name}!`
          );
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "29" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  30: {
    name: "Natural Cure",
    description:
      "After the user targets an ally with a move, heal their status conditions. If the move is ULTIMATE, also dispell their debuffs.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
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

            target.battle.addToLog(
              `${sourcePokemon.name}'s Natural Cure remedies ${target.name}!`
            );
            target.removeStatus();
            const moveData = getMove(args.moveId);
            if (moveData && moveData.tier === moveTiers.ULTIMATE) {
              for (const effectId in target.effectIds) {
                const effectData = getEffect(effectId);
                if (effectData.type === effectTypes.DEBUFF) {
                  target.dispellEffect(effectId);
                }
              }
            }
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_MOVE,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "30" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  31: {
    name: "Lightning Rod",
    description:
      "When the user is targeted by an Electric-type move, the move is redirected to the user. This also boosts user's special attack for 2 turns if dealt damage.",
    abilityAdd(battle, _source, target) {
      // redirect listener
      const listener1 = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // if redirect user isnt targetable, ignore
          if (!args.user.battle.isPokemonTargetable(initialArgs.pokemon)) {
            return;
          }

          // check that enemy used non-ally move, and that move is electric
          const moveUser = args.user;
          const moveData = getMove(args.moveId);
          if (moveData.type !== pokemonTypes.ELECTRIC) {
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
        },
      };
      // raise special attack on take damage from electric type move
      const listener2 = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const moveData = getMove(args.damageInfo.moveId);
          if (moveData.type !== pokemonTypes.ELECTRIC) {
            return;
          }

          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Lightning Rod was activated by the Electric attack!`
          );
          targetPokemon.applyEffect("spaUp", 2, targetPokemon);
        },
      };
      const listenerId1 = battle.eventHandler.registerListener(
        battleEventEnum.GET_ELIGIBLE_TARGETS,
        listener1
      );
      const listenerId2 = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener2
      );
      return {
        listenerId1,
        listenerId2,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "31" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId1);
      battle.eventHandler.unregisterListener(abilityData.listenerId2);
    },
  },
  33: {
    name: "Swift Swim",
    description:
      "Increases user's speed by 1/3 of its level. Increases speed by 50% (multiplicative with initial buff) in rain.",
    abilityAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Swift Swim increases its speed!`);
      target.addFlatStatBoost("spe", Math.floor(target.level * 0.333));
    },
    abilityRemove(_battle, _source, target) {
      target.addFlatStatBoost("spe", -Math.floor(target.level * 0.333));
    },
  },
  34: {
    name: "Chlorophyll",
    description:
      "Increases user's speed by 1/3 of its level. Increases speed by 50% (multiplicative with initial buff) in harsh sunlight.",
    abilityAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Chlorophyll increases its speed!`);
      target.addFlatStatBoost("spe", Math.floor(target.level * 0.333));
    },
    abilityRemove(_battle, _source, target) {
      target.addFlatStatBoost("spe", -Math.floor(target.level * 0.333));
    },
  },
  35: {
    name: "Illuminate",
    description:
      "At the start of battle, reduce the evasion of the enemy front row for 4 turns.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = initialArgs.pokemon;
          const { battle } = args;
          const teamNames = Object.keys(battle.teams);
          // get enemy pokemons
          const enemyTeamName =
            teamNames[0] === sourcePokemon.teamName
              ? teamNames[1]
              : teamNames[0];
          const enemyPokemons = sourcePokemon.getPatternTargets(
            sourcePokemon.battle.parties[enemyTeamName],
            targetPatterns.ROW,
            1
          );
          for (const pokemon of enemyPokemons) {
            battle.addToLog(
              `${sourcePokemon.name}'s Illuminate affects ${pokemon.name}!`
            );
            pokemon.applyEffect("evaDown", 4, sourcePokemon);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "35" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  37: {
    name: "Huge Power",
    description: "Doubles user's attack (x).",
    abilityAdd(battle, _source, target) {
      battle.addToLog(`${target.name}'s Huge Power increases its attack!`);
      target.multiplyStatMult("atk", 2);
    },
    abilityRemove(_battle, _source, target) {
      target.multiplyStatMult("atk", 0.5);
    },
  },
  38: {
    name: "Poison Point",
    description:
      "When the user is damaged by a physical move, the move user has a 50% chance to be poisoned.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          // if physical, 50% chance to poison
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.damageType === damageTypes.PHYSICAL &&
            Math.random() < 0.5
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Poison Point affects ${sourcePokemon.name}!`
            );
            sourcePokemon.applyStatus(statusConditions.POISON, targetPokemon);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "38" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  39: {
    name: "Inner Focus",
    description: "Prevents the user from flinching.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.effectId !== "flinched") {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Inner Focus prevents flinching!`
          );
          args.canAdd = false;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "39" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  45: {
    name: "Sand Stream",
    description: "At the start of battle, kick up a Sandstorm.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          if (initialArgs.pokemon.isFainted) {
            return;
          }

          initialArgs.pokemon.battle.createWeather(
            weatherConditions.SANDSTORM,
            initialArgs.pokemon
          );
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "45" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  46: {
    name: "Pressure",
    description:
      "When the user takes or deals damage, put a random available move for the target on cooldown for 2 turns, if it can have a cooldown. Can only be triggered once per-target.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
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
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "46" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // if target already affected or fainted, return
          if (
            targetPokemon.isFainted ||
            abilityData.affectedPokemons.includes(targetPokemon)
          ) {
            return;
          }

          // find all target moves that can have cooldown and increase cooldown of a random available one by 2
          const targetMoveIds = targetPokemon.moveIds;
          const possibleMoves = Object.entries(targetMoveIds).filter(
            ([moveId, move]) => {
              const moveData = getMove(moveId);
              const currentCooldown = move.cooldown;
              return moveData.cooldown && currentCooldown === 0;
            }
          );
          if (possibleMoves.length === 0) {
            return;
          }
          const randomMove =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          randomMove[1].cooldown = 2;
          targetPokemon.battle.addToLog(
            `${initialArgs.pokemon.name} is exerting Pressure against ${
              targetPokemon.name
            }'s ${getMove(randomMove[0]).name}!`
          );
          abilityData.affectedPokemons.push(targetPokemon);
        },
      };

      // add listener to after damage dealt and after damage taken
      const dealtListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_DEALT,
        listener
      );
      const takenListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );

      return {
        dealtListenerId,
        takenListenerId,
        affectedPokemons: [target],
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "46" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.dealtListenerId);
      battle.eventHandler.unregisterListener(abilityData.takenListenerId);
    },
  },
  "46-1": {
    name: "Conqueror's Pressure",
    description:
      "When the user takes or deals damage from a move, attack the target with a physical attack with 30% the move's power, but use the targets Special Defense stat. Can only be triggered once per-target.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // check move
          if (args.damageInfo.type !== "move") {
            return;
          }
          const { moveId } = args.damageInfo;
          const moveData = getMove(moveId);
          if (!moveData) {
            return;
          }

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
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "46-1" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // if target already affected or fainted, return
          if (
            targetPokemon.isFainted ||
            abilityData.affectedPokemons.includes(targetPokemon)
          ) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${initialArgs.pokemon.name} is exerting Conqueror's Pressure against ${targetPokemon.name}!`
          );
          abilityData.affectedPokemons.push(targetPokemon);
          const power = moveData.power ? Math.floor(moveData.power * 0.3) : 15;
          const damage = calculateDamage(
            {
              power,
              damageType: damageTypes.PHYSICAL,
              type: pokemonTypes.PSYCHIC,
            },
            initialArgs.pokemon,
            targetPokemon,
            false,
            {
              defStat: damageTypes.SPECIAL,
            }
          );
          initialArgs.pokemon.dealDamage(damage, targetPokemon, {
            type: "conquerorsPressure",
          });
        },
      };

      // add listener to after damage dealt and after damage taken
      const dealtListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_DEALT,
        listener
      );
      const takenListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );

      return {
        dealtListenerId,
        takenListenerId,
        affectedPokemons: [target],
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "46-1" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.dealtListenerId);
      battle.eventHandler.unregisterListener(abilityData.takenListenerId);
    },
  },
  47: {
    name: "Thick Fat",
    description: "Reduces damage taken from fire and ice moves by 50%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          // if move type === fire or ice, reduce damage by 50%
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.type === pokemonTypes.FIRE ||
            moveData.type === pokemonTypes.ICE
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Thick Fat reduces damage taken!`
            );
            args.damage = Math.round(args.damage * 0.5);
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "47" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  50: {
    name: "Run Away",
    description:
      "The first time this Pokemon's HP is reduced below 33%, increase its combat readiness to 100%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "50" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // if hp < 33%, increase combat readiness to 100%
          if (targetPokemon.hp < targetPokemon.maxHp / 3) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Run Away increases its combat readiness!`
            );
            targetPokemon.boostCombatReadiness(targetPokemon, 100);
            // remove event listener
            targetPokemon.battle.eventHandler.unregisterListener(
              abilityData.listenerId
            );
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "50" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  52: {
    name: "Hyper Cutter",
    description:
      "Prevents the user's attack from being lowered by Atk. Down and Greater Atk. Down.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (
            args.effectId !== "atkDown" &&
            args.effectId !== "greaterAtkDown"
          ) {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Hyper Cutter prevents its attack from being lowered!`
          );
          args.canAdd = false;
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "52" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  53: {
    name: "Pickup",
    description:
      "After an other ally loses a dispellable buff, have a 30% chance to gain that buff for 1 turn.",
    abilityAdd(battle, source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (
            targetPokemon === initialArgs.pokemon ||
            targetPokemon.teamName !== initialArgs.pokemon.teamName
          ) {
            return;
          }

          const effectData = getEffect(args.effectId);
          if (
            !effectData ||
            !effectData.dispellable ||
            effectData.type !== effectTypes.BUFF
          ) {
            return;
          }

          // 30% chance to gain buff
          if (Math.random() < 0.3) {
            targetPokemon.battle.addToLog(
              `${initialArgs.pokemon.name}'s Pickup gains ${effectData.name}!`
            );
            // apply buff to self
            source.applyEffect(args.effectId, 1, args.source, args.initialArgs);
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_EFFECT_REMOVE,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "53" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  54: {
    name: "Truant",
    description: "Skips every second turn.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { pokemon } = initialArgs;
          const { activePokemon } = pokemon.battle;
          if (pokemon !== activePokemon) {
            return;
          }

          // skip every second turn
          const { ability } = pokemon;
          if (!ability || ability.abilityId !== "54" || !ability.data) {
            return;
          }
          if (ability.data.turn % 2 === 0) {
            pokemon.battle.addToLog(`${pokemon.name} is becoming lazy!`);
            activePokemon.applyEffect("recharge", 1, activePokemon);
          }
          ability.data.turn += 1;
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );

      return {
        listenerId,
        turn: 0,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "54" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  "54-1": {
    name: "Old Age",
    description:
      "Every second turn, sharply lower the user's speed for 1 turn.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { pokemon } = initialArgs;
          const { activePokemon } = pokemon.battle;
          if (pokemon !== activePokemon) {
            return;
          }

          // greater spe down every second turn
          const { ability } = pokemon;
          if (!ability || ability.abilityId !== "54-1" || !ability.data) {
            return;
          }
          if (ability.data.turn % 2 === 0) {
            pokemon.battle.addToLog(
              `${pokemon.name}'s Old Age is holding it back!`
            );
            activePokemon.applyEffect("greaterSpeDown", 1, activePokemon);
          }
          ability.data.turn += 1;
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );

      return {
        listenerId,
        turn: 0,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "54-1" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  56: {
    name: "Cute Charm",
    description:
      "Before the user is hit by a physical move, there is a 50% chance to lower the attacker's attack for 1 turn.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          // if move is physical, 50% chance to lower attacker's attack for 1 turn
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.damageType === damageTypes.PHYSICAL &&
            Math.random() < 0.5
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Cute Charm affects ${sourcePokemon.name}!`
            );
            sourcePokemon.applyEffect("atkDown", 1, targetPokemon);
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "56" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  62: {
    name: "Guts",
    description:
      "After being afflicted with a status condition, permanently boost the user's attack by 100%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          targetPokemon.multiplyStatMult("atk", 2);
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Guts increases its attack!`
          );
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_STATUS_APPLY,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "62" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  65: {
    name: "Overgrow",
    description: "Increases damage of grass moves by 50% when HP is below 1/2.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const userPokemon = args.source;
          if (userPokemon !== initialArgs.pokemon) {
            return;
          }

          // if move type === grass and hp < 1/2, increase damage by 50%
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.type === pokemonTypes.GRASS &&
            userPokemon.hp < userPokemon.maxHp / 2
          ) {
            userPokemon.battle.addToLog(
              `${userPokemon.name}'s Overgrow increases damage!`
            );
            args.damage = Math.round(args.damage * 1.5);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "65" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  66: {
    name: "Blaze",
    description: "Increases damage of fire moves by 50% when HP is below 1/2.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const userPokemon = args.source;
          if (userPokemon !== initialArgs.pokemon) {
            return;
          }

          // if move type === fire and hp < 1/2, increase damage by 50%
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.type === pokemonTypes.FIRE &&
            userPokemon.hp < userPokemon.maxHp / 2
          ) {
            userPokemon.battle.addToLog(
              `${userPokemon.name}'s Blaze increases damage!`
            );
            args.damage = Math.round(args.damage * 1.5);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "66" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  67: {
    name: "Torrent",
    description: "Increases damage of water moves by 50% when HP is below 1/2.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const userPokemon = args.source;
          if (userPokemon !== initialArgs.pokemon) {
            return;
          }

          // if move type === water and hp < 1/2, increase damage by 50%
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.type === pokemonTypes.WATER &&
            userPokemon.hp < userPokemon.maxHp / 2
          ) {
            userPokemon.battle.addToLog(
              `${userPokemon.name}'s Torrent increases damage!`
            );
            args.damage = Math.round(args.damage * 1.5);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "67" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  68: {
    name: "Swarm",
    description: "Increases damage of bug moves by 50% when HP is below 1/2.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const userPokemon = args.source;
          if (userPokemon !== initialArgs.pokemon) {
            return;
          }

          // if move type === bug and hp < 1/2, increase damage by 50%
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.type === pokemonTypes.BUG &&
            userPokemon.hp < userPokemon.maxHp / 2
          ) {
            userPokemon.battle.addToLog(
              `${userPokemon.name}'s Swarm increases damage!`
            );
            args.damage = Math.round(args.damage * 1.5);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "68" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  70: {
    name: "Drought",
    description: "At the start of battle, the weather becomes sunny.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          if (initialArgs.pokemon.isFainted) {
            return;
          }

          initialArgs.pokemon.battle.createWeather(
            weatherConditions.SUN,
            initialArgs.pokemon
          );
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "70" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  71: {
    name: "Arena Trap",
    description:
      "Whenever the user damages a target, restrict their combat readiness boosts for 2 turns. Doesn't affect Pokemon in the air.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (sourcePokemon !== initialArgs.pokemon) {
            return;
          }

          // if target is not flying, restrict combat readiness boosts for 2 turns
          if (
            sourcePokemon.getTypeDamageMultiplier(
              pokemonTypes.GROUND,
              targetPokemon
            ) !== 0
          ) {
            targetPokemon.applyEffect("restricted", 2, sourcePokemon);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "71" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  75: {
    name: "Shell Armor",
    description: "Reduces damage taken from moves by 12.5%.",
    abilityAdd(battle, _source, target) {
      battle.addToLog(
        `${target.name}'s Shell Armor is reducing its damage taken!`
      );
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          // reduce damage taken by 12.5%
          args.damage = Math.round(args.damage * 0.875);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "75" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  76: {
    name: "Air Lock",
    description: "Negates all weather effects.",
    abilityAdd(battle, _source, target) {
      battle.addToLog(
        `${target.name}'s Air Lock ability negates all weather effects!`
      );
    },
    abilityRemove(_battle, _source, _target) {},
  },
  89: {
    name: "Iron Fist",
    description: "Increases damage of punching moves by 30%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const userPokemon = args.source;
          if (userPokemon !== initialArgs.pokemon) {
            return;
          }

          // if move type === punch, increase damage by 30%
          const moveData = getMove(args.damageInfo.moveId);
          if (moveData.name.toLowerCase().includes("punch")) {
            userPokemon.battle.addToLog(
              `${userPokemon.name}'s Iron Fist increases the damage!`
            );
            args.damage = Math.round(args.damage * 1.3);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "89" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  94: {
    name: "Solar Power",
    description: "Increases damage dealt by user by 35% when sunny.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const userPokemon = args.source;
          if (userPokemon !== initialArgs.pokemon) {
            return;
          }

          // if sunny, increase damage by 35%
          if (userPokemon.battle.weather.weatherId === weatherConditions.SUN) {
            userPokemon.battle.addToLog(
              `${userPokemon.name}'s Solar Power increases the damage!`
            );
            args.damage = Math.round(args.damage * 1.35);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "94" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  97: {
    name: "Sniper",
    description: "Increases damage dealt by user to the BACKMOST row by 50%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
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
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "97" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  99: {
    name: "No Guard",
    description: "Moves used by and against the user never miss.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (
            sourcePokemon !== initialArgs.pokemon &&
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          args.hitChance = 100;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.CALCULATE_MISS,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "99" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  101: {
    name: "Technician",
    description:
      "Increases damage dealt by moves with 70 base power or less by 50%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (sourcePokemon !== initialArgs.pokemon) {
            return;
          }

          // if move has 60 base power or less, increase damage by 50%
          const moveData = getMove(args.damageInfo.moveId);
          if (moveData.power <= 70) {
            sourcePokemon.battle.addToLog(
              `${sourcePokemon.name}'s Technician is increasing its damage!`
            );
            args.damage = Math.round(args.damage * 1.5);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "101" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  108: {
    name: "Forewarn",
    description:
      "The user takes 15% less damage from super effective and ultimate moves.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const moveData = getMove(args.damageInfo.moveId);
          if (!moveData) {
            return;
          }

          // if move is super effective or ultimate, reduce damage by 15%
          if (
            moveData.tier === moveTiers.ULTIMATE ||
            sourcePokemon.getTypeDamageMultiplier(
              moveData.type,
              targetPokemon
            ) > 1
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Forewarn reduces the damage!`
            );
            args.damage = Math.round(args.damage * 0.85);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "108" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  111: {
    name: "Filter",
    description: "The user takes 20% less damage from super effective moves.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const moveData = getMove(args.damageInfo.moveId);
          if (!moveData) {
            return;
          }

          // if move is super effective or ultimate, reduce damage by 20%
          if (
            sourcePokemon.getTypeDamageMultiplier(
              moveData.type,
              targetPokemon
            ) > 1
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Filter reduces the damage!`
            );
            args.damage = Math.round(args.damage * 0.8);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "111" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  114: {
    name: "Storm Drain",
    description:
      "When the user is targeted by a Water-type move, the move is redirected to the user. This also boosts user's special attack for 2 turns and ignores damage.",
    abilityAdd(battle, _source, target) {
      // redirect listener
      const listener1 = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // if redirect user isnt targetable, ignore
          if (!args.user.battle.isPokemonTargetable(initialArgs.pokemon)) {
            return;
          }

          // check that enemy used non-ally move, and that move is water
          const moveUser = args.user;
          const moveData = getMove(args.moveId);
          if (moveData.type !== pokemonTypes.WATER) {
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
        },
      };
      // raise special attack on take damage from water type move
      const listener2 = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const moveData = getMove(args.damageInfo.moveId);
          if (moveData.type !== pokemonTypes.WATER) {
            return;
          }

          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Storm Drain was activated by the Water attack!`
          );
          args.damage = 0;
          args.maxDamage = 0;
          targetPokemon.applyEffect("spaUp", 2, targetPokemon);
        },
      };
      const listenerId1 = battle.eventHandler.registerListener(
        battleEventEnum.GET_ELIGIBLE_TARGETS,
        listener1
      );
      const listenerId2 = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener2
      );
      return {
        listenerId1,
        listenerId2,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "114" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId1);
      battle.eventHandler.unregisterListener(abilityData.listenerId2);
    },
  },
  115: {
    name: "Ice Body",
    description:
      "After the user's turn, if it's hailing, heal 33% of its max HP.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { battle } = initialArgs.pokemon;
          const { activePokemon } = battle;
          if (activePokemon !== initialArgs.pokemon) {
            return;
          }

          // if not hailing, ignore
          if (
            !battle.weather ||
            battle.weather.weatherId !== weatherConditions.HAIL
          ) {
            return;
          }

          // heal 33% of max hp
          battle.addToLog(
            `${activePokemon.name}'s Ice Body restores its health!`
          );
          const healAmount = Math.floor(activePokemon.maxHp * 0.33);
          activePokemon.giveHeal(healAmount, activePokemon, {
            type: "iceBody",
          });
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "115" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  125: {
    name: "Sheer Force",
    description:
      "Increases damage dealt by moves by 20%, but prevents the user from applying effects or status conditions.",
    abilityAdd(battle, _source, target) {
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (sourcePokemon !== initialArgs.pokemon) {
            return;
          }

          // increase damage by 20%
          args.damage = Math.round(args.damage * 1.2);
        },
      };

      const effectAndStatusListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (sourcePokemon !== initialArgs.pokemon) {
            return;
          }

          // prevent effects and status conditions
          sourcePokemon.battle.addToLog(
            `${sourcePokemon.name}'s Sheer Force prevents the status or effect!`
          );
          args.canApply = false;
          args.canAdd = false;
        },
      };

      battle.addToLog(`${target.name}'s Sheer Force is increasing its damage!`);
      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        damageListener
      );
      const effectListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        effectAndStatusListener
      );
      const statusListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_STATUS_APPLY,
        effectAndStatusListener
      );
      return {
        damageListenerId,
        effectListenerId,
        statusListenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "125" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
      battle.eventHandler.unregisterListener(abilityData.effectListenerId);
      battle.eventHandler.unregisterListener(abilityData.statusListenerId);
    },
  },
  130: {
    name: "Cursed Body",
    description:
      "When the user is damaged by a move, the move, increase its cooldown by 2.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
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

          targetPokemon.battle.addToLog(
            `${sourcePokemon.name} was cursed by ${targetPokemon.name}'s Cursed Body!`
          );
          sourcePokemon.moveIds[args.damageInfo.moveId].cooldown += 2;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "130" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  134: {
    name: "Heavy Metal",
    description: "Increases damage of Steel moves by 8% of the user's defense.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (sourcePokemon !== initialArgs.pokemon) {
            return;
          }

          if (args.damageInfo.type !== "move") {
            return;
          }
          const { moveId } = args.damageInfo;
          const moveData = getMove(moveId);
          if (!moveData || moveData.type !== pokemonTypes.STEEL) {
            return;
          }

          // increase damage by 8% of defense
          const damageIncrease = Math.round(
            sourcePokemon.getStat("def") * 0.08
          );
          args.damage += damageIncrease;
          targetPokemon.battle.addToLog(
            `${sourcePokemon.name}'s Heavy Metal increases the damage!`
          );
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "134" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  136: {
    name: "Multiscale",
    description: "Reduces damage taken by 50% when HP is full.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          // if hp is full, reduce damage by 50%
          if (targetPokemon.hp === targetPokemon.maxHp) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Multiscale reduces damage taken!`
            );
            args.damage = Math.round(args.damage * 0.5);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "138" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  143: {
    name: "Poison Touch",
    description:
      "When the user is damaged by a physical move, the move user has a 50% chance to be poisoned.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (args.damageInfo.type !== "move") {
            return;
          }

          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (
            targetPokemon.isFainted ||
            initialArgs.pokemon !== targetPokemon
          ) {
            return;
          }

          // if physical, 50% chance to poison
          const moveData = getMove(args.damageInfo.moveId);
          if (
            moveData.damageType === damageTypes.PHYSICAL &&
            Math.random() < 0.5
          ) {
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Poison Touch affects ${sourcePokemon.name}!`
            );
            sourcePokemon.applyStatus(statusConditions.POISON, targetPokemon);
          }
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "143" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  145: {
    name: "Big Pecks",
    description: "Immune to Def. Down and Greater Def. Down.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          if (
            args.effectId !== "defDown" &&
            args.effectId !== "greaterDefDown"
          ) {
            return;
          }

          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Big Pecks prevents the defense drop!`
          );
          args.canAdd = false;
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "145" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  153: {
    name: "Moxie",
    description:
      "When the user defeats a Pokemon, gain increased attack for 2 turns and 20% combat readiness. If already has increased attack, greatly increase attack instead.",
    abilityAdd(battle, source, _target) {
      const listener = {
        initialArgs: {
          pokemon: source,
        },
        execute(initialArgs, args) {
          const sourcePokemon = args.source;
          if (
            sourcePokemon.isFainted ||
            sourcePokemon !== initialArgs.pokemon
          ) {
            return;
          }

          // increase attack or greatly increase attack
          if (sourcePokemon.effectIds.atkUp) {
            sourcePokemon.battle.addToLog(
              `${sourcePokemon.name}'s Moxie greatly increases its attack!`
            );
            sourcePokemon.applyEffect("greaterAtkUp", 2, sourcePokemon);
          } else {
            sourcePokemon.battle.addToLog(
              `${sourcePokemon.name}'s Moxie increases its attack!`
            );
            sourcePokemon.applyEffect("atkUp", 2, sourcePokemon);
          }

          // gain 20% combat readiness
          sourcePokemon.boostCombatReadiness(sourcePokemon, 20);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_FAINT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, source, _target) {
      const { ability } = source;
      if (!ability || ability.abilityId !== "153" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  156: {
    name: "Magic Bounce",
    description: "Reflects non-damaging moves back to the user.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // make sure target of enemy move
          const sourcePokemon = args.source;
          const targetPokemons = args.targets;
          const initialPokemon = initialArgs.pokemon;
          if (sourcePokemon.teamName === initialPokemon.teamName) {
            return;
          }
          if (!targetPokemons.includes(initialPokemon)) {
            return;
          }

          // make sure move is non-damaging
          const moveData = getMove(args.moveId);
          if (!moveData || moveData.damageType !== damageTypes.OTHER) {
            return;
          }

          // remove self from targets
          const index = targetPokemons.indexOf(initialPokemon);
          targetPokemons.splice(index, 1);

          // use move against source
          initialPokemon.battle.addToLog(
            `${initialPokemon.name}'s Magic Bounce reflects the move!`
          );
          initialPokemon.executeMove({
            moveId: args.moveId,
            primaryTarget: sourcePokemon,
            allTargets: [sourcePokemon],
            missedTargets: [],
          });
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_MOVE_EXECUTE,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "156" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  // idea: gain cr or speed on first turn of round, but can only use non-damaging moves
  158: {
    name: "Prankster",
    description: "After using a non-damaging move, gain 30% combat readiness.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // make sure source is user
          const sourcePokemon = args.source;
          if (
            sourcePokemon.isFainted ||
            sourcePokemon !== initialArgs.pokemon
          ) {
            return;
          }

          // make sure move is non-damaging
          const { moveId } = args;
          const moveData = getMove(moveId);
          if (!moveData || moveData.damageType !== damageTypes.OTHER) {
            return;
          }

          // gain 30% combat readiness
          sourcePokemon.battle.addToLog(
            `${sourcePokemon.name}'s Prankster increases its combat readiness!`
          );
          sourcePokemon.boostCombatReadiness(sourcePokemon, 30);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_MOVE,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "158" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  172: {
    name: "Competitive",
    description:
      "After receiving a debuff, sharply increase special attack for 3 turns.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // make sure target is user
          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          const { effectId } = args;
          const effectData = getEffect(effectId);
          if (!effectData || effectData.type !== effectTypes.DEBUFF) {
            return;
          }

          // increase special attack
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Competitive increases its special attack!`
          );
          targetPokemon.applyEffect("greaterSpaUp", 3, targetPokemon);
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_EFFECT_ADD,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "172" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  198: {
    name: "Stakeout",
    description:
      "Allies deal 30% more damage to enemies with greater than 60% combat readiness.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const sourcePokemon = args.source;
          const targetPokemon = args.target;
          if (initialArgs.pokemon.teamName === targetPokemon.teamName) {
            return;
          }

          if (targetPokemon.combatReadiness < 60) {
            return;
          }

          args.damage = Math.round(args.damage * 1.3);
          targetPokemon.battle.addToLog(
            `${initialArgs.pokemon.name}'s Stakeout increases the damage!`
          );
        },
      };
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "198" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  20001: {
    name: "Mind Presence",
    description:
      "Whenever an enemy ends a turn, increase the user's combat readiness by 10% attacking stats by 2% without triggering effects. The user cannot be damaged by more than 35% of its max HP at a time. The user is immune to instant-faint effects.",
    abilityAdd(battle, _source, target) {
      const turnListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { pokemon } = initialArgs;
          const { activePokemon } = pokemon.battle;
          if (activePokemon.teamName === pokemon.teamName) {
            return;
          }

          pokemon.battle.addToLog(
            `${pokemon.name}'s Mind Presence increases its combat readiness and attacking stats!`
          );
          pokemon.boostCombatReadiness(pokemon, 10, false);
          pokemon.multiplyStatMult("atk", 1.02);
          pokemon.multiplyStatMult("spa", 1.02);
        },
      };
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const { damage } = args;
          const { maxHp } = targetPokemon;
          if (damage > maxHp * 0.35) {
            args.damage = Math.floor(maxHp * 0.35);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Mind Presence reduces damage taken!`
            );
          }
        },
      };
      const faintListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          args.canFaint = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Mind Presence prevents it from fainting!`
          );
        },
      };

      const turnListenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        turnListener
      );
      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        damageListener
      );
      const faintListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_CAUSE_FAINT,
        faintListener
      );
      return {
        turnListenerId,
        damageListenerId,
        faintListenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20001" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.turnListenerId);
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
      battle.eventHandler.unregisterListener(abilityData.faintListenerId);
    },
  },
  20002: {
    name: "Soul Body",
    description:
      "Whenever the user survives damage, increase its combat readiness by 15% without triggering effects, and heal all allies by 5% of its max HP. The user cannot be damaged by more than 35% of its max HP at a time. The user is immune to instant-faint effects.",
    abilityAdd(battle, _source, target) {
      const afterDamageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Soul Body increases its combat readiness and heals its allies!`
          );
          targetPokemon.boostCombatReadiness(targetPokemon, 15, false);
          const allyParty =
            targetPokemon.battle.parties[targetPokemon.teamName];
          const allyPokemons = targetPokemon.getPatternTargets(
            allyParty,
            targetPatterns.ALL_EXCEPT_SELF,
            targetPokemon.position
          );
          for (const allyPokemon of allyPokemons) {
            targetPokemon.giveHeal(
              Math.round(targetPokemon.maxHp * 0.05),
              allyPokemon,
              {
                type: "soulBody",
              }
            );
          }
        },
      };
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const { damage } = args;
          const { maxHp } = targetPokemon;
          if (damage > maxHp * 0.35) {
            args.damage = Math.floor(maxHp * 0.35);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Soul Body reduces damage taken!`
            );
          }
        },
      };
      const faintListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          args.canFaint = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Soul Body prevents it from fainting!`
          );
        },
      };

      const afterDamageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        afterDamageListener
      );
      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        damageListener
      );
      const faintListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_CAUSE_FAINT,
        faintListener
      );
      return {
        afterDamageListenerId,
        damageListenerId,
        faintListenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20002" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.afterDamageListenerId);
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
      battle.eventHandler.unregisterListener(abilityData.faintListenerId);
    },
  },
  20003: {
    name: "Soul Energy",
    description:
      "Whenever the user's turn ends, increase the combat readiness of all allies by 15% without triggering effects. The user cannot be damaged by more than 55% of its max HP at a time. The user is immune to instant-faint effects.",
    abilityAdd(battle, _source, target) {
      const turnListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { pokemon } = initialArgs;
          const { activePokemon } = pokemon.battle;
          if (activePokemon !== pokemon) {
            return;
          }

          pokemon.battle.addToLog(
            `${pokemon.name}'s Soul Energy increases its allies' combat readiness!`
          );
          const allyParty = pokemon.battle.parties[pokemon.teamName];
          const allyPokemons = pokemon.getPatternTargets(
            allyParty,
            targetPatterns.ALL,
            pokemon.position
          );
          for (const allyPokemon of allyPokemons) {
            allyPokemon.boostCombatReadiness(pokemon, 15, false);
          }
        },
      };
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const { damage } = args;
          const { maxHp } = targetPokemon;
          if (damage > maxHp * 0.55) {
            args.damage = Math.floor(maxHp * 0.55);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Soul Energy reduces damage taken!`
            );
          }
        },
      };
      const faintListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          args.canFaint = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Soul Energy prevents it from fainting!`
          );
        },
      };

      const turnListenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        turnListener
      );
      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        damageListener
      );
      const faintListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_CAUSE_FAINT,
        faintListener
      );
      return {
        turnListenerId,
        damageListenerId,
        faintListenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20003" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.turnListenerId);
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
      battle.eventHandler.unregisterListener(abilityData.faintListenerId);
    },
  },
  20004: {
    name: "Spirit Power",
    description:
      "Whenever a Pokemon faints, permanently incease the user's attacking stats and speed by 20% without triggering effects. The user cannot be damaged by more than 55% of its max HP at a time. The user is immune to instant-faint effects.",
    abilityAdd(battle, _source, target) {
      const afterFaintListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const { pokemon } = initialArgs;
          const targetPokemon = args.target;
          if (targetPokemon === pokemon) {
            return;
          }

          pokemon.battle.addToLog(
            `${pokemon.name}'s Spirit Power increases its attacking stats and speed!`
          );
          pokemon.multiplyStatMult("atk", 1.2);
          pokemon.multiplyStatMult("spa", 1.2);
          pokemon.multiplyStatMult("spe", 1.2);
        },
      };
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          const { damage } = args;
          const { maxHp } = targetPokemon;
          if (damage > maxHp * 0.55) {
            args.damage = Math.floor(maxHp * 0.55);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Spirit Power reduces damage taken!`
            );
          }
        },
      };
      const faintListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          args.canFaint = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Spirit Power prevents it from fainting!`
          );
        },
      };

      const afterFaintListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_FAINT,
        afterFaintListener
      );
      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        damageListener
      );
      const faintListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_CAUSE_FAINT,
        faintListener
      );
      return {
        afterFaintListenerId,
        damageListenerId,
        faintListenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20004" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.afterFaintListenerId);
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
      battle.eventHandler.unregisterListener(abilityData.faintListenerId);
    },
  },
  20005: {
    name: "False Democracy",
    description:
      "Whenever an enemy gains combat readiness, disable its ultimate move for 1 turn. This can only happen once per-enemy.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon.teamName === initialArgs.pokemon.teamName) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20005" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // if target already affected or fainted, return
          if (
            targetPokemon.isFainted ||
            abilityData.affectedPokemons.includes(targetPokemon)
          ) {
            return;
          }

          // apply disable for 1 turn
          targetPokemon.battle.addToLog(
            `${targetPokemon.name} suffers under ${initialArgs.pokemon.name}'s False Democracy!`
          );
          targetPokemon.applyEffect("disable", 1, initialArgs.pokemon);
          abilityData.affectedPokemons.push(targetPokemon);
        },
      };

      // add listener to after cr gain
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_CR_GAINED,
        listener
      );

      return {
        listenerId,
        affectedPokemons: [target],
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20005" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  20006: {
    name: "Anarchy",
    description:
      "Every other turn, the user enters Anarchy mode. This increases the user's speed by 100% (+), but decreases accuracy by 50% (+). Starts the battle in Anarchy mode.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { battle } = initialArgs.pokemon;
          const { activePokemon } = battle;
          if (activePokemon !== initialArgs.pokemon) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20006" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // if already in anarchy mode, make not in anarchy mode
          if (abilityData.inAnarchyMode) {
            abilityData.inAnarchyMode = false;
            battle.addToLog(`${initialArgs.pokemon.name} exits Anarchy mode!`);
            initialArgs.pokemon.addStatMult("spe", -1);
            initialArgs.pokemon.acc += 50;
          } else {
            // otherwise, make in anarchy mode
            abilityData.inAnarchyMode = true;
            battle.addToLog(`${initialArgs.pokemon.name} enters Anarchy mode!`);
            initialArgs.pokemon.addStatMult("spe", 1);
            initialArgs.pokemon.acc -= 50;
          }
        },
      };

      // add listener to after turn end
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_END,
        listener
      );

      // start in anarchy mode
      target.addStatMult("spe", 1);
      target.acc -= 50;
      battle.addToLog(`${target.name} enters Anarchy mode!`);

      return {
        listenerId,
        inAnarchyMode: true,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20006" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);

      // if in anarchy mode, remove anarchy mode
      if (abilityData.inAnarchyMode) {
        abilityData.inAnarchyMode = false;
        target.addStatMult("spe", -1);
        target.acc += 50;
      }
    },
  },
  20007: {
    name: "Bloody Sunday",
    description:
      "Whenever an ally Pokemon faints, increase the user's combat readiness to 100% and heal 10% HP.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const { battle } = initialArgs.pokemon;
          const targetPokemon = args.target;
          if (targetPokemon.teamName !== initialArgs.pokemon.teamName) {
            return;
          }

          // if user not fainted, set user cr to 100%
          if (!initialArgs.pokemon.isFainted) {
            battle.addToLog(
              `${targetPokemon.name} has been sacrificed to ${initialArgs.pokemon.name}'s Bloody Sunday!`
            );
            initialArgs.pokemon.boostCombatReadiness(initialArgs.pokemon, 100);
            initialArgs.pokemon.giveHeal(
              Math.floor(initialArgs.pokemon.maxHp * 0.1),
              initialArgs.pokemon,
              {
                type: "ability",
                id: "20007",
              }
            );
          }
        },
      };

      // add listener to after faint
      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_FAINT,
        listener
      );

      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20007" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  20008: {
    name: "Resurrection",
    description:
      "The first time the user would take lethal damage, prevent it and set its combat readiness to 100%.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (initialArgs.pokemon !== targetPokemon) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20008" || !ability.data) {
            return;
          }
          const abilityData = ability.data;

          // if fatal damage, prevent it and set cr to 100
          if (args.damage > targetPokemon.hp) {
            args.damage = 0;
            args.maxDamage = Math.min(args.maxDamage, args.damage);
            targetPokemon.battle.addToLog(`${targetPokemon.name} resurrects!`);
            targetPokemon.boostCombatReadiness(targetPokemon, 100);
            // remove event listener
            targetPokemon.battle.eventHandler.unregisterListener(
              abilityData.listenerId
            );
          }
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20008" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  20009: {
    name: "Royalty",
    description:
      "Boosts the user's Special Attack by 30% of its starting Attack.",
    abilityAdd(battle, _source, target) {
      const { batk } = target;
      const flatStatBoost = Math.floor(batk * 0.3);
      target.addFlatStatBoost("spa", flatStatBoost);
      battle.addToLog(`${target.name}'s Royalty boosts its Special Attack!`);
      return {
        statBoost: flatStatBoost,
      };
    },
    abilityRemove(_battle, _source, target) {
      const abilityInstance = target.ability;
      if (abilityInstance?.data?.statBoost !== undefined) {
        target.addFlatStatBoost("spa", -abilityInstance.data.statBoost);
      } else {
        target.addFlatStatBoost("spa", -Math.floor(target.batk * 0.3));
      }
    },
  },
  20010: {
    name: "Money Bags",
    description:
      "At the start of the battle, the user gains the Money Bags buff, which heals allies when taking damage.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { pokemon } = initialArgs;
          // add moneybags buff
          pokemon.applyEffect("moneyBags", 2, pokemon);
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "m20010" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  20011: {
    name: "Ever-beating Heart",
    description:
      "At the start of battle, the user gets Immortality for 2 turns.",
    abilityAdd(battle, _source, target) {
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { pokemon } = initialArgs;
          // add immortality buff
          pokemon.applyEffect("immortal", 2, pokemon);
        },
      };

      const listenerId = battle.eventHandler.registerListener(
        battleEventEnum.BATTLE_BEGIN,
        listener
      );
      return {
        listenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "m20011" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId);
    },
  },
  20012: {
    name: "Blue Haki",
    description:
      "The user's buffs last 1 additional turn. When buffed, the user deals 25% more damage.",
    abilityAdd(battle, _source, target) {
      // buff listener
      const listener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const { pokemon } = initialArgs;
          if (pokemon !== args.target) {
            return;
          }

          const { effectId } = args;
          const effectData = getEffect(effectId);
          if (!effectData) {
            return;
          }
          if (effectData.type !== effectTypes.BUFF) {
            return;
          }

          // increase duration
          pokemon.battle.addToLog(
            `${pokemon.name}'s Blue Haki increased the duration of ${effectData.name}!`
          );
          args.duration += 1;
        },
      };
      // damage listener
      const listener2 = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const { pokemon } = initialArgs;
          if (pokemon !== args.source) {
            return;
          }

          // see if buff
          let isBuffed = false;
          for (const effectId of Object.keys(pokemon.effectIds)) {
            const effectData = getEffect(effectId);
            if (!effectData) {
              continue;
            }
            if (effectData.type !== effectTypes.BUFF) {
              continue;
            }

            isBuffed = true;
            break;
          }

          // if buffed, increase damage
          if (isBuffed) {
            pokemon.battle.addToLog(
              `${pokemon.name}'s Blue Haki increased its damage!`
            );
            args.damage = Math.floor(args.damage * 1.25);
          }
        },
      };

      const listenerId1 = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_EFFECT_ADD,
        listener
      );
      const listenerId2 = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_DEALT,
        listener2
      );
      return {
        listenerId1,
        listenerId2,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "m20012" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.listenerId1);
      battle.eventHandler.unregisterListener(abilityData.listenerId2);
    },
  },
  20013: {
    name: "Armored Behemoth's Pressure",
    description:
      "The user is immune to instant-faint effects and takes reduced damage. When taking damage, increase the user's defensive stats by 5% and has a 30% chance to counter with a random move.",
    abilityAdd(battle, _source, target) {
      const afterDamageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          // attempt to get ability data and log damage taken
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20013" || !ability.data) {
            return;
          }
          const abilityData = ability.data;
          const turn = abilityData.turn || targetPokemon.battle.turn;
          abilityData.damageTakenTurn += args.damage;

          // increase defenses by 5%
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Armored Behemoth's Pressence increases its defenses!`
          );
          targetPokemon.addStatMult("def", 0.05);
          targetPokemon.addStatMult("spd", 0.05);

          // 30% chance to counter with a random move
          if (Math.random() > 0.3 || !sourcePokemon) {
            return;
          }
          const validMoves = Object.keys(targetPokemon.moveIds);
          // if no moves, return
          if (validMoves.length === 0) {
            battle.addToLog(`${targetPokemon.name} has no moves to use!`);
            return;
          }
          const randomMoveId =
            validMoves[Math.floor(Math.random() * validMoves.length)];
          const randomMoveData = getMove(randomMoveId);
          battle.addToLog(
            `${targetPokemon.name} countered with ${randomMoveData.name}!`
          );
          // get valid targets
          const validTargets = battle.getEligibleTargets(
            targetPokemon,
            randomMoveId
          );
          // if no valid targets, return
          if (validTargets.length === 0) {
            battle.addToLog(`${randomMoveData.name} has no valid targets!`);
            return;
          }
          // choose target or random valid target
          const target = validTargets.includes(sourcePokemon)
            ? sourcePokemon
            : validTargets[Math.floor(Math.random() * validTargets.length)];
          const targetParty = battle.parties[target.teamName];
          const targets = targetPokemon.getPatternTargets(
            targetParty,
            randomMoveData.targetPattern,
            target.position,
            randomMoveId
          );
          // use move against target
          battle.addToLog(`${randomMoveData.name} hit ${target.name}!`);
          // yes I know the targets are confusing
          targetPokemon.executeMove({
            moveId: randomMoveId,
            primaryTarget: target,
            allTargets: targets,
            missedTargets: [],
          });
        },
      };
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20013" || !ability.data) {
            return;
          }
          const abilityData = ability.data;
          const { turn } = abilityData;
          abilityData.turn = targetPokemon.battle.turn;
          if (turn !== targetPokemon.battle.turn) {
            abilityData.damageTakenTurn = 0;
          }
          const damageTakenTurn = abilityData.damageTakenTurn || 0;

          const { damage } = args;
          const { maxHp } = targetPokemon;
          if (damage > maxHp * 0.03) {
            args.damage = Math.floor(maxHp * 0.03);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }

          // if took more than 5% of max hp this turn, reduce damage down to 0.5% of max hp
          if (damageTakenTurn > 0.05 * maxHp && damage > maxHp * 0.005) {
            args.damage = Math.floor(maxHp * 0.005);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }
        },
      };
      const faintListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          args.canFaint = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Armored Behemoth's Pressence prevents it from fainting!`
          );
        },
      };

      const afterDamageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        afterDamageListener
      );
      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        damageListener
      );
      const faintListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_CAUSE_FAINT,
        faintListener
      );
      return {
        afterDamageListenerId,
        damageListenerId,
        faintListenerId,
        turn: 0,
        damageTakenTurn: 0,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20013" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.afterDamageListenerId);
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
      battle.eventHandler.unregisterListener(abilityData.faintListenerId);
    },
  },
  20014: {
    name: "Shadow Berserker's Rage",
    description:
      "The user is immune to instant-faint effects and takes reduced damage. When taking damage, increase the user's offensive stats by 5% and gains 30% combat readiness.",
    abilityAdd(battle, _source, target) {
      const afterDamageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          // attempt to get ability data and log damage taken
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20014" || !ability.data) {
            return;
          }
          const abilityData = ability.data;
          const turn = abilityData.turn || targetPokemon.battle.turn;
          abilityData.damageTakenTurn += args.damage;

          // increase offenses by 5%
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Shadow Berserker's Rage increases its offenses!`
          );
          targetPokemon.addStatMult("atk", 0.05);
          targetPokemon.addStatMult("spa", 0.05);

          // gain 30%
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Shadow Berserker's Rage increases its combat readiness!`
          );
          targetPokemon.boostCombatReadiness(targetPokemon, 30);
        },
      };
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          const sourcePokemon = args.source;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20014" || !ability.data) {
            return;
          }
          const abilityData = ability.data;
          const { turn } = abilityData;
          abilityData.turn = targetPokemon.battle.turn;
          if (turn !== targetPokemon.battle.turn) {
            abilityData.damageTakenTurn = 0;
          }
          const damageTakenTurn = abilityData.damageTakenTurn || 0;

          const { damage } = args;
          const { maxHp } = targetPokemon;
          if (damage > maxHp * 0.055) {
            args.damage = Math.floor(maxHp * 0.055);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }

          // if took more than 5% of max hp this turn, reduce damage down to 1% of max hp
          if (damageTakenTurn > 0.05 * maxHp && damage > maxHp * 0.01) {
            args.damage = Math.floor(maxHp * 0.01);
            args.maxDamage = Math.min(args.maxDamage, args.damage);
          }
        },
      };
      const faintListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon !== initialArgs.pokemon) {
            return;
          }

          args.canFaint = false;
          targetPokemon.battle.addToLog(
            `${targetPokemon.name}'s Shadow Berserker's Rage prevents it from fainting!`
          );
        },
      };

      const afterDamageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        afterDamageListener
      );
      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        damageListener
      );
      const faintListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_CAUSE_FAINT,
        faintListener
      );
      return {
        afterDamageListenerId,
        damageListenerId,
        faintListenerId,
        turn: 0,
        damageTakenTurn: 0,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20014" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.afterDamageListenerId);
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
      battle.eventHandler.unregisterListener(abilityData.faintListenerId);
    },
  },
  20015: {
    name: "Cosmic Strength",
    description:
      "When the user receives an attack debuff, sharply raise the other attacking stat for 2 turns.",
    abilityAdd(battle, _source, target) {
      const debuffListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          // make sure target is user
          const targetPokemon = args.target;
          if (
            targetPokemon.isFainted ||
            targetPokemon !== initialArgs.pokemon
          ) {
            return;
          }

          const { effectId } = args;
          if (effectId === "atkDown" || effectId === "greaterAtkDown") {
            // increase special attack
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Cosmic Strength increases its special attack!`
            );
            targetPokemon.applyEffect("greaterSpaUp", 2, targetPokemon);
          } else if (effectId === "spaDown" || effectId === "greaterSpaDown") {
            // increase attack
            targetPokemon.battle.addToLog(
              `${targetPokemon.name}'s Cosmic Strength increases its attack!`
            );
            targetPokemon.applyEffect("greaterAtkUp", 2, targetPokemon);
          }
        },
      };

      const debuffListenerId = battle.eventHandler.registerListener(
        battleEventEnum.AFTER_EFFECT_ADD,
        debuffListener
      );
      return {
        debuffListenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20015" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.debuffListenerId);
    },
  },
  20016: {
    name: "Cosmic Protection",
    description: "Reduce the damage taken by all allies by 10%.",
    abilityAdd(battle, _source, target) {
      const damageListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, args) {
          const targetPokemon = args.target;
          if (targetPokemon.teamName !== initialArgs.pokemon.teamName) {
            return;
          }

          const { damage } = args;
          args.damage = Math.floor(damage * 0.9);
          args.maxDamage = Math.min(args.maxDamage, args.damage);
        },
      };

      const damageListenerId = battle.eventHandler.registerListener(
        battleEventEnum.BEFORE_DAMAGE_TAKEN,
        damageListener
      );
      battle.addToLog(
        `${target.name}'s Cosmic Protection is reducing the damage taken by all allies!`
      );
      return {
        damageListenerId,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20016" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.damageListenerId);
    },
  },
  20017: {
    name: "Cosmic Agility",
    description:
      "When the user starts its turn, boost the stats of all allies permanently by 2%. Can occur up to 10 times.",
    abilityAdd(battle, _source, target) {
      const turnListener = {
        initialArgs: {
          pokemon: target,
        },
        execute(initialArgs, _args) {
          const { pokemon } = initialArgs;
          if (pokemon.battle.activePokemon !== pokemon) {
            return;
          }

          // attempt to get ability data
          const { ability } = initialArgs.pokemon;
          if (!ability || ability.abilityId !== "20017" || !ability.data) {
            return;
          }
          const abilityData = ability.data;
          const turns = abilityData.turns || 0;
          if (turns >= 10) {
            return;
          }
          abilityData.turns = turns + 1;

          pokemon.battle.addToLog(
            `${pokemon.name}'s Cosmic Agility increases the stats of all allies!`
          );
          const allies = pokemon.battle.parties[
            pokemon.teamName
          ].pokemons.filter((p) => p && !p.isFainted);
          for (const ally of allies) {
            ally.addStatMult("atk", 0.02);
            ally.addStatMult("spa", 0.02);
            ally.addStatMult("def", 0.02);
            ally.addStatMult("spd", 0.02);
            ally.addStatMult("spe", 0.02);
          }
        },
      };

      const turnListenerId = battle.eventHandler.registerListener(
        battleEventEnum.TURN_BEGIN,
        turnListener
      );
      return {
        turnListenerId,
        turns: 0,
      };
    },
    abilityRemove(battle, _source, target) {
      const { ability } = target;
      if (!ability || ability.abilityId !== "20017" || !ability.data) {
        return;
      }
      const abilityData = ability.data;
      battle.eventHandler.unregisterListener(abilityData.turnListenerId);
    },
  },
});

module.exports = {
  typeAdvantages,
  moveConfig,
  moveExecutes,
  moveTiers,
  targetTypes,
  targetPositions,
  targetPatterns,
  effectConfig,
  effectTypes,
  statusConditions,
  weatherConditions,
  calculateDamage,
  abilityConfig,
  damageTypes,
  statIndexToBaseStat,
  statIndexToBattleStat,
  battleStatToBaseStat,
};
