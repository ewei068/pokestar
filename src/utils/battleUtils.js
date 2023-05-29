const { effectConfig, statusConditions } = require('../config/battleConfig');
const { difficultyConfig } = require('../config/npcConfig');
const { pokemonConfig, typeConfig } = require('../config/pokemonConfig');
const { getRewardsString, flattenRewards } = require('./trainerUtils');
const { getPBar } = require('./utils');

const buildPartyString = (pokemons, rows, cols, reverse=false, hp=false, emphPosition=null) => {
    let globalIndex = 0;
    let partyString = '';
    // set rows to be a range to iterate over
    const iter = reverse ? [...Array(rows).keys()].reverse() : [...Array(rows).keys()];
    for (let i of iter) {
        // build top line and HP if needed
        let rowString = '`';
        globalIndex = i * cols;
        for (let j = 0; j < cols; j++) {
            const lplus = emphPosition && (emphPosition - 1 == globalIndex || (emphPosition == globalIndex && j != 0)) ? '╬' : '+';
            const rplus = emphPosition && emphPosition - 1 == globalIndex ? '╬' : '+';
            const border = emphPosition && emphPosition - 1 == globalIndex ? '=' : '-';
            const pokemon = pokemons[globalIndex];
            let headerString = "";
            if (hp && pokemon) {
                // get hp percent
                let hpPercent = 0;
                if (pokemon.hp > 0) {
                    hpPercent = Math.max(Math.round(Math.floor(pokemon.hp * 100 / pokemon.maxHp)), 1);
                } else {
                    hpPercent = 0;
                }
                // make string
                headerString = `${hpPercent}%`;
            } else if (pokemon) {
                headerString = `L${pokemon.level}`;
            }

            // add to row string based on length of hp string
            const headerLength = headerString.length;
            if (headerLength === 0) {
                rowString += `${lplus}${border}${border}${border}${border}${border}`;
            } else if (headerLength === 2) {
                rowString += `${lplus}${border}${border}${headerString}${border}`;
            } else if (headerLength === 3) {
                rowString += `${lplus}${border}${headerString}${border}`;
            } else if (headerLength === 4) {
                rowString += `${lplus}${border}${headerString}`;
            }

            if (j == cols - 1) {
                rowString += `${rplus}\``;
            }
            globalIndex++;
        }
        globalIndex -= cols;
        partyString += rowString + '\n';
        
        // build pokemon line
        rowString = '`';
        for (let j = 0; j < cols; j++) {
            const lborder = emphPosition && (emphPosition - 1 == globalIndex || (emphPosition == globalIndex && j != 0)) ? '║' : '|';
            const rborder = emphPosition && emphPosition - 1 == globalIndex ? '║' : '|';
            const pokemon = pokemons[globalIndex];
            const emoji = pokemon ? pokemonConfig[pokemon.speciesId].emoji : '⬛';
            // if j is divisible by 3 and not 0, remove a space from the left
            const leftSpace = j % 3 === 0 && j !== 0 ? '' : ' ';
            rowString += `${lborder} \`${emoji}\`${leftSpace}`;
            globalIndex++;
            if (j == cols - 1) {
                rowString += `${rborder}\``;
            }
        }
        globalIndex -= cols;
        partyString += rowString + '\n';

        // build bottom line with position
        rowString = '`';
        for (let j = 0; j < cols; j++) {
            const lplus = emphPosition && (emphPosition - 1 == globalIndex || (emphPosition == globalIndex && j != 0)) ? '╬' : '+';
            const rplus = emphPosition && emphPosition - 1 == globalIndex ? '╬' : '+';
            const border = emphPosition && emphPosition - 1 == globalIndex ? '=' : '-';
            const position = globalIndex + 1;
            if (position < 10) {
                rowString += `${lplus}${border}${border}${position}${border}${border}`;
            } else {
                rowString += `${lplus}${border}${border}${position}${border}`;
            }
            if (j == cols - 1) {
                rowString += `${rplus}\``;
            }
            globalIndex++;
        }
        partyString += rowString;
        if (iter.indexOf(i) != iter.length - 1) {
            partyString += '\n';
        }
    }
    
    return partyString;
}

const buildMoveString = (moveData, cooldown=0) => {
    let moveHeader = '';
    if (cooldown) {
        moveHeader += `[ON COOLDOWN: ${cooldown} TURNS]\n`;
    }
    moveHeader += `${typeConfig[moveData.type].emoji} **${moveData.name}** | ${moveData.damageType} `;

    let moveString = '';
    moveString += `**[${moveData.tier}]** PWR: ${moveData.power || "-"} | ACC: ${moveData.accuracy || "-"} | CD: ${moveData.cooldown}\n`;
    moveString += `**Target:** ${moveData.targetType}/${moveData.targetPosition}/${moveData.targetPattern}\n`;
    moveString += `${moveData.description}`;

    return {
        moveHeader,
        moveString,
    }
}

