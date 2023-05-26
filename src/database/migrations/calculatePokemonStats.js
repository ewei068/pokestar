const { QueryBuilder } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');
const { calculatePokemonStats } = require('../../services/pokemon');
const { natureConfig, pokemonConfig } = require('../../config/pokemonConfig');
const { calculateEffectiveSpeed } = require('../../utils/pokemonUtils');

/**
 * Stat calculation wrapper
 * Due to mongo's weirdness, we need to use eval to call functions from other files,
 * and pass them as strings.
 * We also need to pass parameters in.
 */
const calculateStats = function(pokemon, pokemonConfig, natureConfig, speedFn, fnString) {
    const calculateEffectiveSpeed = eval(speedFn);
    return eval(fnString)(pokemon, pokemonConfig[pokemon.speciesId]);
}

/**
 * Re-calculate Pokemon stats every time stat calculation changes
 * Usages:
**/

const calculateAllStats = async () => {
    const aggregationPipeline = [
        {
            $replaceRoot: {
                newRoot: {
                    $function: {
                        body: calculateStats.toString(),
                        args: [
                            "$$ROOT", 
                            pokemonConfig, 
                            natureConfig, 
                            calculateEffectiveSpeed.toString(), 
                            calculatePokemonStats.toString()
                        ],
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
    const query = new QueryBuilder(collectionNames.USER_POKEMON)
        .setAggregate(aggregationPipeline);

    return await query.aggregate();
}

calculateAllStats().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});