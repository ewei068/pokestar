const { getPokemon } = require('../../services/pokemon');
const { getTrainer } = require('../../services/trainer');
const { pokemonConfig } = require('../../config/pokemonConfig');
const { setState } = require('../../services/state');
const { buildSpeciesSelectRow } = require('../../components/speciesSelectRow');
const { buildPokemonEmbed } = require('../../embeds/pokemonEmbeds');
const { eventNames } = require('../../config/eventConfig');

const evolve = async (user, pokemonId) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    // get pokemon
    const pokemon = await getPokemon(trainer.data, pokemonId);
    if (pokemon.err) {
        return { send: null, err: pokemon.err };
    }

    // get species data
    const speciesData = pokemonConfig[pokemon.data.speciesId];

    if (!speciesData.evolution) {
        return { send: null, err: `${pokemon.data.name} cannot evolve!` };
    }

    const evolutionSpeciesIds = [];
    // check if pokemon can evolve
    for (const evolutionConfig of speciesData.evolution) {
        if (evolutionConfig.level) {
            if (pokemon.data.level >= evolutionConfig.level) {
                evolutionSpeciesIds.push(evolutionConfig.id);
            }
        }
        // TODO: add other evolution methods
    }

    // if empty, pokemon cannot evolve
    if (evolutionSpeciesIds.length === 0) {
        return { send: null, err: `${pokemon.data.name} cannot evolve yet!` };
    }

    const embed = buildPokemonEmbed(trainer.data, pokemon.data);

    // build selection list of pokemon to evolve to
    const stateId = setState({
        userId: user.id,
        pokemonId: pokemon.data._id,
        speciesId: null
    }, ttl=150);
    const selectionRowData = {
        stateId: stateId,
    }
    const selectionRow = buildSpeciesSelectRow(evolutionSpeciesIds, selectionRowData, eventNames.POKEMON_EVOLVE_SELECT);

    const send = {
        content: `Select a pokemon to evolve ${pokemon.data.name} to:`,
        embeds: [embed],
        components: [selectionRow]
    }
    return { send: send, err: null };
}

const evolveMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokemonId = args[1];
    const { send, err } = await evolve(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const evolveSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString("pokemonid");
    const { send, err } = await evolve(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    }
    else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: evolveMessageCommand,
    slash: evolveSlashCommand
};
