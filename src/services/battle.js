const { getOrSetDefault } = require("../utils/utils");
const { v4: uuidv4, v4 } = require('uuid');
const { pokemonConfig, types } = require('../config/pokemonConfig');
const { battleEventNames, moveExecutes, moveConfig, targetTypes, targetPatterns, targetPositions, getTypeDamageMultiplier, effectConfig, statusConditions, moveTiers, calculateDamage } = require("../config/battleConfig");
const { buildBattleEmbed, buildBattleMovesetEmbed, buildPveListEmbed, buildPveNpcEmbed } = require("../embeds/battleEmbeds");
const { buildSelectBattleMoveRow } = require("../components/selectBattleMoveRow");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildBattleInfoActionRow } = require("../components/battleInfoActionRow");
const { getTrainer, addExpAndMoney, updateTrainer } = require("./trainer");
const { addPokemonExpAndEVs, getPokemon, calculatePokemonStats } = require("./pokemon");
const { logger } = require("../log");
const { buildNextTurnActionRow } = require("../components/battleNextTurnRow");
const { deleteState } = require("./state");
const { calculateEffectiveSpeed, calculateEffectiveAccuracy } = require("../utils/pokemonUtils");
const { npcConfig, difficultyConfig } = require("../config/npcConfig");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { getState } = require("./state");
const { eventNames } = require("../config/eventConfig");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { drawIterable, drawUniform } = require("../utils/gachaUtils");
const { generateRandomPokemon } = require("./gacha");
const { validateParty } = require("./party");
const { addRewards, getRewardsString, flattenCategories, flattenRewards } = require("../utils/trainerUtils");

class NPC {
    userId;
    user;
    party;

