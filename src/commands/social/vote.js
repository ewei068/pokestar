const { buildButtonActionRow } = require("../../components/buttonActionRow");
const { buildUrlButton } = require("../../components/urlButton");
const { eventNames } = require("../../config/eventConfig");
const { voteConfig } = require("../../config/socialConfig");
const { buildVoteEmbed } = require("../../embeds/socialEmbeds");
const { getTrainer } = require("../../services/trainer");

const vote = async (user) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    const voteEmbed = buildVoteEmbed(trainer.data);

    const voteButtons = buildUrlButton(voteConfig);
    const rewardsButton = buildButtonActionRow([{
        label: "Claim Rewards!",
        disabled: false,
        data: {},
        // celebration
        emoji: "🎉" 
    }], eventNames.VOTE_REWARDS);

    const send = {
        embeds: [voteEmbed],
        components: [voteButtons, rewardsButton]
    }

    return { send: send, err: null };
}

const voteMessageCommand = async (message) => {
    const { send, err } = await vote(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const voteSlashCommand = async (interaction) => {
    const { send, err } = await vote(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: voteMessageCommand,
    slash: voteSlashCommand
};