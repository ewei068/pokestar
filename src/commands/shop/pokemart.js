const { getTrainer } = require('../../services/trainer');
const { buildShopEmbed } = require('../../embeds/shopEmbeds');
const { setState, getState } = require('../../services/state');
const { buildIdConfigSelectRow } = require('../../components/idConfigSelectRow');
const { shopCategoryConfig } = require('../../config/shopConfig');
const { eventNames } = require('../../config/eventConfig');

/**
 * Parses the shop config, returning an interactive embed for the user to
 * browse the shop.
 * @param {String} user User who initiated the command.
 * @returns Embed with shop options.
 */
const pokemart = async (user) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }
    
    // build shop embed
    const embed = buildShopEmbed(trainer.data);

    // build selection list of shop categories
    const stateId = setState({
        userId: user.id,
        trainer: trainer.data,
        messageStack: []
    }, ttl=150);
    const categorySelectRowData = {
        stateId: stateId,
        select: "category"
    }
    const categorySelectRow = buildIdConfigSelectRow(
        Object.keys(shopCategoryConfig),
        shopCategoryConfig,
        "Select a category:",
        categorySelectRowData,
        eventNames.SHOP_SELECT
    )

    const send = {
        embeds: [embed],
        components: [categorySelectRow]
    }

    // add message to stack for back button
    getState(stateId).messageStack.push(send);
    return { send: send, err: null };
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