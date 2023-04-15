const { growthRates, rarityConfig, pokemonConfig } = require('../config/pokemonConfig');

const getPokemonExpNeeded = (level, growthRate) => {
    if (growthRate == growthRates.FAST) {
        // (1/2) x ^ 2.5
        return Math.floor(0.5 * Math.pow(level, 2.5));
    } else if (growthRate == growthRates.MEDIUMFAST) {
        // (4/5) x ^ 2.5
        return Math.floor(0.8 * Math.pow(level, 2.5));
    } else if (growthRate == growthRates.MEDIUMSLOW) {
        // x ^ 2.5
        return Math.floor(Math.pow(level, 2.5));
    } else if (growthRate == growthRates.SLOW) {
        // (3/2) x ^ 2.5
        return Math.floor(1.5 * Math.pow(level, 2.5));
    }

    return 0;
}

const calculateWorth = (pokemons=null, speciesIds=null) => {
    let worth = 0;
    if (pokemons) {
        pokemons.forEach(pokemon => {
            worth += rarityConfig[pokemonConfig[pokemon.speciesId].rarity].money;
        });
    } else if (speciesIds) {
        speciesIds.forEach(speciesId => {
            worth += rarityConfig[pokemonConfig[speciesId].rarity].money;
        });
    }

    return worth;
}

module.exports = {
    getPokemonExpNeeded,
    calculateWorth,
};