/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * gacha.js handles all basic gacha logic, draws, dailies etc.
*/
const { backpackCategories, backpackItemConfig, backpackItems } = require('../config/backpackConfig');
const { dailyRewardChances, pokeballConfig, bannerConfig, bannerTypes, MAX_PITY } = require('../config/gachaConfig');
const { rarityBins, pokemonConfig, rarities, rarityConfig } = require('../config/pokemonConfig');
const { collectionNames } = require('../config/databaseConfig');
const { updateDocument, insertDocument, countDocuments, QueryBuilder } = require('../database/mongoHandler');
const { stageNames } = require('../config/stageConfig');
const { drawDiscrete, drawIterable, drawUniform } = require('../utils/gachaUtils');
const { MAX_POKEMON, trainerFields, NUM_DAILY_SHARDS, NUM_DAILY_REWARDS } = require('../config/trainerConfig');
const { getTrainer } = require('./trainer');
const { getState } = require('./state');

const { logger } = require('../log');
const { getOrSetDefault, getTimeToNextDay } = require('../utils/utils');
const { calculatePokemonStats, getBattleEligible } = require('./pokemon');
const { getPokemonExpNeeded } = require('../utils/pokemonUtils');
const { buildBannerEmbed } = require('../embeds/pokemonEmbeds');
const { buildScrollActionRow } = require('../components/scrollActionRow');
const { eventNames } = require('../config/eventConfig');
const { buildButtonActionRow } = require('../components/buttonActionRow');
const { addItems: addItems } = require('../utils/trainerUtils');
const { equipmentConfig } = require('../config/equipmentConfig');
const { locationConfig, locations } = require('../config/locationConfig');

// temp: x2 for event
const DAILY_MONEY = process.env.STAGE == stageNames.ALPHA ? 100000 : 300 * 2;

