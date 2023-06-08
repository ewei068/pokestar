const { EmbedBuilder } = require('discord.js');
const { getFullUsername } = require('../utils/trainerUtils');

const buildLeaderboardEmbed = (leaderboardInfo, categoryData, scope) => {
    let leaderboardString = "";
    for (let index = 0; index < leaderboardInfo.length; index++) {
        const entry = leaderboardInfo[index];
        leaderboardString += `**${index + 1}.** ${getFullUsername(entry.user)} - ${entry.label}\n`;
    }

    const embed = new EmbedBuilder()
        .setTitle(`Top ${categoryData.name} (${scope})`)
        .setColor("#FFFFFF")
        .addFields(
            { name: "Top 10", value: leaderboardString, inline: true }
        )
    return embed;
}

module.exports = {
    buildLeaderboardEmbed
}