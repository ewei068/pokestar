const { getTrainerInfo } = require('../../services/trainer');
const { buildTrainerEmbed } = require('../../embeds/trainerEmbeds');

const trainerInfo = async (user) => {
    const trainer = await getTrainerInfo(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    const embed = buildTrainerEmbed(trainer.data);

    const send = {
        embeds: [embed]
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