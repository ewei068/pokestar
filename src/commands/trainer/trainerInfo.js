const { getTrainer } = require('../../util/trainerUtils.js');
const { buildTrainerEmbed } = require('../../embeds/trainerEmbeds.js');

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
        console.error(err);
        message.channel.send("Error getting trainer info.");
    } else {
        message.channel.send({ embeds: [embed] });
    }
}

const trainerInfoSlashCommand = async (interaction) => {
    const { embed, err } = await trainerInfo(interaction.user);
    if (err) {
        console.error(err);
        interaction.reply("Error getting trainer info.");
    } else {
        interaction.reply({ embeds: [embed] });
    }
}

module.exports = {
    message: trainerInfoMessageCommand,
    slash: trainerInfoSlashCommand
};