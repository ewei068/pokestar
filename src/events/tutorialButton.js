const { buildTutorialSend } = require("../embeds/helpEmbeds");

const tutorialButton = async (interaction, data) => {
    const page = data.page;
    if (!page) {
        return { err: "Invalid tutorial page!" };
    }

    const { send, err } = await buildTutorialSend({
        page: page
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = tutorialButton;