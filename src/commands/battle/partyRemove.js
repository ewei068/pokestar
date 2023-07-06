/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * partyRemove.js removes a pokemon from a saved party.
*/
const { getTrainer } = require('../../services/trainer');
const { updateParty, getPartyPokemons } = require('../../services/party');
const { buildPartyEmbed } = require('../../embeds/battleEmbeds');

/**
 * removes a specific pokemon from a saved party.
 * @param {*} user the user given to get the relevant data from.
 * @param {*} option the pokemon specific to remove (can be position, ID, or all).
 * @returns Error or message to send.
 */
const partyRemove = async (user, option) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    const partyPokemon = trainer.data.party.pokemonIds;

    // if option is a number convert to number and use as position
    if (!isNaN(option)) {
        position = parseInt(option);
        const index = position - 1;
        
        // check if position is valid
        if (index < 0 || index >= trainer.data.party.pokemonIds.length) {
            return { send: null, err: `Invalid position! Must be between 1 and ${trainer.data.party.pokemonIds.length}.` };
        }

        // check if pokemon exists in position
        if (partyPokemon[index] == null) {
            return { send: null, err: `There is no Pokemon in that position!` };
        }

        // remove pokemon from party
        partyPokemon[index] = null;
    } else if (option === 'ALL') {
        // remove all pokemon from party
        // get length of party
        const length = trainer.data.party.rows * trainer.data.party.cols;

        // remove all pokemon from party
        trainer.data.party.pokemonIds = Array(length).fill(null);
    } else {
        // option is pokemon ID
        // get index of pokemon
        const index = partyPokemon.indexOf(option);
        // check if pokemon exists in party
        if (index === -1) {
            return { send: null, err: `That Pokemon is not in your party!` };
        }

        // remove pokemon from party
        partyPokemon[index] = null;
    }

    // update trainer
    const update = await updateParty(trainer.data, trainer.data.party);
    if (update.err) {
        return { send: null, err: update.err };
    }

    // get party pokemons
    const partyPokemons = await getPartyPokemons(trainer.data);
    if (partyPokemons.err) {
        return { send: null, err: partyPokemons.err };
    }

    // build pokemon embed
    const embed = buildPartyEmbed(trainer.data, partyPokemons.data);

    const send = {
        content: `Pokemon was removed from your party!`,
        embeds: [embed]
    }
    return { send: send, err: null };
}

const partyRemoveMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const option = args[1];
    const { send, err } = await partyRemove(message.author, option);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const partyRemoveSlashCommand = async (interaction) => {
    const option = interaction.options.getString('option');
    const { send, err } = await partyRemove(interaction.user, option);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: partyRemoveMessageCommand,
    slash: partyRemoveSlashCommand
};