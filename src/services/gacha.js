const { backpackCategories, backpackItemConfig, backpackItems } = require('../config/backpackConfig');
const { dailyRewardChances, NUM_DAILY_REWARDS, pokeballConfig, bannerConfig, bannerTypes, MAX_PITY } = require('../config/gachaConfig');
const { rarityBins, pokemonConfig, rarities, rarityConfig } = require('../config/pokemonConfig');
const { collectionNames } = require('../config/databaseConfig');
const { updateDocument, insertDocument, countDocuments, QueryBuilder } = require('../database/mongoHandler');
const { stageNames } = require('../config/stageConfig');
const { drawDiscrete, drawIterable, drawUniform } = require('../utils/gachaUtils');
const { MAX_POKEMON, trainerFields } = require('../config/trainerConfig');
const { getTrainer } = require('./trainer');
const { getState } = require('./state');

const { logger } = require('../log');
const { getOrSetDefault } = require('../utils/utils');
const { calculatePokemonStats, getBattleEligible } = require('./pokemon');
const { getPokemonExpNeeded } = require('../utils/pokemonUtils');
const { buildBannerEmbed } = require('../embeds/pokemonEmbeds');
const { buildScrollActionRow } = require('../components/scrollActionRow');
const { eventNames } = require('../config/eventConfig');
const { buildButtonActionRow } = require('../components/buttonActionRow');

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

const generateRandomPokemon = (userId, pokemonId, level=1) => {
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
        "userId": userId,
        "speciesId": pokemonId,
        "name": speciesData.name,
        "level": level,
        "exp": level == 1 ? 0 : getPokemonExpNeeded(level, speciesData.growthRate),
        "evs": [0, 0, 0, 0, 0, 0],
        "ivs": ivs,
        "natureId": `${drawUniform(0, 24, 1)[0]}`,
        "abilityId": `${drawDiscrete(speciesData.abilities, 1)[0]}`,
        "item": "",
        "moves": [],
        "shiny": drawUniform(0, 1024, 1)[0] == 0,
        "dateAcquired": (new Date()).getTime(),
        "ivTotal": ivs.reduce((a, b) => a + b, 0),
        "originalOwner": userId,
        "rarity": speciesData.rarity,
    }

    // calculate stats
    calculatePokemonStats(pokemon, speciesData);

    // get battle eligible
    pokemon["battleEligible"] = getBattleEligible(pokemonConfig, pokemon);

    return pokemon;
}


