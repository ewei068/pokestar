/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * Raid.js is used to run the game's raid's system, specifically the commands within.
*/
const { setState, deleteState } = require("../../services/state");
const { buildRaidSend } = require("../../services/raid");

/**
 * Creates the Raid via encapsulating buildRaidSend and giving it the required user data 
 * @param user user required for creating user specific Raids. 
 * @returns Error or message to send.
 */
const raid = async (user) => {
    const stateId = setState({
        userId: user.id,
        view: "list"
    }, ttl=300);
    const { send, err } = await buildRaidSend({
        stateId: stateId,
        user: user,
    });
    if (err) {
        deleteState(stateId);
    }
    return { send: send, err: err };
}

//reads in commands (not slash commands) for the user-created raid. and outputs results.
const raidMessageCommand = async (message) => {
    const { send, err } = await raid(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

//reads in slash-commands for the user-created raid and outputs results.
const raidSlashCommand = async (interaction) => {
    const { send, err } = await raid(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

//exporting types of commands. this is a common occurrance.
module.exports = {
    message: raidMessageCommand,
    slash: raidSlashCommand
};
