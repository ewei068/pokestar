const { setState } = require('../../services/state');
const { buildShopSend } = require('../../services/shop');

/**
 * Parses the shop config, returning an interactive embed for the user to
 * browse the shop.
 * @param {String} user User who initiated the command.
 * @returns Embed with shop options.
 */
const pokemart = async (user) => {
    // build selection list of shop categories
    const stateId = setState({
        userId: user.id,
        messageStack: []
    }, ttl=150);
    
    return await buildShopSend({
        stateId: stateId,
        user: user,
        view: "shop",
        option: null
    });
}

const pokemartMessageCommand = async (message) => {
    const { send, err } = await pokemart(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const pokemartSlashCommand = async (interaction) => {
    const { send, err } = await pokemart(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: pokemartMessageCommand,
    slash: pokemartSlashCommand
};