const { EmbedBuilder } = require("discord.js");
const { getTrainerLevelExp: getTrainerLevelExp, MAX_TRAINER_LEVEL } = require('../config/trainerConfig');
const { backpackCategories, backpackItems, backpackCategoryConfig, backpackItemConfig } = require('../config/backpackConfig');

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

const buildTrainerEmbed = (trainer) => {
    const oldLevelExp = getTrainerLevelExp(trainer.level);
    const newLevelExp = getTrainerLevelExp(trainer.level + 1);
    const levelPercent = trainer.level == MAX_TRAINER_LEVEL ? 0 : 100 * (trainer.exp - oldLevelExp) / (newLevelExp - oldLevelExp);

    // level progress bar based off percentage
    const progress = Math.floor(levelPercent / 5);
    // progress bar and round percent to nearest int
    const progressBar = `${"▓".repeat(progress)}${"░".repeat(20 - progress)} -- ${Math.round(levelPercent)}%`;

    // check to see if daily availible
    const daily = new Date(trainer.lastDaily);
    const now = new Date();
    const dailyAvailable = now.getDate() != daily.getDate();

    const embed = new EmbedBuilder();
    embed.setTitle(`Trainer ${trainer.user.username}`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`);
    embed.addFields(
        { name: "Level", value: `${trainer.level}`, inline: true },
        { name: "Money", value: `$${trainer.money}`, inline: true },
        { name: "Daily Available", value: `${dailyAvailable}`, inline: true },
        { name: "Level Progress", value: `${progressBar}`, inline: false },
    );
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


module.exports = { 
    buildTrainerEmbed, 
    buildBackpackEmbed
 };
