const { buildNatureSend } = require("../../services/pokemon");
const { setState, deleteState } = require("../../services/state");

const nature = async (user, pokemonId) => {
    // build selection list of shop categories
    const stateId = setState({
        userId: user.id,
        pokemonId: pokemonId
    }, ttl=150);

    const { send, err } = await buildNatureSend({
        stateId: stateId,
        user: user,
    });
    if (err) {
        deleteState(stateId);
    }

    return { send: send, err: err };
}

const natureMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokemonId = args[1];
    const { send, err } = await nature(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const natureSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString("pokemonid");
    const { send, err } = await nature(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    }
    else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: natureMessageCommand,
    slash: natureSlashCommand
};
