/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * tutorialButton.js the button from the help embed to create the tutorial page.
*/
const { buildTutorialSend } = require("../../embeds/helpEmbeds");

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