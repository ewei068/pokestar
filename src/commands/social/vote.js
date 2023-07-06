/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * vote.js is used to help the bot gain more visibility within the discord bot microcosm. Sets up the outline for easing the voting process for users.
*/
const { buildButtonActionRow } = require("../../components/buttonActionRow");
const { buildUrlButton } = require("../../components/urlButton");
const { eventNames } = require("../../config/eventConfig");
const { voteConfig } = require("../../config/socialConfig");
const { buildVoteEmbed } = require("../../embeds/socialEmbeds");
const { getTrainer } = require("../../services/trainer");


/**
 * Syncs the voting to the discord user to give rewards on successful voting.
 * @param {*} user the user who decided to vote.
 * @returns 
 */
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