const buildBattlePokemonString = (pokemon) => {
    let pokemonHeader = ""
    if (pokemon.isFainted) {
        // TODO: check for other status conditions
        pokemonHeader += "[FNT] ";
    } else {
        switch (pokemon.status.statusId) {
            case statusConditions.BURN:
                pokemonHeader += "[BRN] ";
                break;
            case statusConditions.FREEZE:
                pokemonHeader += "[FRZ] ";
                break;
            case statusConditions.PARALYSIS:
                pokemonHeader += "[PAR] ";
                break;
            case statusConditions.POISON:
                pokemonHeader += "[PSN] ";
                break;
            case statusConditions.BADLY_POISON:
                pokemonHeader += "[PSN] ";
                break;
            case statusConditions.SLEEP:
                pokemonHeader += "[SLP] ";
                break;
            default:
                break;
        }
    }

    pokemonHeader += `[${pokemon.position}] [Lv. ${pokemon.level}] ${pokemon.name}`;
    let pokemonString = '';
    // build hp percent string
    const hpPercent = Math.min(Math.round(Math.floor(pokemon.hp * 100 / pokemon.maxHp)), 100);
    pokemonString += `**HP** ${getPBar(hpPercent, 10)} ${hpPercent}\n`;
    // build cr string
    const crPercent = Math.min(Math.round(Math.floor(pokemon.combatReadiness * 100 / 100)), 100);
    pokemonString += `**CR** ${getPBar(crPercent, 10)} ${crPercent}\n`;
    // build effects string
    if (Object.keys(pokemon.effectIds).length > 0) {
        pokemonString += `**Effects:** ${Object.keys(pokemon.effectIds).map((effectId) => {
            return `${effectConfig[effectId].name} (${pokemon.effectIds[effectId].duration})`;
        }).join(', ')}`;
    } else {
        pokemonString += `**Effects:** None`;
    }

    return {
        pokemonHeader,
        pokemonString,
    }
}

const buildNpcDifficultyString = (difficulty, npcDifficultyData) => {
    const difficultyData = difficultyConfig[difficulty];
    // + 1 here because ace pokemon is one level higher than max level
    const difficultyHeader = `[Lv. ${npcDifficultyData.minLevel}-${npcDifficultyData.maxLevel + 1}] ${difficultyData.name}`;

    const rewardMultipliers = npcDifficultyData.rewardMultipliers || difficultyData.rewardMultipliers;
    const pokemonIds = npcDifficultyData.pokemonIds;

    let difficultyString = '';
    difficultyString += `**Possible Pokemon:** ${npcDifficultyData.numPokemon}x`;
    for (let i = 0; i < pokemonIds.length; i++) {
        const pokemonId = pokemonIds[i];
        const pokemonData = pokemonConfig[pokemonId];
        difficultyString += ` ${pokemonData.emoji}`;
    }
    difficultyString += pokemonIds.includes(npcDifficultyData.aceId) ? '' : ` ${pokemonConfig[npcDifficultyData.aceId].emoji}`;
    difficultyString += '\n';
    difficultyString += `**Multipliers:** Money: ${rewardMultipliers.moneyMultiplier} | EXP: ${rewardMultipliers.expMultiplier} | Pkmn. EXP: ${rewardMultipliers.pokemonExpMultiplier}`;
    if (npcDifficultyData.dailyRewards) {
        difficultyString += `\n**Daily Rewards:** ${getRewardsString(flattenRewards(npcDifficultyData.dailyRewards), received=false)}`;
    }

    return {
        difficultyHeader,
        difficultyString,
    }
}

const buildDungeonDifficultyString = (difficulty, dungeonDifficultyData) => {
    const difficultyData = difficultyConfig[difficulty];
    const allDungeonPokemons = dungeonDifficultyData.phases.reduce((acc, phase) => {
        return acc.concat(phase.pokemons);
    }, []);
    const rewards = dungeonDifficultyData.rewards;

    const maxLevel = Math.max(...allDungeonPokemons.map((pokemon) => pokemon.level));
    const difficultyHeader = `[Lv. ${maxLevel}] ${difficultyData.name}`;

    let difficultyString = '';
    const uniqueSpeciesIds = [...new Set(allDungeonPokemons.map((pokemon) => pokemon.speciesId))];
    const pokemonEmojis = uniqueSpeciesIds.map((speciesId) => pokemonConfig[speciesId].emoji);
    difficultyString += `**Pokemon:** ${pokemonEmojis.join(' ')}\n`;
    difficultyString += `**Rewards:** ${getRewardsString(flattenRewards(rewards), received=false)}`;

    return {
        difficultyHeader,
        difficultyString,
    }
}

module.exports = {
    buildPartyString,
    buildMoveString,
    buildBattlePokemonString,
    buildNpcDifficultyString,
    buildDungeonDifficultyString,
};