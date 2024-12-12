/* eslint-disable no-case-declarations */
// TODO: probably fix both
/* eslint-disable no-param-reassign */

const { formatMoney } = require("../../utils/utils");
const { types: pokemonTypes } = require("../../config/pokemonConfig");
const {
  targetTypes,
  targetPositions,
  weatherConditions,
} = require("../../config/battleConfig");
const { battleEventEnum } = require("../../enums/battleEnums");
const { getMove } = require("../data/moveRegistry");
const { BattleEventHandler } = require("./events");
const { BattlePokemon } = require("./BattlePokemon");

class Battle {
  /* TODO: fix
  moneyMultiplier;
  expMultiplier;
  pokemonExpMultiplier;
  moneyReward;
  expReward;
  pokemonExpReward;
  winCallback;
  hasStarted;
  userIds;
  users;
  teams;
  activePokemon;
  parties;
  // { weatherId, duration, source }
  weather;
  log;
  eventHandler;
  turn;
  winner;
  ended;
  minLevel;
  level;
  rewards;
  rewardString;
  dailyRewards;
  npcId;
  difficulty;
  isPvp; */

  /**
   * @param {object} param0
   * @param {number?=} param0.moneyMultiplier
   * @param {number?=} param0.expMultiplier
   * @param {number?=} param0.pokemonExpMultiplier
   * @param {number?=} param0.level
   * @param {number?=} param0.equipmentLevel
   * @param {object?=} param0.rewards
   * @param {string?=} param0.rewardString
   * @param {object?=} param0.dailyRewards
   * @param {Function?=} param0.winCallback
   * @param {Function?=} param0.loseCallback
   * @param {string?=} param0.npcId
   * @param {string?=} param0.difficulty
   * @param {boolean?=} param0.isPvp
   */
  constructor({
    moneyMultiplier = 1,
    expMultiplier = 1,
    pokemonExpMultiplier = 0.2,
    level = null,
    equipmentLevel = null,
    rewards = null,
    rewardString = null,
    dailyRewards = null,
    winCallback = null,
    loseCallback = null,
    npcId = null,
    difficulty = null,
    isPvp = false,
  } = {}) {
    // initial
    this.baseMoney = 100;
    this.baseExp = 50;

    this.moneyMultiplier = moneyMultiplier;
    this.expMultiplier = expMultiplier;
    this.pokemonExpMultiplier = pokemonExpMultiplier;
    this.moneyReward = 0;
    this.expReward = 0;
    this.pokemonExpReward = 0;
    this.hasStarted = false;
    /** @type {string[]} */
    this.userIds = [];
    // map userId to user
    /** @type {Record<string, BattleUser>} */
    this.users = {};
    // map teamName to team
    /** @type {Record<string, BattleTeam>} */
    this.teams = {};
    /** @type {BattlePokemon} */
    this.activePokemon = null;
    // map teamName to party
    /** @type {Record<string, BattleParty>} */
    this.parties = {};
    // map pokemonId to pokemon
    /** @type {Record<string, BattlePokemon>} */
    this.allPokemon = {};
    /**
     * @type {{
     *  weatherId?: WeatherConditionEnum,
     *  duration: number,
     *  source?: BattlePokemon
     * }}
     */
    this.weather = {
      weatherId: null,
      duration: 0,
      source: null,
    };
    /** @type {string[]} */
    this.log = [];
    this.eventHandler = new BattleEventHandler();
    this.turn = 0;
    /** @type {string?} */
    this.winner = null;
    this.ended = false;
    if (equipmentLevel) {
      if (equipmentLevel < 1 || equipmentLevel > 10) {
        throw new Error("Invalid equipment level");
      }
      this.equipmentLevel = equipmentLevel;
    }
    if (level) {
      if (level < 1 || level > 100) {
        throw new Error("Invalid level");
      }
      this.level = level;
      this.minLevel = level;
    }
    this.rewards = rewards;
    this.rewardString = rewardString;
    this.dailyRewards = dailyRewards;
    this.npcId = npcId;
    this.difficulty = difficulty;
    this.winCallback = winCallback;
    this.loseCallback = loseCallback;
    this.isPvp = isPvp;
  }

  /**
   * @param {string} teamName
   * @param {boolean} isNpc
   */
  addTeam(teamName, isNpc) {
    this.teams[teamName] = {
      name: teamName,
      isNpc,
      userIds: [],
    };
  }

