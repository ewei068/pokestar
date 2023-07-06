/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * mew.js mew.
*/
const { buildMewSend } = require('../../services/mythic');

const mew = async (user) => {
    return await buildMewSend({
        user: user,
    })
}

const mewMessageCommand = async (message) => {
    const { send, err } = await mew(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const mewSlashCommand = async (interaction) => {
    const { send, err } = await mew(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: mewMessageCommand,
    slash: mewSlashCommand
};