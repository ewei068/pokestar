/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * levelRewards.js Creates a system to dispaly and grant unclaimed level rewards to the user.
*/
const { getLevelRewards } = require("../../services/trainer");
const { backpackItemConfig } = require("../../config/backpackConfig");
const { getRewardsString } = require("../../utils/trainerUtils");

/**
 * Grants any unclaimed level rewards to the user.
 * @param {Object} user User who initiated the command.
 * @returns Embed with the user's level rewards, or an error message.
 */
const levelRewards = async (user) => {
    // get level rewards
    return await getLevelRewards(user);
}

const levelRewardsMessageCommand = async (message) => {
    const { data, err } = await levelRewards(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(data);
    }
}

const levelRewardsSlashCommand = async (interaction) => {
    const { data, err } = await levelRewards(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(data);
    }
}

module.exports = {
    message: levelRewardsMessageCommand,
    slash: levelRewardsSlashCommand
};