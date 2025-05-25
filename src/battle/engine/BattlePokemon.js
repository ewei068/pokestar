/* eslint-disable no-case-declarations */
// TODO: probably fix both
/* eslint-disable no-param-reassign */

const {
  pokemonConfig,
  types: pokemonTypes,
} = require("../../config/pokemonConfig");
const {
  targetPatterns,
  targetPositions,
  statusConditions,
  typeAdvantages,
  weatherConditions,
  damageTypes,
  battleStatToBaseStat,
} = require("../../config/battleConfig");
const {
  battleEventEnum,
  abilityIdEnum,
  effectIdEnum,
} = require("../../enums/battleEnums");
const { calculatePokemonStats } = require("../../services/pokemon");
const { logger } = require("../../log");
const {
  calculateEffectiveSpeed,
  calculateEffectiveAccuracy,
  calculateEffectiveEvasion,
  getMoveIds,
} = require("../../utils/pokemonUtils");
const { drawDiscrete } = require("../../utils/gachaUtils");
const { getMove } = require("../data/moveRegistry");
const { getEffect } = require("../data/effectRegistry");
const { getAbility } = require("../data/abilityRegistry");
const { getPatternTargetIndices } = require("../../utils/battleUtils");
const { getHeldItem } = require("../data/heldItemRegistry");

class BattlePokemon {
  /**
   * @param {Battle} battle
   * @param {any} trainer
   * @param {WithId<Pokemon> & { remainingHp?: number }} pokemonData
   * @param {string} teamName
   * @param {number} position
   */
  constructor(battle, trainer, pokemonData, teamName, position) {
    this.battle = battle;
    this.speciesId = pokemonData.speciesId;
    this.speciesData = pokemonConfig[this.speciesId];
    // if battle has a set level, scale pokemon to that level
    if (battle.level) {
      battle.minLevel = Math.min(battle.minLevel, pokemonData.level);
      pokemonData.level = battle.level;
    }
    // if battle has an equipment level, set all pokemons equipments to that level
    if (battle.equipmentLevel) {
      for (const equipment of Object.values(pokemonData.equipments)) {
        equipment.level = battle.equipmentLevel;
      }
    }
    pokemonData = calculatePokemonStats(pokemonData, this.speciesData);
    this.pokemonData = pokemonData;
    this.id = pokemonData._id.toString();
    this.userId = trainer.userId;
    this.originalUserId = trainer.userId;
    this.teamName = teamName;
    this.name = pokemonData.name;
    this.hp = pokemonData.remainingHp || pokemonData.stats[0];
    [this.maxHp = 1] = this.pokemonData.stats;
    this.level = pokemonData.level;
    this.allStatData = {
      atk: {
        addMult: 1,
        multMult: 1,
        flatBoost: 0,
      },
      def: {
        addMult: 1,
        multMult: 1,
        flatBoost: 0,
      },
      spa: {
        addMult: 1,
        multMult: 1,
        flatBoost: 0,
      },
      spd: {
        addMult: 1,
        multMult: 1,
        flatBoost: 0,
      },
      spe: {
        addMult: 1,
        multMult: 1,
        flatBoost: 0,
      },
    };
    [
      this.batk = 1,
      this.bdef = 1,
      this.bspa = 1,
      this.bspd = 1,
      this.bspe = 1,
    ] = this.pokemonData.stats.slice(1);
    // for debug and/or backwards compat fallback
    this.atk = this.getStat("atk");
    this.def = this.getStat("def");
    this.spa = this.getStat("spa");
    this.spd = this.getStat("spd");
    this.spe = this.getStat("spe");

    this.acc = 100;
    this.eva = 100;
    [this.type1 = null, this.type2 = null] = this.speciesData.type;
    // map effectId => effect data (duration, args)
    /**
     * @type {PartialRecord<EffectIdEnum, any>}
     */
    this.effectIds = {};

    /** @type {PartialRecord<MoveIdEnum, { cooldown: number, disabledCounter: number}>} */
    this.moveIds = {};
    // map moveId => move data (cooldown, disabledCounter)
    this.addMoves(pokemonData);
    this.setAbility(pokemonData.abilityId);
    this.originalHeldItemId = pokemonData.heldItemId;
    this.setHeldItem(pokemonData.heldItemId);
    /** @type {{ statusId?: StatusConditionEnum, source?: BattlePokemon, turns: number }} */
    this.status = {
      statusId: null,
      turns: 0,
    };
    this.combatReadiness = 0;
    this.position = position;
    this.isFainted = false;
    this.targetable = true;
    this.hittable = true;
    this.incapacitated = false;
    this.restricted = false;
    this.shiny = pokemonData.shiny;
  }

  /**
   * @param {PokemonTypeEnum} type
   * @returns {boolean}
   */
  hasType(type) {
    return this.type1 === type || this.type2 === type;
  }

  /**
   * @param {Pokemon} pokemonData
   */
  addMoves(pokemonData) {
    this.moveIds = getMoveIds(pokemonData).reduce((acc, moveId) => {
      acc[moveId] = {
        cooldown: 0,
        disabledCounter: 0,
      };
      return acc;
    }, {});
  }

  /**
   * @returns {MoveIdEnum[]}
   */
  getMoveIds() {
    // @ts-ignore
    return Object.keys(this.moveIds);
  }

  /**
   * @param {string | number} abilityId
   */
  setAbility(abilityId) {
    /**
     * @type {{ abilityId?: string | number, data: any, applied: boolean }}
     */
    this.ability = {
      abilityId,
      data: {},
      applied: false,
    };
  }

  /**
   * @param {HeldItemIdEnum?} heldItemId
   */
  setHeldItem(heldItemId) {
    if (heldItemId) {
      /**
       * @type {{ heldItemId?: HeldItemIdEnum, data: any, applied: boolean }}
       */
      this.heldItem = {
        heldItemId,
        data: {},
        applied: false,
      };
    } else {
      this.heldItem = {
        data: {},
        applied: false,
      };
    }
  }

  /**
   * @param {PokemonIdEnum} speciesId
   * @param {object} param1
   * @param {string?=} param1.abilityId
   * @param {MoveIdEnum[]?=} param1.moveIds
   */
  transformInto(speciesId, { abilityId = null, moveIds = [] } = {}) {
    const beforeSpeciesId = this.speciesId;
    const oldName = this.name;
    // remove ability
    this.removeAbility();

    // set new species values
    this.speciesId = speciesId;
    this.speciesData = pokemonConfig[this.speciesId];
    [this.type1, this.type2 = null] = this.speciesData.type;
    this.type2 = this.speciesData.type[1] || null;
    this.name = this.speciesData.name;

    // set pokemon data object
    this.pokemonData.speciesId = this.speciesId;
    this.pokemonData.name = this.speciesData.name;
    this.pokemonData.moveIds = moveIds;
    this.pokemonData.abilityId =
      abilityId || drawDiscrete(this.speciesData.abilities, 1)[0];
    calculatePokemonStats(this.pokemonData, this.speciesData);

    // set stats (except hp)
    [, this.batk, this.bdef, this.bspa, this.bspd, this.bspe] =
      this.pokemonData.stats;

    // set moves and ability
    this.addMoves(this.pokemonData);
    this.setAbility(this.pokemonData.abilityId);
    this.applyAbility();

    // for debug and/or backwards compat fallback
    this.atk = this.getStat("atk");
    this.def = this.getStat("def");
    this.spa = this.getStat("spa");
    this.spd = this.getStat("spd");
    this.spe = this.getStat("spe");

    this.battle.addToLog(`${oldName} transformed into ${this.name}!`);

    this.battle.emitEvent(battleEventEnum.AFTER_TRANSFORM, {
      target: this,
      beforeSpeciesId,
      afterSpeciesId: this.speciesId,
    });
  }

