const { pokemonConfig, rarityConfig } = require('./pokemonConfig');

const shinyAggregate = (shiny) => {
    return shiny ? 1 : 0;
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
                    // TODO: find a better way to do this
                    "worth": { $function: { 
                        body: `function (speciesId) {
                            const pokemonConfig = ${JSON.stringify(pokemonConfig)};
                            const rarityConfig = ${JSON.stringify(rarityConfig)};
                            const speciesData = pokemonConfig[speciesId];
                            const rarity = rarityConfig[speciesData.rarity];
                            return rarity.money;
                        }`, 
                        args: ["$speciesId"], 
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
