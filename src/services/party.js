const { collectionNames } = require('../config/databaseConfig');
const { logger } = require('../log');
const { updateDocument } = require('../database/mongoHandler');
const { listPokemons } = require('../services/pokemon');
const { idFrom } = require('../utils/utils');
const { pokemonConfig } = require('../config/pokemonConfig');

const updateParty = async (trainer, party) => {
    try {
        const res = await updateDocument(
            collectionNames.USERS,
            { userId: trainer.userId },
            { $set: { party: party } }
        );
        if (res.modifiedCount === 0) {
            logger.error(`Failed to update trainer ${trainer.user.username}'s party.`);
            return { data: null, err: "Error updating trainer party." };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error updating trainer party." };
    }
    return { data: null, err: null };
}

const getPartyPokemons = async (trainer) => {
    const pokemonIds = trainer.party.pokemonIds.reduce((acc, curr) => {
        if (curr) {
            acc.push(curr);
        }
        return acc;
    }, []);

    const listOptions = {
        filter: { _id: { $in: pokemonIds.map(id => idFrom(id)) } },
        allowNone: true,
    };
    const pokemons = await listPokemons(trainer, listOptions);
    if (pokemons.err) {
        return { data: null, err: pokemons.err };
    }

    // line up pokemon with party order
    const partyPokemons = [];
    for (let i = 0; i < trainer.party.pokemonIds.length; i++) {
        const pokemonId = trainer.party.pokemonIds[i];
        if (pokemonId) {
            const index = pokemons.data.findIndex(p => p._id.toString() === pokemonId.toString());
            if (index === -1) {
                return { data: null, err: "Error finding party pokemon. Use `/partyremove ALL` to fix party." };
            }
            partyPokemons.push(pokemons.data[index]);
        } else {
            partyPokemons.push(null);
        }
    }

    return { data: partyPokemons, err: null };
}

const validateParty = async (trainer) => {
    const party = trainer.party;

    // check if party has valid length
    if (party.pokemonIds.length !== party.rows * party.cols) {
        return { data: null, err: "Please reset your party with `/partyremove ALL`." };
    }

    // check that the party has no duplicates
    const pokemonIds = party.pokemonIds.reduce((acc, curr) => {
        if (curr) {
            acc.push(curr);
        }
        return acc;
    }, []);
    if (pokemonIds.length !== new Set(pokemonIds).size) {
        return { data: null, err: "Please reset your party with `/partyremove ALL`." };
    }

    // check that the party has between 1 and 6 pokemon
    const filteredPokemonIds = pokemonIds.filter(id => id !== null);
    if (filteredPokemonIds.length < 1) {
        return { data: null, err: "No Pokemon in party. Add Pokemon with `/partyadd`." };
    } else if (filteredPokemonIds.length > 6) {
        return { data: null, err: "Invalid party. Please reset your party with `/partyremove ALL`." };
    }

    // attempt to retrieve party pokemon
    const partyPokemons = await getPartyPokemons(trainer);
    if (partyPokemons.err) {
        return { data: null, err: partyPokemons.err };
    }

    // check that all party pokemon are valid
    for (const pokemon of partyPokemons.data) {
        if (pokemon === null) {
            continue;
        }
        if (pokemon.userId.toString() !== trainer.userId.toString()) {
            return { data: null, err: "Please reset your party with `/partyremove ALL`." };
        }
        // check if species is battle eligible
        if (!pokemonConfig[pokemon.speciesId].battleEligible) {
            return { data: null, err: "Please reset your party with `/partyremove ALL`." };
        }
    }

    return partyPokemons;
}

module.exports = {
    updateParty,
    getPartyPokemons,
    validateParty,
};