  /**
   * @param {MoveIdEnum} moveId
   * @param {string} targetPokemonId
   */
  useMove(moveId, targetPokemonId) {
    // make sure pokemon can move
    if (!this.canMove()) {
      return;
    }
    // make sure move exists and is not on cooldown & disabled
    const moveData = getMove(moveId);
    if (
      !moveData ||
      this.moveIds[moveId].cooldown > 0 ||
      this.moveIds[moveId].disabledCounter
    ) {
      return;
    }
    // check to see if target is valid
    const primaryTarget = this.battle.allPokemon[targetPokemonId];
    if (
      !primaryTarget ||
      !this.battle.getEligibleTargets(this, moveId).includes(primaryTarget)
    ) {
      return;
    }

    // clear battle log
    this.battle.clearLog();

    // reset combat readiness
    this.combatReadiness = 0;

    let canUseMove = true;

    // check status conditions
    if (this.status.statusId !== null) {
      switch (this.status.statusId) {
        case statusConditions.FREEZE:
          // if move is flare blitz, thaw out
          if (moveId === "m394" || moveId === "m394-1") {
            this.removeStatus();
            break;
          }

          // thaw chance (turns => chance): 0 => 0%, 1 => 40%, 2 => 80%, 3 => 100%
          const thawChance = this.status.turns * 0.4;
          const thawRoll = Math.random();
          if (thawRoll < thawChance) {
            this.removeStatus();
          } else {
            this.battle.addToLog(`${this.name} is frozen solid!`);
            canUseMove = false;
          }
          break;
        case statusConditions.PARALYSIS:
          // 25% chance to be paralyzed
          const paralysisRoll = Math.random();
          if (paralysisRoll < 0.25) {
            this.battle.addToLog(`${this.name} is paralyzed and can't move!`);
            canUseMove = false;
          }
          break;
        case statusConditions.SLEEP:
          // ignore if sleep talk is used
          if (moveId === "m214") {
            break;
          }
          // sleep wakeup chance: 0 turns: 0%, 1 turn: 66%, 2 turns: 100%
          const wakeupChance = this.status.turns * 0.66;
          const wakeupRoll = Math.random();
          if (wakeupRoll < wakeupChance) {
            this.removeStatus();
          } else {
            this.battle.addToLog(`${this.name} is fast asleep!`);
            canUseMove = false;
          }
          break;
        default:
          break;
      }
    }

    if (canUseMove) {
      const eventArgs = {
        canUseMove,
        source: this,
        primaryTarget,
        moveId,
      };

      // trigger before move events
      this.battle.eventHandler.emit(battleEventEnum.BEFORE_MOVE, eventArgs);

      canUseMove = eventArgs.canUseMove;
    }

    // check if pokemon can use move make sure pokemon is alive
    canUseMove = !!(canUseMove && !this.isFainted);

    // get move data and execute move
    if (canUseMove) {
      // set cooldown
      this.moveIds[moveId].cooldown = moveData.cooldown;

      // execute move
      const { allTargets, missedTargets, err } = this.executeMoveAgainstTarget({
        moveId,
        primaryTarget,
      });

      if (!err) {
        // after move event
        const eventArgs = {
          source: this,
          primaryTarget,
          targets: allTargets,
          missedTargets,
          moveId,
        };
        this.battle.eventHandler.emit(battleEventEnum.AFTER_MOVE, eventArgs);
      }
    }

    // end turn
    this.battle.nextTurn();
  }

  /**
   * @param {object} param0
   * @param {MoveIdEnum} param0.moveId
   * @param {BattlePokemon} param0.primaryTarget
   * @param {object=} param0.extraOptions
   * @returns {{
   *  allTargets?: BattlePokemon[],
   *  missedTargets?: BattlePokemon[],
   *  err?: string
   * }}
   */
  executeMoveAgainstTarget({ moveId, primaryTarget, extraOptions = {} }) {
    const moveData = getMove(moveId);
    if (!moveData) {
      logger.error(`Move ${moveId} not found.`);
      return {};
    }

    // calculate miss and targets
    const allTargets = this.getMoveExecuteTargets(moveId, primaryTarget);
    const missedTargets = this.getMisses(moveId, allTargets);

    // TODO: Move to executeMove?
    // trigger before execute move events
    const executeEventArgs = {
      source: this,
      primaryTarget,
      targets: allTargets,
      missedTargets,
      moveId,
    };
    this.battle.eventHandler.emit(
      battleEventEnum.BEFORE_MOVE_EXECUTE,
      executeEventArgs
    );

    // move logging
    const isSilenced =
      moveData.silenceIf && moveData.silenceIf(this.battle, this);
    if (!isSilenced) {
      const targetString =
        moveData.targetPattern === targetPatterns.ALL ||
        moveData.targetPattern === targetPatterns.ALL_EXCEPT_SELF ||
        moveData.targetPattern === targetPatterns.RANDOM ||
        moveData.targetPosition === targetPositions.SELF
          ? "!"
          : ` against ${primaryTarget.name}!`;
      this.battle.addToLog(`${this.name} used ${moveData.name}${targetString}`);
    }
    if (missedTargets.length > 0 && !isSilenced) {
      this.battle.addToLog(
        `Missed ${missedTargets.map((target) => target.name).join(", ")}!`
      );
    }

    // execute move
    this.executeMove({
      moveId,
      primaryTarget,
      allTargets,
      missedTargets,
      extraOptions,
    });

    return {
      allTargets,
      missedTargets,
    };
  }

  /**
   * @param {object} param0
   * @param {MoveIdEnum} param0.moveId
   * @param {object} param0.primaryTarget
   * @param {Array<object>} param0.allTargets
   * @param {Array<object>=} param0.missedTargets
   * @param {object=} param0.extraOptions
   */
  executeMove({
    moveId,
    primaryTarget,
    allTargets,
    missedTargets = [],
    extraOptions = {},
  }) {
    const move = getMove(moveId);
    if (!move) {
      logger.error(`Move ${moveId} not found.`);
      return;
    }

    // HACK: set primary / all targets for later damage calculation
    this.currentPrimaryTarget = primaryTarget;
    this.currentAllTargets = allTargets;
    if (!move.isLegacyMove) {
      move.execute({
        battle: this.battle,
        source: this,
        primaryTarget,
        allTargets,
        missedTargets,
        extraOptions,
      });
    } else {
      const legacyMove = /** @type {any} */ (move);
      legacyMove.execute(
        this.battle,
        this,
        primaryTarget,
        allTargets,
        missedTargets
      );
    }
    // clear primary / all targets
    this.currentPrimaryTarget = null;
    this.currentAllTargets = null;
  }

