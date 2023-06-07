const { logger } = require("../log");
const { updateDocument, deleteDocuments, QueryBuilder } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { getOrSetDefault, idFrom } = require("../utils/utils");
const { natureConfig, pokemonConfig, MAX_TOTAL_EVS, MAX_SINGLE_EVS, rarities } = require("../config/pokemonConfig");
const { expMultiplier, MAX_RELEASE } = require("../config/trainerConfig");
const { getPokemonExpNeeded, calculateEffectiveSpeed, calculateWorth, getAbilityOrder, getPokemonOrder, getPartyPokemonIds } = require("../utils/pokemonUtils");
const { locations, locationConfig } = require("../config/locationConfig");
const { buildSpeciesDexEmbed, buildPokemonListEmbed, buildPokemonEmbed, buildEquipmentEmbed, buildEquipmentUpgradeEmbed, buildDexListEmbed } = require("../embeds/pokemonEmbeds");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { eventNames } = require("../config/eventConfig");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { getTrainer } = require("./trainer");
const { setState, getState } = require("./state");
const { buildYesNoActionRow } = require("../components/yesNoActionRow");
const { modifierConfig, modifierTypes, modifierSlotConfig, equipmentConfig, MAX_EQUIPMENT_LEVEL, levelUpCost, STAT_REROLL_COST, POKEDOLLAR_MULTIPLIER } = require("../config/equipmentConfig");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { buildBackButtonRow } = require("../components/backButtonRow");
const { getItems, removeItems } = require("../utils/trainerUtils");
const { backpackItemConfig } = require("../config/backpackConfig");
const { drawIterable, drawUniform } = require("../utils/gachaUtils");

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
        const query = new QueryBuilder(collectionNames.LIST_POKEMON)
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

const calculatePokemonStatsNoEquip = (pokemon, speciesData) => {
    // copy pokemon
    const newPokemon = { ...pokemon };
    newPokemon.equipments = {};
    return calculatePokemonStats(newPokemon, speciesData);
}

const calculatePokemonStats = (pokemon, speciesData) => {
    // get nature, IVs, EVs, level, base stats, equips
    const { natureId, ivs, evs, level, equipments={} } = pokemon;
    // copy base stats
    const baseStats = [...speciesData.baseStats];
    const nature = natureConfig[natureId].stats;

    const flatModifiers = [0, 0, 0, 0, 0, 0];
    const percentModifiers = [100, 100, 100, 100, 100, 100];
    // get equipment modifiers
    for (const equipment of Object.values(equipments)) {
        const { level=1, slots={} } = equipment;
        for (const [slotId, slot] of Object.entries(slots)) {
            const slotData = modifierSlotConfig[slotId];
            const modifierData = modifierConfig[slot.modifier];
            const { stat, type, min, max } = modifierData;

            const baseValue = slot.quality / 100 * (max - min) + min;
            const value = Math.round(baseValue * (slotData.level ? level : 1));
            if (type === modifierTypes.FLAT) {
                flatModifiers[stat] += value;
            } else if (type === modifierTypes.PERCENT) {
                percentModifiers[stat] += value;
            } else {
                baseStats[stat] += value;
            }
        }
    }

    // calculate new stats
    const newStats = [];
    // stat calculations
    for (let i = 0; i < 6; i++) {
        // base calculations
        let stat = Math.floor((2 * baseStats[i] + ivs[i] + Math.floor(evs[i] / 4)) * level / 100) + 5;
        if (i === 0) {
            // hp special case
            stat = Math.floor((2 * baseStats[0] + ivs[0] + Math.floor(evs[0] / 4)) * level / 100) + level + 10;
        }
        if (nature[i] > 0) {
            stat = Math.floor(stat * 1.1);
        } else if (nature[i] < 0) {
            stat = Math.floor(stat * 0.9);
        }

        // apply modifiers
        stat = Math.floor(stat * percentModifiers[i] / 100);
        stat += flatModifiers[i];

        newStats.push(stat);
    }

    // calculate new combat power
    // new calc: level * 3 + (3/4) * hp + atk + def + spa + spd + calculateEffectiveSpeed(spe)
    const newCombatPower = Math.floor(level * 3 + (3/4) * newStats[0] + newStats[1] + newStats[2] + newStats[3] + newStats[4] + calculateEffectiveSpeed(newStats[5]));
    
    pokemon.stats = newStats;
    pokemon.combatPower = newCombatPower;

    return pokemon;
}

