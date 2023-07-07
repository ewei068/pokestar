const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { backpackItemConfig, backpackItems } = require("../config/backpackConfig");
const { moveConfig } = require("../config/battleConfig");
const { collectionNames } = require("../config/databaseConfig");
const { eventNames } = require("../config/eventConfig");
const { getCelebiPool } = require("../config/gachaConfig");
const { locations } = require("../config/locationConfig");
const { dungeons } = require("../config/npcConfig");
const { pokemonConfig, rarities, natureConfig } = require("../config/pokemonConfig");
const { stageNames } = require("../config/stageConfig");
const { QueryBuilder } = require("../database/mongoHandler");
const { buildPokemonEmbed, buildCelebiAbilityEmbed, buildNewPokemonEmbed } = require("../embeds/pokemonEmbeds");
const { logger } = require("../log");
const { drawDiscrete, drawIterable } = require("../utils/gachaUtils");
const { getItems, removeItems } = require("../utils/trainerUtils");
const { generateRandomPokemon, checkNumPokemon, giveNewPokemons } = require("./gacha");
const { listPokemons, getPokemon, calculatePokemonStats, calculateAndUpdatePokemonStats } = require("./pokemon");
const { getTrainer, updateTrainer } = require("./trainer");

const getMythic = async (trainer, speciesId) => {
    const speciesData = pokemonConfig[speciesId];
    if (!speciesData) {
        return { err: "Pokemon doesn't exist!" };
    }
    if (speciesData.rarity !== rarities.MYTHICAL) {
        return { err: "Pokemon is not Mythical!" };
    }

    const pokemons = await listPokemons(trainer, {
        filter: {
            speciesId: speciesId,
        },
        limit: 1,
        allowNone: true,
    });
    if (pokemons.err) {
        return { err: pokemons.err };
    }

    // if pokemon exists, get pokemon
    if (pokemons.data.length === 0) {
        return { data: null };
    }
        
    const pokemon = await getPokemon(trainer, pokemons.data[0]._id.toString());
    if (pokemon.err) {
        return { err: pokemon.err };
    }

    return { data: pokemon.data };
}

const validateMewMoves = (mew, mewData) => {
    const mythicConfig = mewData.mythicConfig;

    // if len moveIds != 4, return false
    if (mew.moveIds.length !== 4) {
        return { err: "Mew must have 4 moves!" };
    }

    // if duplicate moves, return false
    const moveIds = [...mew.moveIds];
    const uniqueMoves = new Set(moveIds);
    if (uniqueMoves.size !== moveIds.length) {
        return { err: "Mew cannot have duplicate moves!" };
    }

    // iterate over moveIds and check if move is in mewData.mythicConfig
    // first move in basic
    if (!mythicConfig.basicMoveIds.includes(moveIds[0])) {
        return { err: "Mew's first move must be a valid basic move!" };
    }
    // second move in power
    if (!mythicConfig.powerMoveIds.includes(moveIds[1])) {
        return { err: "Mew's second move must be a valid power move!" };
    }
    // third move in power
    if (!mythicConfig.powerMoveIds.includes(moveIds[2])) {
        return { err: "Mew's third move must be a valid power move!" };
    }
    // fourth move in ultimate
    if (!mythicConfig.ultimateMoveIds.includes(moveIds[3])) {
        return { err: "Mew's fourth move must be a valid ultimate move!" };
    }

    return { err: null };
}

const getMew = async (trainer) => {
    const speciesId = "151";
    const mewData = pokemonConfig[speciesId];

    const mewRes = await getMythic(trainer, speciesId);
    if (mewRes.err) {
        return { err: mewRes.err };
    }

    let mew = mewRes.data;
    let modified = false;
    if (!mew) {
        // if trainer hasn't defeated the newIsland, return err
        if (!trainer.defeatedNPCs[dungeons.NEW_ISLAND]) {
            return { err: "You must defeat the New Island in the `/dungeons` before you can get Mew!" };
        }
        
        mew = generateRandomPokemon(trainer.userId, speciesId, level=1);
        // set ivs to 31
        mew.ivs = [31, 31, 31, 31, 31, 31];
        // set shiny to false
        mew.shiny = false;
        // set locked to true
        mew.locked = true;
        // recalculate stats
        calculatePokemonStats(mew, mewData);
        modified = true;
    }

    // if moves not valid, reset moves
    if (validateMewMoves(mew, mewData).err) {
        mew.moveIds = [...mewData.moveIds];
        modified = true;
    }

    // update mew if modified
    if (modified) {
        try {
            const query = new QueryBuilder(collectionNames.USER_POKEMON)
                .setFilter({ userId: mew.userId, speciesId: speciesId })
                .setUpsert({ $set: mew });
            const res = await query.upsertOne();

            if (res.upsertedCount !== 1) {
                logger.warn(`Error updating Mew for ${trainer.user.username}`);
                // return { err: "Error updating Mew" };
            }
            if (res.upsertedId) {
                mew._id = res.upsertedId;
            }
            logger.info(`Updated Mew for ${trainer.user.username}`);
        } catch (err) {
            logger.error(err);
            return { err: "Error updating Mew" };
        }
    }

    return { data: mew };
}