const drawDaily = async (trainer) => {
    // check if new day; if in alpha, ignore
    if (!trainer.claimedDaily || process.env.STAGE == stageNames.ALPHA) {
        trainer.claimedDaily = true;
    } else {
        // get tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        const tomorrowTime = tomorrow.getTime();
        return { data: null, err: `You already claimed your daily rewards today! You can claim your next reward <t:${Math.floor(tomorrowTime / 1000)}:R>.` };
    }

    // triple shards and money if have celebi
    const mult = trainer.hasCelebi ? 3 : 1;

    const results = drawDiscrete(dailyRewardChances, NUM_DAILY_REWARDS);
    const reducedResults = results.reduce((acc, curr) => {
        if (acc[curr] == undefined) {
            acc[curr] = 1;
        } else {
            acc[curr]++;
        }
        return acc;
    }, {});
    
    // add shards
    reducedResults[backpackItems.KNOWLEDGE_SHARD] = NUM_DAILY_SHARDS * mult;
    reducedResults[backpackItems.EMOTION_SHARD] = NUM_DAILY_SHARDS * mult;
    reducedResults[backpackItems.WILLPOWER_SHARD] = NUM_DAILY_SHARDS * mult;

    // if alpha, give 10 mints
    if (process.env.STAGE == stageNames.ALPHA) {
        reducedResults[backpackItems.MINT] = 10;
    }
            
    const moneyInc = DAILY_MONEY * mult;
    trainer.money += moneyInc;
    Object.entries(reducedResults).forEach(([key, value]) => {
        addItems(trainer, key, value);
    }); 
    try {
        res = await updateDocument(
            collectionNames.USERS, 
            { userId: trainer.userId }, 
            { 
                $set: { backpack: trainer.backpack, claimedDaily: true },
                $inc: { money: moneyInc },
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
        money: moneyInc,
        backpack: reducedResults,
    }

    return { data: rv, err: null };
}

const generateRandomEquipments = (equipmentLevel=1) => {
    const equipments = {};
    for (equipmentType in equipmentConfig) {
        const equipmentData = equipmentConfig[equipmentType];
        const equipment = {
            "level": equipmentLevel,
            "slots": {},
        }
        for (const slot in equipmentData.slots) {
            const slotData = equipmentData.slots[slot];
            equipment["slots"][slot] = {
                "modifier": drawIterable(slotData.modifiers, 1)[0],
                "quality": drawUniform(0, 100, 1)[0],
            }
        }

        equipments[equipmentType] = equipment;
    }

    return equipments;
}

const generateRandomPokemon = (userId, pokemonId, level=5, { equipmentLevel=1, isShiny=false, betterIvs=false}={}) => {
    const speciesData = pokemonConfig[pokemonId];

    const ivs = drawUniform(0, 31, 6);
    // if legendary, set 3 random IVs to 31
    if (speciesData.rarity == rarities.LEGENDARY || betterIvs) {
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

    const shinyChance = process.env.STAGE == stageNames.ALPHA ? 1 : 1024;
    isShiny = isShiny || drawUniform(0, shinyChance, 1)[0] == 0;
    const shouldLock = process.env.STAGE !== stageNames.ALPHA && (isShiny || speciesData.rarity == rarities.LEGENDARY);
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
        "moveIds": [],
        "shiny": isShiny,
        "dateAcquired": (new Date()).getTime(),
        "ivTotal": ivs.reduce((a, b) => a + b, 0),
        "originalOwner": userId,
        "rarity": speciesData.rarity,
        "equipments": generateRandomEquipments(equipmentLevel),
        "locked": shouldLock,
    }

    // calculate stats
    calculatePokemonStats(pokemon, speciesData);

    // get battle eligible
    pokemon["battleEligible"] = getBattleEligible(pokemonConfig, pokemon);

    return pokemon;
}


const giveNewPokemons = async (trainer, pokemonIds, level=5, options) => {
    const pokemons = [];
    for (const pokemonId of pokemonIds) {
        const pokemon = generateRandomPokemon(trainer.userId, pokemonId, level, options);
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

const checkNumPokemon = async (trainer, quantity) => {
    let pokemonLimit = MAX_POKEMON;
    // if trainer has computer lab locations, increase pokemon limit
    const labLevel = trainer.locations[locations.COMPUTER_LAB];
    if (labLevel) {
        pokemonLimit = locationConfig[locations.COMPUTER_LAB].levelConfig[labLevel].storage;
    }

    // check for max pokemon
    try {
        const numPokemon = await countDocuments(collectionNames.USER_POKEMON, { userId: trainer.userId });
        if (numPokemon + quantity > pokemonLimit && process.env.STAGE !== stageNames.ALPHA) {
            return { err: "Max pokemon reached! Use `/release` or `/list` to release some pokemon, or get more storage by purchasing the Computer Lab location in the `/pokemart`!" };
        }
    } catch (error) {
        logger.error(error);
        return { err: "Error checking max Pokemon." };
    }

    return { err: null };
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
    const checkNumPokemonRes = await checkNumPokemon(trainer, quantity);
    if (checkNumPokemonRes.err) {
        return { data: null, err: checkNumPokemonRes.err };
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
            trainerBannerInfo.pity = -1;
        } else {
            // if rate up and 50% chance
            if (rarityRateUp) {
                if (Math.random() < 0.5) {
                    pokemonIds.push(drawIterable(rarityRateUp, 1)[0]);
                    if (rarity === rarities.LEGENDARY) {
                        // reset pity
                        trainerBannerInfo.pity = -1;
                    }
                } else {
                    pokemonIds.push(drawIterable(nonRateUps[rarity], 1)[0]);
                }
            } else {
                pokemonIds.push(drawIterable(nonRateUps[rarity], 1)[0]);
                if (rarity === rarities.LEGENDARY) {
                    // reset pity
                    trainerBannerInfo.pity = -1;
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
    generateRandomEquipments,
    giveNewPokemons,
    usePokeball,
    generateRandomPokemon,
    checkNumPokemon,
    buildBannerSend,
};