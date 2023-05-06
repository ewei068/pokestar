const { drawDaily } = require('../../services/gacha');
const { getTrainer } = require('../../services/trainer');
const { backpackCategories, backpackItemConfig } = require('../../config/backpackConfig');

/**
 * Attempts to grant the user their daily rewards. If the user has 
 * already claimed their daily rewards, returns an error message.
 * @param {Object} user User who initiated the command.
 * @returns Embed with the user's daily rewards, or an error message.
 */
const daily = async (user) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { data: null, err: trainer.err };
    }

    // draw daily rewards
    const rewards = await drawDaily(trainer.data);
    if (rewards.err) {
        return { data: null, err: rewards.err };
    }
    const { money, backpack } = rewards.data;

    // build itemized rewards string
    let rewardsString = "**You received:**";
    if (money) {
        rewardsString += `\n₽${money}`;
    }
    for (let i = 0; i < backpack.length; i++) {
        rewardsString += `\n${backpackItemConfig[backpack[i]].emoji} ${backpackItemConfig[backpack[i]].name}`;
    }
    rewardsString += "\n\n**You now own:**";
    if (money) {
        rewardsString += `\n₽${trainer.data.money}`;
    }
    for (const item in trainer.data.backpack[backpackCategories.POKEBALLS]) {
        rewardsString += `\n${backpackItemConfig[item].emoji} ${trainer.data.backpack[backpackCategories.POKEBALLS][item]}x ${backpackItemConfig[item].name}`;
    }
    rewardsString += "\nSpend your Pokedollars at the \`/pokemart\` | Use \`/gacha\` to use your Pokeballs";

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