  /**
   * @param {any} trainer
   * @param {WithId<Pokemon>[]} pokemons
   * @param {string} teamName
   * @param {number=} rows
   * @param {number=} cols
   */
  addTrainer(trainer, pokemons, teamName, rows = 3, cols = 4) {
    // if user already exists, return
    if (this.users[trainer.userId]) {
      return;
    }

    this.teams[teamName].userIds.push(trainer.userId);
    this.users[trainer.userId] = {
      teamName,
      ...trainer.user,
    };
    this.userIds.push(trainer.userId);

    this.addPokemons(trainer, pokemons, teamName, rows, cols);
  }

  /**
   * @param {any} trainer
   * @param {WithId<Pokemon>[]} pokemons
   * @param {string} teamName
   * @param {number} rows
   * @param {number} cols
   */
  addPokemons(trainer, pokemons, teamName, rows, cols) {
    const partyPokemons = [];
    for (const pokemonData of pokemons) {
      if (pokemonData) {
        const pokemonInstance = new BattlePokemon(
          this,
          trainer,
          pokemonData,
          teamName,
          partyPokemons.length + 1
        );
        partyPokemons.push(pokemonInstance);
        this.allPokemon[pokemonInstance.id] = pokemonInstance;
      } else {
        partyPokemons.push(null);
      }
    }
    // TODO: modify if parties can have different num players
    this.parties[teamName] = {
      pokemons: partyPokemons,
      rows,
      cols,
    };
  }

  increaseCombatReadiness() {
    // get min ticks for a pokemon to be ready
    const MAX_CR = 100;
    let minTicks = Number.MAX_SAFE_INTEGER;
    let minTicksPokemon = null;
    for (const partyName in this.parties) {
      const party = this.parties[partyName];
      for (const pokemon of party.pokemons) {
        if (pokemon && !pokemon.isFainted) {
          const requiredCr = MAX_CR - pokemon.combatReadiness;
          const ticks = requiredCr / pokemon.effectiveSpeed();
          if (ticks < minTicks) {
            minTicks = ticks;
            minTicksPokemon = pokemon;
          }
        }
      }
    }

    // set active pokemon
    if (minTicksPokemon) {
      this.activePokemon = minTicksPokemon;
    } else {
      this.activePokemon = null;
      return;
    }

    // if no ticks, return
    if (minTicks === 0) {
      return;
    }

    // increase combat readiness for all pokemon
    for (const partyName in this.parties) {
      const party = this.parties[partyName];
      for (const pokemon of party.pokemons) {
        if (pokemon && !pokemon.isFainted) {
          pokemon.combatReadiness = Math.min(
            MAX_CR,
            pokemon.combatReadiness + pokemon.effectiveSpeed() * minTicks
          );
        }
      }
    }
  }

  start() {
    this.log.push("The battle begins!");
    this.turn = 0;
    this.hasStarted = true;

    // sort all pokemon by speed descending
    const sortedPokemon = Object.values(this.allPokemon);
    sortedPokemon.sort((a, b) => b.getSpe() - a.getSpe());
    this.allPokemon = {};
    for (const pokemon of sortedPokemon) {
      this.allPokemon[pokemon.id] = pokemon;
    }

    // add all abilities
    Object.entries(this.allPokemon).forEach(([, pokemon]) => {
      if (pokemon.ability.applied) {
        return;
      }
      pokemon.applyAbility();
    });

    this.eventHandler.emit(battleEventEnum.BATTLE_BEGIN, {
      battle: this,
    });

    // begin turn
    this.beginTurn();
  }

  beginTurn() {
    // push cr
    this.increaseCombatReadiness();

    // tick move cooldowns
    if (!this.activePokemon.isFainted) {
      this.activePokemon.tickMoveCooldowns();
    }

    // begin turn
    this.eventHandler.emit(battleEventEnum.TURN_BEGIN);

    // log
    const userIsNpc = this.isNpc(this.activePokemon.userId);
    const userString = userIsNpc
      ? this.users[this.activePokemon.userId].username
      : `<@${this.activePokemon.userId}>`;
    if (this.activePokemon.canMove()) {
      this.log.push(
        `**[Turn ${this.turn}] It is ${userString}'s ${this.activePokemon.name}'s turn.**`
      );
    } else {
      this.log.push(
        `**[Turn ${this.turn}] ${userString}'s ${this.activePokemon.name} is unable to move.**`
      );
    }
  }

