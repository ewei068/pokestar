/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * parties.js is used to display the user's party as requested by the user.
*/
const { getTrainer } = require('../../services/trainer');
const { listPokemons } = require('../../services/pokemon');
const { idFrom } = require('../../utils/utils');
const { buildPartiesEmbed } = require('../../embeds/battleEmbeds');
const { getPartyPokemonIds } = require('../../utils/pokemonUtils');

/**
 * Displays the given user's party via encapsulating the dependencies to variables and compiling the results.
 * @param user user required for displaying a specific party.
 * @returns Error or message to send.
 */
const parties = async (user) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    // get unique pokemon ids in all parties
    const uniqueIds = getPartyPokemonIds(trainer.data);

    // get pokemon from ids
    const pokemons = await listPokemons(
        trainer.data,
        {
            page: 1,
            pageSize: uniqueIds.length + 1, // for safety idk
            filter: { _id: { $in: uniqueIds.map(idFrom) } }
        }
    );
    if (pokemons.err) {
        return { err: pokemons.err };
    }

    // map id to pokemon
    const pokemonMap = {};
    for (const pokemon of pokemons.data) {
        pokemonMap[pokemon._id.toString()] = pokemon;
    }

    // get parties
    const partiesEmbed = buildPartiesEmbed(trainer.data, pokemonMap);

    const send = {
        embeds: [partiesEmbed],
    }
    return { send: send, err: null };
}

//outputs the party from a message command
const partiesMessageCommand = async (message) => {
    const { send, err } = await parties(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

//outputs the party from a slash command
const partiesSlashCommand = async (interaction) => {
    const { send, err } = await parties(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: partiesMessageCommand,
    slash: partiesSlashCommand
}