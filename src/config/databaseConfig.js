const { rarityConfig } = require('./pokemonConfig');

const shinyAggregate = function(shiny) {
    return shiny ? 1 : 0;
}

const worthAggregate = function(rarityConfig, rarity) {
    return rarityConfig[rarity].money;
}

const DB_NAME = 'pokestar';

const collectionNames = {
    USERS: 'users',
    USER_POKEMON: 'userPokemon',
    POKEMON_GROUPED: 'pokemonGrouped',
    POKEMON_AND_USERS: 'pokemonAndUsers',
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
    [collectionNames.POKEMON_GROUPED]: {
        viewOn: collectionNames.USER_POKEMON,
        pipeline: [
            {
                $project: {
                    "userId": 1,
                    "worth": { $function: { 
                        body: worthAggregate.toString(),
                        args: [rarityConfig, "$rarity"], 
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
        indexes: [
            {
                key: { userId: 1 },
                unique: true
            }
        ]
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
        indexes: [
            {
                key: { userId: 1 },
                unique: true
            }
        ]
    },
}


module.exports = {
    DB_NAME,
    collectionNames,
    collectionConfig
};