  nextTurn() {
    // end turn logic
    this.emitEvent(battleEventEnum.TURN_END, {
      activePokemon: this.activePokemon,
    });

    // tick status effects
    if (!this.activePokemon.isFainted) {
      this.activePokemon.tickStatus();
    }

    // tick effects
    if (!this.activePokemon.isFainted) {
      this.activePokemon.tickEffectDurations();
    }

    // tick weather
    if (this.weather) {
      this.tickWeather();
    }

    // increase turn and check for game end
    this.turn += 1;
    if (this.turn > 100) {
      return this.endBattle();
    }
    const undefeatedTeams = [];
    for (const teamName in this.teams) {
      let isTeamDefeated = true;
      for (const pokemon of this.parties[teamName].pokemons) {
        if (pokemon && !pokemon.isFainted) {
          isTeamDefeated = false;
          break;
        }
      }
      if (!isTeamDefeated) {
        undefeatedTeams.push(teamName);
      }
    }
    if (undefeatedTeams.length === 1) {
      [this.winner] = undefeatedTeams;
      return this.endBattle();
    }
    if (undefeatedTeams.length === 0) {
      return this.endBattle();
    }

    // begin turn
    this.beginTurn();
  }

  endBattle() {
    if (this.winner) {
      // get loser, and if any loser has next phase, initialize next phase.
      const loser =
        Object.keys(this.teams)[0] === this.winner
          ? Object.keys(this.teams)[1]
          : Object.keys(this.teams)[0];
      let nextPhase = false;
      for (const userId of this.teams[loser].userIds) {
        const user = this.users[userId];
        if (user.nextPhase !== undefined) {
          const userNextPhase = user.nextPhase(this);
          if (!userNextPhase) {
            continue;
          }
          const { trainer, pokemons, rows, cols } = userNextPhase;

          // clear out all of user's pokemon
          for (const [pokemonId, pokemon] of Object.entries(this.allPokemon)) {
            if (pokemon.userId === userId) {
              delete this.allPokemon[pokemonId];
            }
          }
          // add new pokemon
          this.addPokemons(trainer, pokemons, loser, rows, cols);
          nextPhase = true;
        }
      }
      if (nextPhase) {
        this.addToLog(`**[Phase Complete] A new battle phase begins!**`);
        return this.start();
      }

      let winnerMentions = "";
      if (!this.teams[this.winner].isNpc) {
        winnerMentions = this.teams[this.winner].userIds
          .map((userId) => `<@${userId}>`)
          .join(" ");
      }
      this.addToLog(`**Team ${this.winner} has won! ${winnerMentions}**`);
    } else {
      this.addToLog("**The battle has ended in a draw!**");
    }
    this.ended = true;

    // if winner is npc, no rewards
    if (this.teams[this.winner] && this.teams[this.winner].isNpc) {
      this.addToLog("No rewards were given because the winner is an NPC.");
      return;
    }

    this.moneyReward = Math.floor(this.baseMoney * this.moneyMultiplier);
    this.expReward = Math.floor(this.baseExp * this.expMultiplier);
    // calculate pokemon exp by summing defeated pokemon's levels
    this.pokemonExpReward = Math.floor(
      Object.values(this.allPokemon).reduce((acc, pokemon) => {
        if (pokemon.isFainted) {
          return acc + (this.minLevel || pokemon.level);
        }
        return acc;
      }, 0) * this.pokemonExpMultiplier
    );

    this.addToLog(
      `Winners recieved ${formatMoney(this.moneyReward)}, ${
        this.expReward
      } exp, and ${
        this.pokemonExpReward
      } BASE Pokemon exp. Losers recieved half the amount.`
    );
  }

  /**
   * @param {WeatherConditionEnum} weatherId
   * @param {BattlePokemon} source
   * @returns {boolean}
   */
  createWeather(weatherId, source) {
    // calculate turns = 10 + number of non-fainted Pokemon
    const duration =
      10 +
      Object.values(this.allPokemon).reduce((acc, pokemon) => {
        if (!pokemon.isFainted) {
          return acc + 1;
        }
        return acc;
      }, 0);

    // if weather exists and is same, refresh duration if possible
    if (this.weather.weatherId === weatherId) {
      if (this.weather.duration < duration) {
        this.weather.duration = duration;
        this.weather.source = source;
        this.addToLog(`The weather intensified!`);
        return true;
      }
      return false;
    }

    // apply weather
    this.weather = {
      weatherId,
      duration,
      source,
    };
    switch (weatherId) {
      case weatherConditions.SUN:
        this.addToLog(`The sunlight turned harsh!`);
        break;
      case weatherConditions.RAIN:
        this.addToLog(`It started to rain!`);
        break;
      case weatherConditions.SANDSTORM:
        this.addToLog(`A sandstorm kicked up!`);
        break;
      case weatherConditions.HAIL:
        this.addToLog(`It started to hail!`);
        break;
      default:
        break;
    }

    return true;
  }

