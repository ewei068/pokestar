const { getTrainer } = require('../../utils/trainerUtils');
const { buildBackpackEmbed } = require('../../embeds/trainerEmbeds');

const backpack = async (user) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }
    const embed = buildBackpackEmbed(trainer.data);
    return { embed: embed, err: null };
}

const backpackMessageCommand = async (client, message) => {
    const { embed, err } = await backpack(message.author);
    if (err) {
        console.error(err);
        message.channel.send("Error getting backpack.");
    } else {
        message.channel.send({ embeds: [embed] });
    }
}

const backpackSlashCommand = async (interaction) => {
    const { embed, err } = await backpack(interaction.user);
    if (err) {
        console.error(err);
        interaction.reply("Error getting backpack.");
    } else {
        interaction.reply({ embeds: [embed] });
    }
}

module.exports = {
    message: backpackMessageCommand,
    slash: backpackSlashCommand
};