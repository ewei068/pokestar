/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * Dungeons.js is used to run the game's dungeon's system, specifically the commands within.
*/
const { setState, deleteState } = require("../../services/state");
const { buildDungeonSend } = require("../../services/battle");

/**
 * Creates the dungeon via encapsulating buildDungeonSend and giving it the required user data 
 * @param user user required for creating user specific dungeons. 
 * @returns Error or message to send.
 */
const dungeons = async (user) => {
    const stateId = setState({
        userId: user.id,
    }, 300);
    const { send, err } = await buildDungeonSend({
        stateId: stateId,
        user: user,
        view: "list"
    });
    if (err) {
        deleteState(stateId);
    }
    return { send: send, err: err };
}

//reads in commands (not slash commands) for the user-created dungeon. and outputs results.
const dungeonsMessageCommand = async (message) => {
    const { send, err } = await dungeons(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

//reads in slash-commands for the user-created dungeon and outputs results.
const dungeonsSlashCommand = async (interaction) => {
    const { send, err } = await dungeons(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

//exporting types of commands. this is a common occurrance.
module.exports = {
    message: dungeonsMessageCommand,
    slash: dungeonsSlashCommand
};
