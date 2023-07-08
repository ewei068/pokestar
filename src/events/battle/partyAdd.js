/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * partyAdd.js reads the interaction for the partyAdd embed and calls buildPartyAddSend to build the party.
*/
const { buildPartyAddSend } = require('../../services/party');

/**
 * reads the interaction for the partyAdd embed and calls buildPartyAddSend to build the party.
 * @param {*} interaction the party embed interaction from the user.
 * @param {*} data the relevant data with the state information on the partyAdd interaction.
 * @returns 
 */
const partyAdd = async (interaction, data) => {
    const pokemonId = data.id;
    const position = parseInt(interaction.values[0]);

    const { send, err } = await buildPartyAddSend({
        user: interaction.user,
        pokemonId: pokemonId,
        position: position
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = partyAdd;


