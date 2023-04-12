const { logger } = require("../log");
const { findDocuments, updateDocument } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { getOrSetDefault } = require("../utils/utils");
const { natureConfig, pokemonConfig } = require("../config/pokemonConfig");
const { ObjectId } = require("mongodb");

// TODO: move this?
const PAGE_SIZE = 10;

const listPokemons = async (trainer, page) => {
    // get pokemon with pagination
    try {
        const res = await findDocuments(collectionNames.USER_POKEMON, { userId: trainer.userId }, PAGE_SIZE, page - 1);
        if (res.length === 0) {
            return { data: null, err: "No Pokemon found." };
        } else if (res.length > PAGE_SIZE) {
            res.pop();
            return { data: res, lastPage: false, err: null };
        } else {
            return { data: res, lastPage: true, err: null };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error getting Pokemon." };
    }
}

const calculatePokemonStats = (pokemon, speciesData) => {
    // get nature, IVs, EVs, level, base stats
    const { natureId, ivs, evs, level } = pokemon;
    const { baseStats } = speciesData;
    const nature = natureConfig[natureId].stats;

    // calculate new stats
    const newStats = [];
    // HP
    newStats.push(Math.floor((2 * baseStats[0] + ivs[0] + Math.floor(evs[0] / 4)) * level / 100) + level + 10);
    // other stats
    for (let i = 1; i < 6; i++) {
        let stat = Math.floor((2 * baseStats[i] + ivs[i] + Math.floor(evs[i] / 4)) * level / 100) + 5;
        if (nature[i] > 0) {
            stat = Math.floor(stat * 1.1);
        } else if (nature[i] < 0) {
            stat = Math.floor(stat * 0.9);
        }
        newStats.push(stat);
    }

    // calculate new combat power
    // TODO: change calculation?
    const newCombatPower = (newStats[0]/2) + newStats[1] + newStats[2] + newStats[3] + newStats[4] + newStats[5];
    
    pokemon.stats = newStats;
    pokemon.combatPower = newCombatPower;

    return pokemon;
}

const calculateAndUpdatePokemonStats = async (pokemon, speciesData) => {
    // get old stats and combat power
    const oldStats = getOrSetDefault(pokemon, "stats", [0, 0, 0, 0, 0, 0]);
    const oldCombatPower = getOrSetDefault(pokemon, "combatPower", 0);

    // get updated pokemon 
    pokemon = calculatePokemonStats(pokemon, speciesData);

    // check if old stats and combat power are the same
    if (oldStats[0] !== pokemon.stats[0] 
        || oldStats[1] !== pokemon.stats[1] 
        || oldStats[2] !== pokemon.stats[2] 
        || oldStats[3] !== pokemon.stats[3] 
        || oldStats[4] !== pokemon.stats[4] 
        || oldStats[5] !== pokemon.stats[5] 
        || oldCombatPower !== pokemon.combatPower) {
        try {
            const id = new ObjectId(pokemon._id);    

            const res = await updateDocument(
                collectionNames.USER_POKEMON,
                { userId: pokemon.userId, _id: id },
                { $set: pokemon }
            );
            if (res.modifiedCount === 0) {
                logger.error(`Failed to update Pokemon ${pokemon._id}.`)
                return { data: null, err: "Error updating Pokemon." };
            }
            logger.info(`Updated stats for Pokemon ${pokemon._id}.`);
        } catch (error) {
            logger.error(error);
            return { data: null, err: "Error updating Pokemon." };
        }
    }

    return { data: pokemon, err: null };
}

const getPokemon = async (trainer, pokemonId) => {
    const id = new ObjectId(pokemonId);

    // find instance of pokemon in trainer's collection
    try {
        const res = await findDocuments(collectionNames.USER_POKEMON, { userId: trainer.userId, _id: id });
        if (res.length === 0) {
            return { data: null, err: "Pokemon not found." };
        } else {
            return await calculateAndUpdatePokemonStats(res[0], pokemonConfig[res[0].speciesId]);
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error getting Pokemon." };
    }
}

module.exports = {
    listPokemons,
    getPokemon,
    calculatePokemonStats,
    calculateAndUpdatePokemonStats
};