const updateMew = async (user, tab, selection) => {
    const speciesId = "151";
    const mewData = pokemonConfig[speciesId];

    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    const mewRes = await getMew(trainer);
    if (mewRes.err) {
        return { err: mewRes.err };
    }
    const mew = mewRes.data;

    // replace move or nature based on tab
    let err = null;
    switch (tab) {
        case "basic":
            mew.moveIds[0] = selection;
            err = validateMewMoves(mew, mewData).err;
            break;
        case "power1":
            mew.moveIds[1] = selection;
            err = validateMewMoves(mew, mewData).err;
            break;
        case "power2":
            mew.moveIds[2] = selection;
            err = validateMewMoves(mew, mewData).err;
            break;
        case "ultimate":
            mew.moveIds[3] = selection;
            err = validateMewMoves(mew, mewData).err;
            break;
        case "nature":
            mew.natureId = selection;
            break;
        default:
            return { err: "Invalid tab" };
    }
    if (err) {
        return { err: err };
    }

    // update mew
    const updateRes = calculateAndUpdatePokemonStats(mew, mewData, force=true);
    if (updateRes.err) {
        return { err: updateRes.err };
    }

    return { data: mew };
}

const buildMewSend = async ({ user=null, tab="basic" } = {}) => {
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    const mewId = "151";
    const mewData = pokemonConfig[mewId];
    const mythicConfig = mewData.mythicConfig;

    const mewRes = await getMew(trainer);
    if (mewRes.err) {
        return { err: mewRes.err };
    }
    const mew = mewRes.data;

    // choose selection options based on tab
    let selectIds = [];
    let selectConfig = {};
    let extraFields = [];
    switch (tab) {
        case "basic":
            selectIds = mythicConfig.basicMoveIds;
            // filter out moves that mew already knows
            selectIds = selectIds.filter(moveId => !mew.moveIds.includes(moveId));
            selectConfig = moveConfig;
            break;
        case "power1":
            selectIds = mythicConfig.powerMoveIds;
            // filter out moves that mew already knows
            selectIds = selectIds.filter(moveId => !mew.moveIds.includes(moveId));
            selectConfig = moveConfig;
            break;
        case "power2":
            selectIds = mythicConfig.powerMoveIds;
            // filter out moves that mew already knows
            selectIds = selectIds.filter(moveId => !mew.moveIds.includes(moveId));
            selectConfig = moveConfig;
            break;
        case "ultimate":
            selectIds = mythicConfig.ultimateMoveIds;
            // filter out moves that mew already knows
            selectIds = selectIds.filter(moveId => !mew.moveIds.includes(moveId));
            selectConfig = moveConfig;
            break;
        case "nature":
            selectIds = Object.keys(natureConfig);
            selectConfig = natureConfig;
            extraFields = [
                "description",
            ];
            break;
        default:
            return { err: "Invalid tab" };
    }

    const send = {
        content: mew._id.toString(),
        embeds: [],
        components: [],
    }

    // build pokemon embed
    const embed = buildPokemonEmbed(trainer, mew, "all");
    send.embeds.push(embed);

    // build tab buttons
    const tabButtonConfigs = [
        {
            label: "Basic",
            disabled: tab == "basic",
            data: {
                tab: "basic",
            },
        },
        {
            label: "Power 1",
            disabled: tab === "power1",
            data: {
                tab: "power1",
            },
        },
        {
            label: "Power 2",
            disabled: tab === "power2",
            data: {
                tab: "power2",
            },
        },
        {
            label: "Ultimate",
            disabled: tab === "ultimate",
            data: {
                tab: "ultimate",
            },
        },
        {
            label: "Nature",
            disabled: tab === "nature",
            data: {
                tab: "nature",
            },
        },
    ];
    const tabButtons = buildButtonActionRow(tabButtonConfigs, eventNames.MEW_BUTTON);
    send.components.push(tabButtons);

    // break up selection options into batches of 25, then append a selection menu for each batch
    const selectBatches = [];
    for (let i = 0; i < selectIds.length; i += 25) {
        const batch = selectIds.slice(i, i + 25);
        selectBatches.push(batch);
    }
    for (const batch of selectBatches) {
        const selectData = {
            tab: tab,
            nonce: Math.random().toString(),
        }
        const selectRow = buildIdConfigSelectRow(
            batch,
            selectConfig,
            "Select Replacement",
            selectData,
            eventNames.MEW_SELECT,
            false,
            extraFields,
        );
        send.components.push(selectRow);
    }

    return { send: send, err: null };
}