  /**
   * @param {object} param0
   * @param {Move} param0.move
   * @param {BattlePokemon} param0.target
   * @param {BattlePokemon} param0.primaryTarget
   * @param {Array<BattlePokemon>} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {DamageTypeEnum=} param0.atkDamageTypeOverride
   * @param {number=} param0.attackOverride
   * @param {DamageTypeEnum=} param0.defDamageTypeOverride
   * @param {number=} param0.defenseOverride
   * @param {number=} param0.powerOverride
   * @param {number=} param0.typeEffectivenessOverride
   * @param {PokemonTypeEnum=} param0.moveTypeOverride
   * @param {number=} param0.offTargetDamageMultiplier
   * @param {number=} param0.missedTargetDamageMultiplier
   * @param {number=} param0.backTargetDamageMultiplier
   * @returns {number}
   */
  calculateMoveDamage({
    move,
    target,
    primaryTarget,
    // eslint-disable-next-line no-unused-vars
    allTargets,
    missedTargets = [],
    atkDamageTypeOverride = null,
    attackOverride = null,
    defDamageTypeOverride = null,
    defenseOverride = null,
    powerOverride = null,
    typeEffectivenessOverride = null,
    moveTypeOverride = null,
    offTargetDamageMultiplier = 0.85,
    backTargetDamageMultiplier = 0.85,
    missedTargetDamageMultiplier = 0.6,
  }) {
    const power = powerOverride || move.power;
    const { level } = this;
    const atkDamageType = atkDamageTypeOverride || move.damageType;
    const attackRaw =
      attackOverride ||
      (atkDamageType === damageTypes.PHYSICAL
        ? this.getStat("atk")
        : this.getStat("spa"));
    // modify attack amount -- any attack over 800 is only half as effective
    const attack = attackRaw > 800 ? 800 + (attackRaw - 800) / 2 : attackRaw;

    const defDamageType = defDamageTypeOverride || move.damageType;
    const defense =
      defenseOverride ||
      (defDamageType === damageTypes.PHYSICAL
        ? target.getStat("def")
        : target.getStat("spd"));
    const stab = this.type1 === move.type || this.type2 === move.type ? 1.5 : 1;
    const missMult = missedTargets.includes(target)
      ? missedTargetDamageMultiplier
      : 1;
    const moveType = moveTypeOverride || move.type;
    const typeEffectiveness =
      typeEffectivenessOverride !== null
        ? typeEffectivenessOverride
        : this.getTypeDamageMultiplier(moveType, target);
    // balance type
    let typeMultiplier = 1;
    if (typeEffectiveness >= 4) {
      typeMultiplier = 3;
    } else if (typeEffectiveness >= 2) {
      typeMultiplier = 1.75;
    } else if (typeEffectiveness >= 1) {
      typeMultiplier = 1;
    } else if (typeEffectiveness >= 0.5) {
      typeMultiplier = 0.7;
    } else if (typeEffectiveness >= 0.25) {
      typeMultiplier = 0.45;
    } else {
      typeMultiplier = 0.35;
    }
    const random = Math.random() * (1 - 0.85) + 0.85;
    const burn = this.status.statusId === statusConditions.BURN ? 0.65 : 1;

    let weatherMult = 1;
    if (!this.battle.isWeatherNegated()) {
      const { weather } = this.battle;
      if (weather.weatherId === weatherConditions.SUN) {
        if (move.type === pokemonTypes.FIRE) {
          weatherMult = 1.5;
        } else if (move.type === pokemonTypes.WATER) {
          weatherMult = 0.5;
        }
      } else if (weather.weatherId === weatherConditions.RAIN) {
        if (move.type === pokemonTypes.FIRE) {
          weatherMult = 0.5;
        } else if (move.type === pokemonTypes.WATER) {
          weatherMult = 1.5;
        }
      }
    }

    const maybeOffTargetMult =
      target === primaryTarget || move.targetPattern === targetPatterns.RANDOM
        ? 1
        : offTargetDamageMultiplier;

    let isBackTarget = false;
    // iterate through all rows in front of target. If there is a targetable pokemon, set isBackTarget to true
    const targetParty = this.battle.getPartyForPokemon(target);
    const partyPokemons = targetParty.pokemons;
    const targetRowNum = Math.floor((target.position - 1) / targetParty.cols);
    for (let i = 0; i < targetRowNum; i += 1) {
      const row = partyPokemons.slice(
        i * targetParty.cols,
        (i + 1) * targetParty.cols
      );
      for (const pokemon of row) {
        if (this.battle.isPokemonTargetable(pokemon, move.id)) {
          isBackTarget = true;
          break;
        }
      }
    }
    const maybeBackTargetMult =
      isBackTarget &&
      move.targetPosition !== targetPositions.BACK &&
      move.targetPattern !== targetPatterns.RANDOM
        ? backTargetDamageMultiplier
        : 1;

    /* console.log("power", power)
      console.log("level", level)
      console.log("attack", attack)
      console.log("defense", defense)
      console.log("stab", stab)
      console.log("type", type)
      console.log("random", random) */

    const damage = Math.floor(
      ((((2 * level) / 5 + 2) * power * attack) / defense / 50 + 2) *
        stab *
        typeMultiplier *
        random *
        burn *
        weatherMult *
        missMult *
        maybeOffTargetMult *
        maybeBackTargetMult
    );

    return Math.max(damage, 1);
  }

  /**
   * Called if the Pokemon is the active Pokemon but can't move.
   * @returns {undefined}
   */
  skipTurn() {
    // make sure its this Pokemon's turn
    if (this.battle.activePokemon !== this) {
      return;
    }
    // make sure Pokemon can't move
    if (this.canMove()) {
      return;
    }

    // clear battle log
    this.battle.clearLog();

    // reset combat readiness
    this.combatReadiness = 0;

    // check pre-move status conditions that tick regardless of move
    if (this.status.statusId !== null) {
      switch (this.status.statusId) {
        case statusConditions.FREEZE:
          // thaw chance (turns => chance): 0 => 0%, 1 => 40%, 2 => 80%, 3 => 100%
          const thawChance = this.status.turns * 0.4;
          const thawRoll = Math.random();
          if (thawRoll < thawChance) {
            this.removeStatus();
          }
          break;
        case statusConditions.SLEEP:
          // sleep wakeup chance: 0 turns: 0%, 1 turn: 33%, 2 turns: 66%, 3 turns: 100%
          const wakeupChance = this.status.turns * 0.33;
          const wakeupRoll = Math.random();
          if (wakeupRoll < wakeupChance) {
            this.removeStatus();
          }
          break;
        default:
          break;
      }
    }

    const eventArgs = {
      source: this,
    };
    this.battle.emitEvent(battleEventEnum.AFTER_SKIP_TURN, eventArgs);

    // end turn
    this.battle.nextTurn();
  }

  /**
   * Check that the Pokemon may take a valid action.
   * @returns {boolean}
   */
  canMove() {
    // make sure its this pokemon's turn
    if (this.battle.activePokemon !== this) {
      return false;
    }

    // if fainted, return
    if (this.isFainted) {
      return false;
    }

    // if incapacitated, return
    if (this.incapacitated) {
      return false;
    }

    // for all non-disabled moves not on cooldown, check to see if valid targets exist
    for (const _moveId in this.moveIds) {
      const moveId = /** @type {MoveIdEnum} */ (_moveId);
      if (
        this.moveIds[moveId].disabledCounter > 0 ||
        this.moveIds[moveId].cooldown > 0
      ) {
        continue;
      }
      const eligibleTargets = this.battle.getEligibleTargets(this, moveId);
      if (eligibleTargets.length > 0) {
        return true;
      }
    }

    // if no valid targets exist, return false
    return false;
  }

  /**
   * @param {PokemonTypeEnum} moveType
   * @param {BattlePokemon} targetPokemon
   * @returns {number}
   */
  getTypeDamageMultiplier(moveType, targetPokemon) {
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

    const eventArgs = {
      source: this,
      target: targetPokemon,
      moveType,
      multiplier: mult,
    };
    this.battle.eventHandler.emit(
      battleEventEnum.CALCULATE_TYPE_MULTIPLIER, // This maybe shouldn't be an event. Code run by the NPC should not have possible side-effects
      eventArgs
    );

    return eventArgs.multiplier;
  }

