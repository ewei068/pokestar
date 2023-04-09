const { EmbedBuilder } = require("discord.js");
const { levelConfig } = require('../config/trainerConfig');

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
    const levelPercent = trainer.level > levelConfig.length ? 0 : 100 * (trainer.exp / (levelConfig[trainer.level + 1].exp));

    // create string with backpack categories and their item quantities
    let backpackString = " ";
    for (const category in trainer.backpack) {
        backpackString += `${category}: ${trainer.backpack[category]}\n`;
        for (const item in trainer.backpack[category]) {
            backpackString += `${item}: ${trainer.backpack[category][item]}\n`;
        }
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Trainer ${trainer.user.username}`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`);
    embed.addFields(
        { name: "Level", value: `${trainer.level} (${levelPercent}%)`, inline: true },
        { name: "Money", value: `$${trainer.money}`, inline: true },
        { name: "Last Daily Reward", value: `${trainer.lastDaily}`, inline: true },
        { name: "Backpack", value: backpackString, inline: false },
    );
    return embed;
}

module.exports = { buildTrainerEmbed };