const getCelebi = async (trainer) => {
    const speciesId = "251";
    const celebiData = pokemonConfig[speciesId];

    const celebiRes = await getMythic(trainer, speciesId);
    if (celebiRes.err) {
        return { err: celebiRes.err };
    }

    let celebi = celebiRes.data;
    let modified = false;
    if (!celebi) {
        // if trainer isn't level 75, return error
        const levelReq = process.env.STAGE === stageNames.ALPHA ? 40 : 75;
        if (trainer.level < levelReq) {
            return { err: `Celebi is busy time travelling! Wait a bit (until you're level ${levelReq}) and try again!` };
        }

        // if trainer doesn't have ilex shrine location, return error
        if (trainer.locations[locations.ILEX_SHRINE] === undefined) {
            return { err: "Celebi is currently at a special location (check the `/pokemart`)! Purchase it and try again!" };
        }
        
        celebi = generateRandomPokemon(trainer.userId, speciesId, level=1);
        // set ivs to 31
        celebi.ivs = [31, 31, 31, 31, 31, 31];
        // set shiny to false
        celebi.shiny = false;
        // set locked to true
        celebi.locked = true;
        // set nature to 0
        celebi.natureId = "0";
        // recalculate stats
        calculatePokemonStats(celebi, celebiData);
        modified = true;
    }

    if (!trainer.hasCelebi) {
        trainer.hasCelebi = true;
        trainerRes = await updateTrainer(trainer);
        if (trainerRes.err) {
            return { err: trainerRes.err };
        }
    }

    // update celebi if modified
    if (modified) {
        try {
            const query = new QueryBuilder(collectionNames.USER_POKEMON)
                .setFilter({ userId: celebi.userId, speciesId: speciesId })
                .setUpsert({ $set: celebi });
            const res = await query.upsertOne();

            if (res.upsertedCount !== 1) {
                logger.warn(`Error updating Celebi for ${trainer.user.username}`);
            }
            if (res.upsertedId) {
                celebi._id = res.upsertedId;
            }
            logger.info(`Updated Celebi for ${trainer.user.username}`);
        } catch (err) {
            logger.error(err);
            return { err: "Error updating Celebi" };
        }
    }

    return { data: celebi };
}

const canTimeTravel = async (trainer) => {
    if (!trainer.hasCelebi) {
        return { err: "You need to have Celebi to time travel!" };
    }
    if (trainer.usedTimeTravel) {
        return { err: "You've already used time travel today!" };
    }

    // check if trainer has at least 10 pokeballs
    if (getItems(trainer, backpackItems.POKEBALL) < 10) {
        return { err: "You need at least 10 Pokeballs to time travel!" };
    }

    // check for max pokemon
    return await checkNumPokemon(trainer, 1);
}

const buildCelebiSend = async (user) => {
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    const celebiId = "251";
    const celebiData = pokemonConfig[celebiId];
    const mythicConfig = celebiData.mythicConfig;

    const celebiRes = await getCelebi(trainer);
    if (celebiRes.err) {
        return { err: celebiRes.err };
    }
    const celebi = celebiRes.data;

    const send = {
        content: celebi._id.toString(),
        embeds: [],
        components: [],
    }

    // build pokemon embed
    const embed = buildPokemonEmbed(trainer, celebi, "info");
    send.embeds.push(embed);
    const abilityEmbed = buildCelebiAbilityEmbed(trainer);
    send.embeds.push(abilityEmbed);

    // build time travel button
    const canTimeTravelRes = await canTimeTravel(trainer);
    const timeTravelDisabled = canTimeTravelRes.err !== null;
    const timeTravelButton = buildButtonActionRow(
        [{
            label: "x10 Time Travel",
            disabled: timeTravelDisabled,
            emoji: backpackItemConfig[backpackItems.POKEBALL].emoji,
            data: {}
        }],
        eventNames.CELEBI_TIME_TRAVEL,
    );
    send.components.push(timeTravelButton);

    return { send: send, err: null };
}

const buildTimeTravelSend = async (user) => {
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    const celebiId = "251";
    const celebiData = pokemonConfig[celebiId];
    const mythicConfig = celebiData.mythicConfig;

    const canTimeTravelRes = await canTimeTravel(trainer);
    if (canTimeTravelRes.err) {
        return { err: canTimeTravelRes.err };
    }

    // reduce trainer pokeballs by 10, set time travel to true
    removeItems(trainer, backpackItems.POKEBALL, 10);
    trainer.usedTimeTravel = true;
    const updateRes = await updateTrainer(trainer);
    if (updateRes.err) {
        return { err: updateRes.err };
    }

    // get rarity: epic 90%, legendary 10%
    const dist = {
        [rarities.EPIC]: 0.9,
        [rarities.LEGENDARY]: 0.1
    }
    const rarity = drawDiscrete(dist, 1)[0];
    const possiblePokemons = getCelebiPool()[rarity];
    const pokemonId = drawIterable(possiblePokemons, 1)[0];

    // get new pokemon
    const pokemons = await giveNewPokemons(trainer, [pokemonId]);
    if (pokemons.err) {
        return { err: pokemons.err };
    }
    const pokemon = pokemons.data.pokemons[0];

    const embed = buildNewPokemonEmbed(
        pokemon, 
        backpackItems.POKEBALL, 
        getItems(trainer, backpackItems.POKEBALL)
    );

    const send = {
        content: pokemon._id.toString(),
        embeds: [embed],
        components: [],
    }

    return { send: send, err: null };
}

module.exports = {
    getMew,
    updateMew,
    buildMewSend,
    getCelebi,
    buildCelebiSend,
    buildTimeTravelSend,
}