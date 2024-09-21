/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * locations.js displays locations owned by the user.
*/
const { getTrainer } = require('../../services/trainer');
const { buildLocationsEmbed } = require('../../embeds/trainerEmbeds');

/**
 * Displays the user's owned locations.
 * @param {Object} user User who initiated the command.
 * @returns Embed with user's owned locations.
 */
const locations = async (user) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // get embed
    const embed = buildLocationsEmbed(trainer.data);

    const send = {
        embeds: [embed]
    }

    return { send: send, err: null };
}

const locationsMessageCommand = async (message) => {
    const { send, err } = await locations(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const locationsSlashCommand = async (interaction) => {
    const { send, err } = await locations(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: locationsMessageCommand,
    slash: locationsSlashCommand
};