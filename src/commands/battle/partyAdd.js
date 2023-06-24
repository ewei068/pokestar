const { buildPartyAddSend } = require('../../services/party');
const { getIdFromNameOrId } = require('../../services/pokemon');

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
    const nameOrId = interaction.options.getString('name_or_id');
    const idRes = await getIdFromNameOrId(interaction.user, nameOrId, interaction);
    if (idRes.err) {
        await interaction.reply(`${idRes.err}`);
        return { err: idRes.err };
    }
    const position = interaction.options.getInteger('position');
    const { send, err } = await partyAdd(interaction.user, idRes.data, position);
    if (err) {
        await interaction.editReply(`${err}`);
        return { err: err };
    } else {
        await interaction.editReply(send);
    }
}

module.exports = {
    message: partyAddMessageCommand,
    slash: partyAddSlashCommand
};


