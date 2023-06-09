const { buildEventsSend } = require("../../embeds/helpEmbeds");

const eventButton = async (interaction, data) => {
    const page = data.page;
    if (!page) {
        return { err: "Invalid event page!" };
    }

    const { send, err } = await buildEventsSend({
        page: page
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = eventButton;