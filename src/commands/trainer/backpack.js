const { getTrainer } = require('../../utils/trainerUtils');
const { buildBackpackEmbed } = require('../../embeds/trainerEmbeds');
const { logger } = require('../../log');

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
        await message.channel.send(`${err}`);
    } else {
        await message.channel.send({ embeds: [embed] });
    }
}

const backpackSlashCommand = async (interaction) => {
    const { embed, err } = await backpack(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
    } else {
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = {
    message: backpackMessageCommand,
    slash: backpackSlashCommand
};