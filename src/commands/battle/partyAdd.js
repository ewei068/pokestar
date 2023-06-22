const { buildPartyAddSend } = require('../../services/party');

const partyAdd = async (user, pokemonId, position) => {
    return await buildPartyAddSend({
        user: user,
        pokemonId: pokemonId,
        position: position
    });
}

const partyAddMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const pokemonId = args[1];
    const position = parseInt(args[2]);
    const { send, err } = await partyAdd(message.author, pokemonId, position);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const partyAddSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const position = interaction.options.getInteger('position');
    const { send, err } = await partyAdd(interaction.user, pokemonId, position);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: partyAddMessageCommand,
    slash: partyAddSlashCommand
};


