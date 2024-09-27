const { TRADE_COMPLETE_WINDOW } = require("../../config/socialConfig");
const { getState } = require("../../services/state");
const {
  buildTradeSend,
  onTradeAccept,
  onTradeDecline,
  onTradeComplete,
} = require("../../services/trade");

const tradeRequestButton = async (interaction, data) => {
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  const { userId } = data;
  if (userId && interaction.user.id !== userId) {
    return { err: "You cannot use this button." };
  }
  if (
    interaction.user.id !== state.userId1 &&
    interaction.user.id !== state.userId2
  ) {
    return { err: "You cannot use this button." };
  }

  let actionRes = null;
  if (userId) {
    actionRes = await onTradeAccept({
      stateId: data.stateId,
      user: interaction.user,
    });
  } else {
    actionRes = await onTradeDecline({
      stateId: data.stateId,
      user: interaction.user,
    });
  }
  if (actionRes.err) {
    return { err: actionRes.err };
  }

  const { send, err } = await buildTradeSend({
    stateId: data.stateId,
  });
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }

  await interaction.update(send);

  // if actionRes is should trade, initiate trade in 10 seconds
  if (actionRes.shouldTrade) {
    await setTimeout(async () => {
      const { err: tradeErr } = await onTradeComplete({
        stateId: data.stateId,
      });
      if (tradeErr) {
        await interaction.editReply({
          content: `Trade could not be completed. ${tradeErr}`,
        });
      } else {
        await interaction.editReply({
          content: `Trade completed!`,
        });
      }
    }, TRADE_COMPLETE_WINDOW * 1000);
  }
};

module.exports = tradeRequestButton;
