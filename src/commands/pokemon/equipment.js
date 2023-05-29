const { modifierSlots } = require("../../config/equipmentConfig");
const { buildEquipmentSend } = require("../../services/pokemon");
const { setState, deleteState } = require("../../services/state");

const equipment = async (user, pokemonId) => {
    // build selection list of shop categories
    const stateId = setState({
        userId: user.id,
        pokemonId: pokemonId,
        slotId: modifierSlots.PRIMARY,
        messageStack: []
    }, ttl=150);

    const { send, err } = await buildEquipmentSend({
        stateId: stateId,
        user: user,
    });
    if (err) {
        deleteState(stateId);
    }

    return { send: send, err: err };
}

const equipmentMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokemonId = args[1];
    const { send, err } = await equipment(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const equipmentSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString("pokemonid");
    const { send, err } = await equipment(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    }
    else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: equipmentMessageCommand,
    slash: equipmentSlashCommand
};
