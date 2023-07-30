const { collectionNames } = require("../../config/databaseConfig");
const { QueryBuilder } = require("../../database/mongoHandler");

const toggleSpawn = async (user, guildId, member) => {
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

    // toggle spawn
    guildData.spawnDisabled = !guildData.spawnDisabled;
    try {
        const query = new QueryBuilder(collectionNames.GUILDS)
            .setFilter({ guildId: guildId })
            .setUpsert({ $set: { guildId: guildId, spawnDisabled: guildData.spawnDisabled }});

        await query.upsertOne();
    } catch (err) {
        logger.warn(err);
        return { err: "Something went wrong toggling spawn." };
    }

    if (guildData.spawnDisabled) {
        return { send: "Wild Pokemon spawning **DISABLED.** Use `/togglespawn` to revert this!" };
    } else {
        return { send: "Wild Pokemon spawning **ENABLED.** Use `/togglespawn` to revert this!" };
    }   
}

const toggleSpawnMessageCommand = async (message) => {
    const { send, err } = await toggleSpawn(message.author, message.guildId, message.member);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const toggleSpawnSlashCommand = async (interaction) => {
    const { send, err } = await toggleSpawn(interaction.user, interaction.guildId, interaction.member);
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
