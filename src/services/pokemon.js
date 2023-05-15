const { logger } = require("../log");
const { findDocuments, updateDocument, deleteDocuments, QueryBuilder } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { getOrSetDefault, idFrom } = require("../utils/utils");
const { natureConfig, pokemonConfig, MAX_TOTAL_EVS, MAX_SINGLE_EVS } = require("../config/pokemonConfig");
const { expMultiplier } = require("../config/trainerConfig");
const { getPokemonExpNeeded, calculateEffectiveSpeed } = require("../utils/pokemonUtils");
const { locations, locationConfig } = require("../config/locationConfig");
const { buildSpeciesDexEmbed } = require("../embeds/pokemonEmbeds");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { eventNames } = require("../config/eventConfig");
const { buildButtonActionRow } = require("../components/buttonActionRow");

// TODO: move this?
const PAGE_SIZE = 10;

const listPokemons = async (trainer, listOptions) => {
    // listOptions: { page, pageSize, filter, sort, allowNone }
    const filter = { userId: trainer.userId, ...listOptions.filter};
    const pageSize = listOptions.pageSize || PAGE_SIZE;
    const page = listOptions.page || 1;
    const sort = listOptions.sort || null;
    const allowNone = listOptions.allowNone || false;

    // get pokemon with pagination
    try {
        const query = new QueryBuilder(collectionNames.USER_POKEMON)
            .setFilter(filter)
            .setLimit(pageSize)
            .setPage(page - 1)
            .setSort(sort);

        const res = await query.find();
        if (res.length === 0 && !allowNone) {
            return { data: null, err: "No Pokemon found. Use `/gacha` to catch some Pokemon!" };
        } else if (res.length > pageSize) {
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
    // new calc: level * 3 + (3/4) * hp + atk + def + spa + spd + calculateEffectiveSpeed(spe)
    const newCombatPower = Math.floor(level * 3 + (3/4) * newStats[0] + newStats[1] + newStats[2] + newStats[3] + newStats[4] + calculateEffectiveSpeed(newStats[5]));
    
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
            const res = await updateDocument(
                collectionNames.USER_POKEMON,
                { userId: pokemon.userId, _id: idFrom(pokemon._id) },
                { $set: pokemon }
            );
            if (res.modifiedCount === 0) {
                logger.warn(`Failed to update Pokemon ${pokemon._id}.`)
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
    // find instance of pokemon in trainer's collection
    try {
        let id = null;
        try {
            id = idFrom(pokemonId);
        } catch (error) {
            return { data: null, err: "Invalid Pokemon ID." };
        }
        const query = new QueryBuilder(collectionNames.USER_POKEMON)
            .setFilter({ userId: trainer.userId, _id: id });
        
        const res = await query.findOne();
        
        if (!res) {
            return { data: null, err: "Pokemon not found or Pokemon not owned by you." };
        } else {
            return await calculateAndUpdatePokemonStats(res, pokemonConfig[res.speciesId]);
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error getting Pokemon." };
    }
}

const releasePokemons = async (trainer, pokemonIds) => {
    // remove pokemon from trainer's collection
    try {
        const res = await deleteDocuments(collectionNames.USER_POKEMON, { userId: trainer.userId, _id: { $in: pokemonIds.map(idFrom) } });
        if (res.deletedCount === 0) {
            return { data: null, err: "No Pokemon found." };
        }
        logger.info(`${trainer.user.username} released ${res.deletedCount} Pokemon.`);
        return { data: res.deletedCount, err: null };
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error releasing Pokemon." };
    }
}

const getEvolvedPokemon = (pokemon, evolutionSpeciesId) => {
    // get species data
    const speciesData = pokemonConfig[pokemon.speciesId];
    const evolutionSpeciesData = pokemonConfig[evolutionSpeciesId];

    // get evolution pokemon
    pokemon = calculatePokemonStats(pokemon, evolutionSpeciesData);
    pokemon.speciesId = evolutionSpeciesId;
    if (pokemon.name === speciesData.name) {
        pokemon.name = evolutionSpeciesData.name;
    }
    pokemon.rarity = evolutionSpeciesData.rarity;

    // calculate ability
    // if evolution has one ability, give that ability
    // else, use ability slots
    // 2 abilities => slot 1, 3
    // 3 abilities => slot 1, 2, 3
    // first convert abilities (map id => probability) into lists
    const abilities = Object.keys(speciesData.abilities);
    const evolutionAbilities = Object.keys(evolutionSpeciesData.abilities);
    if (evolutionAbilities.length === 1) {
        pokemon.abilityId = evolutionAbilities[0];
    } else {
        // get current ability slot
        let slot = 1;
        const index = abilities.indexOf(pokemon.abilityId);
        if (abilities.length === 2) {
            slot = index === 0 ? 1 : 3;
        } else if (abilities.length === 3) {
            slot = index + 1;
        }

        // use slot to get new ability
        if (evolutionAbilities.length === 2) {
            if (slot === 1 || slot === 2) {
                pokemon.abilityId = evolutionAbilities[0];
            } else {
                pokemon.abilityId = evolutionAbilities[1];
            }
        } else if (evolutionAbilities.length === 3) {
            pokemon.abilityId = evolutionAbilities[slot - 1];
        }
    }

    // update battle eligibility
    pokemon.battleEligible = evolutionSpeciesData.battleEligible;

    // TODO: change moves

    return pokemon;
}

const evolvePokemon = async (pokemon, evolutionSpeciesId) => {
    // get evolved pokemon
    pokemon = getEvolvedPokemon(pokemon, evolutionSpeciesId);
    const evolutionSpeciesData = pokemonConfig[evolutionSpeciesId];

    // update pokemon
    try {
        const res = await updateDocument(
            collectionNames.USER_POKEMON,
            { userId: pokemon.userId, _id: idFrom(pokemon._id) },
            { $set: pokemon }
        );
        if (res.modifiedCount === 0) {
            logger.warn(`Failed to evolve Pokemon ${pokemon._id}.`)
            return { data: null, err: "Error evolving Pokemon." };
        }
        logger.info(`Evolved Pokemon ${pokemon._id}.`);
        return { data: { pokemon: pokemon, species: evolutionSpeciesData.name }, err: null };
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error evolving Pokemon." };
    }
}

const addPokemonExpAndEVs = async (trainer, pokemon, exp, evs=[0, 0, 0, 0, 0, 0]) => {
    // get species data
    const speciesData = pokemonConfig[pokemon.speciesId];

    // add EVs
    const gainedEvs = [0, 0, 0, 0, 0, 0];
    if (!pokemon.evs) {
        pokemon.evs = [0, 0, 0, 0, 0, 0];
    }
    for (let i = 0; i < 6; i++) {
        const total = pokemon.evs.reduce((a, b) => a + b, 0);
        // check to see if pokemon has max total EVs
        if (total >= MAX_TOTAL_EVS) {
            break;
        }

        // check to see if pokemon has max single EVs
        if (pokemon.evs[i] >= MAX_SINGLE_EVS) {
            continue;
        }

        // new evs to add = min(evs[i], remaining single, remainin total)
        const newEvs = Math.min(evs[i], MAX_SINGLE_EVS - pokemon.evs[i], MAX_TOTAL_EVS - total);
        pokemon.evs[i] += newEvs;
        gainedEvs[i] = newEvs;
    }

    // calculate exp based on trainer level
    exp = Math.max(Math.floor(exp * expMultiplier(trainer.level)), 1);
    if (!pokemon.exp) {
        pokemon.exp = 0;
    }
    pokemon.exp += exp;

    // add exp to pokemon
    while (pokemon.exp >= getPokemonExpNeeded(pokemon.level + 1, speciesData.growthRate)) {
        if (pokemon.level >= 100) {
            break;
        }
        pokemon.level++;
    }

    // calculate new stats
    pokemon = calculatePokemonStats(pokemon, speciesData);

    // update pokemon
    try {
        const res = await updateDocument(
            collectionNames.USER_POKEMON,
            { userId: trainer.userId, _id: idFrom(pokemon._id) },
            { $set: pokemon }
        );
        if (res.modifiedCount === 0) {
            logger.warn(`Failed to update Pokemon ${pokemon._id}.`)
            return { data: null, err: "Error updating Pokemon." };
        }
        // logger.info(`Level-up and update stats for Pokemon ${pokemon._id}.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error updating Pokemon." };
    }

    const data = {
        exp: exp,
        level: pokemon.level,
        evs: gainedEvs,
    }

    return { data: data, err: null };
}

const trainPokemon = async (trainer, pokemon, locationId) => {
    const locationData = locationConfig[locationId];

    // get trainer location level
    const locationLevel = trainer.locations[locationId];

    let exp = 2;
    let evs = [0, 0, 0, 0, 0, 0];
    // get exp and evs based on location
    if (!locationLevel) {
        // if home (no location), continue
        if (locationId != locations.HOME)
            return { data: null, err: "You don't own that location! View your locations with `/locations`, and buy more at the `/pokemart`!" };
    } else {
        const levelConfig = locationData.levelConfig[locationLevel];
        // get exp and evs based on location
        exp = levelConfig.exp;
        evs = levelConfig.evs;
    }

    // add exp and evs
    return await addPokemonExpAndEVs(trainer, pokemon, exp, evs);
}

// to be used in mongo aggregate or other
function getBattleEligible(pokemonConfig, pokemon) {
    return pokemonConfig[pokemon.speciesId].battleEligible ? true : false;
}

/**
 * Sets the battle eligibility of all pokemon owned by the trainer.
 * Use aggregation pipeline to get all pokemon owned by the trainer,
 * then looks up the Pokemon by species id to get the battle eligibility.
 * @param {*} trainer 
 */
const setBattleEligible = async (trainer) => {
    const aggregation = [
        { $match: { userId: trainer.userId } },
        {
            $addFields: {
                battleEligible: {
                    $function: {
                        body: getBattleEligible.toString(),
                        args: [pokemonConfig, "$$ROOT"],
                        lang: "js"
                    }
                }
            }
        },
        { 
            $merge: {
                into: collectionNames.USER_POKEMON,
                on: "_id",
                whenMatched: "replace",
                whenNotMatched: "insert"
            }
        }
    ];

    try {
        const query = new QueryBuilder(collectionNames.USER_POKEMON)
            .setAggregate(aggregation);
        const res = await query.aggregate();
        logger.info(`Set battle eligibility for all Pokemon owned by ${trainer.userId}.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error setting battle eligibility." };
    }

    return { data: null, err: null };
}

const buildPokedexSend = async ({ id="1", tab="info" } = {}) => {
    const send = {
        embeds: [],
        components: []
    }
    const allIds = Object.keys(pokemonConfig);

    if (pokemonConfig[id] === undefined) {
        // if ID undefined, check all species for name match
        const speciesId = allIds.find(speciesId => pokemonConfig[speciesId].name.toLowerCase() === id.toLowerCase());
        if (speciesId) {
            id = speciesId;
        } else {
            return { send: null, err: "Invalid Pokemon species or Pokemon not added yet!" };
        }
    }
    
    const speciesData = pokemonConfig[id];
    const embed = buildSpeciesDexEmbed(id, speciesData, tab);
    send.embeds.push(embed);

    const index = allIds.indexOf(id);

    // build tab selection
    const buttonConfigs = [
        {
            label: "Info",
            disabled: tab === "info" ? true : false,
            data: {
                page: index + 1,
                tab: "info"
            }
        },
        {
            label: "Growth",
            disabled: tab === "growth" ? true : false,
            data: {
                page: index + 1,
                tab: "growth"
            }
        },
        {
            label: "Moves",
            disabled: tab === "moves" ? true : false,
            data: {
                page: index + 1,
                tab: "moves"
            }
        },
    ]
    const tabActionRow = buildButtonActionRow(
        buttonConfigs,
        eventNames.POKEDEX_BUTTON
    )
    send.components.push(tabActionRow);

    // build scroll row
    const scrollData = {
        tab: tab,
    }
    const scrollActionRow = buildScrollActionRow(
        // page = index of id + 1
        index + 1,
        index >= allIds.length - 1 ? true : false,
        scrollData,
        eventNames.POKEDEX_BUTTON
    )
    send.components.push(scrollActionRow);

    return { send: send, err: null };
}

module.exports = {
    listPokemons,
    getPokemon,
    getEvolvedPokemon,
    evolvePokemon,
    calculatePokemonStats,
    calculateAndUpdatePokemonStats,
    releasePokemons,
    addPokemonExpAndEVs,
    trainPokemon,
    setBattleEligible,
    getBattleEligible,
    buildPokedexSend,
};