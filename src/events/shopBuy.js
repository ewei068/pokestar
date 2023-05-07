const { getState } = require("../services/state");
const { buyItem } = require("../services/shop");
const { getTrainer } = require("../services/trainer");
const { buildShopSend } = require("../services/shop");

const shopBuy = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({
            components: []
        });
        return { err: "This interaction has expired." };
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return { err: "This interaction was not initiated by you." };
    }

    // get item Id
    const itemId = data.itemId;
    if (!itemId) {
        return { err: "No item was selected." };
    }

    // get trainer
    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return { err: trainer.err };
    }

    // buy item
    const itemBuyResult = await buyItem(trainer.data, itemId, 1);
    if (itemBuyResult.err) {
        return { embed: null, err: itemBuyResult.err };
    }
    
    const itemBuySend = {
        content: `${itemBuyResult.data}`,
    }

    const { send: shopSend, err } = await buildShopSend({
        stateId: data.stateId,
        user: interaction.user,
        view: "item",
        option: itemId,
        back: false,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(shopSend);
    }
    await interaction.followUp(itemBuySend);
}

module.exports = shopBuy;