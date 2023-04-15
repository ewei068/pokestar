const { buyItem } = require('../../services/shop');
const { getTrainer } = require('../../services/trainer');

const buy = async (user, itemId, quantity) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }
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
    let quantity = 1;
    if (args.length > 2) {
        // convert to int
        quantity = parseInt(args[2]);
    }

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
    const quantity = interaction.options.getInteger('quantity');
    const { send, err } = await buy(interaction.user, itemId, quantity || 1);
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

