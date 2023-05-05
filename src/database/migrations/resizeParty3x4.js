const { QueryBuilder } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');

// resize trainer party to 3x4

const resizeParty = function(party) {
    party.rows = 3;
    party.cols = 4;

    if (!party.pokemonIds || party.pokemonIds.length != 9) {
        party.pokemonIds = [null, null, null, null, null, null, null, null, null, null, null, null];
        return party;
    } else {
        // insert null after 9, 6, 3
        party.pokemonIds.splice(9, 0, null);
        party.pokemonIds.splice(6, 0, null);
        party.pokemonIds.splice(3, 0, null);
        return party;
    }
}

const addFields = async () => {
    const aggregatePipeline = [
        {
            $set: {
                party: {
                    $function: {
                        body: resizeParty.toString(),
                        args: ["$party"],
                        lang: "js"
                    }
                }
            }
        },
        { 
            $merge: { 
                into: collectionNames.USERS,
                on: "_id", 
                whenMatched: "replace", 
                whenNotMatched: "insert" 
            } 
        }
    ];

    const query = new QueryBuilder(collectionNames.USERS)
        .setAggregate(aggregatePipeline);

    const res = await query.aggregate();
    return res;
}

addFields().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});
