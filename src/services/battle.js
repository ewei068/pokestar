/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * battle.js Handles all battle interactions from the user at a base level down to creating the teams.
*/
const { getOrSetDefault, formatMoney } = require("../utils/utils");
const { v4: uuidv4, v4 } = require('uuid');
const { pokemonConfig, types } = require('../config/pokemonConfig');
const { battleEventNames, moveExecutes, moveConfig, targetTypes, targetPatterns, targetPositions, effectConfig, statusConditions, moveTiers, calculateDamage, abilityConfig, typeAdvantages, weatherConditions } = require("../config/battleConfig");
const { buildBattleEmbed, buildBattleMovesetEmbed, buildPveListEmbed, buildPveNpcEmbed, buildDungeonListEmbed, buildDungeonEmbed, buildBattleTowerEmbed } = require("../embeds/battleEmbeds");
const { buildSelectBattleMoveRow } = require("../components/selectBattleMoveRow");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildBattleInfoActionRow } = require("../components/battleInfoActionRow");
const { getTrainer, addExpAndMoney, updateTrainer } = require("./trainer");
const { addPokemonExpAndEVs, getPokemon, calculatePokemonStats } = require("./pokemon");
const { logger } = require("../log");
const { buildNextTurnActionRow } = require("../components/battleNextTurnRow");
const { deleteState } = require("./state");
const { calculateEffectiveSpeed, calculateEffectiveAccuracy, calculateEffectiveEvasion, getMoveIds } = require("../utils/pokemonUtils");
const { npcConfig, difficultyConfig, dungeons, dungeonConfig, battleTowerConfig } = require("../config/npcConfig");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { getState } = require("./state");
const { eventNames } = require("../config/eventConfig");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { drawIterable, drawUniform, drawDiscrete } = require("../utils/gachaUtils");
const { generateRandomPokemon } = require("./gacha");
const { validateParty } = require("./party");
const { addRewards, getRewardsString, flattenCategories, flattenRewards } = require("../utils/trainerUtils");
const { getIdFromTowerStage } = require("../utils/battleUtils");

class NPC {
    userId;
    user;
    party;

    constructor(npcData, difficulty) {
        const difficultyData = difficultyConfig[difficulty];
        this.userId = uuidv4();
        this.user = {
            username: npcData.name,
            discriminator: '0',
            npc: this,
            id: this.userId,
            // data: npcData,
            // difficulty: difficulty,
        };

        // this.setPokemon(npcData, difficulty);
    }

    setPokemon(npcData, difficulty) {
        const npcDifficultyData = npcData.difficulties[difficulty];
        this.party = {
            rows: 3,
            cols: 4,
            pokemons: [
                null, null, null, null, 
                null, null, null, null, 
                null, null, null, null
            ],
        };
        
        // generate party
        // generate numPokemon - 1 pokemon, then 1 for the ace
        const numPokemon = npcDifficultyData.numPokemon;
        const pokemons = [];
        const pokemonIds = drawIterable(npcDifficultyData.pokemonIds, numPokemon - 1);
        for (const pokemonId of pokemonIds) {
            const pokemon = generateRandomPokemon(this.userId, pokemonId, drawUniform(npcDifficultyData.minLevel, npcDifficultyData.maxLevel, 1)[0]);
            // give random id
            pokemon._id = uuidv4();
            pokemons.push(pokemon);
        }
        // push ace
        const acePokemon = generateRandomPokemon(this.userId, npcDifficultyData.aceId, npcDifficultyData.maxLevel + 1);
        acePokemon._id = uuidv4();
        pokemons.push(acePokemon);

        // put parties in random indices with no overlap
        let i = 0;
        while (i < numPokemon) {
            const index = drawUniform(0, this.party.rows * this.party.cols - 1, 1)[0];
            if (this.party.pokemons[index] === null) {
                this.party.pokemons[index] = pokemons[i];
                i++;
            }
        }
    }

    action(battle) {
        const activePokemon = battle.activePokemon;
        if (activePokemon.userId !== this.userId) {
            return;
        }

        /* steps:
        if cant move, skip turn
        get all moves filtered by those with eligible targets and usable
        for all considered moves, get the best move
        best move/target: for all targets:
            get how many targets would be hit by AoE
            calculate heuristic
                if move does damage, calculate damage that would be dealt
                else, calculate heuristic = numTargets * source level * 1.5
            normalize heuristic by move accuracy, or *1.2 if move has no accuracy
            normalize heuristic by move tier
        choose best move & target based off heuristic
        use move */

        // if cant move, skip turn
        if (!activePokemon.canMove()) {
            activePokemon.skipTurn();
            return;
        }

        // get all moves filtered by those with eligible targets and usable
        const moveIds = activePokemon.moveIds;
        const validMoveIdsToTargets = {};
        Object.entries(moveIds).forEach(([moveId, move]) => {
            if (move.disabled || move.cooldown > 0) {
                return;
            }

            const eligibleTargets = battle.getEligibleTargets(activePokemon, moveId);
            if (eligibleTargets.length > 0) {
                validMoveIdsToTargets[moveId] = eligibleTargets;
            }
        });

        // if for some reason no moves exist, skip turn
        if (Object.keys(validMoveIdsToTargets).length === 0) {
            activePokemon.skipTurn();
            return;
        }

        // for all considered moves, get the best move
        let bestMoveId = null;
        let bestTarget = null;
        let bestHeuristic = -1;
        for (const moveId in validMoveIdsToTargets) {
            for (const target of validMoveIdsToTargets[moveId]) {
                const source = activePokemon;
                const targetsHit = source.getTargets(moveId, target.id);
                const heuristic = this.calculateHeuristic(moveId, source, targetsHit);
                if (heuristic > bestHeuristic) {
                    bestMoveId = moveId;
                    bestTarget = target;
                    bestHeuristic = heuristic;
                }
            }
        }

        // use move
        activePokemon.useMove(bestMoveId, bestTarget.id);
    }

    calculateHeuristic(moveId, source, targetsHit) {
        const moveData = moveConfig[moveId];

        let heuristic = 0;
        // special case: if asleep and sleep talk, use sleep talk
        if (source.status.statusId === statusConditions.SLEEP && moveId === "m214") {
            return 1000000;
        }
        // special case: if move is rocket thievery and enemy team has no fainted pokemon, return 0
        if (moveId === "m20003") {
            const enemyParty = source.getEnemyParty();
            if (enemyParty && enemyParty.pokemons && enemyParty.pokemons.filter(p => p && p.isFainted).length === 0) {
                return 0;
            }
        }
        // special case: if move is gear fifth, use if under 25% hp
        if (moveId === "m20010") {
            if (source.hp / source.maxHp > 0.25) {
                return 0;
            } else {
                return 1000000;
            }
        }

        if (moveData.power !== null) {
            // if move does damage, calculate damage that would be dealt
            for (const target of targetsHit) {
                const damage = calculateDamage(moveData, source, target, false);
                heuristic += damage;
            }
        } else {
            // else, calculate heuristic = numTargets * source level * 1.5
            heuristic = targetsHit.length * source.level * 1.5;
        }
        // normalize heuristic by move accuracy, or *1.2 if move has no accuracy
        const accuracy = moveData.accuracy;
        heuristic *= accuracy === null ? 1.2 : accuracy / 100;

        // multiply heuristic by move tier. basic = 0.7, power = 1, ultimate = 1.5
        const moveTier = moveData.tier;
        heuristic *= moveTier === moveTiers.BASIC ? 0.7 : (moveTier === moveTiers.POWER ? 1 : 1.5);

        // calculate nonce for small random variation
        const nonce = Math.random();
        return heuristic + nonce;
    }
}

class DungeonNPC extends NPC {
    constructor(dungeonData, difficulty) {
        super(dungeonData, difficulty);
        this.phaseNumber = 0;
        this.phases = dungeonData.difficulties[difficulty].phases;
        this.dungeonData = dungeonData;
        this.difficulty = difficulty;
        // suuper hacky, probably a better way to do this
        this.user.nextPhase = (battle) => this.nextPhase(battle);
    }

    setPokemon(dungeonData, difficulty) {
        const dungeonDifficultyData = dungeonData.difficulties[difficulty];
        const phase = this.phases[this.phaseNumber];
        if (phase === undefined) {
            return;
        }
        this.party = {
            rows: phase.rows,
            cols: phase.cols,
            pokemons: Array(phase.rows * phase.cols).fill(null)
        };
        
        // generate party
        for (const pokemonData of phase.pokemons) {
            const pokemon = generateRandomPokemon(this.userId, pokemonData.speciesId, pokemonData.level);
            // give random id
            pokemon._id = uuidv4();
            this.party.pokemons[pokemonData.position - 1] = pokemon;
        }
    }

