const { QueryBuilder, updateDocument } = require('../mongoHandler');
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
 * 2023-05-27: update pokemon effective speed
 * 2023-06-21: update pokemon equipment calculation
 * 2023-07-04: patch lugia's base stats
 * 2023-07-10: increase equipment flat HP
**/

const calculateAllStats = async () => {
    // get all pokemon
    const getQuery = new QueryBuilder(collectionNames.USER_POKEMON)
        .setFilter({});
    const pokemons = await getQuery.find();

    const numPokemon = pokemons.length;
    const promises = [];
    let count = 0;
    for (let i = 0; i < numPokemon; i++) {
        const pokemon = pokemons[i];
        const speciesData = pokemonConfig[pokemon.speciesId];
        const newPokemon = calculatePokemonStats(pokemon, speciesData);
        const updateRes = updateDocument(collectionNames.USER_POKEMON, { _id: pokemon._id }, { $set: newPokemon });
        promises.push(updateRes);
    }
    const res = await Promise.all(promises);
    for (const result of res) {
        if (result.modifiedCount === 1) {
            count++;
        }
    }
    return `Updated ${count}/${numPokemon} pokemon`;
}

calculateAllStats().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});