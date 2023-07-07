/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * pokemonUtils.js the lowest level of pokemon code used by pokemonUtils.js
*/
const { growthRates, rarityConfig, pokemonConfig, growthRateConfig } = require('../config/pokemonConfig');
const { getPBar, getWhitespace } = require('./utils');
const { abilityConfig } = require('../config/battleConfig');
const { equipmentConfig, modifierSlotConfig, modifierConfig, modifierTypes } = require('../config/equipmentConfig');

const getPokemonExpNeeded = (level, growthRate) => {
    if (level <= 1) {
        return 0;
    }

    return growthRateConfig[growthRate].growthFn(level);
}

const calculateWorth = (pokemons=null, speciesIds=null) => {
    let worth = 0;
    if (pokemons) {
        pokemons.forEach(pokemon => {
            worth += rarityConfig[pokemonConfig[pokemon.speciesId].rarity].money * (pokemon.shiny ? 100 : 1);
        });
    } else if (speciesIds) {
        speciesIds.forEach(speciesId => {
            worth += rarityConfig[pokemonConfig[speciesId].rarity].money;
        });
    }

    return worth;
}

const buildPokemonStatString = (pokemon, size=20, compact=false) => {
    const statArray = [
        `${pokemon.stats[0]}` + (compact ? `` : `|${pokemon.ivs[0]}|${pokemon.evs[0]}`),
        `${pokemon.stats[1]}` + (compact ? `` : `|${pokemon.ivs[1]}|${pokemon.evs[1]}`),
        `${pokemon.stats[2]}` + (compact ? `` : `|${pokemon.ivs[2]}|${pokemon.evs[2]}`),
        `${pokemon.stats[3]}` + (compact ? `` : `|${pokemon.ivs[3]}|${pokemon.evs[3]}`),
        `${pokemon.stats[4]}` + (compact ? `` : `|${pokemon.ivs[4]}|${pokemon.evs[4]}`),
        `${pokemon.stats[5]}` + (compact ? `` : `|${pokemon.ivs[5]}|${pokemon.evs[5]}`)
    ];
    const whitespace = getWhitespace(statArray);
    let statString = "";
    statString += `\` HP (${whitespace[0]}${statArray[0]})\` ${getPBar(pokemon.stats[0] * 100 / 800, size=size)}\n`;
    statString += `\`Atk (${whitespace[1]}${statArray[1]})\` ${getPBar(pokemon.stats[1] * 100 / 800, size=size)}\n`;
    statString += `\`Def (${whitespace[2]}${statArray[2]})\` ${getPBar(pokemon.stats[2] * 100 / 800, size=size)}\n`;
    statString += `\`SpA (${whitespace[3]}${statArray[3]})\` ${getPBar(pokemon.stats[3] * 100 / 800, size=size)}\n`;
    statString += `\`SpD (${whitespace[4]}${statArray[4]})\` ${getPBar(pokemon.stats[4] * 100 / 800, size=size)}\n`;
    statString += `\`Spe (${whitespace[5]}${statArray[5]})\` ${getPBar(pokemon.stats[5] * 100 / 800, size=size)}\n`;
    statString += `Power: ${pokemon.combatPower}`;

    return statString;
}

const buildPokemonBaseStatString = (speciesData, size=20) => {
    const statArray = [
        `${speciesData.baseStats[0]}`,
        `${speciesData.baseStats[1]}`,
        `${speciesData.baseStats[2]}`,
        `${speciesData.baseStats[3]}`,
        `${speciesData.baseStats[4]}`,
        `${speciesData.baseStats[5]}`
    ];
    const whitespace = getWhitespace(statArray);
    let statString = "";
    statString += `\` HP ${whitespace[0]}${statArray[0]}\` ${getPBar(speciesData.baseStats[0] * 100 / 200, size=size)}\n`;
    statString += `\`Atk ${whitespace[1]}${statArray[1]}\` ${getPBar(speciesData.baseStats[1] * 100 / 200, size=size)}\n`;
    statString += `\`Def ${whitespace[2]}${statArray[2]}\` ${getPBar(speciesData.baseStats[2] * 100 / 200, size=size)}\n`;
    statString += `\`SpA ${whitespace[3]}${statArray[3]}\` ${getPBar(speciesData.baseStats[3] * 100 / 200, size=size)}\n`;
    statString += `\`SpD ${whitespace[4]}${statArray[4]}\` ${getPBar(speciesData.baseStats[4] * 100 / 200, size=size)}\n`;
    statString += `\`Spe ${whitespace[5]}${statArray[5]}\` ${getPBar(speciesData.baseStats[5] * 100 / 200, size=size)}\n`;
    statString += `Total: ${speciesData.baseStats.reduce((a, b) => a + b, 0)}`;

    return statString;
}

const calculateEffectiveSpeed = (speed) => {
    // use formula:
    // y\ =\ 100\ \left\{x\ \le\ 0\right\}
    // y=\frac{1}{2}x\ +\ 100\ \left\{0\ <x\ \le\ 400\right\}
    // y\ =\ \frac{1}{3}x\ +166\left\{400\ <\ x\ \right\}

    if (speed <= 0) {
        return 100;
    } else if (speed <= 400) {
        return Math.floor(speed / 2 + 100);
    } else {
        return Math.floor(speed / 3 + 166);
    }
}

