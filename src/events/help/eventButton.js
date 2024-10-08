/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * eventButton.js Builds the event from the interaction.
 */
const { buildEventsSend } = require("../../embeds/helpEmbeds");

const eventButton = async (interaction, data) => {
  const { page } = data;
  if (!page) {
    return { err: "Invalid event page!" };
  }

  const { send, err } = await buildEventsSend({
    page,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = eventButton;
