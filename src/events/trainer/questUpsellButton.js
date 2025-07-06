/**
 * @file
 * @author Elvis Wei
 *
 * questUpsellButton.js the button from the help embed to create the quest page.
 */
// eslint-disable-next-line no-unused-vars
const { MessageComponentInteraction } = require("discord.js");
const { createRoot } = require("../../deact/deact");
const QuestList = require("../../elements/quest/QuestList");

/**
 * @param {MessageComponentInteraction} interaction
 * @param {any} data
 */
const questUpsellButton = async (interaction, data) =>
  await createRoot(
    QuestList,
    {
      user: interaction.user,
      initialQuestType: data.type,
      initialQuestId: data.questId,
    },
    interaction,
    {
      ttl: 180,
      defer: true,
    }
  );

module.exports = questUpsellButton;
