const { QueryBuilder, updateDocuments } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');
const { pokemonConfig } = require('../../config/pokemonConfig');

// add the following fields
// ivTotal: sum of iv array
// rarity: rarity of pokemon
// dateAcquired: date of acquisition (default to now)
// originalOwner: original owner of pokemon (default to current owner)

const getRarity = function(pokemonConfig, speciesId) {
    const speciesData = pokemonConfig[speciesId];
    return speciesData.rarity;
}

const addFields = async () => {
    const aggregatePipeline = [
        {
            $set: {
                ivTotal: { $sum: "$ivs" },
                rarity: { $function: {
                    body: getRarity.toString(),
                    args: [pokemonConfig, "$speciesId"],
                    lang: "js"
                } },
                dateAcquired: (new Date()).getTime(),
                originalOwner: "$userId",
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

    const query = new QueryBuilder(collectionNames.USER_POKEMON)
        .setAggregate(aggregatePipeline);

    const res = await query.aggregate();
    return res;
}

addFields().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});
