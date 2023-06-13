const { shopItems, shopItemConfig, shopCategories, shopCategoryConfig } = require("../config/shopConfig");
const { getOrSetDefault } = require("../utils/utils");
const { dailyRewardChances } = require('../config/gachaConfig');
const { drawDiscrete } = require('../utils/gachaUtils');
const { backpackCategories, backpackItems, backpackItemConfig } = require('../config/backpackConfig');
const { updateDocument } = require('../database/mongoHandler');
const { collectionNames } = require('../config/databaseConfig');
const { logger } = require('../log');
const { locations: locations, locationConfig } = require("../config/locationConfig");

const { getTrainer } = require("./trainer");
const { getState, setState } = require("./state");
const { buildShopEmbed, buildShopCategoryEmbed, buildShopItemEmbed } = require("../embeds/shopEmbeds");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { eventNames } = require("../config/eventConfig");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildBackButtonRow } = require("../components/backButtonRow");
const { getRewardsString, getPokeballsString, addItems: addItems, getBackpackItemsString, getItems } = require("../utils/trainerUtils");

const canBuyItem = (trainer, itemId, quantity) => {
    getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0);

    // get item data
    const item = shopItemConfig[itemId];
    if (!item) {
        return { data: null, err: "Item does not exist." };
    }

    if (item.limit) {
        // check if limit has been reached
        if (trainer.purchasedShopItemsToday[itemId] >= item.limit) {
            return { data: null, err: "You have reached the daily limit for this item." };
        }

        // check if quantity exceeds limit
        if (trainer.purchasedShopItemsToday[itemId] + quantity > item.limit) {
            return { data: null, err: `You can only purchase ${item.limit - trainer.purchasedShopItemsToday[itemId]} more of this item today.` };
        }
    }

    let cost = 0;

    // functionality dependent on item
    if (itemId === shopItems.RANDOM_POKEBALL) {
        // check if trainer has enough money
        cost = item.price[0] * quantity;
        if (trainer.money < cost) {
            return { data: null, err: "You do not have enough money." };
        }
    } else if (item.category === shopCategories.LOCATIONS) {
        // if quantity is not 1, return error
        if (quantity !== 1) {
            return { data: null, err: "You can only purchase one location at a time." };
        }

        // map item id to location id
        const itemIdToLocationId = {
            [shopItems.HOME]: locations.HOME,
            [shopItems.RESTAURANT]: locations.RESTAURANT,
            [shopItems.GYM]: locations.GYM,
            [shopItems.DOJO]: locations.DOJO,
            [shopItems.TEMPLE]: locations.TEMPLE,
            [shopItems.SCHOOL]: locations.SCHOOL,
            [shopItems.TRACK]: locations.TRACK,
            [shopItems.BERRY_BUSH]: locations.BERRY_BUSH,
            [shopItems.BERRY_FARM]: locations.BERRY_FARM,
        }

        const locationId = itemIdToLocationId[itemId];
        const locationData = locationConfig[locationId];

        // check what level location is
        const level = getOrSetDefault(trainer.locations, locationId, 0);
        if (level >= Object.keys(locationData.levelConfig).length) {
            return { data: null, err: "You have already purchased the maximum level for this location." };
        }

        // check if trainer has enough money
        cost = item.price[level];
        if (trainer.money < cost) {
            return { data: null, err: "You do not have enough money." };
        }
    } else if (item.category === shopCategories.MATERIALS) {
        // check if trainer has enough money
        cost = item.price[0] * quantity;
        if (trainer.money < cost) {
            return { data: null, err: "You do not have enough money." };
        }
    }

    return {
        data: null,
        err: null,
    }
}

