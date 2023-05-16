const { backpackCategories, backpackItemConfig } = require("../config/backpackConfig");

const getPokeballsString = (trainer) => {
    let pokeballsString = "";
    for (const item in trainer.backpack[backpackCategories.POKEBALLS]) {
        pokeballsString += `\n${backpackItemConfig[item].emoji} ${trainer.backpack[backpackCategories.POKEBALLS][item]}x ${backpackItemConfig[item].name}`;
    }
    return pokeballsString;
}

module.exports = {
    getPokeballsString
};