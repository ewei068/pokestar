const { getLeaderboard } = require('../../services/social');
const { leaderboardConfig } = require('../../config/socialConfig');
const { buildLeaderboardEmbed } = require('../../embeds/socialEmbeds');

const leaderboard = async (category, scope) => {
    const categoryData = leaderboardConfig[category];

    // if scope = social, get guild members
    let subset = null;
    if (scope == 'social') {
        const members = await message.guild.members.fetch();
        subset = members.map(member => member.user.id);
    }

    const leaderboard = await getLeaderboard(categoryData, subset);
    if (leaderboard.err) {
        return { embed: null, err: leaderboard.err };
    }
    
    const embed = buildLeaderboardEmbed(leaderboard.data, categoryData, scope);

    const send = {
        embeds: [embed]
    }

    return { send: send, err: null };
}

const leaderboardMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const category = args[1];
    const scope = args[2] || 'global';
    const { send, err } = await leaderboard(category, scope);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const leaderboardSlashCommand = async (interaction) => {
    const category = interaction.options.getString('category');
    const scope = interaction.options.getString('scope') || 'global';
    const { send, err } = await leaderboard(category, scope);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: leaderboardMessageCommand,
    slash: leaderboardSlashCommand
};