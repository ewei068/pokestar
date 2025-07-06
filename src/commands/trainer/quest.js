/**
 * @file
 * @author Elvis Wei
 *
 * quest.js Creates a system to display the user's quest for them.
 */
const { createRoot } = require("../../deact/deact");
const QuestList = require("../../elements/quest/QuestList");
const { getUserFromInteraction } = require("../../utils/utils");

/**
 * Displays the user's quest items.
 * @param {any} interaction
 * @param {QuestTypeEnum=} questType
 */
const quest = async (interaction, questType) =>
  await createRoot(
    QuestList,
    {
      user: getUserFromInteraction(interaction),
      initialQuestType: questType,
    },
    interaction,
    { defer: true, ttl: 180 }
  );

const questMessageCommand = async (message) => {
  const questType = message.content.split(" ")[1] ?? undefined;
  return await quest(message, questType);
};

const questSlashCommand = async (interaction) => {
  const questType = interaction.options.getString("type") ?? undefined;
  return await quest(interaction, questType);
};

module.exports = {
  message: questMessageCommand,
  slash: questSlashCommand,
};
