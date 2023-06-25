const { EmbedBuilder } = require("discord.js");
const { shopCategoryConfig, shopItemConfig } = require("../config/shopConfig");
const { formatMoney } = require("../utils/utils");

const buildShopEmbed = (trainer) => {
    let shopString = " ";
    for (const categoryId in shopCategoryConfig) {
        shopString += `**${shopCategoryConfig[categoryId].emoji} ${shopCategoryConfig[categoryId].name}**\n`;
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Pokemart`);
    embed.setColor(0xffffff);
    embed.setDescription("Welcome to the Pokemart! Here you can buy items to help you on your journey. Use the Buttons below to navigate the shop.");
    embed.addFields(
        { name: "Categories", value: shopString, inline: true },
    )
    embed.setFooter({ text: `You have ${formatMoney(trainer.money)} Pokédollars.` });

    return embed;
}

const buildShopCategoryEmbed = (trainer, categoryId) => {
    const categoryData = shopCategoryConfig[categoryId];
    const items = categoryData.items;
    let shopString = " ";
    for (let i = 0; i < items.length; i++) {
        const item = shopItemConfig[items[i]];
        if (item.price.length == 1) {
            shopString += `${item.emoji} **#${items[i]} ${item.name}** - ${formatMoney(item.price)}\n`;
        } else {
            // multi-price items
            // TODO: make this better or remove if multi-prices are too many
            shopString += `${item.emoji} **#${items[i]} ${item.name}** - `;
            for (let j = 0; j < item.price.length; j++) {
                shopString += `${formatMoney(item.price[j])}`;
                if (j < item.price.length - 1) {
                    shopString += "/";
                }
            }
            shopString += "\n";
        }
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Pokemart - ${shopCategoryConfig[categoryId].name}`);
    embed.setColor(0xffffff);
    embed.setDescription(`${categoryData.description}\n\nSelect and item for more information.`);
    embed.addFields(
        { name: "Items", value: shopString, inline: true },
    )
    embed.setFooter({ text: `You have ${formatMoney(trainer.money)} Pokédollars | Use /buy <itemid> <qty?> to buy an item!` });

    return embed;
}

const buildShopItemEmbed = (trainer, itemId) => {
    const itemData = shopItemConfig[itemId];
    
    let priceString = "";
    if (itemData.price.length == 1) {
        priceString = `${formatMoney(itemData.price)}`;
    } else {
        // multi-price items are based on upgrade level (for now)
        for (let i = 0; i < itemData.price.length; i++) {
            priceString += `Level ${i + 1}: ${formatMoney(itemData.price[i])}`;
            if (i < itemData.price.length - 1) {
                priceString += "\n";
            }
        }
    }
    
    const embed = new EmbedBuilder();
    embed.setTitle(`Pokemart - ${itemData.name} (ID: ${itemId})`);
    embed.setColor(0xffffff);
    embed.setDescription(`${itemData.description}\n\nUse \`/buy ${itemId} <qty?>\` to buy this item!`);
    embed.addFields(
        { name: "Price", value: priceString, inline: true },
        { name: "Daily Limit", value: `${itemData.limit || "None"}`, inline: true },
    )
    embed.setFooter({ text: `You have ${formatMoney(trainer.money)} Pokédollars | Use /buy ${itemId} <qty?> to buy this item!` });

    return embed;
}


module.exports = {
    buildShopEmbed,
    buildShopCategoryEmbed,
    buildShopItemEmbed,
};