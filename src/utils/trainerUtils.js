const { backpackCategories, backpackItemConfig } = require("../config/backpackConfig");
const { getOrSetDefault } = require("./utils");

const getPokeballsString = (trainer) => {
    let pokeballsString = "";
    for (const item in trainer.backpack[backpackCategories.POKEBALLS]) {
        pokeballsString += `\n${backpackItemConfig[item].emoji} ${trainer.backpack[backpackCategories.POKEBALLS][item]}x ${backpackItemConfig[item].name}`;
    }
    return pokeballsString;
}

const getRewardsString = (rewards) => {
    let rewardsString = "**You received:**";
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
    getPokeballs,
    setPokeballs,
    addPokeballs,
    removePokeballs,
};