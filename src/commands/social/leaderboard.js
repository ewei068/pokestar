const { getLeaderboard } = require('../../services/social');
const { leaderboardConfig } = require('../../config/socialConfig');
const { buildLeaderboardEmbed } = require('../../embeds/socialEmbeds');

/**
 * Displays a top 10 leaderboard for a given category and scope.
 * @param {String} category Category to display leaderboard for.
 * @param {String} scope Scope of leaderboard (global, social).
 * @returns Embed with leaderboard.
 */
const leaderboard = async (category, scope) => {
    const categoryData = leaderboardConfig[category];

    // if scope = social, get guild members
    let subset = null;
    if (scope == 'social') {
        const members = await message.guild.members.fetch();
        subset = members.map(member => member.user.id);
    }

    // get leaderboard
    const leaderboard = await getLeaderboard(categoryData, subset);
    if (leaderboard.err) {
        return { embed: null, err: leaderboard.err };
    }
    
    // build leaderboard embed
    const embed = buildLeaderboardEmbed(leaderboard.data, categoryData, scope);

    const send = {
        embeds: [embed]
    }

    return { send: send, err: null };
}

const leaderboardMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const category = args[1];
    const scope = args[2] || 'global'; // default to global
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
    const scope = interaction.options.getString('scope') || 'global'; // default to global
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