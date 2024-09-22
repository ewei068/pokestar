const { buildTimeTravelSend } = require("../../services/mythic");

const celebiTimeTravel = async (interaction) => {
  const { send, err } = await buildTimeTravelSend(interaction.user);
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = celebiTimeTravel;