const calculateEffectiveAccuracy = (accuracy) => {
    // use formula:
    // if acc <= 20: acc = 0.2
    // else: acc = acc/100

    if (accuracy <= 20) {
        return 0.2;
    } else {
        return accuracy / 100;
    }
}

const calculateEffectiveEvasion = (evasion) => {
    // use formula:
    // if eva <= 20: eva = 0.2
    // else: eva = eva/100

    if (evasion <= 20) {
        return 0.2;
    } else {
        return evasion / 100;
    }
}

const getAbilityName = (abilityId) => {
    if (abilityConfig[abilityId]) {
        return `#${abilityId} ${abilityConfig[abilityId].name}`;
    } else {
        return `#${abilityId}`;
    }
}

// speciesAbilities = abilityId => probability
const getAbilityOrder = (speciesAbilities) => {
    if (Object.keys(speciesAbilities).length === 1) {
        return Object.keys(speciesAbilities);
    }

    // sort abilities: primary sort by probability (desc), secondary sort by id (asc)
    const sortedAbilities = Object.keys(speciesAbilities).sort((a, b) => {
        if (speciesAbilities[a] > speciesAbilities[b]) {
            return -1;
        } else if (speciesAbilities[a] < speciesAbilities[b]) {
            return 1;
        } else {
            a = parseInt(a);
            b = parseInt(b);
            return a - b;
        }
    })

    return sortedAbilities;
}

const getPokemonOrder = (pokemons=pokemonConfig) => {
    // sort: split by dash and sort accordingly
    return Object.keys(pokemons).sort((a, b) => {
        aSplit = a.split("-");
        bSplit = b.split("-");
        for (let i = 0; i < 5; i++) {
            ai = aSplit[i] ? parseInt(aSplit[i]) : 0;
            bi = bSplit[i] ? parseInt(bSplit[i]) : 0;
            if (ai < bi) {
                return -1;
            } else if (ai > bi) {
                return 1;
            }
        }
        return 0;
    });
}

const getPokemonIdToIndex = (pokemons=pokemonConfig) => {
    const pokemonOrder = getPokemonOrder(pokemons);
    const pokemonIdToIndex = {};
    for (let i = 0; i < pokemonOrder.length; i++) {
        pokemonIdToIndex[pokemonOrder[i]] = i;
    }
    return pokemonIdToIndex;
}

const buildEquipmentString = (equipmentType, equipment) => {
    const { level=1, slots={} } = equipment;
    const equipmentData = equipmentConfig[equipmentType];
    const equipmentHeader = `${equipmentData.emoji} [Lv. ${level}] ${equipmentData.name}`;

    const modifierNames = [];
    const modifierValues = [];
    for (const [slotId, slot] of Object.entries(slots)) {
        const slotData = modifierSlotConfig[slotId];
        const modifierData = modifierConfig[slot.modifier];
        const { type, min, max } = modifierData;

        const baseValue = slot.quality / 100 * (max - min) + min;
        const value = Math.round(baseValue * (slotData.level ? level : 1));

        modifierNames.push(`[${slotData.abbreviation}] ${modifierData.name}`);
        modifierValues.push(`${value}${type === modifierTypes.PERCENT ? "%" : ""}`);
    }
    const whitespace = getWhitespace(modifierNames, 20);
    const equipmentString = modifierNames.map((name, i) => {
        let str = `\`${name}${whitespace[i]}${modifierValues[i]}\``;
        // bold primary / secondary stats
        if (i <= 1) {
            name = str = `**${str}**`;
        }
        return str;
    }).join("\n");

    return {
        equipmentHeader,
        equipmentString
    }
}

const buildBoostString = (oldPokemon, newPokemon) => {
    const boostStrings = ["HP", "Atk", "Def", "SpA", "SpD", "Spe", "Power"];
    const boostValues = [];
    for (let i = 0; i < 6; i++) {
        const oldStat = oldPokemon.stats[i];
        const newStat = newPokemon.stats[i];
        boostValues.push(`${oldStat} -> ${newStat} (+${newStat - oldStat})`);
    }
    boostValues.push(`${oldPokemon.combatPower} -> ${newPokemon.combatPower} (+${newPokemon.combatPower - oldPokemon.combatPower})`);
    const whitespace = getWhitespace(boostStrings, 10);
    const boostString = boostStrings.map((name, i) => {
        return `\`${name}${whitespace[i]}${boostValues[i]}\``;
    }).join("\n");

    return boostString;
}

const getPartyPokemonIds = (trainer) => {
    // get unique pokemon ids in all parties
    const allIds = trainer.party.pokemonIds;
    const savedPartyIds = Object.values(trainer.savedParties).map(party => party.pokemonIds).flat();
    const uniqueIds = [...new Set([...allIds, ...savedPartyIds])];

    return uniqueIds;
}

const getMoveIds = (pokemon) => {
    if (pokemon.moveIds && pokemon.moveIds.length > 0) {
        return pokemon.moveIds;
    } else {
        return pokemonConfig[pokemon.speciesId].moveIds;
    }
}

module.exports = {
    getPokemonExpNeeded,
    calculateWorth,
    buildPokemonStatString,
    buildPokemonBaseStatString,
    calculateEffectiveSpeed,
    calculateEffectiveAccuracy,
    calculateEffectiveEvasion,
    getAbilityName,
    getAbilityOrder,
    getPokemonOrder,
    getPokemonIdToIndex,
    buildEquipmentString,
    buildBoostString,
    getPartyPokemonIds,
    getMoveIds
};