  /**
   * @param {BattleParty} targetParty
   * @param {TargetPatternEnum} targetPattern
   * @param {number} targetPosition
   * @param {object} options
   * @param {MoveIdEnum=} options.moveId
   * @param {boolean=} options.ignoreHittable
   * @returns {BattlePokemon[]} targets
   */
  getPatternTargets(
    targetParty,
    targetPattern,
    targetPosition,
    { moveId = null, ignoreHittable = false } = {}
  ) {
    const targets = [];

    // special case: random
    if (targetPattern === targetPatterns.RANDOM) {
      // return random pokemon in party
      const validPokemons = [];
      for (const pokemon of targetParty.pokemons) {
        if (ignoreHittable || this.battle.isPokemonHittable(pokemon, moveId)) {
          validPokemons.push(pokemon);
        }
      }
      targets.push(
        validPokemons[Math.floor(Math.random() * validPokemons.length)]
      );
    } else {
      const targetIndices = getPatternTargetIndices(
        targetParty,
        targetPattern,
        targetPosition
      );
      for (const index of targetIndices) {
        const target = targetParty.pokemons[index];
        if (
          target &&
          (ignoreHittable || this.battle.isPokemonHittable(target, moveId))
        ) {
          targets.push(target);
        }
      }
    }

    return targets;
  }

  /**
   * @param {MoveIdEnum} moveId
   * @returns {TargetPatternEnum}
   */
  getMovePattern(moveId) {
    let pattern = getMove(moveId)?.targetPattern || targetPatterns.SINGLE;

    // spatial blessing special case
    if (this.effectIds[effectIdEnum.SPATIAL_BLESSING]) {
      switch (pattern) {
        case targetPatterns.SINGLE:
          pattern = targetPatterns.CROSS;
          break;
        case targetPatterns.CROSS:
        case targetPatterns.X:
        case targetPatterns.ROW:
        case targetPatterns.COLUMN:
          pattern = targetPatterns.SQUARE;
          break;
        case targetPatterns.SQUARE:
        case targetPatterns.ALL_EXCEPT_SELF:
          pattern = targetPatterns.ALL;
          break;
        default:
          break;
      }
    }

    return pattern;
  }

  /**
   * Not to be used for exact targetting, only util for now
   * TODO: use move itself?
   * @param {MoveIdEnum} moveId
   * @param {string} targetPokemonId
   * @returns {Record<string, number[]>} map of team name to target indices
   */
  getTargetIndices(moveId, targetPokemonId) {
    const target = this.battle.allPokemon[targetPokemonId];
    if (!target) {
      return {};
    }

    const targetParty = this.battle.parties[target.teamName];

    return {
      [target.teamName]: getPatternTargetIndices(
        targetParty,
        this.getMovePattern(moveId),
        target.position
      ),
    };
  }

  /**
   * @param {MoveIdEnum} moveId
   * @param {BattlePokemon?} target
   * @returns {BattlePokemon[]}
   */
  getMoveExecuteTargets(moveId, target) {
    if (!target) {
      return [];
    }

    // get party of target
    const targetParty = this.battle.parties[target.teamName];

    // TODO: use getTargetIndices?
    return this.getPatternTargets(
      targetParty,
      this.getMovePattern(moveId),
      target.position,
      { moveId }
    );
  }

  /**
   * @param {MoveIdEnum} moveId
   * @param {BattlePokemon[]} targetPokemons
   * @returns {BattlePokemon[]}
   */
  getMisses(moveId, targetPokemons) {
    const moveData = getMove(moveId);
    const misses = [];
    if (!moveData.accuracy) {
      return misses;
    }
    for (const target of targetPokemons) {
      let hitChance =
        (moveData.accuracy * calculateEffectiveAccuracy(this.acc)) /
        calculateEffectiveEvasion(target.eva);
      const damageMult = this.getTypeDamageMultiplier(moveData.type, target);
      if (damageMult >= 4) {
        hitChance *= 1.4;
      } else if (damageMult >= 2) {
        hitChance *= 1.15;
      } else if (damageMult === 0) {
        hitChance = 0;
      } else if (damageMult <= 0.25) {
        hitChance *= 0.6;
      } else if (damageMult <= 0.5) {
        hitChance *= 0.8;
      }

      // weather check
      if (!this.battle.isWeatherNegated()) {
        if (this.battle.weather.weatherId === weatherConditions.SUN) {
          if (
            moveId === "m87" ||
            moveId === "m87-1" ||
            moveId === "m542" ||
            moveId === "m542-1"
          ) {
            hitChance *= 0.75;
          }
        } else if (this.battle.weather.weatherId === weatherConditions.RAIN) {
          if (
            moveId === "m87" ||
            moveId === "m87-1" ||
            moveId === "m542" ||
            moveId === "m542-1"
          ) {
            hitChance = 150;
          }
        } else if (this.battle.weather.weatherId === weatherConditions.HAIL) {
          if (moveId === "m59") {
            hitChance = 150;
          }
        }
      }

      const calculateMissArgs = {
        target,
        hitChance,
        source: this,
      };
      this.battle.eventHandler.emit(
        battleEventEnum.CALCULATE_MISS,
        calculateMissArgs
      );

      if (Math.random() > calculateMissArgs.hitChance / 100) {
        misses.push(target);
      }
    }
    return misses;
  }

  /**
   * Makes the Pokemon switch owners to the given userId.
   * @param {string} userId
   * @returns {boolean}
   */
  switchUsers(userId) {
    if (this.userId === userId) {
      return false;
    }
    // get user info from battle
    const user = this.battle.users[userId];
    if (!user) {
      return false;
    }
    const { teamName } = user;
    if (!teamName) {
      return false;
    }

    // set teamName and userId
    this.teamName = teamName;
    this.userId = userId;

    this.battle.addToLog(`${this.name} switched to ${user.username}'s team!`);

    return true;
  }

  /**
   * @param {string} userId
   * @param {number} newPosition
   * @param {BattlePokemon} source
   * @returns {boolean}
   */
  // eslint-disable-next-line no-unused-vars
  switchPositions(userId, newPosition, source) {
    const currentIndex = this.position - 1;
    const newIndex = newPosition - 1;

    // get user info from battle
    const user = this.battle.users[userId];
    if (!user) {
      return false;
    }
    const newTeamName = user.teamName;
    if (!newTeamName) {
      return false;
    }

    const oldParty = this.battle.parties[this.teamName];
    const newParty = this.battle.parties[newTeamName];
    if (!newParty) {
      return false;
    }

    // check if position is valid
    if (newPosition < 1 || newPosition > newParty.pokemons.length) {
      return false;
    }
    // if pokemon exists in new position, return false
    if (newParty.pokemons[newIndex]) {
      return false;
    }

    // if new team, attempt to switch teams
    if (this.teamName !== newTeamName) {
      if (!this.switchUsers(userId)) {
        return false;
      }
    }

    // remove from old position
    oldParty.pokemons[currentIndex] = null;

    // add to new position
    newParty.pokemons[newIndex] = this;
    this.position = newPosition;

    this.battle.addToLog(
      `${this.name} switched to position to ${newPosition}!`
    );

    return true;
  }

  /**
   * @param {number} damage
   * @param {BattlePokemon} target
   * @param {any} damageInfo TODO: improve damage info
   * @returns {number}
   */
  dealDamage(damage, target, damageInfo) {
    if (damage <= 0) {
      return 0;
    }

    if (damageInfo.type === "recoil") {
      this.battle.addToLog(`${this.name} is affected by recoil!`);
    }

    // if pvp, deal 15% less damage
    if (this.battle.isPvp) {
      damage = Math.max(1, Math.floor(damage * 0.85));
    }

    const eventArgs = {
      target,
      damage,
      source: this,
      damageInfo,
    };

    this.battle.eventHandler.emit(
      battleEventEnum.BEFORE_DAMAGE_DEALT,
      eventArgs
    );
    damage = eventArgs.damage;

    const damageDealt = target.takeDamage(damage, this, damageInfo);

    if (damageDealt > 0) {
      const afterDamageArgs = {
        target,
        damage: damageDealt,
        source: this,
        damageInfo,
      };
      this.battle.eventHandler.emit(
        battleEventEnum.AFTER_DAMAGE_DEALT,
        afterDamageArgs
      );
    }

    return damageDealt;
  }

