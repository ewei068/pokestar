const { getOrSetDefault } = require("../utils/utils");
const { v4: uuidv4 } = require('uuid');
const { pokemonConfig } = require('../config/pokemonConfig');
const { battleEventNames, moveExecutes, moveConfig, targetTypes, targetPatterns, targetPositions } = require("../config/battleConfig");
const { buildBattleEmbed } = require("../embeds/battleEmbeds");
const { buildSelectBattleMoveRow } = require("../components/selectBattleMoveRow");

class Battle {
    userIds;
    users;
    teams;
    activePokemon;
    parties;
    log;
    eventHandler;
    turn;
    winner;

    constructor() {
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
            cols: 3,
        }
    }

    increaseCombatReadiness() {
        // TODO: possibly balance effective speed
        // get min ticks for a pokemon to be ready
        const MAX_CR = 100;
        let minTicks = Number.MAX_SAFE_INTEGER;
        let minTicksPokemon = null;
        for (const partyName in this.parties) {
            const party = this.parties[partyName];
            for (const pokemon of party.pokemons) {
                if (pokemon && !pokemon.isFainted) {
                    const requiredCr = MAX_CR - pokemon.combatReadiness;
                    const ticks = requiredCr / pokemon.spe;
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
                    pokemon.combatReadiness = Math.min(MAX_CR, pokemon.combatReadiness + pokemon.spe * minTicks);
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
        this.log.push(`[Turn ${this.turn}] It is <@${this.activePokemon.userId}>'s ${this.activePokemon.name}'s turn.`);
    }

    nextTurn() {
        // end turn logic
        this.eventHandler.emit(battleEventNames.TURN_END);
        // TODO: tick effects & status effects

        // increase turn and check for game end
        this.turn++;
        if (this.turn > 100) {
            this.winner = "DRAW";
            return;
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
            // TODO: deal with NPC case
            const winnerMentions = this.teams[this.winner].userIds.map(userId => `<@${userId}>`).join(" ");
            this.addToLog(`Team ${this.winner} has won! ${winnerMentions}`);
            return;
        } else if (undefeatedTeams.length === 0) {
            this.winner = "DRAW";
            this.addToLog("The battle has ended in a draw!");
            return;
        }

        // push cr
        this.increaseCombatReadiness();

        // begin turn
        this.eventHandler.emit(battleEventNames.TURN_BEGIN);
        this.activePokemon.tickMoveCooldowns();

        // TODO: deal with NPC case
        // log
        this.log.push(`[Turn ${this.turn}] It is <@${this.activePokemon.userId}>'s ${this.activePokemon.name}'s turn.`);
    }

    getEligibleTargets(source, moveId) {
        const moveData = moveConfig[moveId];
        const eligibleTargets = [];
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
                        if (pokemon && !pokemon.isFainted) {
                            eligibleTargets.push(pokemon);
                        }
                    }
                }
                return eligibleTargets;
        }

        // use target position to get valid targets
        switch (moveData.targetPosition) {
            case targetPositions.SELF:
                eligibleTargets.push(source);
                break;
            case targetPositions.NON_SELF:
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted && pokemon !== source) {
                        eligibleTargets.push(pokemon);
                    }
                }
                break;
            case targetPositions.FRONT:
                // break up party into rows
                // if pokemons exist in row, add to eligible targets
                // if all pokemon in front row fainted or nonexistent, move to next row
                
                let index = 0;
                for (let i = 0; i < targetParty.rows; i++) {
                    let pokemonFound = false;
                    for (let j = 0; j < targetParty.cols; j++) {
                        const pokemon = targetParty.pokemons[index];
                        if (pokemon && !pokemon.isFainted) {
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
                        if (pokemon && !pokemon.isFainted) {
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
                    if (pokemon && !pokemon.isFainted) {
                        eligibleTargets.push(pokemon);
                    }
                }
                break;
        }

        return eligibleTargets;
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
    def;
    spd;
    spa;
    spe;
    type1;
    type2;
    // effectId => duration
    effectIds;
    // moveId => cooldown
    moveIds;
    // { statusId. tuns active }
    status;
    combatReadiness;
    position;
    isFainted;

    constructor(battle, trainer, pokemonData, teamName, position) {
        this.battle = battle;
        this.pokemonData = pokemonData;
        this.speciesId = pokemonData.speciesId;
        this.speciesData = pokemonConfig[this.speciesId];
        this.id = pokemonData._id.toString();
        this.userId = trainer.userId;
        this.teamName = teamName;
        this.name = pokemonData.name;
        this.hp = pokemonData.stats[0];
        this.maxHp = this.hp;
        this.level = pokemonData.level;
        this.atk = pokemonData.stats[1];
        this.def = pokemonData.stats[2];
        this.spd = pokemonData.stats[3];
        this.spa = pokemonData.stats[4];
        this.spe = pokemonData.stats[5];
        this.type1 = this.speciesData.type[0];
        this.type2 = this.speciesData.type[1] || null;
        this.effectIds = {};
        this.moveIds = this.speciesData.moveIds.reduce((acc, moveId) => {
            acc[moveId] = 0;
            return acc;
        }, {});
        this.status = {
            statusId: null,
            turns: 0,
        }
        this.combatReadiness = 0;
        this.position = position;
        this.isFainted = false;
    }

    useMove(moveId, targetPokemonId) {
        // make sure its this pokemon's turn
        if (this.battle.activePokemon !== this) {
            return;
        }
        // make sure move exists and is not on cooldown
        const cooldown = this.moveIds[moveId];
        if (cooldown == null || cooldown > 0) {
            return;
        }
        // check if pokemon fainted
        if (this.isFainted) {
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

        // TODO: trigger move begin

        // get move data and execute move
        // TODO: check if pokemon still alive and not incapacitated
        if (true) {
            // if pokemon alive, get all targets
            const allTargets = this.getTargets(moveId, targetPokemonId);
            this.battle.addToLog(`${this.name} used ${moveConfig[moveId].name} against ${primaryTarget.name}!`);
            moveExecutes[moveId](this.battle, this, primaryTarget, allTargets);
            // set cooldown
            this.moveIds[moveId] = moveConfig[moveId].cooldown;
        }

        // TODO: trigger move end

        // end turn
        this.battle.nextTurn();
    }

    getTargets(moveId, targetPokemonId) {
        const allTargets = [];
        const moveData = moveConfig[moveId];
        // make sure target exists and is alive
        const target = this.battle.allPokemon[targetPokemonId];
        if (!target) {
            return [];
        }

        // get party of target
        const targetParty = this.battle.parties[target.teamName];

        // get eligible targets based on target pattern AOE
        switch (moveData.targetPattern) {
            case targetPatterns.ALL:
                // return all pokemon in party
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted) {
                        allTargets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.ALL_EXCEPT_SELF:
                // return all pokemon in party except self
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted && pokemon !== this) {
                        allTargets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.COLUMN:
                // TODO: should i use index or position?
                // return all pokemon in column
                const column = target.position % targetParty.cols;
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted && pokemon.position % targetParty.cols === column) {
                        allTargets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.ROW:
                // TODO: should i use index or position?
                // return all pokemon in row
                const row = Math.floor((target.position - 1) / targetParty.cols);
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted && Math.floor((pokemon.position - 1) / targetParty.cols) === row) {
                        allTargets.push(pokemon);
                    }
                }
                break;
            case targetPatterns.RANDOM:
                // return random pokemon in party
                const validPokemons = [];
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted) {
                        validPokemons.push(pokemon);
                    }
                }
                allTargets.push(validPokemons[Math.floor(Math.random() * validPokemons.length)]);
                break;
            case targetPatterns.SQUARE:
                // if row index or column index within 1 of target, add to targets
                let targetRow = Math.floor((target.position - 1) / targetParty.cols);
                let targetCol = target.position % targetParty.cols;
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted) {
                        const pokemonRow = Math.floor((pokemon.position - 1) / targetParty.cols);
                        const pokemonCol = pokemon.position % targetParty.cols;
                        if (Math.abs(targetRow - pokemonRow) <= 1 && Math.abs(targetCol - pokemonCol) <= 1) {
                            allTargets.push(pokemon);
                        }
                    }
                }
                break;
            case targetPatterns.CROSS:
                // target manhattan distance <= 1, add to targets
                targetRow = Math.floor((target.position - 1) / targetParty.cols);
                targetCol = target.position % targetParty.cols;
                for (const pokemon of targetParty.pokemons) {
                    if (pokemon && !pokemon.isFainted) {
                        const pokemonRow = Math.floor((pokemon.position - 1) / targetParty.cols);
                        const pokemonCol = pokemon.position % targetParty.cols;
                        if (Math.abs(targetRow - pokemonRow) + Math.abs(targetCol - pokemonCol) <= 1) {
                            allTargets.push(pokemon);
                        }
                    }
                }
                break;
            default:
                // default is single
                if (!target.isFainted) {
                    allTargets.push(target);
                }
                break;
        }

        return allTargets;
    }



    dealDamage(damage, target, damageInfo) {
        // TODO: use type to trigger any events

        // TODO: trigger damage begin

        const damageDealt = target.takeDamage(damage, this, damageInfo);

        // TODO: trigger damage end

        return damageDealt;
    }

    takeDamage(damage, source, damageInfo) {
        // TODO: trigger damage taken begin & type events

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

    tickMoveCooldowns() {
        for (const moveId in this.moveIds) {
            if (this.moveIds[moveId] > 0) {
                this.moveIds[moveId]--;
            }
        }
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
        getOrSetDefault(this.eventNames, eventName, []).push(listener);
        // generate listener UUID
        const listenerId = uuidv4();
        this.eventListeners[listenerId] = listener;
        // add listenerId and eventName to listener.initialargs
        listener.initialargs = {
            listenerId: listenerId,
            eventName: eventName,
            ...listener.initialargs
        }

        return listenerId;
    }

    unregisterListener(listenerId) {
        const listener = this.eventListeners[listenerId];
        if (listener) {
            const eventName = listener.initialargs.eventName;
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
                    listener.execute({
                        ...args,
                        ...listener.initialargs
                    })
                }
            }
        }
    }
}

const getStartTurnSend = (battle, stateId) => {
    const content = battle.log.join('\n');

    const stateEmbed = buildBattleEmbed(battle);
    
    components = [];
    if (!battle.winner) {
        // TODO: handle pokemon fainted or incapacitated
        // TODO: handle edge case where pokemon can't use any moves
        const selectMoveComponent = buildSelectBattleMoveRow(battle, stateId);
        components.push(selectMoveComponent);
    }

    return {
        content: content,
        embeds: [stateEmbed],
        components: components
    }
}


module.exports = {
    Battle,
    // BattleEventHandler,
    // Pokemon,
    getStartTurnSend
}