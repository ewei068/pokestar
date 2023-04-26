const { getLevelRewards } = require("../../services/trainer");
const { backpackItemConfig } = require("../../config/backpackConfig");

/**
 * Grants any unclaimed level rewards to the user.
 * @param {Object} user User who initiated the command.
 * @returns Embed with the user's level rewards, or an error message.
 */
const levelRewards = async (user) => {
    // get level rewards
    const rewards = await getLevelRewards(user);
    if (rewards.err) {
        return { data: null, err: rewards.err };
    }

    // build itemized rewards string
    let rewardsString = "**You received:**";
    if (rewards.data.money) {
        rewardsString += `\n₽${rewards.data.money}`;
    }
    if (rewards.data.backpack) {
        for (const itemId in rewards.data.backpack) {
            rewardsString += `\n${backpackItemConfig[itemId].emoji} ${rewards.data.backpack[itemId]}x ${backpackItemConfig[itemId].name}`;
        }
    }

    return { data: rewardsString, err: null };
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