  /**
   * @param {number} damage
   * @param {BattlePokemon} source
   * @param {any} damageInfo TODO: improve damage info
   * @returns {number}
   */
  takeDamage(damage, source, damageInfo) {
    if (this.isFainted) {
      return 0;
    }

    // if frozen and fire type or scald, thaw and deal 1.5x damage
    const freezeCheck =
      this.status.statusId === statusConditions.FREEZE &&
      damageInfo.type === "move" &&
      getMove(damageInfo.moveId) !== undefined &&
      (getMove(damageInfo.moveId).type === pokemonTypes.FIRE ||
        damageInfo.moveId === "m503");
    if (freezeCheck) {
      if (this.removeStatus()) {
        damage = Math.floor(damage * 1.5);
        this.battle.addToLog(
          `${this.name} Took extra damage because it was frozen!`
        );
      }
    }

    // if sleep and hit with a move, wake up and deal 1.5x damage
    const sleepCheck =
      this.status.statusId === statusConditions.SLEEP &&
      damageInfo.type === "move";
    if (sleepCheck) {
      if (this.removeStatus()) {
        damage = Math.floor(damage * 1.5);
        this.battle.addToLog(`${this.name} Took extra damage while sleeping!`);
      }
    }

    // if shield, take shield damage and return 0
    const shieldData = this.effectIds.shield;
    if (shieldData && shieldData.args && shieldData.args.shield) {
      const shieldDamage = Math.min(damage, shieldData.args.shield);
      shieldData.args.shield -= shieldDamage;

      this.battle.addToLog(
        `${this.name} took ${shieldDamage} shield damage! (${shieldData.args.shield} left)`
      );
      if (shieldData.args.shield <= 0) {
        this.removeEffect("shield");
      }
      return 0;
    }

    const eventArgs = {
      target: this,
      damage,
      source,
      damageInfo,
      maxDamage: Number.MAX_SAFE_INTEGER,
    };

    this.battle.eventHandler.emit(
      battleEventEnum.BEFORE_DAMAGE_TAKEN,
      eventArgs
    );
    damage = Math.min(eventArgs.damage, eventArgs.maxDamage);

    const oldHp = this.hp;
    if (oldHp <= 0 || this.isFainted) {
      return 0;
    }
    this.hp = Math.max(0, this.hp - damage);
    const damageTaken = oldHp - this.hp;
    this.battle.addToLog(`${this.name} took ${damageTaken} damage!`);
    if (this.hp <= 0) {
      this.hp = 0;
      this.faint(source);
    }

    if (damageTaken > 0) {
      const afterDamageArgs = {
        target: this,
        damage: damageTaken,
        source,
        damageInfo,
      };
      this.battle.eventHandler.emit(
        battleEventEnum.AFTER_DAMAGE_TAKEN,
        afterDamageArgs
      );
    }

    return damageTaken;
  }

  /**
   * @param {BattlePokemon} source
   */
  takeFaint(source) {
    if (this.isFainted) {
      return;
    }
    // trigger before cause faint effects
    const beforeCauseFaintArgs = {
      target: this,
      source,
      canFaint: true,
    };
    this.battle.eventHandler.emit(
      battleEventEnum.BEFORE_CAUSE_FAINT,
      beforeCauseFaintArgs
    );
    if (!beforeCauseFaintArgs.canFaint) {
      return;
    }

    this.faint(source);
  }

  /**
   * @param {BattlePokemon} source
   */
  faint(source) {
    // TODO: trigger before faint effects

    this.hp = 0;
    this.isFainted = true;
    this.disableHeldItem();
    this.battle.addToLog(`${this.name} fainted!`);

    // trigger after faint effects
    const afterFaintArgs = {
      target: this,
      source,
    };
    this.battle.eventHandler.emit(battleEventEnum.AFTER_FAINT, afterFaintArgs);
    this.disableAbility();
  }

  /**
   * @param {number} reviveHp
   * @param {BattlePokemon} source
   */
  // eslint-disable-next-line no-unused-vars
  beRevived(reviveHp, source) {
    if (!this.isFainted) {
      return;
    }
    if (reviveHp <= 0) {
      return;
    }

    this.hp = Math.min(this.maxHp, reviveHp);
    this.isFainted = false;
    this.battle.addToLog(`${this.name} was revived!`);

    // re-add ability and held item
    this.applyHeldItem();
    this.applyAbility();
  }

  applyAbility() {
    const { abilityId } = this.ability;
    const abilityData = getAbility(/** @type {AbilityIdEnum} */ (abilityId));
    if (
      !abilityData ||
      !abilityData.abilityAdd ||
      this.ability.applied ||
      this.isFainted
    ) {
      // TODO: not all abilities are implemented
      // logger.error(`Ability ${abilityId} does not exist.`);
      return;
    }

    if (!abilityData.isLegacyAbility) {
      this.ability.data = abilityData.abilityAdd({
        battle: this.battle,
        source: this,
        target: this,
      });
    } else {
      const legacyAbility = /** @type {any} */ (abilityData);
      this.ability.data = legacyAbility.abilityAdd(this.battle, this, this);
    }
    this.ability.applied = true;
  }

  applyHeldItem() {
    const { heldItemId } = this.heldItem;
    const heldItemData = getHeldItem(
      /** @type {HeldItemIdEnum} */ (heldItemId)
    );
    if (
      !heldItemData ||
      !heldItemData.itemAdd ||
      this.heldItem.applied ||
      this.isFainted
    ) {
      return;
    }

    this.heldItem.data = heldItemData.itemAdd({
      battle: this.battle,
      source: this,
      target: this,
    });
    this.heldItem.applied = true;
  }

  /**
   * Prevents the ability from working by triggering abilityRemove
   */
  disableAbility() {
    // remove ability effects
    const { abilityId, applied } = this.ability;
    const abilityData = getAbility(/** @type {AbilityIdEnum} */ (abilityId));
    if (!abilityData || !abilityData.abilityRemove) {
      // TODO: not all abilities are implemented
      // logger.error(`Ability ${abilityId} does not exist.`);
      return;
    }
    if (!abilityId || !applied) {
      logger.error(
        `Ability ${abilityId} is not applied to Pokemon ${this.id} ${this.name}.`
      );
      return;
    }

    if (!abilityData.isLegacyAbility) {
      // @ts-ignore
      abilityData.abilityRemove({
        battle: this.battle,
        source: this,
        target: this,
        properties: this.ability.data,
      });
    } else {
      const legacyAbility = /** @type {any} */ (abilityData);
      legacyAbility.abilityRemove(this.battle, this, this);
    }
    this.ability.applied = false;
  }

  /**
   * Prevents the held item from working by triggering itemRemove
   */
  disableHeldItem() {
    // remove held item effects
    const { heldItemId, applied } = this.heldItem;
    const heldItemData = getHeldItem(
      /** @type {HeldItemIdEnum} */ (heldItemId)
    );
    if (!heldItemData || !heldItemData.itemRemove || !heldItemId) {
      return false;
    }
    if (!applied) {
      logger.error(
        `Held item ${heldItemId} is not applied to Pokemon ${this.id} ${this.name}.`
      );
      return false;
    }

    // @ts-ignore
    heldItemData.itemRemove({
      battle: this.battle,
      source: this,
      target: this,
      properties: this.heldItem.data,
    });
    this.heldItem.applied = false;
    return true;
  }

  /**
   * Disables the pokemon's ability, then resets ability data and removes ability ID
   */
  removeAbility() {
    this.disableAbility();
    this.ability = {
      applied: false,
      data: {},
    };
  }

  /**
   * Disables the pokemon's held item, then resets held item data and removes held item ID
   * @returns {boolean} Whether the held item was removed
   */
  removeHeldItem() {
    const heldItemRemoved = this.disableHeldItem();
    this.heldItem = {
      applied: false,
      data: {},
    };
    if (!heldItemRemoved) {
      return false;
    }

    this.battle.addToLog(`${this.name} lost its held item!`);
    return true;
  }

