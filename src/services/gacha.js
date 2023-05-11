const { backpackCategories, backpackItemConfig, backpackItems } = require('../config/backpackConfig');
const { dailyRewardChances, NUM_DAILY_REWARDS, pokeballChanceConfig } = require('../config/gachaConfig');
const { rarityBins, pokemonConfig, rarities, rarityConfig } = require('../config/pokemonConfig');
const { collectionNames } = require('../config/databaseConfig');
const { updateDocument, insertDocument, countDocuments, QueryBuilder } = require('../database/mongoHandler');
const { stageNames } = require('../config/stageConfig');
const { drawDiscrete, drawIterable, drawUniform } = require('../utils/gachaUtils');
const { MAX_POKEMON } = require('../config/trainerConfig');

const { logger } = require('../log');
const { getOrSetDefault } = require('../utils/utils');
const { calculatePokemonStats, getBattleEligible } = require('./pokemon');

const DAILY_MONEY = 300;

const drawDaily = async (trainer) => {
    // check if new day; if in alpha, ignore
    const now = new Date();
    const lastDaily = new Date(trainer.lastDaily);
    if (now.getDate() != lastDaily.getDate() || process.env.STAGE == stageNames.ALPHA) {
        trainer.lastDaily = now.getTime();
    } else {
        return { data: null, err: "You already claimed your daily rewards today!" };
    }

    const results = drawDiscrete(dailyRewardChances, NUM_DAILY_REWARDS);
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    trainer.money += DAILY_MONEY;
    for (const result of results) {
        pokeballs[result] = getOrSetDefault(pokeballs, result, 0) + 1;
    }
    try {
        res = await updateDocument(
            collectionNames.USERS, 
            { userId: trainer.userId }, 
            { 
                $set: { backpack: trainer.backpack, lastDaily: trainer.lastDaily },
                $inc: { money: DAILY_MONEY }
            }
        );
        if (res.modifiedCount === 0) {
            logger.error(`Failed to daily draw and update ${trainer.user.username}.`);
            return { data: null, err: "Error daily draw update." };
        }
        logger.info(`Daily draw and update ${trainer.user.username}.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error daily draw update." };
    }

    const rv = {
        money: DAILY_MONEY,
        backpack: results
    }

    return { data: rv, err: null };
}

const giveNewPokemons = async (trainer, pokemonIds) => {
    const pokemons = [];
    for (const pokemonId of pokemonIds) {
        const speciesData = pokemonConfig[pokemonId];

        const ivs = drawUniform(0, 31, 6);
        // if legendary, set 3 random IVs to 31
        if (speciesData.rarity == rarities.LEGENDARY) {
            let indices = drawUniform(0, 5, 3);

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
            "shiny": drawUniform(0, 8192, 1)[0] == 0,
            "dateAcquired": (new Date()).getTime(),
            "ivTotal": ivs.reduce((a, b) => a + b, 0),
            "originalOwner": trainer.userId,
            "rarity": speciesData.rarity,
        }

        // calculate stats
        calculatePokemonStats(pokemon, speciesData);

        // get battle eligible
        pokemon["battleEligible"] = getBattleEligible(pokemonConfig, pokemon);
        pokemons.push(pokemon);
    }

    // store pokemon
    try {
        const query = new QueryBuilder(collectionNames.USER_POKEMON)
            .setInsert(pokemons);
        const res = await query.insertMany();

        if (res.insertedCount !== pokemons.length) {
            logger.error(`Failed to insert pokemons for ${trainer.user.username}.`);
            return { data: null, err: "Error drawing Pokemon." };
        }

        // for each pokemon, add their _id
        for (let i = 0; i < pokemons.length; i++) {
            pokemons[i]["_id"] = res.insertedIds[i];
        }

        const rv = {
            "pokemons": pokemons,
        };
    
        return { data: rv , err: null };
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error drawing Pokemon." };
    }
}

const beginnerRoll = (trainer, quantity) => {
    const currentNumRolls = trainer.beginnerRolls;
    const rolls = {};
    // if currentNumRolls + quantity >= 1 and currentNumRolls < 1, give random beginner pokemon
    if (currentNumRolls + quantity >= 1 && currentNumRolls < 1) {
        rolls[0 - currentNumRolls] = drawIterable(["1", "4", "7"], 1)[0];
    }

    // if currentNumRolls + quantity >= 5 and currentNumRolls < 5, give random epic
    if (currentNumRolls + quantity >= 5 && currentNumRolls < 5) {
        rolls[4 - currentNumRolls] = drawIterable(rarityBins[rarities.EPIC], 1)[0];
    }

    // if currentNumRolls + quantity >= 10 and currentNumRolls < 10, give random legendary
    if (currentNumRolls + quantity >= 10 && currentNumRolls < 10) {
        rolls[9 - currentNumRolls] = drawIterable(rarityBins[rarities.LEGENDARY], 1)[0];
    }

    trainer.beginnerRolls = Math.min(currentNumRolls + quantity, 10);

    return rolls;
}

const usePokeball = async (trainer, pokeballId, quantity=1) => {
    // validate quantity
    if (quantity < 1 || quantity > 10) {
        return { data: null, err: "You may only draw between 1-10 times at once!" };
    }

    // check for max pokemon
    try {
        const numPokemon = await countDocuments(collectionNames.USER_POKEMON, { userId: trainer.userId });
        if (numPokemon + quantity > MAX_POKEMON) {
            return { data: null, err: "Max pokemon reached! Use `/release` to release some pokemon." };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error checking max Pokemon." };
    }
    
    // validate number of pokeballs
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    if (getOrSetDefault(pokeballs, pokeballId, 0) >= quantity) {
        pokeballs[pokeballId] -= quantity;
    } else {
        return { data: null, err: `Not enough Pokeballs of type ${backpackItemConfig[pokeballId].name}! View your items with \`/backpack\`. Use the \`/pokemart\`, daily rewards, or level rewards to get more.` };
    }

    // if pokeball and beginner rolls < 10, roll beginner rolls
    const currentNumRolls = getOrSetDefault(trainer, "beginnerRolls", 0);
    let beginnerRolls = null;
    if (pokeballId == backpackItems.POKEBALL && currentNumRolls < 10) {
        beginnerRolls = beginnerRoll(trainer, quantity);
    }

    // draw rarities
    const rarities = drawDiscrete(pokeballChanceConfig[pokeballId], quantity);

    try {
        const res = await updateDocument(
            collectionNames.USERS, 
            { userId: trainer.userId }, 
            { $set: { backpack: trainer.backpack, beginnerRolls: trainer.beginnerRolls } }
        );
        if (res.modifiedCount === 0) {
            logger.error(`Failed to use pokeball and update ${trainer.user.username}.`);
            return { data: null, err: "Error using Pokeball." };
        }
        // logger.info(`Used pokeball and updated ${trainer.user.username}.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error using Pokeball." };
    }

    const pokemonIds = rarities.map(rarity => drawIterable(rarityBins[rarity], 1)[0]);
    if (beginnerRolls) {
        for (const [index, pokemonId] of Object.entries(beginnerRolls)) {
            pokemonIds[index] = pokemonId;
        }
    }
    
    return await giveNewPokemons(trainer, pokemonIds);
}

module.exports = {
    drawDaily,
    giveNewPokemons,
    usePokeball,
};