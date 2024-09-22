const { onButtonPress } = require("../../services/spawn");
const { getState } = require("../../services/state");

const wildPokemonButton = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  const res = await onButtonPress(interaction, data, state);
  if (res.err) {
    return { err: res.err };
  }
};

module.exports = wildPokemonButton;
