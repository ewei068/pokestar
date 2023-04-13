const { backpackCategories, backpackItemConfig } = require('../config/backpackConfig');
const { dailyRewardChances, NUM_DAILY_REWARDS, pokeballChanceConfig } = require('../config/gachaConfig');
const { rarityBins, pokemonConfig, rarities } = require('../config/pokemonConfig');
const { collectionNames } = require('../config/databaseConfig');
const { updateDocument, insertDocument, countDocuments } = require('../database/mongoHandler');
const { stageNames } = require('../config/stageConfig');
const { drawDiscrete, drawIterable, drawUniform } = require('../utils/gachaUtils');
const { MAX_POKEMON } = require('../config/trainerConfig');

const { logger } = require('../log');
const { getOrSetDefault } = require('../utils/utils');
const { calculatePokemonStats } = require('./pokemon');

const drawDaily = async (trainer) => {
    // check if new day; if in alpha, ignore
    const now = new Date();
    const lastDaily = new Date(trainer.lastDaily);
    if (now.getDate() != lastDaily.getDate() || process.env.STAGE == stageNames.ALPHA) {
        trainer.lastDaily = now.getTime();
    } else {
        return { data: [], err: null };
    }

    const results = drawDiscrete(dailyRewardChances, NUM_DAILY_REWARDS);
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    for (const result of results) {
        pokeballs[result] = getOrSetDefault(pokeballs, result, 0) + 1;
    }
    try {
        res = await updateDocument(collectionNames.USERS, { userId: trainer.userId }, { $set: { backpack: trainer.backpack, lastDaily: trainer.lastDaily } });
        if (res.modifiedCount === 0) {
            logger.error(`Failed to daily draw and update ${trainer.user.username}.`);
            return { data: null, err: "Error daily draw update." };
        }
        logger.info(`Daily draw and update ${trainer.user.username}.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error daily draw update." };
    }

    return { data: results, err: null };
}

const usePokeball = async (trainer, pokeballId) => {
    // check for max pokemon
    try {
        const numPokemon = await countDocuments(collectionNames.USER_POKEMON, { userId: trainer.userId });
        if (numPokemon >= MAX_POKEMON) {
            return { data: null, err: "Max pokemon reached! Use `/release` to release some pokemon." };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error checking max pokemon." };
    }
    
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    if (getOrSetDefault(pokeballs, pokeballId, 0) > 0) {
        pokeballs[pokeballId]--;
    } else {
        return { data: null, err: `No pokeballs of type ${backpackItemConfig[pokeballId].name}!` };
    }

    const rarity = drawDiscrete(pokeballChanceConfig[pokeballId], 1)[0];

    try {
        const res = await updateDocument(collectionNames.USERS, { userId: trainer.userId }, { $set: { backpack: trainer.backpack } });
        if (res.modifiedCount === 0) {
            logger.error(`Failed to use pokeball and update ${trainer.user.username}.`);
            return { data: null, err: "Error pokeball use update." };
        }
        // logger.info(`Used pokeball and updated ${trainer.user.username}.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error pokeball use update." };
    }

    const pokemonId = drawIterable(rarityBins[rarity], 1)[0];
    const speciesData = pokemonConfig[pokemonId];


    const ivs = drawUniform(0, 31, 6);
    // if legendary, set 3 random IVs to 31
    if (rarity == rarities.LEGENDARY) {
        const indices = drawUniform(0, 5, 3);

        // while dupes, reroll indices
        // TODO: make this better lol im lazy
        while (indices[0] == indices[1] || indices[0] == indices[2] || indices[1] == indices[2]) {
            indices = drawUniform(0, 5, 3);
        }

        for (const index of indices) {
            ivs[index] = 31;
        }
    }

    const pokemon = {
        "userId": trainer.userId,
        "speciesId": pokemonId,
        "name": speciesData.name,
        "level": 1,
        "exp": 0,
        "evs": [0, 0, 0, 0, 0, 0],
        "ivs": ivs,
        "natureId": `${drawUniform(0, 24, 1)[0]}`,
        "abilityId": `${drawDiscrete(speciesData.abilities, 1)[0]}`,
        "item": "",
        "moves": [],
        "shiny": false,
    }

    // calculate stats
    calculatePokemonStats(pokemon, speciesData);

    // store pokemon
    try {
        const res = await insertDocument(collectionNames.USER_POKEMON, pokemon);
        if (res.insertedCount === 0) {
            logger.error(`Failed to insert pokemon ${pokemon.name} for ${trainer.user.username}.`);
            return { data: null, err: "Error pokemon saving." };
        }
        logger.info(`Inserted pokemon ${pokemon.name} for ${trainer.user.username}.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error pokemon saving." };
    }

    const rv = {
        "pokemon": pokemon,
        "speciesData": speciesData,
    }

    return { data: rv , err: null };
}

module.exports = {
    drawDaily,
    usePokeball,
};