  clearWeather() {
    if (this.weather.weatherId) {
      this.addToLog(`The weather cleared up!`);
    }
    this.weather = {
      weatherId: null,
      duration: 0,
      source: null,
    };
  }

  tickWeather() {
    if (!this.weather.weatherId) {
      return;
    }

    if (!this.isWeatherNegated()) {
      switch (this.weather.weatherId) {
        case weatherConditions.SANDSTORM:
          // tick weather for active Pokemon's team
          this.addToLog(`The sandstorm rages!`);
          for (const pokemon of this.parties[this.activePokemon.teamName]
            .pokemons) {
            // if pokemon not targetable, skip
            if (this.isPokemonTargetable(pokemon) === false) {
              continue;
            }
            // if pokemon not rock, steel, or ground, damage 1/16 of max hp
            if (
              pokemon.type1 !== pokemonTypes.ROCK &&
              pokemon.type1 !== pokemonTypes.STEEL &&
              pokemon.type1 !== pokemonTypes.GROUND &&
              pokemon.type2 !== pokemonTypes.ROCK &&
              pokemon.type2 !== pokemonTypes.STEEL &&
              pokemon.type2 !== pokemonTypes.GROUND
            ) {
              pokemon.takeDamage(
                Math.floor(pokemon.maxHp / 16),
                this.weather.source,
                {
                  type: "weather",
                }
              );
            }
          }
          break;
        case weatherConditions.HAIL:
          // tick weather for active Pokemon's team
          this.addToLog(`The hail continues!`);
          for (const pokemon of this.parties[this.activePokemon.teamName]
            .pokemons) {
            // if pokemon not targetable, skip
            if (this.isPokemonTargetable(pokemon) === false) {
              continue;
            }
            // if pokemon not ice, damage 1/16 of max hp
            if (
              pokemon.type1 !== pokemonTypes.ICE &&
              pokemon.type2 !== pokemonTypes.ICE
            ) {
              pokemon.takeDamage(
                Math.floor(pokemon.maxHp / 16),
                this.weather.source,
                {
                  type: "weather",
                }
              );
            }
          }
          break;
        default:
          break;
      }
    }

    this.weather.duration -= 1;
    if (this.weather.duration <= 0) {
      this.clearWeather();
    }
  }

