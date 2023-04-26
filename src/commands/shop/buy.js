const { buyItem } = require('../../services/shop');
const { getTrainer } = require('../../services/trainer');

/**
 * Attends to execute user's request to buy an item at a given quantity.
 * @param {Object} user User who initiated the command.
 * @param {String} itemId ID of the item to buy.
 * @param {Number} quantity Quantity of the item to buy.
 * @returns Message confirming the purchase, or an error message.
 */
const buy = async (user, itemId, quantity) => {
    // validate quantity
    if (quantity > 10) {
        return { embed: null, err: 'You can only buy 10 items at a time.' };
    }
    if (quantity < 1) {
        return { embed: null, err: 'You must buy at least 1 item.' };
    }
    
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // buy item
    const itemBuyResult = await buyItem(trainer.data, itemId, quantity);
    if (itemBuyResult.err) {
        return { embed: null, err: itemBuyResult.err };
    }
    
    const send = {
        content: `${itemBuyResult.data}`,
    }
    return { send: send, err: null };
}

const buyMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const itemId = args[1];
    const quantity = parseInt(args[2]) || 1; // default to 1 if no quantity is given

    const { send, err } = await buy(message.author, itemId, quantity);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const buySlashCommand = async (interaction) => {
    const itemId = interaction.options.getString('itemid');
    const quantity = interaction.options.getInteger('quantity') || 1; // default to 1 if no quantity is given
    const { send, err } = await buy(interaction.user, itemId, quantity);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: buyMessageCommand,
    slash: buySlashCommand
};

