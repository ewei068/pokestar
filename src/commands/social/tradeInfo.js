/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * tradeInfo.js is used to view trade info
*/
const { buildTradeInfoSend } = require('../../services/trade');

/**
 * Kills yourself
 * @param user user required for getting specific user's data.
 * @returns Error or message to send.
 */
//tradeAdd sends off the relevent user, pokemonId and position to buildtradeAddSend from the trade.js dependency and waits for it to return.
const tradeInfo = async (user) => {
    return await buildTradeInfoSend({
        user: user,
    });
}

//turns the message into the relevant info and calls tradeAdd for message commands. returns the result.
const tradeInfoMessageCommand = async (message) => {
    const { send, err } = await tradeInfo(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

//using the inbuilt commands from the slash interactions, this grabs the pertinent information necessary to run tradeAdd. returns the result.
const tradeInfoSlashCommand = async (interaction) => {
    const { send, err } = await tradeInfo(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: tradeInfoMessageCommand,
    slash: tradeInfoSlashCommand
};