  /**
   * If usable, uses the held item on the target Pokemon, then removes it if it's used up
   * @param {BattlePokemon=} target
   * @returns {boolean} Whether the held item was used
   */
  useHeldItem(target = this) {
    // remove held item effects
    const { heldItemId } = this.heldItem;
    const heldItemData = getHeldItem(heldItemId);
    if (!heldItemData || !heldItemId) {
      return false;
    }
    if (!heldItemData.tags.includes("usable")) {
      logger.warn(
        `Attempted to use held item ${heldItemId} on ${this.name}, but it is not usable!`
      );
      return false;
    }

    // TODO: disable item before use?
    // @ts-ignore
    heldItemData.itemUse({
      battle: this.battle,
      source: this,
      target,
      properties: this.heldItem.data,
    });
    this.removeHeldItem();

    return true;
  }

  hasAbility(abilityId) {
    return this.ability?.abilityId === abilityId;
  }

  hasActiveAbility(abilityId) {
    return this.ability?.abilityId === abilityId && this.ability.applied;
  }

  hasHeldItem(heldItemId) {
    return this.heldItem?.heldItemId === heldItemId;
  }

  /**
   * @param {number} heal
   * @param {BattlePokemon} target
   * @param {any} healInfo TODO: improve heal info
   * @returns {number}
   */
  giveHeal(heal, target, healInfo) {
    const healGiven = target.takeHeal(heal, this, healInfo);
    return healGiven;
  }

  /**
   * @param {number} heal
   * @param {BattlePokemon} source
   * @param {any} healInfo
   * @returns {number}
   */
  // eslint-disable-next-line no-unused-vars
  takeHeal(heal, source, healInfo) {
    const oldHp = this.hp;
    if (oldHp <= 0 || this.isFainted) {
      return 0;
    }
    this.hp = Math.min(this.maxHp, this.hp + heal);
    const healTaken = this.hp - oldHp;
    if (healTaken > 0) {
      this.battle.addToLog(`${this.name} healed ${healTaken} HP!`);
    }
    return healTaken;
  }

  /**
   * @param {BattlePokemon} source
   * @param {number} amount
   * @param {boolean=} triggerEvents
   * @returns {number} CR boosted
   */
  boostCombatReadiness(source, amount, triggerEvents = true) {
    // if faint, do nothing
    if (this.isFainted) {
      return 0;
    }

    if (this.restricted) {
      this.battle.addToLog(
        `${this.name} is restricted and cannot gain combat readiness!`
      );
      return 0;
    }

    const beforeBoostArgs = {
      target: this,
      source,
      amount,
    };
    if (triggerEvents) {
      this.battle.eventHandler.emit(
        battleEventEnum.BEFORE_CR_GAINED,
        beforeBoostArgs
      );
    }

    const oldCombatReadiness = this.combatReadiness;
    this.combatReadiness = Math.min(
      100,
      this.combatReadiness + beforeBoostArgs.amount
    );
    const combatReadinessGained = this.combatReadiness - oldCombatReadiness;
    this.battle.addToLog(
      `${this.name} gained ${Math.round(
        combatReadinessGained
      )} combat readiness!`
    );

    if (combatReadinessGained > 0 && triggerEvents) {
      const eventArgs = {
        target: this,
        source,
        combatReadinessGained: amount,
      };
      this.battle.eventHandler.emit(battleEventEnum.AFTER_CR_GAINED, eventArgs);
    }

    return combatReadinessGained;
  }

  /**
   * @param {BattlePokemon} source
   * @param {number} amount
   * @returns {number} CR reduced
   */
  reduceCombatReadiness(source, amount) {
    // if faint, do nothing
    if (this.isFainted) {
      return 0;
    }

    const oldCombatReadiness = this.combatReadiness;
    this.combatReadiness = Math.max(0, this.combatReadiness - amount);
    const combatReadinessLost = oldCombatReadiness - this.combatReadiness;
    this.battle.addToLog(
      `${this.name} lost ${Math.round(combatReadinessLost)} combat readiness!`
    );
    return combatReadinessLost;
  }

  /**
   * @template {EffectIdEnum} K
   * @param {K} effectId
   * @param {number} duration
   * @param {BattlePokemon} source
   * @param {EffectInitialArgsTypeFromId<K>} initialArgs
   */
  applyEffect(effectId, duration, source, initialArgs) {
    // if faint, do nothing
    if (this.isFainted) {
      return;
    }
    const effect = getEffect(effectId);
    if (!effect) {
      logger.error(`Effect ${effectId} does not exist.`);
      return;
    }

    duration = this.battle.activePokemon === this ? duration + 1 : duration;

    // if effect already exists for longer or equal duration, do nothing (special case for shield)
    if (
      this.effectIds[effectId] &&
      this.effectIds[effectId].duration >= duration &&
      effectId !== "shield"
    ) {
      return;
    }

    // if effect exists, refresh duration
    // TODO: should this be modified?
    if (this.effectIds[effectId]) {
      duration = Math.max(this.effectIds[effectId].duration, duration);
      this.effectIds[effectId].duration = duration;
      // shield special case
      if (effectId !== "shield") {
        return;
      }
    }

    // trigger before effect add events
    const beforeAddArgs = {
      target: this,
      source,
      effectId,
      duration,
      initialArgs,
      canAdd: true,
    };
    this.battle.eventHandler.emit(
      battleEventEnum.BEFORE_EFFECT_ADD,
      beforeAddArgs
    );
    if (!beforeAddArgs.canAdd) {
      return;
    }
    duration = beforeAddArgs.duration;

    // special case for shield
    let oldShield = {};
    if (effectId === "shield") {
      // if shield already exists, keep note of it
      if (this.effectIds[effectId]) {
        oldShield = this.effectIds[effectId].args;
      }
    }
    this.effectIds[effectId] = {
      duration,
      source,
      initialArgs,
    };
    if (oldShield) {
      this.effectIds[effectId].args = oldShield;
    }

    if (!effect.isLegacyEffect) {
      this.effectIds[effectId].args =
        // @ts-ignore
        effect.effectAdd({
          battle: this.battle,
          source,
          target: this,
          initialArgs,
        }) || {};
    } else {
      const legacyEffect = /** @type {any} */ (effect);
      this.effectIds[effectId].args =
        legacyEffect.effectAdd(this.battle, source, this, initialArgs) || {};
    }

    if (this.effectIds[effectId] !== undefined) {
      // trigger after add effect events
      const afterAddArgs = {
        target: this,
        source,
        effectId,
        duration,
        initialArgs,
        args: this.effectIds[effectId].args,
      };
      this.battle.eventHandler.emit(
        battleEventEnum.AFTER_EFFECT_ADD,
        afterAddArgs
      );
    }
  }

  /**
   * @param {EffectIdEnum} effectId
   * @returns {boolean} whether the effect was dispelled
   */
  dispellEffect(effectId) {
    const effectData = getEffect(effectId);

    // if effect doesn't exist, do nothing
    if (!this.effectIds[effectId]) {
      return false;
    }

    // if effect is not dispellable, do nothing
    if (!effectData.dispellable) {
      return false;
    }

    return this.removeEffect(effectId);
  }

  /**
   * @template {EffectIdEnum} K
   * @param {K} effectId
   * @returns {{
   *  duration: number,
   *  source: BattlePokemon,
   *  initialArgs: K extends keyof RegisteredEffects ? EffectInitialArgsType<RegisteredEffects[K]> : any,
   *  args: K extends keyof RegisteredEffects ? EffectPropertiesType<RegisteredEffects[K]> : any
   * } | undefined}
   */
  getEffectInstance(effectId) {
    // @ts-ignore
    return this.effectIds[effectId];
  }

