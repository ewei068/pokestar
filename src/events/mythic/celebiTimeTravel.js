const { buildTimeTravelSend } = require("../../services/mythic");

const celebiTimeTravel = async (interaction, data) => {
    const { send, err } = await buildTimeTravelSend(interaction.user);
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = celebiTimeTravel;