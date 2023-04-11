const { backpackCategories, backpackItemConfig } = require('../config/backpackConfig');
const { dailyRewardChances, NUM_DAILY_REWARDS, pokeballChanceConfig } = require('../config/gachaConfig');
const { updateDocument, insertDocument } = require('../database/mongoHandler');
const { stageNames } = require('../config/stageConfig');
const { logger } = require('../log');
const { getOrSetDefault } = require('./utils');
const { rarityBins, pokemonConfig } = require('../config/pokemonConfig');
const { collectionNames } = require('../config/databaseConfig');

const drawDiscrete = (probabilityDistribution, times) => {
    const results = [];
    for (let i = 0; i < times; i++) {
        const rand = Math.random();
        let sum = 0;
        for (const item in probabilityDistribution) {
            sum += probabilityDistribution[item];
            if (rand < sum) {
                results.push(item);
                break;
            }
        }
    }
    return results;
}

const drawIterable = (iterable, times) => {
    const results = [];
    for (let i = 0; i < times; i++) {
        results.push(iterable[Math.floor(Math.random() * iterable.length)]);
    }
    return results;
}

const drawUniform = (min, max, times) => {
    const results = [];
    for (let i = 0; i < times; i++) {
        results.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return results;
}

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
    const pokemonData = pokemonConfig[pokemonId];

    const pokemon = {
        "userId": trainer.userId,
        "speciesId": pokemonId,
        "name": pokemonData.name,
        "level": 1,
        "experience": 0,
        "evs": [0, 0, 0, 0, 0, 0],
        "ivs": drawUniform(0, 31, 6),
        "natureId": `${drawUniform(0, 24, 1)[0]}`,
        "abilityId": `${drawDiscrete(pokemonData.abilities, 1)[0]}`,
        "item": "",
        "moves": [],
        "shiny": false,
    }

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
        "pokemonData": pokemonData,
    }

    return { data: rv , err: null };
}

module.exports = {
    drawDaily,
    drawIterable,
    drawUniform,
    usePokeball,
};