  /**
   * Forcefully deletes the effect instance from this Pokemon. ONLY USE to bypass effect removal logic.
   * @param {EffectIdEnum} effectId
   */
  deleteEffectInstance(effectId) {
    delete this.effectIds[effectId];
  }

  /**
   * @param {EffectIdEnum} effectId
   */
  removeEffect(effectId) {
    // if effect doesn't exist, do nothing
    const effectInstance = this.getEffectInstance(effectId);
    if (!effectInstance) {
      return false;
    }
    const effect = getEffect(effectId);
    if (!effect) {
      logger.error(`Effect ${effectId} does not exist.`);
      return;
    }

    if (!effect.isLegacyEffect) {
      // @ts-ignore
      effect.effectRemove({
        battle: this.battle,
        source: effectInstance.source,
        duration: effectInstance.duration,
        target: this,
        properties: effectInstance.args,
        initialArgs: effectInstance.initialArgs,
      });
    } else {
      const legacyEffect = /** @type {any} */ (effect);
      legacyEffect.effectRemove(
        this.battle,
        this,
        effectInstance.args,
        effectInstance.initialArgs
      );
    }

    if (this.effectIds[effectId] !== undefined) {
      const afterRemoveArgs = {
        target: this,
        source: effectInstance.source,
        effectId,
        duration: effectInstance.duration,
        initialArgs: effectInstance.initialArgs,
        args: effectInstance.args,
      };
      this.battle.eventHandler.emit(
        battleEventEnum.AFTER_EFFECT_REMOVE,
        afterRemoveArgs
      );
    }

    delete this.effectIds[effectId];
    return true;
  }

  /**
   * @param {StatusConditionEnum} statusId
   * @param {BattlePokemon} source
   * @param {object} options
   * @param {number?=} options.startingTurns
   */
  applyStatus(statusId, source, { startingTurns = 0 } = {}) {
    // if faint, do nothing
    if (this.isFainted) {
      return;
    }

    // if status already exists, do nothing
    if (this.status.statusId) {
      this.battle.addToLog(`${this.name} already has a status condition!`);
      return;
    }

    // trigger before apply status events
    const beforeApplyArgs = {
      target: this,
      source,
      statusId,
      canApply: true,
    };
    this.battle.eventHandler.emit(
      battleEventEnum.BEFORE_STATUS_APPLY,
      beforeApplyArgs
    );
    if (!beforeApplyArgs.canApply) {
      return;
    }

    let statusApplied = false;
    switch (statusId) {
      // TODO: other status effects
      case statusConditions.BURN:
        if (
          this.type1 === pokemonTypes.FIRE ||
          this.type2 === pokemonTypes.FIRE
        ) {
          this.battle.addToLog(
            `${this.name}'s Fire type renders it immune to burns!`
          );
          break;
        }

        this.status = {
          statusId,
          source,
          turns: startingTurns,
        };
        this.battle.addToLog(`${this.name} was burned!`);
        statusApplied = true;
        break;
      case statusConditions.FREEZE:
        if (
          this.type1 === pokemonTypes.ICE ||
          this.type2 === pokemonTypes.ICE
        ) {
          this.battle.addToLog(
            `${this.name}'s Ice type renders it immune to freezing!`
          );
          break;
        }

        if (this.battle.weather.weatherId === weatherConditions.SUN) {
          this.battle.addToLog(
            `${this.name} was protected from freezing by the sun!`
          );
          break;
        }

        this.status = {
          statusId,
          source,
          turns: startingTurns,
        };
        this.battle.addToLog(`${this.name} was frozen!`);
        statusApplied = true;
        break;
      case statusConditions.PARALYSIS:
        if (
          this.type1 === pokemonTypes.ELECTRIC ||
          this.type2 === pokemonTypes.ELECTRIC
        ) {
          this.battle.addToLog(
            `${this.name}'s Electric type renders it immune to paralysis!`
          );
          break;
        }

        // reduce speed by 40%
        this.addStatMult("spe", -0.4);

        this.status = {
          statusId,
          source,
          turns: startingTurns,
        };
        this.battle.addToLog(`${this.name} was paralyzed!`);
        statusApplied = true;
        break;
      case statusConditions.POISON:
        if (
          this.type1 === pokemonTypes.POISON ||
          this.type2 === pokemonTypes.POISON
        ) {
          this.battle.addToLog(
            `${this.name}'s Poison type renders it immune to poison!`
          );
          break;
        }

        this.status = {
          statusId,
          source,
          turns: startingTurns,
        };
        this.battle.addToLog(`${this.name} was poisoned!`);
        statusApplied = true;
        break;
      case statusConditions.SLEEP:
        this.status = {
          statusId,
          source,
          turns: startingTurns,
        };
        this.battle.addToLog(`${this.name} fell asleep!`);
        statusApplied = true;
        break;
      case statusConditions.BADLY_POISON:
        if (
          this.type1 === pokemonTypes.POISON ||
          this.type2 === pokemonTypes.POISON
        ) {
          this.battle.addToLog(
            `${this.name}'s Poison type renders it immune to poison!`
          );
          break;
        }

        this.status = {
          statusId,
          source,
          turns: startingTurns,
        };
        this.battle.addToLog(`${this.name} was badly poisoned!`);
        statusApplied = true;
        break;
      default:
        break;
    }

    if (statusApplied) {
      const afterStatusArgs = {
        target: this,
        source,
        statusId,
      };
      this.battle.eventHandler.emit(
        battleEventEnum.AFTER_STATUS_APPLY,
        afterStatusArgs
      );
    }
  }

  tickStatus() {
    // if status doesn't exist, do nothing
    if (!this.status.statusId) {
      return;
    }

    switch (this.status.statusId) {
      case statusConditions.POISON:
        const damage = Math.round(this.maxHp / 6);
        this.battle.addToLog(`${this.name} is hurt by poison!`);
        this.takeDamage(damage, this.status.source, {
          type: "statusCondition",
          statusId: statusConditions.POISON,
        });
        break;
      case statusConditions.BURN:
        const burnDamage = Math.round(this.maxHp / 8);
        this.battle.addToLog(`${this.name} is hurt by its burn!`);
        this.takeDamage(burnDamage, this.status.source, {
          type: "statusCondition",
          statusId: statusConditions.BURN,
        });
        break;
      case statusConditions.BADLY_POISON:
        const badlyPoisonDamage =
          Math.round(this.maxHp / 6) * 2 ** this.status.turns;
        this.battle.addToLog(`${this.name} is hurt by poison!`);
        this.takeDamage(badlyPoisonDamage, this.status.source, {
          type: "statusCondition",
          statusId: statusConditions.BADLY_POISON,
        });
        break;
      default:
        break;
    }

    this.status.turns += 1;
  }

  /**
   * @returns {boolean} whether the status was removed
   */
  removeStatus() {
    // if status doesn't exist, do nothing
    if (!this.status.statusId) {
      return false;
    }

    // TODO: trigger before remove status events

    switch (this.status.statusId) {
      case statusConditions.BURN:
        this.battle.addToLog(`${this.name} was cured of its burn!`);
        break;
      case statusConditions.FREEZE:
        this.battle.addToLog(`${this.name} was thawed out!`);
        break;
      case statusConditions.PARALYSIS:
        // restore speed
        this.addStatMult("spe", 0.4);

        this.battle.addToLog(`${this.name} was cured of its paralysis!`);
        break;
      case statusConditions.POISON:
      case statusConditions.BADLY_POISON:
        this.battle.addToLog(`${this.name} was cured of its poison!`);
        break;
      case statusConditions.SLEEP:
        this.battle.addToLog(`${this.name} woke up!`);
        break;
      default:
        break;
    }

    this.status = {
      statusId: null,
      turns: 0,
    };

    return true;
  }

