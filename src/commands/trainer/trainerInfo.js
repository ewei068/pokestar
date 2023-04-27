const { getTrainerInfo } = require('../../services/trainer');
const { buildTrainerEmbed } = require('../../embeds/trainerEmbeds');
const { getPartyPokemons } = require('../../services/party');
const { buildPartyEmbed } = require('../../embeds/battleEmbeds');

/**
 * Displays the user's trainer info (trainer card).
 * @param {Object} user User who initiated the command.
 * @returns Embed with user's trainer info.
 */
const trainerInfo = async (user) => {
    // get trainer info (contains extra info)
    const trainer = await getTrainerInfo(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // get party info
    // TODO: should move to another command?
    const partyPokemons = await getPartyPokemons(trainer.data);
    if (partyPokemons.err) {
        return { embed: null, err: partyPokemons.err };
    }

    // build embeds
    const trainerEmbed = buildTrainerEmbed(trainer.data);
    const partyEmbed = buildPartyEmbed(trainer.data, partyPokemons.data);

    const send = {
        embeds: [trainerEmbed, partyEmbed]
    }
    return { send: send, err: null };
}

const trainerInfoMessageCommand = async (message) => {
    const { send, err } = await trainerInfo(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const trainerInfoSlashCommand = async (interaction) => {
    const { send, err } = await trainerInfo(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: trainerInfoMessageCommand,
    slash: trainerInfoSlashCommand
};