const { getTrainer } = require('../../services/trainer');
const { buildPokemonInfoSend } = require('../../services/pokemon');

/**
 * Gets information about a Pokemon, returning an embed with the Pokemon's info.
 * @param {Object} user User who initiated the command.
 * @param {String} pokemonId ID of the Pokemon to get info about.
 * @returns Embed with Pokemon's info.
 */
const info = async (user, pokemonId) => {
    return await buildPokemonInfoSend({
        user: user,
        pokemonId: pokemonId
    })
}

const infoMessageCommand = async (message) => {
    const pokemonId = message.content.split(' ')[1];
    const { send, err } = await info(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const infoSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const { send, err } = await info(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: infoMessageCommand,
    slash: infoSlashCommand
};