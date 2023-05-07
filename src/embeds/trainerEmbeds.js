const { EmbedBuilder } = require("discord.js");
const { getTrainerLevelExp: getTrainerLevelExp, MAX_TRAINER_LEVEL } = require('../config/trainerConfig');
const { backpackCategories, backpackItems, backpackCategoryConfig, backpackItemConfig } = require('../config/backpackConfig');
const { getPBar } = require("../utils/utils");
const { locationConfig } = require("../config/locationConfig");

/*
"trainer": {
    userId
    user
    level
    money
    exp
    lastDaily (date)
    backpack
}
*/

const buildTrainerEmbed = (trainerInfo) => {
    const oldLevelExp = getTrainerLevelExp(trainerInfo.level);
    const newLevelExp = getTrainerLevelExp(trainerInfo.level + 1);
    const levelPercent = trainerInfo.level == MAX_TRAINER_LEVEL ? 0 : 100 * (trainerInfo.exp - oldLevelExp) / (newLevelExp - oldLevelExp);
    const progressBar = `${getPBar(levelPercent, 20)} -- ${Math.round(levelPercent)}%`;

    const embed = new EmbedBuilder();
    embed.setTitle(`Trainer ${trainerInfo.user.username}`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainerInfo.userId}/${trainerInfo.user.avatar}.webp`);
    embed.addFields(
        { name: "Level", value: `${trainerInfo.level}`, inline: true },
        { name: "Money", value: `₽${trainerInfo.money}`, inline: true },
        { name: "Pokemon", value: `${trainerInfo.numPokemon}`, inline: true },
        { name: "Power", value: `${trainerInfo.totalPower}`, inline: true },
        { name: "Worth", value: `₽${trainerInfo.totalWorth}`, inline: true },
        { name: "Shinies", value: `${trainerInfo.totalShiny}`, inline: true },
        { name: "Level Progress", value: `${progressBar}`, inline: false },
    );

    const footerString = '/gacha to get Pokemon\n/backpack to view your items\n/list to view your Pokemon';
    embed.setFooter({ text: footerString });

    return embed;
}

const buildBackpackEmbed = (trainer) => {
    // create string with backpack categories and their item quantities
    let backpackString = " ";
    for (const category in trainer.backpack) {
        backpackString += `**${backpackCategoryConfig[category].emoji} ${backpackCategoryConfig[category].name}**\n`;
        for (const item in trainer.backpack[category]) {
            if (trainer.backpack[category][item] == 0) {
                continue;
            }
            backpackString += `${backpackItemConfig[item].name}: ${trainer.backpack[category][item]}\n`;
        }
    }

    const embed = new EmbedBuilder()
    embed.setTitle(`Trainer ${trainer.user.username}'s Backpack`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`);
    embed.setDescription(backpackString);

    return embed;
}

const buildLocationsEmbed = (trainer) => {
    // create a string with all locations
    let locationString = "";
    for (const locationId in trainer.locations) {
        const locationLevel = trainer.locations[locationId];
        const location = locationConfig[locationId];

        locationString += `${location.emoji} ${location.name} (Level ${locationLevel})\n`;
    }
    if (locationString == "") {
        locationString = "No locations found!";
    }

    const embed = new EmbedBuilder()
    embed.setTitle(`Trainer ${trainer.user.username}'s Locations`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`);
    embed.setDescription(locationString);
    embed.setFooter({ text: "Use /pokemart to find more locations to buy!" });

    return embed;
}


module.exports = { 
    buildTrainerEmbed, 
    buildBackpackEmbed,
    buildLocationsEmbed
 };
