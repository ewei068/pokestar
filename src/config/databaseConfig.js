const { getPokemonIdToIndex } = require('../utils/pokemonUtils');
const { modifierSlotConfig, modifierConfig } = require('./equipmentConfig');
const { rarityConfig } = require('./pokemonConfig');

const shinyAggregate = function(shiny) {
    return shiny ? 1 : 0;
}

const worthAggregate = function(rarityConfig, rarity, shiny) {
    return rarityConfig[rarity].money * (shiny ? 100 : 1);
}

const getPokedexOrder = function(idToIndex, speciesId) {
    return idToIndex[speciesId];
}

const equipmentStatAggregate = function(equipmentLevel, slots, modifierSlotConfig, modifierConfig, includeLevel) {
    const stats = {}
    equipmentLevel = equipmentLevel || 1;
    for (const slotId in slots) {
        const slot = slots[slotId];
        const slotData = modifierSlotConfig[slotId];
        const modifierData = modifierConfig[slot.modifier];
        const { stat, type, min, max } = modifierData;

        const baseValue = slot.quality / 100 * (max - min) + min;
        const value = Math.round(baseValue * (slotData.level && includeLevel ? equipmentLevel : 1));
        stats[slot.modifier] = stats[slot.modifier] ? stats[slot.modifier] + value : value;
    }
    return stats;
}

const DB_NAME = 'pokestar';

const collectionNames = {
    USERS: 'users',
    USER_POKEMON: 'userPokemon',
    GUILDS: 'guilds',
    LIST_POKEMON: 'listPokemon',
    POKEMON_GROUPED: 'pokemonGrouped',
    POKEMON_AND_USERS: 'pokemonAndUsers',
    EQUIPMENT: 'equipment',
};

const collectionConfig = {
    [collectionNames.USERS]: {
        indexes: [
            {
                key: { userId: 1 },
                unique: true
            }
        ]
    },
    [collectionNames.USER_POKEMON]: {
        indexes: [
            {
                key: { userId: 1 },
                unique: false
            }
        ]
    },
    [collectionNames.GUILDS]: {
        indexes: [
            {
                key: { guildId: 1 },
                unique: true
            }
        ]
    },
    [collectionNames.LIST_POKEMON]: {
        viewOn: collectionNames.USER_POKEMON,
        pipeline: [
            {
                $set: {
                    "pokedexOrder": {
                        $function: {
                            body: getPokedexOrder.toString(),
                            args: [getPokemonIdToIndex(), "$speciesId"],
                            lang: "js"
                        }
                    }
                }
            },
        ]
    },
    [collectionNames.POKEMON_GROUPED]: {
        viewOn: collectionNames.USER_POKEMON,
        pipeline: [
            {
                $project: {
                    "userId": 1,
                    "worth": { $function: { 
                        body: worthAggregate.toString(),
                        args: [rarityConfig, "$rarity", "$shiny"], 
                        lang: "js" 
                    } },
                    "shiny": { $function: { 
                        body: shinyAggregate.toString(), 
                        args: ["$shiny"], 
                        lang: "js" 
                    } },
                    "combatPower": 1,
                }
            },
            {
                $group: {
                    _id: "$userId",
                    totalWorth: { $sum: "$worth" },
                    totalShiny: { $sum: "$shiny" },
                    totalPower: { $sum: "$combatPower" }
                }
            },
        ],
    },
    [collectionNames.POKEMON_AND_USERS]: {
        viewOn: collectionNames.USERS,
        pipeline: [
            {
                $project: {
                    "userId": 1,
                    "user": 1,
                }
            },
            {
                $lookup: {
                    from: collectionNames.POKEMON_GROUPED,
                    localField: "userId",
                    foreignField: "_id",
                    as: "pokemon"
                }
            },
            {
                $unwind: "$pokemon"
            },
        ],
    },
    [collectionNames.EQUIPMENT]: {
        viewOn: collectionNames.USER_POKEMON,
        pipeline: [
            { 
                "$project": { 
                    _id: 1,
                    userId: 1,
                    speciesId: 1,
                    name: 1,
                    pokemonLevel: "$level",
                    equipments: { 
                        $objectToArray: "$equipments" 
                    }
                }
            },
            {
                $unwind: {
                    path: "$equipments"
                }
            },
            {
                $project: {
                    userId: 1,
                    speciesId: 1,
                    name: 1,
                    pokemonLevel: 1,
                    equipmentType: "$equipments.k",
                    level: "$equipments.v.level",
                    slots: "$equipments.v.slots"
                }
            },
            // add field
            {
                $addFields: {
                    equipmentStats: {
                        $function: {
                            body: equipmentStatAggregate.toString(),
                            args: ["$level", "$slots", modifierSlotConfig, modifierConfig, true],
                            lang: "js"
                        }
                    },
                    equipmentStatsWithoutLevel: {
                        $function: {
                            body: equipmentStatAggregate.toString(),
                            args: ["$level", "$slots", modifierSlotConfig, modifierConfig, false],
                            lang: "js"
                        }
                    }
                }
            },
        ],
    }
}


module.exports = {
    DB_NAME,
    collectionNames,
    collectionConfig
};
