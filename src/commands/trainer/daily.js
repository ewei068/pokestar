const { drawDaily } = require('../../services/gacha');
const { getTrainer } = require('../../services/trainer');
const { backpackCategories, backpackItemConfig } = require('../../config/backpackConfig');

const daily = async (user) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { data: null, err: trainer.err };
    }

    const rewards = await drawDaily(trainer.data);
    if (rewards.err) {
        return { data: null, err: rewards.err };
    } else if (rewards.data.length === 0) {
        return { data: null, err: "You already claimed your daily rewards today!" };
    }

    // build itemized rewards string
    let rewardsString = "**You received:**";
    for (let i = 0; i < rewards.data.length; i++) {
        rewardsString += `\n${backpackItemConfig[rewards.data[i]].emoji} ${backpackItemConfig[rewards.data[i]].name}`;
    }
    rewardsString += "\n\n**You now own:**";
    for (const item in trainer.data.backpack[backpackCategories.POKEBALLS]) {
        rewardsString += `\n${backpackItemConfig[item].emoji} ${trainer.data.backpack[backpackCategories.POKEBALLS][item]}x ${backpackItemConfig[item].name}`;
    }
    rewardsString += "\nUse \`/help gacha\` command to learn how to use these!";

    return { data: rewardsString, err: null };
}

const dailyMessageCommand = async (message) => {
    const { data, err } = await daily(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(data);
    }
}

const dailySlashCommand = async (interaction) => {
    const { data, err } = await daily(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(data);
    }
}

module.exports = {
    message: dailyMessageCommand,
    slash: dailySlashCommand
};