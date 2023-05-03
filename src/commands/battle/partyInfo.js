const { getTrainer } = require('../../services/trainer');
const { getPartyPokemons } = require('../../services/party');
const { buildPartyEmbed } = require('../../embeds/battleEmbeds');
const { buildPokemonSelectRow } = require('../../components/pokemonSelectRow');
const { setState } = require('../../services/state');
const { eventNames } = require('../../config/eventConfig');

const partyInfo = async (user) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    // get party pokemons
    const partyPokemons = await getPartyPokemons(trainer.data);
    if (partyPokemons.err) {
        return { send: null, err: partyPokemons.err };
    }
    const partyPokemonsFiltered = partyPokemons.data.filter(pokemon => pokemon !== null);

    // if no party pokemons, return
    if (partyPokemonsFiltered.length === 0) {
        return { send: null, err: `You have no Pokemon in your party! Add a Pokemon with \`/partyadd\`` };
    }

    // build embed
    const partyEmbed = buildPartyEmbed(trainer.data, partyPokemons.data, detailed=true);

    // set state
    const stateId = setState({ 
        userId: user.id, 
    }, ttl=150);
    // build selection row for pokemon Ids
    const selectRowData = {
        stateId: stateId,
    }
    const pokemonSelectRow = buildPokemonSelectRow(partyPokemonsFiltered, selectRowData, eventNames.POKEMON_LIST_SELECT);

    const send = {
        content: "Select a pokemon to copy its ID (On mobile: Hold message -> Copy Text).",
        embeds: [partyEmbed],
        components: [pokemonSelectRow]
    }
    return { send: send, err: null };
}

const partyInfoMessageCommand = async (message) => {
    const { send, err } = await partyInfo(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const partyInfoSlashCommand = async (interaction) => {
    const { send, err } = await partyInfo(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: partyInfoMessageCommand,
    slash: partyInfoSlashCommand
}