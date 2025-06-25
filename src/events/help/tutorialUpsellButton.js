/**
 * @file
 * @author Elvis Wei
 *
 * tutorialUpsellButton.js the button from the help embed to create the tutorial page.
 */
// eslint-disable-next-line no-unused-vars
const { MessageComponentInteraction } = require("discord.js");
const { createRoot } = require("../../deact/deact");
const TutorialList = require("../../elements/quest/TutorialList");

/**
 * @param {MessageComponentInteraction} interaction
 */
const tutorialUpsellButton = async (interaction) =>
  await createRoot(
    TutorialList,
    {
      user: interaction.user,
    },
    interaction,
    {
      ttl: 150,
    }
  );

module.exports = tutorialUpsellButton;
