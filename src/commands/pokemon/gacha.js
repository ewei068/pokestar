/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * gacha.js is the backbone of the game concept. Using a modified standard gacha system it uses pokeballs to spin the gacha for a/many random pokemon.
*/
const { buildBannerSend } = require('../../services/gacha');
const { setState, deleteState } = require('../../services/state');

/**
 * Attempts to use a pokeball to spin the gacha for a random pokemon.
 * @param {Object} user User who initiated the command.
 * @param {String} pokeball Pokeball to use.
 * @returns An embed with the new pokemon, or an error message.
 */
const gacha = async (user, page) => {
    // build banner embed
    const stateId = setState({
        userId: user.id
    }, 150);

    const { send, err } = await buildBannerSend({
        stateId: stateId,
        user: user,
        page: page,
    });
    if (err) {
        deleteState(stateId);
    }

    return { send: send, err: err };
}

const gachaMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const page = args[1] ? parseInt(args[1]) : 1;
    const { send, err } = await gacha(message.author, page);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const gachaSlashCommand = async (interaction) => {
    const page = interaction.options.getInteger('page') || 1;
    const { send, err } = await gacha(interaction.user, page);
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



