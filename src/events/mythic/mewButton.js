const { buildMewSend } = require("../../services/mythic");

const mewButton = async (interaction, data) => {
  const { tab } = data;
  const { send, err } = await buildMewSend({
    user: interaction.user,
    tab,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = mewButton;
