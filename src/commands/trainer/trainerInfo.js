const { getTrainer } = require('../../utils/trainerUtils.js');
const { buildTrainerEmbed } = require('../../embeds/trainerEmbeds.js');
const { logger } = require('../../log.js');

const trainerInfo = async (user) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }
    const embed = buildTrainerEmbed(trainer.data);
    return { embed: embed, err: null };
}

const trainerInfoMessageCommand = async (client, message) => {
    const { embed, err } = await trainerInfo(message.author);
    if (err) {
        await message.channel.send(`${err}`);
    } else {
        await message.channel.send({ embeds: [embed] });
    }
}

const trainerInfoSlashCommand = async (interaction) => {
    const { embed, err } = await trainerInfo(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
    } else {
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = {
    message: trainerInfoMessageCommand,
    slash: trainerInfoSlashCommand
};