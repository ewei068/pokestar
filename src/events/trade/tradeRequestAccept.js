const { TRADE_COMPLETE_WINDOW } = require("../../config/socialConfig");
const { getState } = require("../../services/state");
const { onTradeRequestAccept, buildTradeSend, onTradeComplete } = require("../../services/trade");

const tradeRequestAccept = async (interaction, data) => {
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    const actionRes = await onTradeRequestAccept({
        stateId: data.stateId,
        user2: interaction.user
    });
    if (actionRes.err) {
        await interaction.reply(`${actionRes.err}`);
        return { err: actionRes.err };
    }

    const { send, err } = await buildTradeSend({
        stateId: data.stateId,
    });
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    }

    await interaction.update(send);
}

module.exports = tradeRequestAccept;