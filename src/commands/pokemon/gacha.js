const { buildBannerSend } = require ('../../services/gacha') ;
const { setState, deleteState } = require('../../services/state');

/**
 * Attempts to use a pokeball to spin the gacha for a random pokemon.
 * @param {Object} user User who initiated the command.
 * @param {String} pokeball Pokeball to use.
 * @returns An embed with the new pokemon, or an error message.
 */
const gacha = async (user) => {
    // build banner embed
    const stateId = setState({
        userId: user.id
    }, ttl=150);

    const { send, err } = await buildBannerSend({
        stateId: stateId,
        user: user,
        page: 1,
    });
    if (err) {
        deleteState(stateId);
    }

    return { send: send, err: err };
}

const gachaMessageCommand = async (message) => {
    const { send, err } = await gacha(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const gachaSlashCommand = async (interaction) => {
    const { send, err } = await gacha(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    }
    else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: gachaMessageCommand,
    slash: gachaSlashCommand
};