    nextPhase(battle) {
        this.phaseNumber++;
        if (this.phaseNumber >= this.phases.length) {
            return false;
        }
        this.setPokemon(this.dungeonData, this.difficulty);

        return {
            trainer: this,
            ...this.party
        }
    }
}

class TowerNPC extends NPC {
    constructor(towerData, difficulty) {
        const npcData = npcConfig[towerData.npcId];
        super(npcData, difficulty);
    }

    setPokemon(towerData, difficulty) {
        const npcData = npcConfig[towerData.npcId];
        const npcDifficultyData = npcData.difficulties[difficulty];
        this.party = {
            rows: 3,
            cols: 4,
            pokemons: [
                null, null, null, null, 
                null, null, null, null, 
                null, null, null, null
            ],
        };
        
        // generate party
        // generate numPokemon - 1 pokemon, then 1 for the ace
        const numPokemon = npcDifficultyData.numPokemon;
        const pokemons = [];
        const pokemonIds = drawIterable(npcDifficultyData.pokemonIds, numPokemon - 1);
        for (const pokemonId of pokemonIds) {
            const pokemon = generateRandomPokemon(this.userId, pokemonId, drawUniform(towerData.minLevel, towerData.maxLevel, 1)[0]);
            // give random id
            pokemon._id = uuidv4();
            pokemons.push(pokemon);
        }
        // push ace
        const acePokemon = generateRandomPokemon(this.userId, npcDifficultyData.aceId, towerData.maxLevel + 1);
        acePokemon._id = uuidv4();
        pokemons.push(acePokemon);

        // put parties in random indices with no overlap
        let i = 0;
        while (i < numPokemon) {
            const index = drawUniform(0, this.party.rows * this.party.cols - 1, 1)[0];
            if (this.party.pokemons[index] === null) {
                this.party.pokemons[index] = pokemons[i];
                i++;
            }
        }
    }
}

class Battle {
    baseMoney=100;
    baseExp=50;
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
    isPvp;

    constructor({ 
        moneyMultiplier=1, 
        expMultiplier=1, 
        pokemonExpMultiplier=0.2,
        level=null,
        equipmentLevel=null,
        rewards=null,
        rewardString=null,
        dailyRewards=null,
        winCallback=null,
        npcId=null,
        difficulty=null,
        isPvp=false
    } = {}) {
        this.moneyMultiplier = moneyMultiplier;
        this.expMultiplier = expMultiplier;
        this.pokemonExpMultiplier = pokemonExpMultiplier;
        this.moneyReward = 0;
        this.expReward = 0;
        this.pokemonExpReward = 0;
        this.hasStarted = false;
        this.userIds = [];
        // map userId to user
        this.users = {};
        // map teamName to team
        this.teams = {};
        this.activePokemon = null;
        // map teamName to party
        this.parties = {};
        // map pokemonId to pokemon
        this.allPokemon = {};
        this.weather = {
            weatherId: null,
            duration: 0,
            source: null
        }
        this.log = [];
        this.eventHandler = new BattleEventHandler(this);
        this.turn = 0;
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
        this.isPvp = isPvp;
    }
    
    addTeam(teamName, isNpc) {
        this.teams[teamName] = {
            name: teamName,
            isNpc: isNpc,
            userIds: [],
        }
    }

    addTrainer(trainer, pokemons, teamName, rows=3, cols=4) {
        // if user already exists, return
        if (this.users[trainer.userId]) {
            return;
        }

        this.teams[teamName].userIds.push(trainer.userId);
        this.users[trainer.userId] = {
            teamName: teamName,
            ...trainer.user
        }
        this.userIds.push(trainer.userId);

        this.addPokemons(trainer, pokemons, teamName, rows, cols);
    }

