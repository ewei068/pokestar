const { buildPartyAddSend } = require('../../services/party');

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
        await interaction.reply(send);
    }
}

module.exports = partyAdd;


