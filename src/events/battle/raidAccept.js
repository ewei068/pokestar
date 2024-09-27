const { onRaidAccept } = require("../../services/raid");
const { getState } = require("../../services/state");

const raidAccept = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }
  state.messageRef = interaction.message;

  const { send, err } = await onRaidAccept({
    stateId: data.stateId,
    user: interaction.user,
  });
  if (err) {
    return { err };
  }

  await interaction.reply(send);
};

module.exports = raidAccept;