    constructor(npcData, difficulty) {
        const difficultyData = difficultyConfig[difficulty];
        const npcDifficultyData = npcData.difficulties[difficulty];
        this.userId = uuidv4();
        this.user = {
            username: npcData.name,
            discriminator: uuidv4().slice(0, 4),
            npc: this,
            id: this.userId,
            // data: npcData,
            // difficulty: difficulty,
        };
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

        return heuristic;
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
    userIds;
    users;
    teams;
    activePokemon;
    parties;
    log;
    eventHandler;
    turn;
    winner;
    ended;
    minLevel;
    level;
    dailyRewards;
    npcId;
    difficulty;

    constructor({ 
        moneyMultiplier=1, 
        expMultiplier=1, 
        pokemonExpMultiplier=0.2,
        level=null,
        dailyRewards=null,
        npcId=null,
        difficulty=null,
    } = {}) {
        this.moneyMultiplier = moneyMultiplier;
        this.expMultiplier = expMultiplier;
        this.pokemonExpMultiplier = pokemonExpMultiplier;
        this.moneyReward = 0;
        this.expReward = 0;
        this.pokemonExpReward = 0;
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
        this.log = [];
        this.eventHandler = new BattleEventHandler(this);
        this.turn = 0;
        this.winner = null;
        this.ended = false;
        if (level) {
            if (level < 1 || level > 100) {
                throw new Error("Invalid level");
            }
            this.level = level;
            this.minLevel = level;
        }
        this.dailyRewards = dailyRewards;
        this.npcId = npcId;
        this.difficulty = difficulty;
    }
    
    addTeam(teamName, isNpc) {
        this.teams[teamName] = {
            name: teamName,
            isNpc: isNpc,
            userIds: [],
        }
    }

    addTrainer(trainer, pokemons, teamName) {
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
        // TODO: modify if parties can have different sizes and different num players
        this.parties[teamName] = {
            pokemons: partyPokemons,
            rows: 3,
            cols: 4,
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
        this.log.push("Battle started.");
        this.eventHandler.emit(battleEventNames.BATTLE_BEGIN);

        // increase combat readiness for all pokemon
        this.increaseCombatReadiness();

        // begin turn
        this.eventHandler.emit(battleEventNames.TURN_BEGIN);

        // log
        const userIsNpc = this.isNpc(this.activePokemon.userId);
        const userString = userIsNpc ? this.users[this.activePokemon.userId].username : `<@${this.activePokemon.userId}>`;
        this.log.push(`[Turn ${this.turn}] It is ${userString}'s ${this.activePokemon.name}'s turn.`);
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

        // push cr
        this.increaseCombatReadiness();

        // begin turn
        this.eventHandler.emit(battleEventNames.TURN_BEGIN);
        if (!this.activePokemon.isFainted) {
            this.activePokemon.tickMoveCooldowns();
        }

        // log
        const userIsNpc = this.isNpc(this.activePokemon.userId);
        const userString = userIsNpc ? this.users[this.activePokemon.userId].username : `<@${this.activePokemon.userId}>`;
        if (this.activePokemon.canMove()) {
            this.log.push(`[Turn ${this.turn}] It is ${userString}'s ${this.activePokemon.name}'s turn.`);
        } else {
            this.log.push(`[Turn ${this.turn}] ${userString}'s ${this.activePokemon.name} is unable to move.`);
        }
    }

    endBattle() {
        if (this.winner) {
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
        if (this.teams[this.winner].isNpc) {
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

        this.addToLog(`Winners recieved ₽${this.moneyReward}, ${this.expReward} exp, and ${this.pokemonExpReward} BASE Pokemon exp. Losers recieved half the amount.`);
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
            if ((moveId === "m87" || moveId === "m16" || moveId === "m479") && pokemon.effectIds.sprungUp !== undefined) {
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
            if ((moveId === "m87" || moveId === "m16" || moveId === "m479") && pokemon.effectIds.sprungUp !== undefined) {
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
    type1;
    type2;
    // effectId => duration
    effectIds;
    // moveId => { cooldown, disabled }
    moveIds;
    // { statusId. tuns active }
    status;
    combatReadiness;
    position;
    isFainted;
    targetable;
    hittable;
    incapacitated;

    constructor(battle, trainer, pokemonData, teamName, position) {
        this.battle = battle;
        this.speciesId = pokemonData.speciesId;
        this.speciesData = pokemonConfig[this.speciesId];
        // if battle has a set level, scale pokemon to that level
        if (battle.level) {
            battle.minLevel = Math.min(battle.minLevel, pokemonData.level);
            pokemonData.level = battle.level;
            pokemonData = calculatePokemonStats(pokemonData, this.speciesData);
        }
        this.pokemonData = pokemonData;
        this.id = pokemonData._id.toString();
        this.userId = trainer.userId;
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
        this.type1 = this.speciesData.type[0];
        this.type2 = this.speciesData.type[1] || null;
        // map effectId => effect data (duration, args)
        this.effectIds = {};
        this.moveIds = this.speciesData.moveIds.reduce((acc, moveId) => {
            acc[moveId] = {
                cooldown: 0,
                disabled: false,
            };
            return acc;
        }, {});
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
                    if (moveId === "m394") {
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
                    // TEMP: log paralysis roll
                    logger.info(`paralysis roll: ${paralysisRoll}`);
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
                user: this,
                primaryTarget: primaryTarget,
                move: moveId,
            };

            // trigger before move events
            this.battle.eventHandler.emit(battleEventNames.MOVE_BEGIN, eventArgs);

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

            // execute move
            moveExecutes[moveId](this.battle, this, primaryTarget, allTargets, missedTargets);

            // TODO: trigger move end
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
            // TODO: account for target evasion
            let hitChance = moveData.accuracy * calculateEffectiveAccuracy(this.acc);
            const damageMult = getTypeDamageMultiplier(moveData.type, target);
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

            if (Math.random() > hitChance / 100) {
                misses.push(target);
            }
        }
        return misses;
    }


    dealDamage(damage, target, damageInfo) {
        // TODO: use type to trigger any events

        // TODO: trigger damage begin

        const damageDealt = target.takeDamage(damage, this, damageInfo);

        // TODO: trigger damage end

        return damageDealt;
    }

    takeDamage(damage, source, damageInfo) {
        if (this.isFainted) {
            return 0;
        }

        // if frozen and fire type, thaw and deal 1.5x damage
        const freezeCheck = this.status.statusId === statusConditions.FREEZE
        && damageInfo.type === "move"
        && moveConfig[damageInfo.moveId] !== undefined
        && moveConfig[damageInfo.moveId].type === types.FIRE;
        if (freezeCheck) {
            if(this.removeStatus()) {
                damage = Math.floor(damage * 1.5);
            }
        }

        // TODO: trigger damage taken begin & type events
        const eventArgs = {
            target: this,
            damage: damage,
            source: source,
            damageInfo: damageInfo,
        };

        this.battle.eventHandler.emit(battleEventNames.BEFORE_DAMAGE_TAKEN, eventArgs);
        damage = eventArgs.damage;

        const oldHp = this.hp;
        if (oldHp <= 0 || this.isFainted) {
            return 0;
        }
        this.hp = Math.max(0, this.hp - damage)
        const damageTaken = oldHp - this.hp;
        this.battle.addToLog(`${this.name} took ${damageTaken} damage!`);
        if (this.hp <= 0) {
            this.hp = 0;
            this.faint();
        }

        // TODO: trigger damage taken end
        
        return damageTaken;
    }

    faint() {
        this.hp = 0;
        this.isFainted = true;
        this.battle.addToLog(`${this.name} fainted!`);
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
    
    boostCombatReadiness(source, amount) {
        // if faint, do nothing
        if (this.isFainted) {
            return 0;
        }

        const oldCombatReadiness = this.combatReadiness;
        this.combatReadiness = Math.min(100, this.combatReadiness + amount);
        const combatReadinessGained = this.combatReadiness - oldCombatReadiness;
        this.battle.addToLog(`${this.name} gained ${Math.round(combatReadinessGained)} combat readiness!`);
        
        const eventArgs = {
            target: this,
            source: source,
            combatReadinessGained: amount,
        };
        this.battle.eventHandler.emit(battleEventNames.AFTER_CR_GAINED, eventArgs);

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

        const effectData = effectConfig[effectId];

        // if effect already exists for longer or equal duration, do nothing
        if (this.effectIds[effectId] && this.effectIds[effectId].duration >= duration) {
            return;
        }

        // if effect exists, refresh duration
        // TODO: should this be modified?
        if (this.effectIds[effectId]) {
            this.effectIds[effectId].duration = duration;
            return;
        }

        // TODO: trigger before add effect events

        this.effectIds[effectId] = {
            duration: duration,
            source: source,
        };
        args = {
            ...effectData.effectAdd(this.battle, source, this, args),
            ...args,
        };
        
        // if effect still exists, add args
        if (this.effectIds[effectId]) {
            this.effectIds[effectId].args = args;
        }

        // TODO: trigger after add effect events
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

        effectData.effectRemove(this.battle, this, this.effectIds[effectId].args);

        delete this.effectIds[effectId];
        return true;
    }

    applyStatus(statusId, source) {
        // if faint, do nothing
        if (this.isFainted) {
            return;
        }

        // if status already exists, do nothing
        if (this.status.statusId) {
            this.battle.addToLog(`${this.name} already has a status condition!`);
            return;
        }

        // TODO: trigger before apply status events

        switch (statusId) {
            // TODO: other status effects
            case statusConditions.BURN:
                if (this.type1 === types.FIRE || this.type2 === types.FIRE) {
                    this.battle.addToLog(`${this.name}'s Fire type renders it immune to burns!`);
                    break;
                }

                this.status = {
                    statusId: statusId,
                    turns: 0,
                }
                this.battle.addToLog(`${this.name} was burned!`);
                break;
            case statusConditions.FREEZE:
                if (this.type1 === types.ICE || this.type2 === types.ICE) {
                    this.battle.addToLog(`${this.name}'s Ice type renders it immune to freezing!`);
                    break;
                }

                this.status = {
                    statusId: statusId,
                    turns: 0,
                }
                this.battle.addToLog(`${this.name} was frozen!`);
                break;
            case statusConditions.PARALYSIS:
                if (this.type1 === types.ELECTRIC || this.type2 === types.ELECTRIC) {
                    this.battle.addToLog(`${this.name}'s Electric type renders it immune to paralysis!`);
                    break;
                }

                // reduce speed by 30%
                this.spe -= Math.floor(this.bspd * 0.3);

                this.status = {
                    statusId: statusId,
                    turns: 0,
                }
                this.battle.addToLog(`${this.name} was paralyzed!`);
                break;
            case statusConditions.POISON:
                if (this.type1 === types.POISON || this.type2 === types.POISON) {
                    this.battle.addToLog(`${this.name}'s Poison type renders it immune to poison!`);
                    break;
                }

                this.status = {
                    statusId: statusId,
                    turns: 0,
                }
                this.battle.addToLog(`${this.name} was poisoned!`);
                break;
            case statusConditions.SLEEP:
                this.status = {
                    statusId: statusId,
                    turns: 0,
                }
                this.battle.addToLog(`${this.name} fell asleep!`);
                break;
            case statusConditions.BADLY_POISON:
                if (this.type1 === types.POISON || this.type2 === types.POISON) {
                    this.battle.addToLog(`${this.name}'s Poison type renders it immune to poison!`);
                    break;
                }

                this.status = {
                    statusId: statusId,
                    turns: 0,
                }
                this.battle.addToLog(`${this.name} was badly poisoned!`);
                break;
            default:
                break;
        }

        // TODO: trigger after apply status events
    }

    tickStatus() {
        // if status doesn't exist, do nothing
        if (!this.status.statusId) {
            return;
        }

        switch (this.status.statusId) {
            case statusConditions.POISON:
                const damage = Math.round(this.maxHp / 10);
                this.battle.addToLog(`${this.name} is hurt by poison!`);
                this.takeDamage(damage, null, {
                    type: "statusCondition",
                    statusId: statusConditions.POISON,
                });
                break;
            case statusConditions.BURN:
                const burnDamage = Math.round(this.maxHp / 16);
                this.battle.addToLog(`${this.name} is hurt by its burn!`);
                this.takeDamage(burnDamage, null, {
                    type: "statusCondition",
                    statusId: statusConditions.BURN,
                });
                break;
            case statusConditions.BADLY_POISON:
                const badlyPoisonDamage = Math.round(this.maxHp / 10) * Math.pow(2, this.status.turns);
                this.battle.addToLog(`${this.name} is hurt by poison!`);
                this.takeDamage(badlyPoisonDamage, null, {
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
                break;
            case statusConditions.FREEZE:
                this.battle.addToLog(`${this.name} was thawed out!`);
                break;
            case statusConditions.PARALYSIS:
                // restore speed
                this.spe += Math.floor(this.bspd * 0.25);

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

    effectiveSpeed() {
        return calculateEffectiveSpeed(this.spe);
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
                const dailyRecipients = [];
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

                        // add trainer rewards
                        await addExpAndMoney(user, moneyReward, expReward);
                        const defeatedDifficultiesToday = trainer.data.defeatedNPCsToday[battle.npcId];
                        if (battle.dailyRewards && (!defeatedDifficultiesToday || !defeatedDifficultiesToday.includes(battle.difficulty))) {
                            // add daily rewards
                            addRewards(trainer.data, battle.dailyRewards);
                            getOrSetDefault(trainer.data.defeatedNPCsToday, battle.npcId, []).push(battle.difficulty);
                            const {data, err} = await updateTrainer(trainer.data);
                            if (err) {
                                logger.warn(`Failed to update daily trainer for user ${user.id} after battle`);
                                continue;
                            } else {
                                dailyRecipients.push(user.username);
                            }
                        }

                        const levelUps = [];
                        // add pokemon rewards
                        for (const pokemon of Object.values(battle.allPokemon).filter(p => p.userId === trainer.data.userId)) {
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

                    if (dailyRecipients.length > 0) {
                        content += `\n**${dailyRecipients.join(', ')} received daily rewards for their victory:**`;
                        content += getRewardsString(flattenRewards(battle.dailyRewards), received=false);
                    }

                }
            }
        } catch (err) {
            logger.error(`Failed to add battle rewards: ${err}`);
        }

        // if state has an NPC id, add a replay button
        const state = getState(stateId);
        if (state && state.replayComponent) {
            components.push(state.replayComponent);
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
        const rewardMultipliers = npcDifficultyData.rewardMultipliers || difficultyConfig[state.difficulty].rewardMultipliers;
        const battle = new Battle({
            ...rewardMultipliers,
            dailyRewards: npcDifficultyData.dailyRewards,
            npcId: state.npcId,
            difficulty: state.difficulty,
        });
        battle.addTeam("NPC", true);
        battle.addTrainer(npc, npc.party.pokemons, "NPC");
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
        state.replayComponent = difficultyRow;

        return {
            send: await getStartTurnSend(battle, stateId),
            err: null,
        }
    }

    return { send: send, err: null };
} 


module.exports = {
    Battle,
    // BattleEventHandler,
    // Pokemon,
    getStartTurnSend,
    buildPveSend,
}