const calculateAndUpdatePokemonStats = async (pokemon, speciesData, force=false) => {
    // get old stats and combat power
    const oldStats = getOrSetDefault(pokemon, "stats", [0, 0, 0, 0, 0, 0]);
    const oldCombatPower = getOrSetDefault(pokemon, "combatPower", 0);

    // get updated pokemon 
    pokemon = calculatePokemonStats(pokemon, speciesData);

    // check if old stats and combat power are the same
    if (force || oldStats[0] !== pokemon.stats[0] 
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
    const abilities = getAbilityOrder(speciesData.abilities);
    const evolutionAbilities = getAbilityOrder(evolutionSpeciesData.abilities);
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

const canUpgradeEquipment = (trainer, pokemon, equipmentType, upgrade=false, slot=false) => {
    const equipment = pokemon.equipments[equipmentType];
    if (!equipment) {
        return false;
    }
    const equipmentData = equipmentConfig[equipmentType];
    const material = equipmentData.material;
    if (upgrade) {
        // check level
        if (equipment.level >= MAX_EQUIPMENT_LEVEL) {
            return false;
        }

        // check cost
        const moneyCost = levelUpCost(equipment.level) * POKEDOLLAR_MULTIPLIER;
        if (trainer.money < moneyCost) {
            return false;
        }

        // check material
        const materialCost = levelUpCost(equipment.level);
        if (getItems(trainer, material) < materialCost) {
            return false;
        }
    } else if (slot) {
        // check cost
        const moneyCost = STAT_REROLL_COST * POKEDOLLAR_MULTIPLIER;
        if (trainer.money < moneyCost) {
            return false;
        }

        // check material
        const materialCost = STAT_REROLL_COST;
        if (getItems(trainer, material) < materialCost) {
            return false;
        }
    } else {
        return false;
    }

    return true;
}

const upgradeEquipmentLevel = async (trainer, pokemon, equipmentType) => {
    const equipment = pokemon.equipments[equipmentType];
    if (!equipment) {
        return { data: null, err: "Error upgrading equipment." };
    }
    if (!canUpgradeEquipment(trainer, pokemon, equipmentType, true)) {
        return { data: null, err: "You can't upgrade that equipment right now!" };
    }
    const equipmentData = equipmentConfig[equipmentType];
    const material = equipmentData.material;
    const materialData = backpackItemConfig[material];

    // withdraw cost from trainer
    const moneyCost = levelUpCost(equipment.level) * POKEDOLLAR_MULTIPLIER;
    const materialCost = levelUpCost(equipment.level);
    removeItems(trainer, material, materialCost);
    try {
        const res = await updateDocument(
            collectionNames.USERS,
            { _id: idFrom(trainer._id) },
            { $inc: { money: -moneyCost }, $set: { backpack: trainer.backpack } }
        );
        if (res.modifiedCount === 0) {
            logger.warn(`Failed to update trainer ${trainer._id} money.`);
            return { data: null, err: "Error upgrading equipment." };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error upgrading equipment." };
    }

    // update equipment
    equipment.level++;
    const { data, err } = await calculateAndUpdatePokemonStats(pokemon, pokemonConfig[pokemon.speciesId]);
    if (err) {
        return { data: null, err: err };
    } else {
        return { data: `Equipment upgraded to level ${equipment.level} for ₽${moneyCost} and ${materialData.emoji} x${materialCost}!`, err: null };
    }
}

const toggleLock = async (pokemon) => {
    pokemon.locked = !pokemon.locked;
    try {
        const res = await updateDocument(
            collectionNames.USER_POKEMON,
            { _id: idFrom(pokemon._id) },
            { $set: { locked: pokemon.locked } }
        );
        if (res.modifiedCount === 0) {
            logger.warn(`Failed to update Pokemon ${pokemon._id}.`)
            return { data: null, err: "Error locking Pokemon." };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error locking Pokemon." };
    }

    return { err: null };
}

const rerollStatSlot = async (trainer, pokemon, equipmentType, slotId) => {
    const equipment = pokemon.equipments[equipmentType];
    if (!equipment) {
        return { data: null, err: "Error rerolling stat slot." };
    }
    if (!canUpgradeEquipment(trainer, pokemon, equipmentType, false, true)) {
        return { data: null, err: "You can't reroll that stat slot right now!" };
    }
    const equipmentData = equipmentConfig[equipmentType];
    const material = equipmentData.material;
    const materialData = backpackItemConfig[material];
    const slotData = equipmentData.slots[slotId];

    // withdraw cost from trainer
    const moneyCost = STAT_REROLL_COST * POKEDOLLAR_MULTIPLIER;
    const materialCost = STAT_REROLL_COST;
    removeItems(trainer, material, materialCost);
    try {
        const res = await updateDocument(
            collectionNames.USERS,
            { _id: idFrom(trainer._id) },
            { $inc: { money: -moneyCost }, $set: { backpack: trainer.backpack } }
        );
        if (res.modifiedCount === 0) {
            logger.warn(`Failed to update trainer ${trainer._id} money.`);
            return { data: null, err: "Error rerolling stat slot." };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error rerolling stat slot." };
    }

    // update equipment
    equipment.slots[slotId] = {
        "modifier": drawIterable(slotData.modifiers, 1)[0],
        "quality": drawUniform(0, 100, 1)[0],
    }
    const slot = equipment.slots[slotId];
    
    const { data, err } = await calculateAndUpdatePokemonStats(pokemon, pokemonConfig[pokemon.speciesId], force=true);
    if (err) {
        return { data: null, err: err };
    } else {
        return { data: `Stat slot ${slotId} rerolled to ${modifierConfig[slot.modifier].name} (${slot.quality}%) for ₽${moneyCost} and ${materialData.emoji} x${materialCost}!`, err: null };
    }
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

const buildPokemonInfoSend = async ({ user=null, pokemonId=null, tab="info" } = {}) => {
    const send = {
        content: pokemonId,
        embeds: [],
        components: []
    }

    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // get pokemon
    const pokemon = await getPokemon(trainer.data, pokemonId);
    if (pokemon.err) {
        return { embed: null, err: pokemon.err };
    }
    const pokemonNoEquip = calculatePokemonStatsNoEquip(pokemon.data, pokemonConfig[pokemon.data.speciesId]);

    if (tab === "lock") {
        const { err } = await toggleLock(pokemon.data);
        if (err) {
            return { embed: null, err: err };
        }
        tab = "info";
    }

    // build pokemon embed
    const embed = buildPokemonEmbed(trainer.data, pokemon.data, tab, pokemonNoEquip);
    send.embeds.push(embed);

    // build tab selection
    const buttonConfigs = [
        {
            label: "Info",
            disabled: tab === "info",
            data: { id: pokemonId, tab: "info" }
        },
        {
            label: "Battle",
            disabled: tab === "battle",
            data: { id: pokemonId, tab: "battle" }
        },
        {
            label: "Equipment",
            disabled: tab === "equipment",
            data: { id: pokemonId, tab: "equipment" }
        },
        {
            label: pokemon.data.locked ? "Unlock" : "Lock",
            disabled: false,
            data: { id: pokemonId, tab: "lock" }
        },
    ];
    const tabActionRow = buildButtonActionRow(
        buttonConfigs,
        eventNames.POKEMON_INFO_BUTTON
    )
    send.components.push(tabActionRow);

    return { send: send, err: null };
}

const buildPokedexSend = async ({ id="1", tab="info", view="list", page=1 } = {}) => {
    const send = {
        embeds: [],
        components: []
    }
    const allIds = getPokemonOrder();

    if (view === "list") {
        if (page < 1 || page > Math.ceil(allIds.length / 10)) {
            return { send: null, err: "Invalid page number." };
        }

        const start = (page - 1) * 10;
        const end = start + 10;
        const ids = allIds.slice(start, end);

        const embed = buildDexListEmbed(ids, page);
        send.embeds.push(embed);

        const scrollData = {};
        const scrollActionRow = buildScrollActionRow(
            page,
            page === Math.ceil(allIds.length / 10),
            scrollData,
            eventNames.POKEDEX_LIST_BUTTON,
        );
        send.components.push(scrollActionRow);

        const selectData = {};
        const selectActionRow = buildIdConfigSelectRow(
            ids,
            pokemonConfig,
            "Select a Pokemon to view",
            selectData,
            eventNames.POKEDEX_BUTTON,
        );
        send.components.push(selectActionRow);
    } else if (view === "species") {
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
            {
                label: "Abilities",
                disabled: tab === "abilities" ? true : false,
                data: {
                    page: index + 1,
                    tab: "abilities"
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

        // build return button
        const returnButtonData = {
            // page = index of id / 10 + 1
            page: Math.floor(index / 10) + 1,
        }
        const returnButtonConfig = [
            {
                label: "Return",
                disabled: false,
                data: returnButtonData
            }
        ]
        const returnActionRow = buildButtonActionRow(
            returnButtonConfig,
            eventNames.POKEDEX_LIST_BUTTON,
        );
        send.components.push(returnActionRow);
    }

    return { send: send, err: null };
}

const canRelease = async (trainer, pokemonIds) => {
    // get pokemon to release
    const toRelease = await listPokemons(
        trainer, 
        { page: 1, filter: { _id: { $in: pokemonIds.map(idFrom)} } }
    );
    if (toRelease.err) {
        return { err: toRelease.err };
    } else if (toRelease.data.length !== pokemonIds.length) {
        return { err: `You don't have all the Pokemon you want to release!` };
    }

    // see if any pokemon are mythical
    for (const pokemon of toRelease.data) {
        if (pokemon.rarity === rarities.MYTHICAL) {
            return { err: `You can't release ${pokemon.name} (${pokemon._id}) because it's mythical!` };
        }
    }

    // see if any pokemon are locked
    for (const pokemon of toRelease.data) {
        if (pokemon.locked) {
            return { err: `You can't release ${pokemon.name} (${pokemon._id}) because it's locked!` };
        }
    }

    // see if any pokemon are in a team
    const partyUniqueIds = getPartyPokemonIds(trainer);
    for (const pokemon of toRelease.data) {
        if (partyUniqueIds.includes(pokemon._id.toString())) {
            return { err: `You can't release ${pokemon.name} (${pokemon._id}) because it's in one of your parties!` };
        }
    }

    return { toRelease: toRelease, err: null };
}

const buildReleaseSend = async (user, pokemonIds) => {
    // check if pokemonIds has too many ids
    if (pokemonIds.length > MAX_RELEASE || pokemonIds.length < 1) {
        return { err: `You can only release up to ${MAX_RELEASE} pokemons at a time!` };
    }

    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }

    const checkRelease = await canRelease(trainer.data, pokemonIds);
    if (checkRelease.err) {
        return { err: checkRelease.err };
    }
    const toRelease = checkRelease.toRelease;

    // calculate total worth of pokemon
    const totalWorth = calculateWorth(toRelease.data, null);

    // build list embed
    const embed = buildPokemonListEmbed(trainer.data, toRelease.data, 1);

    // build confirmation prompt
    const stateId = setState({ userId: user.id, pokemonIds: pokemonIds }, ttl=150);
    const releaseData = {
        stateId: stateId,
    }
    const actionRow = buildYesNoActionRow(releaseData, eventNames.POKEMON_RELEASE, true);

    const send = {
        content: `Do you really want to release the following Pokemon for ₽${totalWorth}?`,
        embeds: [embed],
        components: [actionRow],
    }

    return { send: send, err: null };
}

const buildEquipmentSend = async ({ stateId=null, user=null } = {}) => {
    const state = getState(stateId);
    
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    let pokemon = await getPokemon(trainer, state.pokemonId);
    if (pokemon.err) {
        return { err: pokemon.err };
    }
    pokemon = pokemon.data;

    // embed info
    const oldPokemon = calculatePokemonStatsNoEquip(pokemon, pokemonConfig[pokemon.speciesId]);
    const equipmentEmbed = buildEquipmentEmbed(pokemon, oldPokemon);

    // equipment selection row
    const selectData = {
        stateId: stateId,
        select: "equipment"
    }
    const selectActionRow = buildIdConfigSelectRow(
        Object.keys(pokemon.equipments),
        equipmentConfig,
        "Select equipment to upgrade",
        selectData,
        eventNames.EQUIPMENT_SELECT,
        false
    )

    const send = {
        embeds: [equipmentEmbed],
        components: [selectActionRow],
    }
    
    return { send: send, err: null };
}

const buildEquipmentUpgradeSend = async ({ stateId=null, user=null } = {}) => {
    const state = getState(stateId);
    
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    let pokemon = await getPokemon(trainer, state.pokemonId);
    if (pokemon.err) {
        return { err: pokemon.err };
    }
    pokemon = pokemon.data;

    const equipmentType = state.equipmentType;
    const equipment = pokemon.equipments[equipmentType];
    if (!equipment) {
        return { err: `Pokemon doesn't have ${equipmentType} equipment!` };
    }

    const button = state.button;
    const slotId = state.slotId;
    const slotData = modifierSlotConfig[slotId];

    const send = {
        embeds: [],
        components: [],
    }

    // embed
    const embed = buildEquipmentUpgradeEmbed(trainer, pokemon, equipmentType, equipment, button === "upgrade", button === "slot" && slotId);
    send.embeds.push(embed);

    // upgrade select buttons
    const buttonData = {
        stateId: stateId,
    }
    const buttonConfigs = [
        {
            label: "Upgrade",
            disabled: button === "upgrade" || !canUpgradeEquipment(trainer, pokemon, equipmentType, true),
            data: {
                ...buttonData,
                button: "upgrade",
            },
        },
        {
            label: "Reroll",
            disabled: button === "slot" || !canUpgradeEquipment(trainer, pokemon, equipmentType, false, true),
            data: {
                ...buttonData,
                button: "slot",
            },
        },
        {
            label: "Info",
            disabled: false,
            data: {
                ...buttonData,
                button: "info",
            },
        },
    ]
    const buttonActionRow = buildButtonActionRow(buttonConfigs, eventNames.EQUIPMENT_BUTTON);
    send.components.push(buttonActionRow);

    if (button === "slot") {
        const rerollData = {
            stateId: stateId,
            select: "slot"
        }
        const rerollSelectRow = buildIdConfigSelectRow(
            Object.keys(equipment.slots),
            modifierSlotConfig,
            "Select stat slot to reroll",
            rerollData,
            eventNames.EQUIPMENT_SELECT,
            false
        )
        send.components.push(rerollSelectRow);
    }

    // if button is upgrade or slot, add upgrade confirm button
    if (button === "upgrade" || button === "slot") {
        const upgradeData = {
            stateId: stateId,
        }
        const upgradeButtonConfigs = [
            {
                label: button === "upgrade" ? "Confirm Upgrade" : `Reroll ${slotData.name}`,
                disabled: !canUpgradeEquipment(trainer, pokemon, equipmentType, button === "upgrade", button === "slot"),
                data: {
                    ...upgradeData,
                },
            }
        ]
        const upgradeActionRow = buildButtonActionRow(upgradeButtonConfigs, eventNames.EQUIPMENT_UPGRADE);
        send.components.push(upgradeActionRow);
    }

    // back button
    const backButtonConfigs = [
        {
            label: "Return",
            disabled: false,
            data: {
                ...buttonData,
                button: "back",
            },
        }
    ]
    const backButtonActionRow = buildButtonActionRow(backButtonConfigs, eventNames.EQUIPMENT_BUTTON);
    send.components.push(backButtonActionRow);

    return { send: send, err: null };
}

module.exports = {
    listPokemons,
    getPokemon,
    getEvolvedPokemon,
    evolvePokemon,
    calculatePokemonStatsNoEquip,
    calculatePokemonStats,
    calculateAndUpdatePokemonStats,
    releasePokemons,
    canRelease,
    addPokemonExpAndEVs,
    trainPokemon,
    setBattleEligible,
    getBattleEligible,
    canUpgradeEquipment,
    upgradeEquipmentLevel,
    rerollStatSlot,
    buildPokemonInfoSend,
    buildPokedexSend,
    buildReleaseSend,
    buildEquipmentSend,
    buildEquipmentUpgradeSend,
};