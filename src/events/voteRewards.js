const { getVoteRewards } = require('../services/trainer');

const voteRewards = async (interaction, data) => {
    // get vote rewards
    const rewards = await getVoteRewards(interaction.user);
    if (rewards.err) {
        return { err: rewards.err };
    }

    await interaction.reply(rewards.data);
}

module.exports = voteRewards;