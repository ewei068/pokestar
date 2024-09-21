/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * partyInfo.js returns the info of the party for the user.
*/

const { getTrainer } = require('../../services/trainer');
const { getPartyPokemons } = require('../../services/party');
const { buildPartyEmbed } = require('../../embeds/battleEmbeds');
const { buildPokemonSelectRow } = require('../../components/pokemonSelectRow');
const { eventNames } = require('../../config/eventConfig');

/**
 * partyInfo reads the given user's data in order to output the information on the party of the user.
 * @param {*} user the user given to get the relevant data from.
 * @returns Error or message to send.
 */
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
    const partyEmbed = buildPartyEmbed(trainer.data, partyPokemons.data, true);

    // build selection row for pokemon Ids
    const selectRowData = {}
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