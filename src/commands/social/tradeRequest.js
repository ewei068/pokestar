/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * tradeRequest.js is the encapsulating program for the tradeRequest system.
*/
const { setState, deleteState } = require('../../services/state');
const { getUserId } = require('../../utils/utils');
const { buildTradeRequestSend } = require('../../services/trade');

/**
 * The encapsulating program for the tradeRequest system.
 * @param {*} user the user given to get the relevant data from.
 * @param {*} secondUserId the user you want to trade.
 * @returns Error or message to send.
 */
const tradeRequest = async (user, secondUserId) => {
    // if second user ID equals user ID, return error
    if (secondUserId === user.id) {
        return { send: null, err: "You can't trade with yourself!" };
    }

    // build state
    const stateId = setState({
        user1: user,
        userId1: user.id,
        userId2: secondUserId,
    }, 300);
    const { send, err } = await buildTradeRequestSend({
        stateId: stateId,
        user1: user,
        userId2: secondUserId,
    });
    if (err) {
        deleteState(stateId);
        return { send: null, err: err };
    }

    return { send: send, err: null };
}

const tradeRequestMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const secondUserId = getUserId(args[1]) || null;

    const { send, err } = await tradeRequest(message.author, secondUserId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const tradeRequestSlashCommand = async (interaction) => {
    const secondUserId = interaction.options.getUser('user') ? interaction.options.getUser('user').id : null;

    const { send, err } = await tradeRequest(interaction.user, secondUserId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: tradeRequestMessageCommand,
    slash: tradeRequestSlashCommand
};