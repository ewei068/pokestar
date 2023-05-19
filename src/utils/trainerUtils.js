const { backpackCategories, backpackItemConfig } = require("../config/backpackConfig");
const { getOrSetDefault } = require("./utils");

const getPokeballsString = (trainer) => {
    let pokeballsString = "";
    for (const item in trainer.backpack[backpackCategories.POKEBALLS]) {
        pokeballsString += `\n${backpackItemConfig[item].emoji} ${trainer.backpack[backpackCategories.POKEBALLS][item]}x ${backpackItemConfig[item].name}`;
    }
    return pokeballsString;
}

const getRewardsString = (rewards, received=true) => {
    let rewardsString = received ? "**You received:**" : "";
    if (rewards.money) {
        rewardsString += `\n₽${rewards.money}`;
    }
    if (rewards.backpack) {
        // console.log(rewards.backpack)
        for (const itemId in rewards.backpack) {
            rewardsString += `\n${backpackItemConfig[itemId].emoji} ${rewards.backpack[itemId]}x ${backpackItemConfig[itemId].name}`;
        }
    }
    return rewardsString;
}

const flattenCategories = (backpack) => {
    const flattenedBackpack = {};
    for (const categoryId in backpack) {
        for (const itemId in backpack[categoryId]) {
            flattenedBackpack[itemId] = getOrSetDefault(flattenedBackpack, itemId, 0) + backpack[categoryId][itemId];
        }
    }
    return flattenedBackpack;
}

const flattenRewards = (rewards) => {
    const flattenedRewards = {
        ...rewards,
    }
    if (rewards.backpack) {
        flattenedRewards.backpack = flattenCategories(rewards.backpack);
    }
    return flattenedRewards;
}

const addRewards = (trainer, rewards, accumulator={}) => {
    if (rewards.money) {
        accumulator.money = (accumulator.money || 0) + rewards.money;
        trainer.money += rewards.money;
    }
    if (rewards.backpack) {
        const backpack = getOrSetDefault(accumulator, "backpack", {});
        for (const categoryId in rewards.backpack) {
            const trainerBackpackCategory = getOrSetDefault(trainer.backpack, categoryId, {});
            for (const itemId in rewards.backpack[categoryId]) {
                backpack[itemId] = getOrSetDefault(backpack, itemId, 0) + rewards.backpack[categoryId][itemId];
                trainerBackpackCategory[itemId] = getOrSetDefault(trainerBackpackCategory, itemId, 0) + rewards.backpack[categoryId][itemId];
            }
        }
    }

    return accumulator;
}

const getPokeballs = (trainer, pokeballId) => {
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    return getOrSetDefault(pokeballs, pokeballId, 0);
}

const setPokeballs = (trainer, pokeballId, quantity) => {
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    pokeballs[pokeballId] = quantity;
}

const addPokeballs = (trainer, pokeballId, quantity=1) => {
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    pokeballs[pokeballId] = getOrSetDefault(pokeballs, pokeballId, 0) + quantity;
}

const removePokeballs = (trainer, pokeballId, quantity=1) => {
    const pokeballs = getOrSetDefault(trainer.backpack, backpackCategories.POKEBALLS, {});
    pokeballs[pokeballId] = getOrSetDefault(pokeballs, pokeballId, 0) - quantity;
}


module.exports = {
    getPokeballsString,
    getRewardsString,
    flattenCategories,
    flattenRewards,
    addRewards,
    getPokeballs,
    setPokeballs,
    addPokeballs,
    removePokeballs,
};