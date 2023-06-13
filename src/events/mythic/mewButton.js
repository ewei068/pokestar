const { buildMewSend } = require("../../services/mythic");

const mewButton = async (interaction, data) => {
    const tab = data.tab;
    const { send, err } = await buildMewSend({
        user: interaction.user,
        tab: tab,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = mewButton;