const giveNewPokemons = async (trainer, pokemonIds) => {
    const pokemons = [];
    for (const pokemonId of pokemonIds) {
        const pokemon = generateRandomPokemon(trainer.userId, pokemonId, level=5);
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

const usePokeball = async (trainer, pokeballId, bannerIndex, quantity=1) => {
    // validate quantity
    if (quantity < 1 || quantity > 10) {
        return { data: null, err: "You may only catch between 1-10 Pokemon at once!" };
    }

    // get banner data
    const bannerData = bannerConfig[bannerIndex];
    if (!bannerData) {
        return { data: null, err: "Invalid banner!" };
    }
    const bannerType = bannerData.bannerType;

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

    // draw rarities
    const drawnRarities = drawDiscrete(pokeballConfig[pokeballId].chances, quantity);

    // draw pokemon, accounting for pity
    const trainerBannerInfo = getOrSetDefault(trainer, "banners", trainerFields.banners.default)[bannerType];
    const pokemonIds = [];
    const bannerRateUps = bannerData.rateUp() || {};
    // if pokeball and standard banner and beginner rolls < 10, roll beginner rolls
    const currentNumRolls = getOrSetDefault(trainer, "beginnerRolls", 0);
    let beginnerRolls = null;
    if (pokeballId == backpackItems.POKEBALL && bannerType === bannerTypes.STANDARD &&  currentNumRolls < 10) {
        beginnerRolls = beginnerRoll(trainer, quantity);
    }
    // get non-rate-ups for each rarity
    const nonRateUps = {};
    for (const rarity in rarityBins) {
        const rarityRateUps = bannerRateUps[rarity] || [];
        nonRateUps[rarity] = rarityBins[rarity].filter(pokemonId => !rarityRateUps.includes(pokemonId));
    }
    // roll for pokemon
    for (const rarity of drawnRarities) {
        let rarityRateUp = bannerRateUps[rarity];
        if (trainerBannerInfo.pity >= MAX_PITY) {
            // set rarity to legendary
            rarityRateUp = bannerRateUps[rarities.LEGENDARY];
            if (rarityRateUp) {
                pokemonIds.push(drawIterable(rarityRateUp, 1)[0]);
            } else {
                pokemonIds.push(drawIterable(rarityBins[rarities.LEGENDARY], 1)[0]);
            }

            // reset pity
            trainerBannerInfo.pity -= MAX_PITY + 1;
        } else {
            // if rate up and 50% chance
            if (rarityRateUp) {
                if (Math.random() < 0.5) {
                    pokemonIds.push(drawIterable(rarityRateUp, 1)[0]);
                    if (rarity === rarities.LEGENDARY) {
                        // reset pity
                        trainerBannerInfo.pity -= MAX_PITY + 1;
                    }
                } else {
                    pokemonIds.push(drawIterable(nonRateUps[rarity], 1)[0]);
                }
            } else {
                pokemonIds.push(drawIterable(nonRateUps[rarity], 1)[0]);
                if (rarity === rarities.LEGENDARY) {
                    // reset pity
                    trainerBannerInfo.pity -= MAX_PITY + 1;
                }
            }
        }

        // add pity based on pokeball pity
        trainerBannerInfo.pity += pokeballConfig[pokeballId].pity;
    }

    try {
        const res = await updateDocument(
            collectionNames.USERS, 
            { userId: trainer.userId }, 
            { $set: { 
                backpack: trainer.backpack, 
                beginnerRolls: trainer.beginnerRolls ,
                banners: trainer.banners
            } }
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

    if (beginnerRolls) {
        for (const [index, pokemonId] of Object.entries(beginnerRolls)) {
            pokemonIds[index] = pokemonId;
        }
    }
    
    return await giveNewPokemons(trainer, pokemonIds);
}

const buildBannerSend = async ({ stateId=null, user=null, button=null, page=null } = {}) => {
    // get state
    const state = getState(stateId);

    // check page
    if (page !== null) {
        if (page < 1 || page > bannerConfig.length) {
            return { send: null, err: "Invalid banner." };
        }
        state.index = page - 1;
    }

    // if pokeball undefined, default to Pokeball
    if (state.pokeballId === undefined) {
        state.pokeballId = backpackItems.POKEBALL;
    }

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

    // banner embed
    const bannerData = bannerConfig[state.index];
    const bannerEmbed = buildBannerEmbed(trainer, bannerData);
    send.embeds.push(bannerEmbed);

    // scroll buttons
    const scrollData = {
        stateId: stateId,
    }
    const scrollButtons = buildScrollActionRow(
        state.index + 1, 
        state.index === bannerConfig.length - 1,
        scrollData,
        eventNames.BANNER_SCROLL
    );
    send.components.push(scrollButtons);

    // pokeball select buttons
    const pokeballData = {
        stateId: stateId,
    }
    const pokeballButtonConfigs = [
        {
            data: {
                ...pokeballData,
                pokeballId: backpackItems.POKEBALL,
            },
            disabled: state.pokeballId === backpackItems.POKEBALL,
            emoji: backpackItemConfig[backpackItems.POKEBALL].emoji,
        }, 
        {
            data: {
                ...pokeballData,
                pokeballId: backpackItems.GREATBALL,
            },
            disabled: state.pokeballId === backpackItems.GREATBALL,
            emoji: backpackItemConfig[backpackItems.GREATBALL].emoji,
        },
        {
            data: {
                ...pokeballData,
                pokeballId: backpackItems.ULTRABALL,
            },
            disabled: state.pokeballId === backpackItems.ULTRABALL,
            emoji: backpackItemConfig[backpackItems.ULTRABALL].emoji,
        },
        {
            data: {
                ...pokeballData,
                pokeballId: backpackItems.MASTERBALL,
            },
            disabled: state.pokeballId === backpackItems.MASTERBALL,
            emoji: backpackItemConfig[backpackItems.MASTERBALL].emoji,
        },
        {
            label: "Info",
            data: {
                ...pokeballData
            },
            disabled: false,
        }
    ]
    const pokeballButtons = buildButtonActionRow(
        pokeballButtonConfigs,
        eventNames.BANNER_BUTTON
    )
    send.components.push(pokeballButtons);

    // build choose quantity select gacha
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    const numPokeballs = getOrSetDefault(pokeballs, state.pokeballId, 0);
    const maxNumRolls = Math.min(numPokeballs, 10);
    const gachaData = {
        stateId: stateId,
    }
    const gachaButtonConfigs = [
        {
            label: "x1",
            data: {
                ...gachaData,
                quantity: 1,
            },
            disabled: numPokeballs < 1,
            emoji: backpackItemConfig[state.pokeballId].emoji,
        },
    ]
    if (maxNumRolls > 1) {
        gachaButtonConfigs.push({
            label: `x${maxNumRolls}`,
            data: {
                ...gachaData,
                quantity: maxNumRolls == 1 ? 0 : maxNumRolls,
            },
            disabled: numPokeballs < maxNumRolls,
            emoji: backpackItemConfig[state.pokeballId].emoji,
        });
    }
    const gachaButtons = buildButtonActionRow(
        gachaButtonConfigs,
        eventNames.BANNER_GACHA
    )
    send.components.push(gachaButtons);

    return { send: send, err: null };
}

module.exports = {
    drawDaily,
    giveNewPokemons,
    usePokeball,
    generateRandomPokemon,
    buildBannerSend,
};