  /**
   * @returns {boolean}
   */
  isWeatherNegated() {
    // for all non-fainted pokemon, check if they have cloud nine or air lock
    for (const pokemon of Object.values(this.allPokemon)) {
      if (pokemon.isFainted) {
        continue;
      }

      if (
        pokemon.ability.abilityId === "13" ||
        pokemon.ability.abilityId === "76"
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {string} userId
   * @returns {boolean}
   */
  isNpc(userId) {
    const user = this.users[userId];
    return user?.npc !== undefined;
  }

  /**
   * @param {BattlePokemon} source
   * @param {MoveIdEnum} moveId
   * @returns {BattlePokemon[]}
   */
  getEligibleTargets(source, moveId) {
    const moveData = getMove(moveId);
    const eligibleTargets = [];
    const eventArgs = {
      user: source,
      moveId,
      eligibleTargets,
      shouldReturn: false,
    };
    this.eventHandler.emit(battleEventEnum.GET_ELIGIBLE_TARGETS, eventArgs);
    if (eventArgs.shouldReturn) {
      return eligibleTargets;
    }

    let targetParty = null;
    // use target type to get party
    switch (moveData.targetType) {
      case targetTypes.ALLY:
        targetParty = this.parties[source.teamName];
        break;
      case targetTypes.ENEMY:
        for (const teamName in this.parties) {
          if (teamName !== source.teamName) {
            targetParty = this.parties[teamName];
            break;
          }
        }
        break;
      default:
        // return all pokemon
        for (const teamName in this.parties) {
          const party = this.parties[teamName];
          for (const pokemon of party.pokemons) {
            if (this.isPokemonTargetable(pokemon, moveId)) {
              eligibleTargets.push(pokemon);
            }
          }
        }
        return eligibleTargets;
    }

    // use target position to get valid targets
    let index;
    switch (moveData.targetPosition) {
      case targetPositions.SELF:
        eligibleTargets.push(source);
        break;
      case targetPositions.NON_SELF:
        for (const pokemon of targetParty.pokemons) {
          if (this.isPokemonTargetable(pokemon, moveId) && pokemon !== source) {
            eligibleTargets.push(pokemon);
          }
        }
        break;
      case targetPositions.FRONT:
        // break up party into rows
        // if pokemons exist in row, add to eligible targets
        // if all pokemon in front row fainted or nonexistent, move to next row

        index = 0;
        for (let i = 0; i < targetParty.rows; i += 1) {
          let pokemonFound = false;
          for (let j = 0; j < targetParty.cols; j += 1) {
            const pokemon = targetParty.pokemons[index];
            if (this.isPokemonTargetable(pokemon, moveId)) {
              pokemonFound = true;
              eligibleTargets.push(pokemon);
            }
            index += 1;
          }
          if (pokemonFound) {
            break;
          }
        }
        break;
      case targetPositions.BACK:
        // break up party into rows
        // if pokemons exist in back row, add to eligible targets
        // if all pokemon in back row fainted or nonexistent, move to next row
        index = targetParty.pokemons.length - 1;
        for (let i = targetParty.rows - 1; i >= 0; i -= 1) {
          let pokemonFound = false;
          for (let j = targetParty.cols - 1; j >= 0; j -= 1) {
            const pokemon = targetParty.pokemons[index];
            if (this.isPokemonTargetable(pokemon, moveId)) {
              pokemonFound = true;
              eligibleTargets.push(pokemon);
            }
            index -= 1;
          }
          if (pokemonFound) {
            break;
          }
        }
        break;
      default:
        // return all pokemon in party
        for (const pokemon of targetParty.pokemons) {
          if (this.isPokemonTargetable(pokemon, moveId)) {
            eligibleTargets.push(pokemon);
          }
        }
        break;
    }

    return eligibleTargets;
  }

  /**
   * TODO: move to pokemon
   * @param {BattlePokemon} pokemon
   * @param {MoveIdEnum} moveId
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  isPokemonTargetable(pokemon, moveId = null) {
    if (!pokemon || pokemon.isFainted) {
      return false;
    }

    if (!pokemon.targetable) {
      // special cases
      // TODO: should this be an event listener?

      // eq + dig
      if (moveId === "m89" && pokemon.effectIds.burrowed !== undefined) {
        return true;
      }

      // bounce + thunder or gust or smackdown
      if (
        (moveId === "m87" ||
          moveId === "m87-1" ||
          moveId === "m16" ||
          moveId === "m479") &&
        pokemon.effectIds.sprungUp !== undefined
      ) {
        return true;
      }

      return false;
    }

    return true;
  }

  /**
   * TODO: move to pokemon
   * @param {BattlePokemon} pokemon
   * @param {MoveIdEnum} moveId
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  isPokemonHittable(pokemon, moveId = null) {
    if (!pokemon || pokemon.isFainted) {
      return false;
    }

    if (!pokemon.hittable) {
      // special cases
      // TODO: should this be an event listener?

      // eq + dig
      if (moveId === "m89" && pokemon.effectIds.burrowed !== undefined) {
        return true;
      }

      // bounce + thunder or gust or smackdown
      if (
        (moveId === "m87" ||
          moveId === "m87-1" ||
          moveId === "m16" ||
          moveId === "m479") &&
        pokemon.effectIds.sprungUp !== undefined
      ) {
        return true;
      }

      return false;
    }

    return true;
  }

  /**
   * @template {BattleEventEnum} K
   * @param {object} param0
   * @param {K} param0.eventName
   * @param {BattleEventListenerCallback<K>} param0.callback
   * @param {BattleEventListenerConditionCallback<K>=} param0.conditionCallback function that returns true if the event should be executed. If undefined, always execute for event.
   * @returns {string} listenerId
   */
  registerListenerFunction({ eventName, callback, conditionCallback }) {
    return this.eventHandler.registerListener(eventName, {
      isNewListener: true,
      execute: callback,
      conditionCallback,
    });
  }

  /**
   * @param {string?=} listenerId
   */
  unregisterListener(listenerId) {
    if (!listenerId) {
      return;
    }
    this.eventHandler.unregisterListener(listenerId);
  }

  /**
   * @template {BattleEventEnum} K
   * @param {K} eventName
   * @param {BattleEventArgsWithoutEventName<K>} args
   */
  emitEvent(eventName, args) {
    this.eventHandler.emit(eventName, args || {});
  }

  clearLog() {
    this.log = [];
  }

  /**
   * @param {string} message
   */
  addToLog(message) {
    this.log.push(message);
  }
}

module.exports = {
  Battle,
};
