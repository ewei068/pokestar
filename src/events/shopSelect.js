const { getState } = require("../services/state");
const { buildShopCategoryEmbed, buildShopItemEmbed } = require("../embeds/shopEmbeds");
const { buildBackButtonRow } = require("../components/backButtonRow");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { shopCategoryConfig, shopItemConfig } = require("../config/shopConfig");
const { eventNames } = require("../config/eventConfig");

const shopSelect = async (interaction, data) => {
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

    // get trainer
    const trainer = state.trainer;
    if (!trainer) {
        return { err: "No trainer data." };
    }

    // get which select menu was used
    const select = data.select;

    // get which option was selected
    const option = interaction.values[0];

    const send = {
        embeds: [],
        components: []
    }
    // if select is category, update embed to selected category
    if (select === "category") {
        const embed = buildShopCategoryEmbed(trainer, option);
        send.embeds.push(embed);
        
        const categorySelectRowData = {
            stateId: data.stateId,
            select: "item"
        }
        const categorySelectRow = buildIdConfigSelectRow(
            shopCategoryConfig[option].items,
            shopItemConfig,
            "Select an item:",
            categorySelectRowData,
            eventNames.SHOP_SELECT
        )
        send.components.push(categorySelectRow);
    } else if (select === "item") {
        // if select is item, update embed to selected item
        const embed = buildShopItemEmbed(trainer, option);
        send.embeds.push(embed);
    }

    // get back button
    const backButton = buildBackButtonRow(data.stateId);
    send.components.push(backButton);

    state.messageStack.push(send);
    await interaction.update(send);
}

module.exports = shopSelect;