  /**
   * @param {MoveIdEnum} moveId
   * @param {BattlePokemon} source
   */
  // eslint-disable-next-line no-unused-vars
  disableMove(moveId, source) {
    // check that move exists
    if (!this.moveIds[moveId]) {
      return;
    }

    // disable move
    this.moveIds[moveId].disabledCounter += 1;
    // this.battle.addToLog(`${this.name}'s ${getMove(moveId).name} was disabled!`);
  }

  /**
   * @param {MoveIdEnum} moveId
   * @param {BattlePokemon} source
   */
  // eslint-disable-next-line no-unused-vars
  enableMove(moveId, source) {
    // check that move exists
    if (!this.moveIds[moveId]) {
      return;
    }
    // enable move
    this.moveIds[moveId].disabledCounter = Math.max(
      0,
      this.moveIds[moveId].disabledCounter - 1
    );
    // this.battle.addToLog(`${this.name}'s ${getMove(moveId).name} is no longer disabled!`);
  }

  /**
   * @param {MoveIdEnum} moveId
   * @returns {boolean}
   */
  removeMove(moveId) {
    if (!this.moveIds[moveId]) {
      return false;
    }

    delete this.moveIds[moveId];
    return true;
  }

  /**
   * @param {MoveIdEnum} moveId
   * @returns {boolean}
   */
  addMove(moveId) {
    if (this.moveIds[moveId]) {
      return false;
    }

    this.moveIds[moveId] = { cooldown: 0, disabledCounter: 0 };
    return true;
  }

  tickEffectDurations() {
    for (const effectId in this.effectIds) {
      this.effectIds[effectId].duration -= 1;
      if (this.effectIds[effectId].duration <= 0) {
        // @ts-ignore
        this.removeEffect(effectId);
      }
    }
  }

  tickMoveCooldowns() {
    for (const moveId in this.moveIds) {
      if (this.moveIds[moveId].cooldown > 0) {
        this.moveIds[moveId].cooldown -= 1;
      }
    }
  }

  /**
   * @param {MoveIdEnum} moveId
   * @param {number} amount
   * @param {BattlePokemon} source
   * @param {boolean=} silenceLog
   */
  reduceMoveCooldown(moveId, amount, source, silenceLog = false) {
    // check that move exists
    if (!this.moveIds[moveId]) {
      return;
    }

    // check that the move is on cooldown
    if (this.moveIds[moveId].cooldown === 0) {
      return;
    }

    // reduce cooldown
    const oldCooldown = this.moveIds[moveId].cooldown;
    this.moveIds[moveId].cooldown -= amount;
    if (this.moveIds[moveId].cooldown < 0) {
      this.moveIds[moveId].cooldown = 0;
    }
    const newCooldown = this.moveIds[moveId].cooldown;

    if (!silenceLog) {
      this.battle.addToLog(
        `${this.name}'s ${getMove(moveId).name}'s cooldown was reduced by ${
          oldCooldown - newCooldown
        } turns!`
      );
    }
    return oldCooldown - newCooldown;
  }

  removeMoveCooldown(moveId, source, silenceLog = false) {
    return this.reduceMoveCooldown(
      moveId,
      this.moveIds[moveId].cooldown,
      source,
      silenceLog
    );
  }

  effectiveSpeed() {
    return calculateEffectiveSpeed(this.getStat("spe"));
  }

  getRowAndColumn() {
    const party = this.battle.parties[this.teamName];
    const row = Math.floor((this.position - 1) / party.cols);
    const col = (this.position - 1) % party.cols;
    return { row, col };
  }

  getParty() {
    return this.battle.parties[this.teamName];
  }

  getPartyPokemon() {
    return this.getParty().pokemons;
  }

  getPartyRowColumn() {
    const party = this.getParty();
    return { party, ...this.getRowAndColumn() };
  }

  getEnemyParty() {
    const teamNames = Object.keys(this.battle.parties);
    const enemyTeamName =
      teamNames[0] === this.teamName ? teamNames[1] : teamNames[0];
    return this.battle.parties[enemyTeamName];
  }

  /**
   * @param {StatIdNoHP} statId
   * @param {number} mult
   */
  addStatMult(statId, mult) {
    const statData = this.allStatData[statId];
    statData.addMult += mult;
    // debug
    this[statId] = this.getStat(statId);
  }

  /**
   * @param {StatIdNoHP} statId
   * @param {number} mult
   */
  multiplyStatMult(statId, mult) {
    const statData = this.allStatData[statId];
    statData.multMult *= mult;
    // debug
    this[statId] = this.getStat(statId);
  }

  /**
   * @param {StatIdNoHP} statId
   * @param {number} boost
   */
  addFlatStatBoost(statId, boost) {
    const statData = this.allStatData[statId];
    statData.flatBoost += boost;
    // debug
    this[statId] = this.getStat(statId);
  }

  /**
   * @param {StatIdNoHP} statId
   */
  getStat(statId) {
    const statData = this.allStatData[statId];
    let stat =
      this[battleStatToBaseStat(statId)] *
        statData.addMult *
        statData.multMult +
      statData.flatBoost;
    stat = Math.max(1, Math.floor(stat));

    // Simple ability: doubles the effect of stat changes
    if (this.hasActiveAbility(abilityIdEnum.SIMPLE)) {
      const baseStat = this[battleStatToBaseStat(statId)];
      const difference = stat - baseStat;
      stat = baseStat + difference * 2;
      stat = Math.max(1, Math.floor(stat));
    }

    switch (statId) {
      case "def":
        // if hail and ice, def * 1.5
        if (
          !this.battle.isWeatherNegated() &&
          this.battle.weather?.weatherId === weatherConditions.HAIL &&
          (this.type1 === pokemonTypes.ICE || this.type2 === pokemonTypes.ICE)
        ) {
          stat = Math.floor(stat * 1.5);
        }

        return stat;
      case "spd":
        // if sandstorm and rock, spd * 1.5
        if (
          !this.battle.isWeatherNegated() &&
          this.battle.weather?.weatherId === weatherConditions.SANDSTORM &&
          (this.type1 === pokemonTypes.ROCK || this.type2 === pokemonTypes.ROCK)
        ) {
          stat = Math.floor(stat * 1.5);
        }

        return stat;
      case "spe":
        if (!this.battle.isWeatherNegated()) {
          if (this.battle.weather?.weatherId === weatherConditions.SUN) {
            if (this.ability && this.ability.abilityId === "34") {
              stat = Math.floor(stat * 1.5);
            }
          } else if (
            this.battle.weather?.weatherId === weatherConditions.RAIN
          ) {
            if (this.ability && this.ability.abilityId === "33") {
              stat = Math.floor(stat * 1.5);
            }
          }
        }

        return stat;
      default:
        return stat;
    }
  }

  /**
   * @returns {StatArray}
   */
  getAllStats() {
    return [
      this.hp,
      this.getStat("atk"),
      this.getStat("def"),
      this.getStat("spa"),
      this.getStat("spd"),
      this.getStat("spe"),
    ];
  }

  /**
   * @returns {StatIdNoHP} statId
   */
  getHighestNonHpStatId() {
    let highestStat = 0;
    let highestStatId = "atk";
    for (const statId of ["atk", "def", "spa", "spd", "spe"]) {
      // @ts-ignore
      const stat = this.getStat(statId);
      if (stat > highestStat) {
        highestStat = stat;
        highestStatId = statId;
      }
    }
    // @ts-ignore
    return highestStatId;
  }

  /**
   * @returns {StatArray}
   */
  getAllBaseStats() {
    return [this.maxHp, this.batk, this.bdef, this.bspa, this.bspd, this.bspe];
  }
}

module.exports = {
  BattlePokemon,
};
