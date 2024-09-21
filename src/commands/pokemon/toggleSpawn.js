const { collectionNames } = require("../../config/databaseConfig");
const { QueryBuilder } = require("../../database/mongoHandler");
const { getChannelId } = require("../../utils/utils");
const { logger } = require("../../log");

const toggleSpawn = async (user, guildId, channelId, member) => {
    // check if user can manage roles
    if (!member.permissions.has("ManageRoles")) {
        return { err: "You do not have permission to toggle spawn. You must have the MANAGE ROLES permission to do so." };
    }

    // get guild
    let guildData = {
        guildId: guildId,
        spawnDisabled: false
    }
    try {
        const query = new QueryBuilder(collectionNames.GUILDS)
            .setFilter({ guildId: guildId });

        const guildRes = await query.findOne();
        if (guildRes) {
            guildData = guildRes;
        }
    } catch (err) {
        logger.warn(err);
        // pass
    }
    if (!guildData.spawnDisabledChannels) {
        guildData.spawnDisabledChannels = [];
    }

    if (channelId) {
        // toggle spawn for channel
        if (guildData.spawnDisabledChannels.includes(channelId)) {
            guildData.spawnDisabledChannels = guildData.spawnDisabledChannels.filter((id) => id != channelId);
        } else {
            guildData.spawnDisabledChannels.push(channelId);
        }
        try {
            const query = new QueryBuilder(collectionNames.GUILDS)
                .setFilter({ guildId: guildId })
                .setUpsert({ $set: { guildId: guildId, spawnDisabledChannels: guildData.spawnDisabledChannels } });

            await query.upsertOne();
        } catch (err) {
            logger.warn(err);
            return { err: "Something went wrong toggling spawn." };
        }

        if (guildData.spawnDisabledChannels.includes(channelId)) {
            return { send: `Wild Pokemon spawning **DISABLED** in <#${channelId}>. Use \`/togglespawn channel\` to revert this! Spawning is disabled in channels: <#${guildData.spawnDisabledChannels.join(">, <#")}>` };
        } else {
            const channelsDisabledString = guildData.spawnDisabledChannels.length > 0 ? ` Spawning is still disabled in <#${guildData.spawnDisabledChannels.join(">, <#")}>.` : "";
            return { send: `Wild Pokemon spawning **ENABLED** in <#${channelId}>. Use \`/togglespawn channel\` to revert this!` + channelsDisabledString };
        }
    } else {
        // toggle spawn for server
        guildData.spawnDisabled = !guildData.spawnDisabled;
        try {
            const query = new QueryBuilder(collectionNames.GUILDS)
                .setFilter({ guildId: guildId })
                .setUpsert({ $set: { guildId: guildId, spawnDisabled: guildData.spawnDisabled } });

            await query.upsertOne();
        } catch (err) {
            logger.warn(err);
            return { err: "Something went wrong toggling spawn." };
        }

        if (guildData.spawnDisabled) {
            return { send: "Wild Pokemon spawning **DISABLED.** Use `/togglespawn` to revert this! **If you wanted to disable spawns in only one channel,** re-enable spawns with `/togglespawn` and then use `/togglespawn channel`." };
        } else {
            const channelsDisabledString = guildData.spawnDisabledChannels.length > 0 ? ` Spawning is still disabled in <#${guildData.spawnDisabledChannels.join(">, <#")}> Use \`/togglespawn channel\` to enable spawns in a channel.` : "";
            return { send: "Wild Pokemon spawning **ENABLED.** Use `/togglespawn` to revert this!" + channelsDisabledString };
        }
    }
}

const toggleSpawnMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const channelId = getChannelId(args[1]);

    const { send, err } = await toggleSpawn(message.author, message.guildId, channelId, message.member);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const toggleSpawnSlashCommand = async (interaction) => {
    const channelId = interaction.options.getChannel("channel")?.id || null;

    const { send, err } = await toggleSpawn(interaction.user, interaction.guildId, channelId, interaction.member);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: toggleSpawnMessageCommand,
    slash: toggleSpawnSlashCommand
};
