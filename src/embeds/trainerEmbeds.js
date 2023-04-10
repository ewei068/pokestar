const { EmbedBuilder } = require("discord.js");
const { getTrainerLevelExp: getTrainerLevelExp, MAX_TRAINER_LEVEL } = require('../config/trainerConfig');

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
    const progressBar = `${"▓".repeat(progress)}${"░".repeat(20 - progress)} -- ${levelPercent}%`;

    const embed = new EmbedBuilder();
    embed.setTitle(`Trainer ${trainer.user.username}`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`);
    embed.addFields(
        { name: "Level", value: `${trainer.level}`, inline: true },
        { name: "Money", value: `$${trainer.money}`, inline: true },
        { name: "Last Daily Reward", value: `${trainer.lastDaily}`, inline: true },
        { name: "Level Progress", value: `${progressBar}`, inline: false },
    );
    return embed;
}

const buildBackpackEmbed = (trainer) => {
    // create string with backpack categories and their item quantities
    let backpackString = " ";
    for (const category in trainer.backpack) {
        backpackString += `${category}: ${trainer.backpack[category]}\n`;
        for (const item in trainer.backpack[category]) {
            backpackString += `${item}: ${trainer.backpack[category][item]}\n`;
        }
    }

    const embed = new EmbedBuilder();
}


module.exports = { buildTrainerEmbed };
