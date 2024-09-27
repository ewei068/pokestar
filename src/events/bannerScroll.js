const { buildBannerSend } = require("../services/gacha");
const { getState } = require("../services/state");

const bannerScroll = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // if data has userId component, verify interaction was done by that user
  if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  }

  const { page } = data;
  if (!page) {
    return { err: "No page." };
  }

  const { send, err } = await buildBannerSend({
    stateId: data.stateId,
    user: interaction.user,
    page,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = bannerScroll;
