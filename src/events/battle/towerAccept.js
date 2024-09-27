const {
  onBattleTowerAccept,
  getStartTurnSend,
} = require("../../services/battle");
const { getState } = require("../../services/state");

const towerAccept = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // verify user is the same as the user who pressed the button
  if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  }

  const onAcceptRes = await onBattleTowerAccept({
    stateId: data.stateId,
    user: interaction.user,
  });
  if (onAcceptRes.err) {
    return { err: onAcceptRes.err };
  }

  await interaction.update(await getStartTurnSend(state.battle, data.stateId));
};

module.exports = towerAccept;
