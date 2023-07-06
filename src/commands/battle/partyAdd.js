/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * partyAdd.js is used to add pokemon to the user's party.
*/
const { buildPartyAddSend } = require('../../services/party');
const { getIdFromNameOrId } = require('../../services/pokemon');

/**
 * Adds the given pokemon via ID to the position in the given user's party.
 * @param user user required for getting specific user's data.
 * @param pokemonId the Id of the pokemon the user wants to add to their party
 * @param position the position the user wants to add the pokemon to
 * @returns Error or message to send.
 */
//partyAdd sends off the relevent user, pokemonId and position to buildPartyAddSend from the party.js dependency and waits for it to return.
const partyAdd = async (user, pokemonId, position) => {
    return await buildPartyAddSend({
        user: user,
        pokemonId: pokemonId,
        position: position
    });
}

//turns the message into the relevant info and calls partyAdd for message commands. returns the result.
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

//using the inbuilt commands from the slash interactions, this grabs the pertinent information necessary to run partyAdd. returns the result.
const partyAddSlashCommand = async (interaction) => {
    const nameOrId = interaction.options.getString('name_or_id');
    const idRes = await getIdFromNameOrId(interaction.user, nameOrId, interaction);
    if (idRes.err) {
        await interaction.editReply(`${idRes.err}`);
        return { err: idRes.err };
    }
    const pokemonId = idRes.data;
    const position = interaction.options.getInteger('position');
    const { send, err } = await partyAdd(interaction.user, pokemonId, position);
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


