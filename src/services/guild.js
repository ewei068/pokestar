const { collectionNames } = require("../config/databaseConfig");
const { guildFields } = require("../config/guildConfig");
const {
  QueryBuilder,
  findAndUpdateDocument,
} = require("../database/mongoHandler");
const { logger } = require("../log");
const { setDefaultFields } = require("../utils/utils");

/**
 * @param {string} guildId
 * @returns {Promise<{data?: WithId<GuildData>, err?: string}>}
 */
const getGuildData = async (guildId) => {
  let guildData = {
    guildId,
  };
  try {
    const query = new QueryBuilder(collectionNames.GUILDS).setFilter({
      guildId,
    });

    const guildRes = await query.findOne();
    if (guildRes) {
      guildData = guildRes;
    }
  } catch (err) {
    logger.warn(err);
    return {
      err: "Error retrieving guild data.",
    };
  }

  // attempt to reset time-interval fields
  const lastCorrectedTime = new Date(guildData.lastCorrected || 0);
  const newCorrectedTime = new Date();
  const modified = setDefaultFields(
    guildData,
    guildFields,
    lastCorrectedTime,
    newCorrectedTime
  );

  if (modified) {
    guildData.lastCorrected = newCorrectedTime.getTime();
    try {
      const query = new QueryBuilder(collectionNames.GUILDS)
        .setFilter({ guildId })
        .setUpsert({
          $set: guildData,
        });
      const res = await query.upsertOne();
      if (res.modifiedCount === 0 && res.upsertedCount === 0) {
        logger.error(
          `Failed to update guild in getGuildData ${guildData.guildId}.`
        );
        return { data: null, err: "Error updating guild." };
      }
    } catch (error) {
      logger.error(error);
      return { data: null, err: "Error updating guild." };
    }

    // re-retrieve guild to flush pointers
    // TODO: possibly better way to do this
    return {
      data: await new QueryBuilder(collectionNames.GUILDS)
        .setFilter({
          guildId,
        })
        .findOne(),
    };
  }

  // @ts-ignore
  return { data: guildData };
};

/**
 * @param {GuildData} guild
 * @returns {Promise<{data?: WithId<GuildData>, err?: string}>}
 */
const updateGuildData = async (guild) => {
  const res = await findAndUpdateDocument(
    collectionNames.GUILDS,
    {
      guildId: guild.guildId,
    },
    {
      $set: guild,
    }
  );

  if (!res.value) {
    logger.error(`Failed to update guild ${guild.guildId}.`);
    return { data: null, err: "Error updating guild." };
  }
  // @ts-ignore
  return { data: res.value };
};

/**
 * @param {DiscordGuild} guild
 * @param {string} channelId
 * @returns {Promise<{data?: WithId<GuildData>, err?: string}>}
 */
const addSpawnChannel = async (guild, channelId) => {
  // if channel not in guild, return
  const channel = guild.channels.cache.get(channelId);
  if (!channel) {
    return {
      err: "Channel not found in server. Remember to enter a channel ID. Go to Discord Settings -> Advanced -> Enable Developer Mode. Then, right-click a channel and click 'Copy ID'.",
    };
  }

  // get guild data
  const guildRes = await getGuildData(guild.id);
  if (guildRes.err) {
    return guildRes;
  }
  const guildData = guildRes.data;

  // if channel already in spawn channels, return
  if (guildData.spawnSettings.channelIds.includes(channelId)) {
    return {
      err: "Channel already added.",
    };
  }

  // update guild data
  guildData.spawnSettings.channelIds.push(channelId);

  return updateGuildData(guildData);
};

/**
 * @param {DiscordGuild} guild
 * @param {string} channelId
 * @returns {Promise<{data?: WithId<GuildData>, err?: string}>}
 */
const removeSpawnChannel = async (guild, channelId) => {
  // get guild data
  const guildRes = await getGuildData(guild.id);
  if (guildRes.err) {
    return guildRes;
  }
  const guildData = guildRes.data;

  // if channel not in spawn channels, return
  if (!guildData.spawnSettings.channelIds.includes(channelId)) {
    return {
      err: "Channel not found in spawn channels.",
    };
  }

  // update guild data
  guildData.spawnSettings.channelIds =
    guildData.spawnSettings.channelIds.filter((id) => id !== channelId);

  return updateGuildData(guildData);
};

/**
 * @param {DiscordGuild} guild
 * @returns {Promise<{data?: WithId<GuildData>, err?: string}>}
 */
const switchChannelSpawnMode = async (guild) => {
  // get guild data
  const guildRes = await getGuildData(guild.id);
  if (guildRes.err) {
    return guildRes;
  }
  const guildData = guildRes.data;

  guildData.spawnSettings.mode =
    guildData.spawnSettings.mode === "allowlist" ? "denylist" : "allowlist";

  return updateGuildData(guildData);
};
module.exports = {
  getGuildData,
  updateGuildData,
  addSpawnChannel,
  removeSpawnChannel,
  switchChannelSpawnMode,
};
