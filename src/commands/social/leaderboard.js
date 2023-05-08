const { getLeaderboard } = require('../../services/social');
const { leaderboardConfig } = require('../../config/socialConfig');
const { buildLeaderboardEmbed } = require('../../embeds/socialEmbeds');

/**
 * Displays a top 10 leaderboard for a given category and scope.
 * @param {String} category Category to display leaderboard for.
 * @param {String} scope Scope of leaderboard (global, server).
 * @returns Embed with leaderboard.
 */
const leaderboard = async (category, scope, guild) => {
    const categoryData = leaderboardConfig[category];

    // if scope = server, get guild members
    // TODO: see if we can use non-cache version
    let subset = null;
    if (scope == 'server') {
        const members = await guild.members.cache;
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

const leaderboardMessageCommand = async (message, client) => {
    const args = message.content.split(' ');
    const category = args[1];
    const scope = args[2] || 'global'; // default to global
    const { send, err } = await leaderboard(category, scope, client.guilds.cache.get(message.guild.id));
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const leaderboardSlashCommand = async (interaction, client) => {
    const category = interaction.options.getString('category');
    const scope = interaction.options.getString('scope') || 'global'; // default to global
    const { send, err } = await leaderboard(category, scope, client.guilds.cache.get(interaction.guild.id));
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