const buyItem = async (trainer, itemId, quantity) => {
    getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0);

    // get item data
    const item = shopItemConfig[itemId];
    if (!item) {
        return { data: null, err: "Item does not exist." };
    }

    if (item.limit) {
        // check if limit has been reached
        if (trainer.purchasedShopItemsToday[itemId] >= item.limit) {
            return { data: null, err: "You have reached the daily limit for this item." };
        }

        // check if quantity exceeds limit
        if (trainer.purchasedShopItemsToday[itemId] + quantity > item.limit) {
            return { data: null, err: `You can only purchase ${item.limit - trainer.purchasedShopItemsToday[itemId]} more of this item today.` };
        }
    }

    let cost = 0;
    let returnString = "";

    // functionality dependent on item
    if (itemId === shopItems.RANDOM_POKEBALL) {
        // check if trainer has enough money
        cost = item.price[0] * quantity;
        if (trainer.money < cost) {
            return { data: null, err: "You do not have enough money." };
        }

        // purchase item
        trainer.money -= cost;
        trainer.purchasedShopItemsToday[itemId] = getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0) + quantity;

        // roll random pokeballs
        const results = drawDiscrete(dailyRewardChances, quantity);
        const reducedResults = results.reduce((acc, curr) => {
            if (acc[curr] == undefined) {
                acc[curr] = 1;
            } else {
                acc[curr]++;
            }
            return acc;
        }, {});
                
        // add pokeballs to trainer's backpack
        Object.entries(reducedResults).forEach(([key, value]) => {
            addItems(trainer, key, value);
        });

        returnString = `You purchased ${quantity} random pokeballs for ₽${cost}.\n`;
        // build itemized rewards string
        returnString += getRewardsString({
            backpack: reducedResults,
        });
        returnString += "\n\n**You now own:**";
        returnString += `\n₽${trainer.money}`;
        returnString += getPokeballsString(trainer);
    } else if (item.category === shopCategories.LOCATIONS) {
        // if quantity is not 1, return error
        if (quantity !== 1) {
            return { data: null, err: "You can only purchase one location at a time." };
        }

        // map item id to location id
        const itemIdToLocationId = {
            [shopItems.HOME]: locations.HOME,
            [shopItems.RESTAURANT]: locations.RESTAURANT,
            [shopItems.GYM]: locations.GYM,
            [shopItems.DOJO]: locations.DOJO,
            [shopItems.TEMPLE]: locations.TEMPLE,
            [shopItems.SCHOOL]: locations.SCHOOL,
            [shopItems.TRACK]: locations.TRACK,
            [shopItems.BERRY_BUSH]: locations.BERRY_BUSH,
            [shopItems.BERRY_FARM]: locations.BERRY_FARM,
        }

        const locationId = itemIdToLocationId[itemId];
        const locationData = locationConfig[locationId];

        // check what level location is
        const level = getOrSetDefault(trainer.locations, locationId, 0);
        if (level >= Object.keys(locationData.levelConfig).length) {
            return { data: null, err: "You have already purchased the maximum level for this location." };
        }

        // check if trainer has enough money
        cost = item.price[level];
        if (trainer.money < cost) {
            return { data: null, err: "You do not have enough money." };
        }

        // purchase item
        trainer.money -= cost;
        trainer.locations[locationId] = level + 1;

        returnString = `You purchased a level ${level + 1} ${locationData.name} for ₽${cost}. View your locations with \`/locations\`.`;
    } else if (item.category === shopCategories.MATERIALS) {
        // check if trainer has enough money
        cost = item.price[0] * quantity;
        if (trainer.money < cost) {
            return { data: null, err: "You do not have enough money." };
        }

        // purchase item
        trainer.money -= cost;
        trainer.purchasedShopItemsToday[itemId] = getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0) + quantity;

        // add item
        addItems(trainer, item.backpackItem, quantity);

        returnString = `You purchased ${quantity} ${item.name}s for ₽${cost}.\n`;
        returnString += `**You now own: ${getItems(trainer, item.backpackItem)} ${item.name}s.**`;
    }

    // update trainer
    try {
        res = await updateDocument(
            collectionNames.USERS, 
            { userId: trainer.userId }, 
            { 
                $set: { 
                    backpack: trainer.backpack,
                    purchasedShopItemsToday: trainer.purchasedShopItemsToday,
                    locations: trainer.locations
                },
                $inc: { money: -cost }
            }
        );
        if (res.modifiedCount === 0) {
            logger.error(`Failed to update ${trainer.user.username} after shop purchase.`);
            return { data: null, err: "Error shop purchase." };
        }
        // logger.info(`Updated ${trainer.user.username} after shop purchase.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error shop purchase." };
    }

    // return success
    return { data: returnString, err: null };
}

const buildShopSend = async ({ stateId=null, user=null, view="shop", option=null, back=true } = {}) => {
    // get state
    const state = getState(stateId);

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    trainer = trainer.data;

    const send = {
        embeds: [],
        components: []
    }
    
    if (view === "shop") {
        // build shop embed
        const embed = buildShopEmbed(trainer);

        const categorySelectRowData = {
            stateId: stateId,
            select: "category"
        }
        const categorySelectRow = buildIdConfigSelectRow(
            Object.keys(shopCategoryConfig),
            shopCategoryConfig,
            "Select a category:",
            categorySelectRowData,
            eventNames.SHOP_SELECT
        )

        send.embeds.push(embed);
        send.components.push(categorySelectRow);
    } else if (view === "category") {
        // if select is category, update embed to selected category
        const embed = buildShopCategoryEmbed(trainer, option);
        send.embeds.push(embed);
        
        const categorySelectRowData = {
            stateId: stateId,
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
        // get back button
        const backButton = buildBackButtonRow(stateId);
        send.components.push(backButton);
    } else if (view === "item") {
        // if select is item, update embed to selected item
        const embed = buildShopItemEmbed(trainer, option);
        send.embeds.push(embed);

        const buttonData = {
            stateId: stateId,
            itemId: option
        };
        // create buy button
        const buttonConfigs = [{
            label: "Buy",
            disabled: canBuyItem(trainer, option, 1).err === null ? false : true,
            data: buttonData,
        }];
        const buyButton = buildButtonActionRow(buttonConfigs, eventNames.SHOP_BUY);
        send.components.push(buyButton);
        // get back button
        const backButton = buildBackButtonRow(stateId);
        send.components.push(backButton);
    }

    if (back) {
        state.messageStack.push({
            execute: buildShopSend,
            args: { 
                stateId: stateId, 
                user: user, 
                view: view, 
                option: option, 
                back: false 
            }
        });
    }

    return { send: send, err: null };
}

module.exports = {
    canBuyItem,
    buyItem,
    buildShopSend
}