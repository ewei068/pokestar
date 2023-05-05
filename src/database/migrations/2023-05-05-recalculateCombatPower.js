const { QueryBuilder, updateDocument } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');
const { pokemonConfig } = require('../../config/pokemonConfig');
const { calculatePokemonStats } = require('../../services/pokemon');

// recalculate the combat power of all pokemon using new formula
// then update entire Pokemon

const addFields = async () => {
    // get all pokemon
    const getQuery = new QueryBuilder(collectionNames.USER_POKEMON)
        .setFilter({});
    const pokemons = await getQuery.find();

    const numPokemon = pokemons.length;
    let count = 0;
    for (let i = 0; i < numPokemon; i++) {
        const pokemon = pokemons[i];
        const speciesData = pokemonConfig[pokemon.speciesId];
        const newPokemon = calculatePokemonStats(pokemon, speciesData);
        const updateRes = await updateDocument(collectionNames.USER_POKEMON, { _id: pokemon._id }, { $set: newPokemon });
        if (updateRes.modifiedCount === 1) {
            count++;
        }
    }
    return `Updated ${count}/${numPokemon} pokemon`;
}

addFields().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});