    addPokemons(trainer, pokemons, teamName, rows, cols) {
        const partyPokemons = []
        for (const pokemonData of pokemons) {
            if (pokemonData) {
                const pokemonInstance = new Pokemon(this, trainer, pokemonData, teamName, partyPokemons.length + 1);
                partyPokemons.push(pokemonInstance);
                this.allPokemon[pokemonInstance.id] = pokemonInstance;
            } else {
                partyPokemons.push(null);
            }
        }
        // TODO: modify if parties can have different num players
        this.parties[teamName] = {
            pokemons: partyPokemons,
            rows: rows,
            cols: cols,
        }
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
        if (minTicks == 0) {
            return;
        }

        // increase combat readiness for all pokemon
        for (const partyName in this.parties) {
            const party = this.parties[partyName];
            for (const pokemon of party.pokemons) {
                if (pokemon && !pokemon.isFainted) {
                    pokemon.combatReadiness = Math.min(MAX_CR, pokemon.combatReadiness + pokemon.effectiveSpeed() * minTicks);
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
        sortedPokemon.sort((a, b) => {
            return b.getSpe() - a.getSpe();
        });
        this.allPokemon = {};
        for (const pokemon of sortedPokemon) {
            this.allPokemon[pokemon.id] = pokemon;
        }

        // add all abilities
        Object.entries(this.allPokemon).forEach(([pokemonId, pokemon]) => {
            if (pokemon.ability.applied) {
                return;
            }
            pokemon.applyAbility();
        });

        this.eventHandler.emit(battleEventNames.BATTLE_BEGIN, {
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
        this.eventHandler.emit(battleEventNames.TURN_BEGIN);

        // log
        const userIsNpc = this.isNpc(this.activePokemon.userId);
        const userString = userIsNpc ? this.users[this.activePokemon.userId].username : `<@${this.activePokemon.userId}>`;
        if (this.activePokemon.canMove()) {
            this.log.push(`**[Turn ${this.turn}] It is ${userString}'s ${this.activePokemon.name}'s turn.**`);
        } else {
            this.log.push(`**[Turn ${this.turn}] ${userString}'s ${this.activePokemon.name} is unable to move.**`);
        }
    }

    nextTurn() {
        // end turn logic
        this.eventHandler.emit(battleEventNames.TURN_END);

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
        this.turn++;
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
            this.winner = undefeatedTeams[0];
            return this.endBattle();
        } else if (undefeatedTeams.length === 0) {
            return this.endBattle();
        }

        // begin turn
        this.beginTurn();
    }

    endBattle() {
        if (this.winner) {
            // get loser, and if any loser has next phase, initialize next phase.
            const loser = Object.keys(this.teams)[0] == this.winner ? Object.keys(this.teams)[1] : Object.keys(this.teams)[0];
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
                winnerMentions = this.teams[this.winner].userIds.map(userId => `<@${userId}>`).join(" ");
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
        this.pokemonExpReward = Math.floor(Object.values(this.allPokemon).reduce((acc, pokemon) => {
            if (pokemon.isFainted) {
                return acc + (this.minLevel || pokemon.level);
            } else {
                return acc;
            }
        }, 0) * this.pokemonExpMultiplier);

        this.addToLog(`Winners recieved ${formatMoney(this.moneyReward)}, ${this.expReward} exp, and ${this.pokemonExpReward} BASE Pokemon exp. Losers recieved half the amount.`);
    }

    createWeather(weatherId, source) {
        // calculate turns = 10 + number of non-fainted Pokemon
        const duration = 10 + Object.values(this.allPokemon).reduce((acc, pokemon) => {
            if (!pokemon.isFainted) {
                return acc + 1;
            } else {
                return acc;
            }
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
            weatherId: weatherId,
            duration: duration,
            source: source
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
            source: null
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
                    for (const pokemon of this.parties[this.activePokemon.teamName].pokemons) {
                        // if pokemon not targetable, skip
                        if (this.isPokemonTargetable(pokemon) === false) {
                            continue;
                        }
                        // if pokemon not rock, steel, or ground, damage 1/16 of max hp
                        if (
                            pokemon.type1 !== types.ROCK &&
                            pokemon.type1 !== types.STEEL &&
                            pokemon.type1 !== types.GROUND &&
                            pokemon.type2 !== types.ROCK &&
                            pokemon.type2 !== types.STEEL &&
                            pokemon.type2 !== types.GROUND
                        ) {
                            pokemon.takeDamage(
                                Math.floor(pokemon.maxHp / 16), 
                                this.weather.source,
                                {
                                    "type": "weather",
                                }
                            );
                        }
                    }
                    break;
                case weatherConditions.HAIL:
                    // tick weather for active Pokemon's team
                    this.addToLog(`The hail continues!`);
                    for (const pokemon of this.parties[this.activePokemon.teamName].pokemons) {
                        // if pokemon not targetable, skip
                        if (this.isPokemonTargetable(pokemon) === false) {
                            continue;
                        }
                        // if pokemon not ice, damage 1/16 of max hp
                        if (
                            pokemon.type1 !== types.ICE &&
                            pokemon.type2 !== types.ICE
                        ) {
                            pokemon.takeDamage(
                                Math.floor(pokemon.maxHp / 16), 
                                this.weather.source,
                                {
                                    "type": "weather",
                                }
                            );
                        }
                    }
                    break;
            }
        }

        this.weather.duration--;
        if (this.weather.duration <= 0) {
            this.clearWeather();
        }
    }

    isWeatherNegated() {
        // for all non-fainted pokemon, check if they have cloud nine or air lock
        for (const pokemon of Object.values(this.allPokemon)) {
            if (pokemon.isFainted) {
                continue;
            }

            if (pokemon.ability.abilityId === "13" || pokemon.ability.abilityId === "76") {
                return true;
            }
        }

        return false;
    }
        
    isNpc(userId) {
        const user = this.users[userId];
        return user.npc !== undefined;
    }

    getEligibleTargets(source, moveId) {
        const moveData = moveConfig[moveId];
        const eligibleTargets = [];
        const eventArgs = {
            user: source,
            moveId: moveId,
            eligibleTargets: eligibleTargets,
            shouldReturn: false
        };
        this.eventHandler.emit(battleEventNames.GET_ELIGIBLE_TARGETS, eventArgs);
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
                for (let i = 0; i < targetParty.rows; i++) {
                    let pokemonFound = false;
                    for (let j = 0; j < targetParty.cols; j++) {
                        const pokemon = targetParty.pokemons[index];
                        if (this.isPokemonTargetable(pokemon, moveId)) {
                            pokemonFound = true;
                            eligibleTargets.push(pokemon);
                        }
                        index++;
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
                for (let i = targetParty.rows - 1; i >= 0; i--) {
                    let pokemonFound = false;
                    for (let j = targetParty.cols - 1; j >= 0; j--) {
                        const pokemon = targetParty.pokemons[index];
                        if (this.isPokemonTargetable(pokemon, moveId)) {
                            pokemonFound = true;
                            eligibleTargets.push(pokemon);
                        }
                        index--;
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

    isPokemonTargetable(pokemon, moveId=null) {
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
            if ((moveId === "m87" || moveId === "m87-1" || moveId === "m16" || moveId === "m479") && pokemon.effectIds.sprungUp !== undefined) {
                return true;
            }

            return false;
        }

        return true;
    }

    isPokemonHittable(pokemon, moveId=null) {
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
            if ((moveId === "m87" || moveId === "m87-1" || moveId === "m16" || moveId === "m479") && pokemon.effectIds.sprungUp !== undefined) {
                return true;
            }

            return false;
        }

        return true;
    }

    clearLog() {
        this.log = [];
    }

    addToLog(message) {
        this.log.push(message);
    }

}

class Pokemon {
    battle;
    pokemonData;
    speciesId;
    speciesData;
    id;
    userId;
    originalUserId;
    teamName;
    name;
    level;
    hp;
    maxHp;
    atk;
    batk;
    def;
    bdef;
    spa;
    bspa;
    spd;
    bspd;
    spe;
    bspe;
    acc;
    eva;
    type1;
    type2;
    // effectId => { duration, args }
    effectIds;
    // moveId => { cooldown, disabled }
    moveIds;
    // { statusId. tuns active }
    status;
    // { abilityId, args }
    ability;
    combatReadiness;
    position;
    isFainted;
    targetable;
    hittable;
    incapacitated;
    restricted;

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
        this.hp = pokemonData.stats[0];
        this.maxHp = this.hp;
        this.level = pokemonData.level;
        this.atk = pokemonData.stats[1];
        this.batk = pokemonData.stats[1];
        this.def = pokemonData.stats[2];
        this.bdef = pokemonData.stats[2];
        this.spa = pokemonData.stats[3];
        this.bspa = pokemonData.stats[3];
        this.spd = pokemonData.stats[4];
        this.bspd = pokemonData.stats[4];
        this.spe = pokemonData.stats[5];
        this.bspe = pokemonData.stats[5];
        this.acc = 100;
        this.eva = 100;
        this.type1 = this.speciesData.type[0];
        this.type2 = this.speciesData.type[1] || null;
        // map effectId => effect data (duration, args)
        this.effectIds = {};
        // map moveId => move data (cooldown, disabled)
        this.addMoves(pokemonData);
        this.addAbility(pokemonData);
        this.status = {
            statusId: null,
            turns: 0,
        }
        this.combatReadiness = 0;
        this.position = position;
        this.isFainted = false;
        this.targetable = true;
        this.hittable = true;
        this.incapacitated = false;
        this.restricted = false;
    }

    addMoves(pokemonData) {
        this.moveIds = getMoveIds(pokemonData).reduce((acc, moveId) => {
            acc[moveId] = {
                cooldown: 0,
                disabled: false,
            };
            return acc;
        }, {});
    }

    addAbility(pokemonData) {
        this.ability = {
            abilityId: pokemonData.abilityId,
        }
    }

    transformInto(speciesId, { abilityId=null, moveIds=[] }={}) {
        const oldName = this.name;
        // remove ability
        this.removeAbility();

        // get old stat ratios (excpet hp)
        const atkRatio = this.atk / this.batk;
        const defRatio = this.def / this.bdef;
        const spaRatio = this.spa / this.bspa;
        const spdRatio = this.spd / this.bspd;
        const speRatio = this.spe / this.bspe;

        // set new species values
        this.speciesId = speciesId;
        this.speciesData = pokemonConfig[this.speciesId];
        this.type1 = this.speciesData.type[0];
        this.type2 = this.speciesData.type[1] || null;
        this.name = this.speciesData.name;

        // set pokemon data object
        this.pokemonData.speciesId = this.speciesId;
        this.pokemonData.name = this.speciesData.name;
        this.pokemonData.moveIds = moveIds;
        this.pokemonData.abilityId = abilityId || drawDiscrete(this.speciesData.abilities, 1)[0];
        calculatePokemonStats(this.pokemonData, this.speciesData);

        // set stats (except hp)
        this.atk = Math.round(this.pokemonData.stats[1] * atkRatio);
        this.batk = this.pokemonData.stats[1];
        this.def = Math.round(this.pokemonData.stats[2] * defRatio);
        this.bdef = this.pokemonData.stats[2];
        this.spa = Math.round(this.pokemonData.stats[3] * spaRatio);
        this.bspa = this.pokemonData.stats[3];
        this.spd = Math.round(this.pokemonData.stats[4] * spdRatio);
        this.bspd = this.pokemonData.stats[4];
        this.spe = Math.round(this.pokemonData.stats[5] * speRatio);
        this.bspe = this.pokemonData.stats[5];

        // set moves and ability
        this.addMoves(this.pokemonData);
        this.addAbility(this.pokemonData);
        this.applyAbility();

        this.battle.addToLog(`${oldName} transformed into ${this.name}!`);
    }


    useMove(moveId, targetPokemonId) {
        // make sure pokemon can move
        if (!this.canMove()) {
            return;
        }
        // make sure move exists and is not on cooldown & disabled
        const moveData = moveConfig[moveId];
        if (!moveData || this.moveIds[moveId].cooldown > 0 || this.moveIds[moveId].disabled) {
            return;
        }
        // check to see if target is valid
        const primaryTarget = this.battle.allPokemon[targetPokemonId];
        if (!primaryTarget || !this.battle.getEligibleTargets(this, moveId).includes(primaryTarget)) {
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
                canUseMove: canUseMove,
                source: this,
                primaryTarget: primaryTarget,
                moveId: moveId,
            };

            // trigger before move events
            this.battle.eventHandler.emit(battleEventNames.BEFORE_MOVE, eventArgs);

            canUseMove = eventArgs.canUseMove;
        }

        // check if pokemon can use move make sure pokemon is alive
        canUseMove = canUseMove && !this.isFainted ? true : false;

        // get move data and execute move
        if (canUseMove) {
            // see if move log should be silenced
            const isSilenced = moveData.silenceIf && moveData.silenceIf(this.battle, this);
            // if pokemon alive, get all targets
            const allTargets = this.getTargets(moveId, targetPokemonId);
            if (!isSilenced) {
                const targetString = moveData.targetPattern === targetPatterns.ALL 
                || moveData.targetPattern === targetPatterns.ALL_EXCEPT_SELF
                || moveData.targetPattern === targetPatterns.RANDOM
                || moveData.targetPosition === targetPositions.SELF
                ? "!" : ` against ${primaryTarget.name}!`
                this.battle.addToLog(`${this.name} used ${moveData.name}${targetString}`);
            }
            // calculate miss
            const missedTargets = this.getMisses(moveId, allTargets);
            // if misses, log miss
            if (missedTargets.length > 0 && !isSilenced) {
                this.battle.addToLog(`Missed ${missedTargets.map(target => target.name).join(', ')}!`);
            } 

            // set cooldown
            this.moveIds[moveId].cooldown = moveData.cooldown;

            // trigger before execute move events
            const executeEventArgs = {
                source: this,
                primaryTarget: primaryTarget,
                targets: allTargets,
                missedTargets: missedTargets,
                moveId: moveId,
            };
            this.battle.eventHandler.emit(battleEventNames.BEFORE_MOVE_EXECUTE, executeEventArgs);

            // execute move
            moveExecutes[moveId](this.battle, this, primaryTarget, allTargets, missedTargets);

            // after move event
            const eventArgs = {
                source: this,
                primaryTarget: primaryTarget,
                targets: allTargets,
                missedTargets: missedTargets,
                moveId: moveId,
            };
            this.battle.eventHandler.emit(battleEventNames.AFTER_MOVE, eventArgs);

        }


        // end turn
        this.battle.nextTurn();
    }

    /**
     * Called if the Pokemon is the active Pokemon but can't move.
     * @returns null
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
                    // sleep wakeup chance: 0 turns: 0%, 1 turn: 66%, 2 turns: 100%
                    const wakeupChance = this.status.turns * 0.66;
                    const wakeupRoll = Math.random();
                    if (wakeupRoll < wakeupChance) {
                        this.removeStatus();
                    }
                    break;
                default:
                    break;
            }
        }

        // end turn
        this.battle.nextTurn();
    }

    /**
     * Check that the Pokemon may take a valid action.
     * @returns True or False
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
        for (const moveId in this.moveIds) {
            if (this.moveIds[moveId].disabled || this.moveIds[moveId].cooldown > 0) {
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
            moveType: moveType,
            multiplier: mult,
        };
        this.battle.eventHandler.emit(battleEventNames.CALCULATE_TYPE_MULTIPLIER, eventArgs);
    
        return eventArgs.multiplier;
    };

    getPatternTargets(targetParty, targetPattern, targetPosition, moveId=null) {
        const targetRow = Math.floor((targetPosition - 1) / targetParty.cols);
        const targetCol = (targetPosition - 1) % targetParty.cols;
        const targets = [];

        switch (targetPattern) {
            case targetPatterns.ALL:
                // return all pokemon in party
                for (const pokemon of targetParty.pokemons) {
                    if (this.battle.isPokemonHittable(pokemon, moveId)) {
                        targets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.ALL_EXCEPT_SELF:
                // return all pokemon in party except self
                for (const pokemon of targetParty.pokemons) {
                    if (this.battle.isPokemonHittable(pokemon, moveId) && pokemon !== this) {
                        targets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.COLUMN:
                // return all pokemon in column
                for (const pokemon of targetParty.pokemons) {
                    if (this.battle.isPokemonHittable(pokemon, moveId) && (pokemon.position - 1)% targetParty.cols === targetCol) {
                        targets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.ROW:
                // return all pokemon in row
                for (const pokemon of targetParty.pokemons) {
                    if (this.battle.isPokemonHittable(pokemon, moveId) && Math.floor((pokemon.position - 1) / targetParty.cols) === targetRow) {
                        targets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.RANDOM:
                // return random pokemon in party
                const validPokemons = [];
                for (const pokemon of targetParty.pokemons) {
                    if (this.battle.isPokemonHittable(pokemon, moveId)) {
                        validPokemons.push(pokemon);
                    }
                }
                targets.push(validPokemons[Math.floor(Math.random() * validPokemons.length)]);
                break;
            case targetPatterns.SQUARE:
                // if row index or column index within 1 of target, add to targets
                for (const pokemon of targetParty.pokemons) {
                    if (this.battle.isPokemonHittable(pokemon, moveId)) {
                        const pokemonRow = Math.floor((pokemon.position - 1) / targetParty.cols);
                        const pokemonCol = (pokemon.position - 1) % targetParty.cols;
                        if (Math.abs(targetRow - pokemonRow) <= 1 && Math.abs(targetCol - pokemonCol) <= 1) {
                            targets.push(pokemon);
                        }
                    }
                }
                break;
            case targetPatterns.CROSS:
                // target manhattan distance <= 1, add to targets
                for (const pokemon of targetParty.pokemons) {
                    if (this.battle.isPokemonHittable(pokemon, moveId)) {
                        const pokemonRow = Math.floor((pokemon.position - 1) / targetParty.cols);
                        const pokemonCol = (pokemon.position - 1) % targetParty.cols;
                        if (Math.abs(targetRow - pokemonRow) + Math.abs(targetCol - pokemonCol) <= 1) {
                            targets.push(pokemon);
                        }
                    }
                }
                break;
            default:
                // default is single

                // get target pokemon
                const targetPokemon = targetParty.pokemons[targetRow * targetParty.cols + targetCol];
                if (this.battle.isPokemonHittable(targetPokemon, moveId)) {
                    targets.push(targetPokemon);
                }

                break;
        }

        return targets;
    }

    getTargets(moveId, targetPokemonId) {
        const moveData = moveConfig[moveId];
        // make sure target exists and is alive
        const target = this.battle.allPokemon[targetPokemonId];
        if (!target) {
            return [];
        }

        // get party of target
        const targetParty = this.battle.parties[target.teamName];

        const allTargets = []
        return [...allTargets, ...this.getPatternTargets(targetParty, moveData.targetPattern, target.position, moveId)];
    }

    getMisses(moveId, targetPokemons) {
        const moveData = moveConfig[moveId];
        const misses = [];
        if (!moveData.accuracy) {
            return misses;
        }
        for (const target of targetPokemons) {
            let hitChance = moveData.accuracy * calculateEffectiveAccuracy(this.acc) / calculateEffectiveEvasion(target.eva);
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
                    if (moveId === "m87" || moveId === "m87-1" || moveId === "m542" || moveId === "m542-1") {
                        hitChance *= 0.75;
                    }
                } else if (this.battle.weather.weatherId === weatherConditions.RAIN) {
                    if (moveId === "m87" || moveId === "m87-1" || moveId === "m542" || moveId === "m542-1") {
                        hitChance = 150;
                    }
                } else if (this.battle.weather.weatherId === weatherConditions.HAIL) {
                    if (moveId === "m59") {
                        hitChance = 150;
                    }
                }
            }

            const calculateMissArgs = {
                target: target,
                hitChance: hitChance,
                source: this,
            }
            this.battle.eventHandler.emit(battleEventNames.CALCULATE_MISS, calculateMissArgs);

            if (Math.random() > calculateMissArgs.hitChance / 100) {
                misses.push(target);
            }
        }
        return misses;
    }

    switchUsers(userId) {
        if (this.userId === userId) {
            return false;
        }
        // get user info from battle
        const user = this.battle.users[userId];
        if (!user) {
            return false;
        }
        const teamName = user.teamName;
        if (!teamName) {
            return false;
        }

        // set teamName and userId
        this.teamName = teamName;
        this.userId = userId;

        this.battle.addToLog(`${this.name} switched to ${user.username}'s team!`);

        return true;
    }

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

        this.battle.addToLog(`${this.name} switched to position to ${newPosition}!`);

        return true;
    }

    dealDamage(damage, target, damageInfo) {
        if (damage <= 0) {
            return 0;
        }

        // if pvp, deal 15% less damage
        if (this.battle.isPvp) {
            damage = Math.max(1, Math.floor(damage * 0.85));
        }

        const eventArgs = {
            target: target,
            damage: damage,
            source: this,
            damageInfo: damageInfo,
        };

        this.battle.eventHandler.emit(battleEventNames.BEFORE_DAMAGE_DEALT, eventArgs);
        damage = eventArgs.damage;

        const damageDealt = target.takeDamage(damage, this, damageInfo);

        if (damageDealt > 0) {
            const afterDamageArgs = {
                target: target,
                damage: damageDealt,
                source: this,
                damageInfo: damageInfo,
            };
            this.battle.eventHandler.emit(battleEventNames.AFTER_DAMAGE_DEALT, afterDamageArgs);
        }

        return damageDealt;
    }

    takeDamage(damage, source, damageInfo) {
        if (this.isFainted) {
            return 0;
        }

        // if frozen and fire type or scald, thaw and deal 1.5x damage
        const freezeCheck = this.status.statusId === statusConditions.FREEZE
        && damageInfo.type === "move"
        && moveConfig[damageInfo.moveId] !== undefined
        && (moveConfig[damageInfo.moveId].type === types.FIRE || damageInfo.moveId === "m503");
        if (freezeCheck) {
            if(this.removeStatus()) {
                damage = Math.floor(damage * 1.5);
            }
        }

        // if shield, take shield damage and return 0
        const shieldData = this.effectIds["shield"];
        if (shieldData && shieldData.args && shieldData.args["shield"]) {
            const shieldDamage = Math.min(damage, shieldData.args["shield"]);
            shieldData.args["shield"] -= shieldDamage;

            this.battle.addToLog(`${this.name} took ${shieldDamage} shield damage! (${shieldData.args["shield"]} left)`);
            if (shieldData.args["shield"] <= 0) {
                this.removeEffect("shield");
            }
            return 0;
        }
        
        const eventArgs = {
            target: this,
            damage: damage,
            source: source,
            damageInfo: damageInfo,
            maxDamage: Number.MAX_SAFE_INTEGER,
        };

        this.battle.eventHandler.emit(battleEventNames.BEFORE_DAMAGE_TAKEN, eventArgs);
        damage = Math.min(eventArgs.damage, eventArgs.maxDamage);

        const oldHp = this.hp;
        if (oldHp <= 0 || this.isFainted) {
            return 0;
        }
        this.hp = Math.max(0, this.hp - damage)
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
                source: source,
                damageInfo: damageInfo,
            };
            this.battle.eventHandler.emit(battleEventNames.AFTER_DAMAGE_TAKEN, afterDamageArgs);
        }
        
        return damageTaken;
    }

    takeFaint(source) {
        if (this.isFainted) {
            return;
        }
        // trigger before cause faint effects
        const beforeCauseFaintArgs = {
            target: this,
            source: source,
            canFaint: true,
        };
        this.battle.eventHandler.emit(battleEventNames.BEFORE_CAUSE_FAINT, beforeCauseFaintArgs);
        if (!beforeCauseFaintArgs.canFaint) {
            return;
        }

        this.faint(source);
    }

    faint(source) {
        // TODO: trigger before faint effects

        this.hp = 0;
        this.isFainted = true;
        this.removeAbility();
        this.battle.addToLog(`${this.name} fainted!`);

        // trigger after faint effects
        const afterFaintArgs = {
            target: this,
            source: source,
        };
        this.battle.eventHandler.emit(battleEventNames.AFTER_FAINT, afterFaintArgs);
    }

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

        // re-add ability
        this.applyAbility();
    }

    applyAbility() {
        const abilityId = this.ability.abilityId;
        const abilityData = abilityConfig[abilityId];
        if (!abilityData || !abilityData.abilityAdd) {
            return;
        }

        this.ability.data = abilityData.abilityAdd(this.battle, this, this);
        this.ability.applied = true;
    }

    removeAbility() {
        // remove ability effects
        const abilityId = this.ability.abilityId;
        const abilityData = abilityConfig[abilityId];
        if (abilityData && abilityData.abilityRemove) {
            abilityData.abilityRemove(this.battle, this, this);
        }
    }

    giveHeal(heal, target, healInfo) {
        const healGiven = target.takeHeal(heal, this, healInfo);
        return healGiven;
    }

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
    
    boostCombatReadiness(source, amount, triggerEvents=true) {
        // if faint, do nothing
        if (this.isFainted) {
            return 0;
        }

        if (this.restricted) {
            this.battle.addToLog(`${this.name} is restricted and cannot gain combat readiness!`);
            return 0;
        }

        const beforeBoostArgs = {
            target: this,
            source: source,
            amount: amount,
        };
        if (triggerEvents) {
            this.battle.eventHandler.emit(battleEventNames.BEFORE_CR_GAINED, beforeBoostArgs);
        }

        const oldCombatReadiness = this.combatReadiness;
        this.combatReadiness = Math.min(100, this.combatReadiness + beforeBoostArgs.amount);
        const combatReadinessGained = this.combatReadiness - oldCombatReadiness;
        this.battle.addToLog(`${this.name} gained ${Math.round(combatReadinessGained)} combat readiness!`);
        
        if (combatReadinessGained > 0 && triggerEvents) {
            const eventArgs = {
                target: this,
                source: source,
                combatReadinessGained: amount,
            };
            this.battle.eventHandler.emit(battleEventNames.AFTER_CR_GAINED, eventArgs);
        }

        return combatReadinessGained;
    }

    reduceCombatReadiness(source, amount) {
        // if faint, do nothing
        if (this.isFainted) {
            return 0;
        }

        const oldCombatReadiness = this.combatReadiness;
        this.combatReadiness = Math.max(0, this.combatReadiness - amount);
        const combatReadinessLost = oldCombatReadiness - this.combatReadiness;
        this.battle.addToLog(`${this.name} lost ${Math.round(combatReadinessLost)} combat readiness!`);
        return combatReadinessLost;
    }

    addEffect(effectId, duration, source, args) {
        // if faint, do nothing
        if (this.isFainted) {
            return;
        }

        duration = this.battle.activePokemon === this ? duration + 1 : duration;
        const effectData = effectConfig[effectId];

        // if effect already exists for longer or equal duration, do nothing (special case for shield)
        if (this.effectIds[effectId] && this.effectIds[effectId].duration >= duration && effectId !== "shield") {
            return;
        }

        // if effect exists, refresh duration
        // TODO: should this be modified?
        if (this.effectIds[effectId]) {
            duration = Math.max(this.effectIds[effectId].duration, duration)
            this.effectIds[effectId].duration = duration;
            // shield special case
            if (effectId !== "shield") {
                return;
            }
        }

        // trigger before effect add events
        const beforeAddArgs = {
            target: this,
            source: source,
            effectId: effectId,
            duration: duration,
            initialArgs: args,
            canAdd: true,
        };
        this.battle.eventHandler.emit(battleEventNames.BEFORE_EFFECT_ADD, beforeAddArgs);
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
            duration: duration,
            source: source,
            initialArgs: args,
        };
        if (oldShield) {
            this.effectIds[effectId].args = oldShield;
        }
        this.effectIds[effectId].args = effectData.effectAdd(this.battle, source, this, args) || {};

        if (this.effectIds[effectId] !== undefined) {
            // trigger after add effect events
            const afterAddArgs = {
                target: this,
                source: source,
                effectId: effectId,
                duration: duration,
                initialArgs: args,
                args: this.effectIds[effectId].args,
            };
            this.battle.eventHandler.emit(battleEventNames.AFTER_EFFECT_ADD, afterAddArgs);
        }
    }

    dispellEffect(effectId) {
        const effectData = effectConfig[effectId];

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

    removeEffect(effectId) {
        const effectData = effectConfig[effectId];

        // if effect doesn't exist, do nothing
        if (!this.effectIds[effectId]) {
            return false;
        }

        effectData.effectRemove(this.battle, this, this.effectIds[effectId].args, this.effectIds[effectId].initialArgs);

        if (this.effectIds[effectId] !== undefined) {
            const afterRemoveArgs = {
                target: this,
                source: this.effectIds[effectId].source,
                effectId: effectId,
                duration: this.effectIds[effectId].duration,
                initialArgs: this.effectIds[effectId].initialArgs,
                args: this.effectIds[effectId].args,
            };
            this.battle.eventHandler.emit(battleEventNames.AFTER_EFFECT_REMOVE, afterRemoveArgs);
        }

        delete this.effectIds[effectId];
        return true;
    }

    applyStatus(statusId, source, {
        startingTurns=0
    }={}) {
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
            source: source,
            statusId: statusId,
            canApply: true,
        };
        this.battle.eventHandler.emit(battleEventNames.BEFORE_STATUS_APPLY, beforeApplyArgs);
        if (!beforeApplyArgs.canApply) {
            return;
        }

        let statusApplied = false;
        switch (statusId) {
            // TODO: other status effects
            case statusConditions.BURN:
                if (this.type1 === types.FIRE || this.type2 === types.FIRE) {
                    this.battle.addToLog(`${this.name}'s Fire type renders it immune to burns!`);
                    break;
                }

                // reduce atk, spa by 25%
                this.atk -= Math.floor(this.batk * 0.25);
                this.spa -= Math.floor(this.bspa * 0.25);

                this.status = {
                    statusId: statusId,
                    source: source,
                    turns: startingTurns,
                }
                this.battle.addToLog(`${this.name} was burned!`);
                statusApplied = true;
                break;
            case statusConditions.FREEZE:
                if (this.type1 === types.ICE || this.type2 === types.ICE) {
                    this.battle.addToLog(`${this.name}'s Ice type renders it immune to freezing!`);
                    break;
                }

                if (this.battle.weather.weatherId === weatherConditions.SUN) {
                    this.battle.addToLog(`${this.name} was protected from freezing by the sun!`);
                    break;
                }

                this.status = {
                    statusId: statusId,
                    source: source,
                    turns: startingTurns,
                }
                this.battle.addToLog(`${this.name} was frozen!`);
                statusApplied = true;
                break;
            case statusConditions.PARALYSIS:
                if (this.type1 === types.ELECTRIC || this.type2 === types.ELECTRIC) {
                    this.battle.addToLog(`${this.name}'s Electric type renders it immune to paralysis!`);
                    break;
                }

                // reduce speed by 45%
                this.spe -= Math.floor(this.bspd * 0.45);

                this.status = {
                    statusId: statusId,
                    source: source,
                    turns: startingTurns,
                }
                this.battle.addToLog(`${this.name} was paralyzed!`);
                statusApplied = true;
                break;
            case statusConditions.POISON:
                if (this.type1 === types.POISON || this.type2 === types.POISON) {
                    this.battle.addToLog(`${this.name}'s Poison type renders it immune to poison!`);
                    break;
                }

                this.status = {
                    statusId: statusId,
                    source: source,
                    turns: startingTurns,
                }
                this.battle.addToLog(`${this.name} was poisoned!`);
                statusApplied = true;
                break;
            case statusConditions.SLEEP:
                this.status = {
                    statusId: statusId,
                    source: source,
                    turns: startingTurns,
                }
                this.battle.addToLog(`${this.name} fell asleep!`);
                statusApplied = true;
                break;
            case statusConditions.BADLY_POISON:
                if (this.type1 === types.POISON || this.type2 === types.POISON) {
                    this.battle.addToLog(`${this.name}'s Poison type renders it immune to poison!`);
                    break;
                }

                this.status = {
                    statusId: statusId,
                    source: source,
                    turns: startingTurns,
                }
                this.battle.addToLog(`${this.name} was badly poisoned!`);
                statusApplied = true;
                break;
            default:
                break;
        }

        if (statusApplied) {
            const afterStatusArgs = {
                target: this,
                source: source,
                statusId: statusId,
            };
            this.battle.eventHandler.emit(battleEventNames.AFTER_STATUS_APPLY, afterStatusArgs);
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
                const badlyPoisonDamage = Math.round(this.maxHp / 6) * Math.pow(2, this.status.turns);
                this.battle.addToLog(`${this.name} is hurt by poison!`);
                this.takeDamage(badlyPoisonDamage, this.status.source, {
                    type: "statusCondition",
                    statusId: statusConditions.BADLY_POISON,
                });
            default:
                break;
        }

        this.status.turns += 1;
    }

    removeStatus() {
        // if status doesn't exist, do nothing
        if (!this.status.statusId) {
            return false;
        }

        // TODO: trigger before remove status events

        switch (this.status.statusId) {
            case statusConditions.BURN:
                this.battle.addToLog(`${this.name} was cured of its burn!`);
                // restore atk, spa
                this.atk += Math.floor(this.batk * 0.25);
                this.spa += Math.floor(this.bspa * 0.25);
                break;
            case statusConditions.FREEZE:
                this.battle.addToLog(`${this.name} was thawed out!`);
                break;
            case statusConditions.PARALYSIS:
                // restore speed
                this.spe += Math.floor(this.bspd * 0.45);

                this.battle.addToLog(`${this.name} was cured of its paralysis!`);
                break;
            case statusConditions.POISON:
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
        }

        return true;
    }

    disableMove(moveId, source) {
        // check that move exists
        if (!this.moveIds[moveId]) {
            return;
        }

        // if move already disabled, do nothing
        if (this.moveIds[moveId].disabled) {
            return;
        }

        // disable move
        this.moveIds[moveId].disabled = true;
        // this.battle.addToLog(`${this.name}'s ${moveConfig[moveId].name} was disabled!`);
    }

    enableMove(moveId, source) {
        // check that move exists
        if (!this.moveIds[moveId]) {
            return;
        }

        // if move not disabled, do nothing
        if (!this.moveIds[moveId].disabled) {
            return;
        }

        // enable move
        this.moveIds[moveId].disabled = false;
        // this.battle.addToLog(`${this.name}'s ${moveConfig[moveId].name} is no longer disabled!`);
    }

    tickEffectDurations() {
        for (const effectId in this.effectIds) {
            this.effectIds[effectId].duration--;
            if (this.effectIds[effectId].duration <= 0) {
                this.removeEffect(effectId);
            }
        }
    }

    tickMoveCooldowns() {
        for (const moveId in this.moveIds) {
            if (this.moveIds[moveId].cooldown > 0) {
                this.moveIds[moveId].cooldown--;
            }
        }
    }

    reduceMoveCooldown(moveId, amount, source, silenced=false) {
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

        if (!silenced) {
            this.battle.addToLog(`${this.name}'s ${moveConfig[moveId].name}'s cooldown was reduced by ${oldCooldown - newCooldown} turns!`);
        }
        return oldCooldown - newCooldown;
    }

    effectiveSpeed() {
        return calculateEffectiveSpeed(this.getSpe());
    }

    getRowAndColumn() {
        const party = this.battle.parties[this.teamName];
        const row = Math.floor((this.position - 1) / party.cols);
        const col = (this.position - 1) % party.cols;
        return { row, col };
    }

    getPartyRowColumn() {
        const party = this.battle.parties[this.teamName];
        return {party, ...this.getRowAndColumn()};
    }

    getEnemyParty() {
        const teamNames = Object.keys(this.battle.parties);
        const enemyTeamName = teamNames[0] === this.teamName ? teamNames[1] : teamNames[0];
        return this.battle.parties[enemyTeamName];
    }

    getDef() {
        let def = this.def;

        // if hail and ice, def * 1.5
        if (
            !this.battle.isWeatherNegated() &&
            this.battle.weather.weatherId === weatherConditions.HAIL &&
            (this.type1 === types.ICE || this.type2 === types.ICE)
        ) {
            def = Math.floor(def * 1.5);
        }

        return def;
    }

    getSpd() {
        let spd = this.spd;

        // if sandstorm and rock, spd * 1.5
        if (
            !this.battle.isWeatherNegated() &&
            this.battle.weather.weatherId === weatherConditions.SANDSTORM && 
            (this.type1 === types.ROCK || this.type2 === types.ROCK)
        ) {
            spd = Math.floor(spd * 1.5);
        }

        return spd;
    }

    getSpe() {
        let spe = this.spe;

        if (!this.battle.isWeatherNegated()) {
            if (this.battle.weather.weatherId === weatherConditions.SUN) {
                if (this.ability && this.ability.abilityId === "34") {
                    spe = Math.floor(spe * 1.5);
                }
            } else if (this.battle.weather.weatherId === weatherConditions.RAIN) {
                if (this.ability && this.ability.abilityId === "33") {
                    spe = Math.floor(spe * 1.5);
                }
            }
        }

        return spe;
    }

}

class BattleEventHandler {
    battle;
    // event name => listenerIds
    eventNames;
    // listenerId => listener
    eventListeners;

    constructor(battle) {
        this.battle = battle;
        this.eventNames = {};
        this.eventListeners = {};
    }

    registerListener(eventName, listener) {
        // generate listener UUID
        const listenerId = uuidv4();

        getOrSetDefault(this.eventNames, eventName, []).push(listenerId);
        this.eventListeners[listenerId] = listener;
        // add listenerId and eventName to listener.initialargs
        listener.initialArgs = {
            listenerId: listenerId,
            eventName: eventName,
            ...listener.initialArgs
        }

        return listenerId;
    }

    unregisterListener(listenerId) {
        const listener = this.eventListeners[listenerId];
        if (listener) {
            const eventName = listener.initialArgs.eventName;
            const listenerIds = this.eventNames[eventName];
            if (listenerIds) {
                const index = listenerIds.indexOf(listenerId);
                if (index > -1) {
                    listenerIds.splice(index, 1);
                }
            }
            delete this.eventListeners[listenerId];
        }
    }

    emit(eventName, args) {
        const listenerIds = this.eventNames[eventName];
        if (listenerIds) {
            for (const listenerId of listenerIds) {
                const listener = this.eventListeners[listenerId];
                if (listener) {
                    listener.execute(listener.initialArgs, args);
                }
            }
        }
    }
}

const getStartTurnSend = async (battle, stateId) => {
    let content = battle.log.join('\n');

    const stateEmbed = buildBattleEmbed(battle);
    
    components = [];
    if (!battle.ended) {
        const infoRow = buildBattleInfoActionRow(battle, stateId, Object.keys(battle.teams).length + 1)
        components.push(infoRow);

        // check if active pokemon can move
        // TODO: deal with NPC case
        if (battle.activePokemon.canMove() && !battle.isNpc(battle.activePokemon.userId)) {
            const selectMoveComponent = buildSelectBattleMoveRow(battle, stateId);
            components.push(selectMoveComponent);
        } else {
            const nextTurnComponent = buildNextTurnActionRow(stateId);
            components.push(nextTurnComponent);
        }
    } else {
        // if game ended, add rewards to trainers and pokemon
        // for non-NPC teams, for all trainers, add rewards
        try {
            // if winner is NPC, no rewards
            if (!battle.teams[battle.winner].isNpc) {
                if (battle.rewardString) {
                    content += `\n${battle.rewardString}`;
                }
                const rewardRecipients = [];
                content += `\n**The following Pokemon leveled up:**`;
                for (const teamName in battle.teams) {
                    const team = battle.teams[teamName];
                    if (team.isNpc) {
                        continue;
                    }

                    const moneyReward = teamName === battle.winner ? battle.moneyReward : Math.floor(battle.moneyReward / 2);
                    const expReward = teamName === battle.winner ? battle.expReward : Math.floor(battle.expReward / 2);
                    const pokemonExpReward = teamName === battle.winner ? battle.pokemonExpReward : Math.floor(battle.pokemonExpReward / 2);

                    // TODO: optimize this it makes too many db calls
                    for (const userId of team.userIds) {
                        const user = battle.users[userId];
                        // get trainer
                        const trainer = await getTrainer(user);
                        if (trainer.err) {
                            logger.warn(`Failed to get trainer for user ${user.id} after battle`);
                            continue;
                        }

                        // trigger battle win callback
                        if (battle.winCallback) {
                            await battle.winCallback(battle, trainer.data);
                        }

                        // add trainer rewards
                        await addExpAndMoney(user, expReward, moneyReward);
                        const defeatedDifficultiesToday = trainer.data.defeatedNPCsToday[battle.npcId];
                        const defeatedDifficulties = trainer.data.defeatedNPCs[battle.npcId];
                        const allRewards = {};
                        let modified = false;
                        // add battle rewards
                        if (battle.rewards) {
                            addRewards(trainer.data, battle.rewards, allRewards);
                            modified = true;
                        }
                        // add daily rewards
                        if (battle.dailyRewards && (!defeatedDifficultiesToday || !defeatedDifficultiesToday.includes(battle.difficulty))) {
                            addRewards(trainer.data, battle.dailyRewards, allRewards);
                            getOrSetDefault(trainer.data.defeatedNPCsToday, battle.npcId, []).push(battle.difficulty);
                            modified = true;
                        }
                        // add to defeated difficulties if not already there
                        if (!defeatedDifficulties || !defeatedDifficulties.includes(battle.difficulty)) {
                            getOrSetDefault(trainer.data.defeatedNPCs, battle.npcId, []).push(battle.difficulty);
                            modified = true;
                        }

                        // attempt to add rewards
                        if (modified) {
                            const {data, err} = await updateTrainer(trainer.data);
                            if (err) {
                                logger.warn(`Failed to update daily trainer for user ${user.id} after battle`);
                                continue;
                            } else {
                                // this is kinda hacky there may be a better way to do this
                                rewardRecipients.push({
                                    username: user.username,
                                    rewards: allRewards
                                });
                            }
                        }

                        const levelUps = [];
                        // add pokemon rewards
                        for (const pokemon of Object.values(battle.allPokemon).filter(p => p.originalUserId === trainer.data.userId)) {
                            // get db pokemon
                            const dbPokemon = await getPokemon(trainer.data, pokemon.id);
                            if (dbPokemon.err) {
                                logger.warn(`Failed to get pokemon ${pokemon.id} after battle`);
                                continue;
                            }
                            
                            const oldLevel = dbPokemon.data.level;
                            const trainResult = await addPokemonExpAndEVs(trainer.data, dbPokemon.data, pokemonExpReward);
                            if (trainResult.err) {
                                continue;
                            }
                            const newLevel = trainResult.data.level;

                            if (newLevel > oldLevel) {
                                levelUps.push({
                                    pokemonName: dbPokemon.data.name,
                                    oldLevel: oldLevel,
                                    newLevel: newLevel
                                });
                            }
                        }
                        if (levelUps.length > 0) {
                            content += `\n${user.username}'s Pokemon: ${levelUps.map(l => `${l.pokemonName} (${l.oldLevel} -> ${l.newLevel})`).join(', ')}`;
                        }
                    }

                    if (rewardRecipients.length > 0) {
                        content += `\n**${rewardRecipients.map(r => r.username).join(', ')} received rewards for their victory:**`;
                        content += getRewardsString(rewardRecipients[0].rewards, received=false);
                    }

                }
            }
        } catch (err) {
            logger.error(`Failed to add battle rewards: ${err}`);
        }

        // if state has an NPC id, add a replay button
        const state = getState(stateId);
        if (state && state.endBattleComponents) {
            components.push(...state.endBattleComponents);
        } else {
            deleteState(stateId);
        }
    }

    return {
        content: content,
        embeds: [stateEmbed],
        components: components
    }
}

const buildPveSend = async ({ stateId=null, user=null, view="list", option=null, page=1 } = {}) => {
    // get state
    const state = getState(stateId);

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    trainer = trainer.data;

    const send = {
        embeds: [],
        components: []
    }
    const pageSize = 10;
    const npcIds = Object.keys(npcConfig);
    if (view === "list") {
        const maxPages = Math.ceil(npcIds.length / pageSize);
        if (page < 1 || page > maxPages) {
            return { embed: null, err: `Invalid page!` };
        }
        // get npc ids for page
        const npcIdsForPage = npcIds.slice((page - 1) * pageSize, page * pageSize);

        // build list embed
        const embed = buildPveListEmbed(npcIdsForPage, page);
        send.embeds.push(embed);

        // build scroll buttons
        const scrollData = {
            stateId: stateId,
        }
        const scrollRow = buildScrollActionRow(
            page, 
            page == maxPages, 
            scrollData,
            eventNames.PVE_SCROLL
        );
        send.components.push(scrollRow);

        // build npc select menu
        const npcSelectRowData = {
            stateId: stateId,
        };
        const npcSelectRow = buildIdConfigSelectRow(
            npcIdsForPage,
            npcConfig,
            "Select an NPC to battle:",
            npcSelectRowData,
            eventNames.PVE_SELECT,
            false
        );
        send.components.push(npcSelectRow);
    } else if (view === "npc") {
        // validate npc id
        const npcData = npcConfig[option];
        if (npcData === undefined) {
            return { embed: null, err: `Invalid NPC!` };
        }

        // build npc embed
        const embed = buildPveNpcEmbed(option);
        send.embeds.push(embed);

        // build difficulty row
        const difficultySelectData = {
            stateId: stateId,
        }
        const difficultyButtonConfigs = Object.keys(npcData.difficulties).map(difficulty => {
            return {
                label: difficultyConfig[difficulty].name,
                disabled: false,
                data: {
                    ...difficultySelectData,
                    difficulty: difficulty,
                }
            }
        });
        const difficultyRow = buildButtonActionRow(
            difficultyButtonConfigs,
            eventNames.PVE_ACCEPT,
        );
        send.components.push(difficultyRow);

        // build return button
        const index = npcIds.indexOf(option);
        const page = Math.floor(index / pageSize) + 1;
        const returnData = {
            stateId: stateId,
            page: page,
        }
        const returnButtonConfigs = [
            {
                label: "Return",
                disabled: false,
                data: returnData,
            }
        ]
        const returnRow = buildButtonActionRow(
            returnButtonConfigs,
            eventNames.PVE_SCROLL,
        );

        state.npcId = option;
        send.components.push(returnRow);
        send.content = "";
    } else if (view === "battle") {
        // validate npc id
        const npcData = npcConfig[state.npcId];
        if (npcData === undefined) {
            return { embed: null, err: `Invalid NPC!` };
        }

        // validate difficulty
        const npcDifficultyData = npcData.difficulties[state.difficulty];
        if (npcDifficultyData === undefined) {
            return { embed: null, err: `Difficulty doesn't exist for ${npcData.name}!` };
        }

        // get trainer
        const trainer = await getTrainer(user);
        if (trainer.err) {
            return { embed: null, err: trainer.err };
        }

        // validate party
        const validate = await validateParty(trainer.data);
        if (validate.err) {
            return { err: validate.err };
        }

        // add npc to battle
        const npc = new NPC(npcData, state.difficulty);
        npc.setPokemon(npcData, state.difficulty);
        const rewardMultipliers = npcDifficultyData.rewardMultipliers || difficultyConfig[state.difficulty].rewardMultipliers;
        const battle = new Battle({
            ...rewardMultipliers,
            dailyRewards: npcDifficultyData.dailyRewards,
            npcId: state.npcId,
            difficulty: state.difficulty,
        });
        battle.addTeam("NPC", true);
        battle.addTrainer(npc, npc.party.pokemons, "NPC", npc.party.rows, npc.party.cols);
        battle.addTeam("Player", false);
        battle.addTrainer(trainer.data, validate.data, "Player");

        // start battle and add to state
        battle.start();
        state.battle = battle;

        // add a replay button to state for later
        // build difficulty row
        const difficultySelectData = {
            stateId: stateId,
            difficulty: state.difficulty,
        }
        const difficultyButtonConfigs = [{
            label: "Replay",
            disabled: false,
            data: difficultySelectData,
        }];
        const difficultyRow = buildButtonActionRow(
            difficultyButtonConfigs,
            eventNames.PVE_ACCEPT,
        );

        const returnData = {
            stateId: stateId,
        }
        const returnButtonConfigs = [
            {
                label: "Return",
                disabled: false,
                data: returnData,
            }
        ]
        const returnRow = buildButtonActionRow(
            returnButtonConfigs,
            eventNames.PVE_SELECT,
        );

        state.endBattleComponents = [difficultyRow, returnRow];

        return {
            send: await getStartTurnSend(battle, stateId),
            err: null,
        }
    }

    return { send: send, err: null };
} 

const buildDungeonSend = async ({ stateId=null, user=null, view="list", option=null } = {}) => {
    // get state
    const state = getState(stateId);

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    trainer = trainer.data;

    const send = {
        embeds: [],
        components: []
    }
    if (view === "list") {
        // build list embed
        const embed = buildDungeonListEmbed();
        send.embeds.push(embed);
        
        
        // build dungeon select menu
        const dungeonSelectRowData = {
            stateId: stateId,
        };
        const dungeonSelectRow = buildIdConfigSelectRow(
            Object.values(dungeons),
            dungeonConfig,
            "Select a Dungeon to battle:",
            dungeonSelectRowData,
            eventNames.DUNGEON_SELECT,
            false
        );
        send.components.push(dungeonSelectRow);
    } else if (view === "dungeon") {
        // validate npc id
        const dungeonData = dungeonConfig[option];
        if (dungeonData === undefined) {
            return { embed: null, err: `Invalid Dungeon!` };
        }

        // build npc embed
        const embed = buildDungeonEmbed(option);
        send.embeds.push(embed);

        // build difficulty row
        const difficultySelectData = {
            stateId: stateId,
        }
        const difficultyButtonConfigs = Object.keys(dungeonData.difficulties).map(difficulty => {
            return {
                label: difficultyConfig[difficulty].name,
                disabled: false,
                data: {
                    ...difficultySelectData,
                    difficulty: difficulty,
                }
            }
        });
        const difficultyRow = buildButtonActionRow(
            difficultyButtonConfigs,
            eventNames.DUNGEON_ACCEPT,
        );
        send.components.push(difficultyRow);

        // build return button
        const returnData = {
            stateId: stateId,
        }
        const returnButtonConfigs = [
            {
                label: "Return",
                disabled: false,
                data: returnData,
            }
        ]
        const returnRow = buildButtonActionRow(
            returnButtonConfigs,
            // im lazy and using the same event name
            eventNames.DUNGEON_ACCEPT,
        );

        state.dungeonId = option;
        send.components.push(returnRow);
    } else if (view === "battle") {
        // validate npc id
        const dungeonData = dungeonConfig[state.dungeonId];
        if (dungeonData === undefined) {
            return { embed: null, err: `Invalid Dungeon!` };
        }

        // validate difficulty
        const dungeonDifficultyData = dungeonData.difficulties[state.difficulty];
        if (dungeonDifficultyData === undefined) {
            return { embed: null, err: `Difficulty doesn't exist for ${dungeonData.name}!` };
        }

        // get trainer
        const trainer = await getTrainer(user);
        if (trainer.err) {
            return { embed: null, err: trainer.err };
        }

        // validate party
        const validate = await validateParty(trainer.data);
        if (validate.err) {
            return { err: validate.err };
        }

        // add npc to battle
        const npc = new DungeonNPC(dungeonData, state.difficulty);
        npc.setPokemon(dungeonData, state.difficulty);
        const rewardMultipliers = dungeonDifficultyData.rewardMultipliers || difficultyConfig[state.difficulty].rewardMultipliers;
        const battle = new Battle({
            ...rewardMultipliers,
            rewards: dungeonDifficultyData.rewards,
            rewardString: dungeonDifficultyData.rewardString,
            npcId: state.dungeonId,
            difficulty: state.difficulty,
        });
        battle.addTeam("Dungeon", true);
        battle.addTrainer(npc, npc.party.pokemons, "Dungeon", npc.party.rows, npc.party.cols);
        battle.addTeam("Player", false);
        battle.addTrainer(trainer.data, validate.data, "Player");

        // start battle and add to state
        battle.start();
        state.battle = battle;

        // add a replay button to state for later
        // build difficulty row
        const difficultySelectData = {
            stateId: stateId,
            difficulty: state.difficulty,
        }
        const difficultyButtonConfigs = [{
            label: "Replay",
            disabled: false,
            data: difficultySelectData,
        }];
        const difficultyRow = buildButtonActionRow(
            difficultyButtonConfigs,
            eventNames.DUNGEON_ACCEPT,
        );
        state.endBattleComponents = [difficultyRow];

        return {
            send: await getStartTurnSend(battle, stateId),
            err: null,
        }
    }

    return { send: send, err: null };
}

const towerWinCallback = async (battle, trainer) => {
    // validate tower stage
    const towerStage = trainer.lastTowerStage + 1;
    if (getIdFromTowerStage(towerStage) !== battle.npcId) {
        battle.rewards = null;
        return;
    }

    // make sure that stage exists
    const battleTowerData = battleTowerConfig[towerStage];
    if (!battleTowerData) {
        battle.rewards = null;
        return;
    }

    // update trainer
    trainer.lastTowerStage = towerStage;
    const updateRes = await updateTrainer(trainer);
    if (updateRes.err) {
        battle.rewards = null;
        return;
    }

    // add rewards to battle
    battle.rewards = {
        ...battleTowerData.rewards
    };
}

const onBattleTowerAccept = async ({ stateId=null, user=null } = {}) => {
    // get state
    const state = getState(stateId);

    // get battle tower stage data
    const towerStage = state.towerStage || 1;
    const battleTowerData = battleTowerConfig[towerStage];
    if (!battleTowerData) {
        return { send: null, err: `Invalid Battle Tower stage!` };
    }
    // validate npc id
    const npcData = npcConfig[battleTowerData.npcId];
    if (npcData === undefined) {
        return { embed: null, err: `Invalid NPC!` };
    }
    // validate difficulty
    const npcDifficultyData = npcData.difficulties[battleTowerData.difficulty];
    if (npcDifficultyData === undefined) {
        return { embed: null, err: `Difficulty doesn't exist for ${npcData.name}!` };
    }

    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }
    // validate that last stage is correct
    if (trainer.data.lastTowerStage !== towerStage - 1) {
        return { embed: null, err: `You must complete the previous stage first!` };
    }
    // validate party
    const validate = await validateParty(trainer.data);
    if (validate.err) {
        return { err: validate.err };
    }

    // add npc to battle
    const npc = new TowerNPC(battleTowerData, battleTowerData.difficulty);
    npc.setPokemon(battleTowerData, battleTowerData.difficulty);
    const rewardMultipliers = npcDifficultyData.rewardMultipliers || difficultyConfig[battleTowerData.difficulty].rewardMultipliers;
    const battle = new Battle({
        ...rewardMultipliers,
        npcId: getIdFromTowerStage(towerStage),
        difficulty: battleTowerData.difficulty,
        winCallback: towerWinCallback,
    });
    battle.addTeam("Battle Tower", true);
    battle.addTrainer(npc, npc.party.pokemons, "Battle Tower", npc.party.rows, npc.party.cols);
    battle.addTeam("Player", false);
    battle.addTrainer(trainer.data, validate.data, "Player");

    // start battle and add to state
    battle.start();
    state.battle = battle;

    // build return button
    const returnData = {
        stateId: stateId,
        page: towerStage,
    }
    const returnButtonConfigs = [
        {
            label: "Return",
            disabled: false,
            data: returnData,
        }
    ]
    const returnRow = buildButtonActionRow(
        returnButtonConfigs,
        // im lazy and using the same event name
        eventNames.TOWER_SCROLL,
    );
    state.endBattleComponents = [returnRow];

    return { err: null };
}

const buildBattleTowerSend = async ({ stateId=null, user=null } = {}) => {
    // get state
    const state = getState(stateId);

    // get battle tower stage data
    const towerStage = state.towerStage || 1;
    const battleTowerData = battleTowerConfig[towerStage];
    if (!battleTowerData) {
        return { send: null, err: `Invalid Battle Tower stage!` };
    }
    const maxPages = Object.keys(battleTowerConfig).length;

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    trainer = trainer.data;

    const send = {
        content: "",
        embeds: [],
        components: []
    }

    const embed = buildBattleTowerEmbed(towerStage);
    send.embeds.push(embed);

    // build scroll buttons
    const scrollData = {
        stateId: stateId,
    }
    const scrollRow = buildScrollActionRow(
        towerStage, 
        towerStage == maxPages, 
        scrollData,
        eventNames.TOWER_SCROLL
    );
    send.components.push(scrollRow);

    // build battle button
    const battleData = {
        stateId: stateId,
    }
    const battleButtonConfigs = [{
        label: "Battle",
        disabled: towerStage !== trainer.lastTowerStage + 1,
        data: battleData,
    }];
    const battleRow = buildButtonActionRow(
        battleButtonConfigs,
        eventNames.TOWER_ACCEPT,
    );
    send.components.push(battleRow);

    return { send: send, err: null };
}

module.exports = {
    Battle,
    // BattleEventHandler,
    // Pokemon,
    getStartTurnSend,
    buildPveSend,
    buildDungeonSend,
    onBattleTowerAccept,
    buildBattleTowerSend,
}