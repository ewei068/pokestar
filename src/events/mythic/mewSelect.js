const { buildMewSend, updateMew } = require("../../services/mythic");

const mewSelect = async (interaction, data) => {
    const tab = data.tab;
    const selection = interaction.values[0];

    const updateRes = await updateMew(interaction.user, tab, selection);
    if (updateRes.err) {
        return { err: updateRes.err };
    }

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

module.exports = mewSelect;