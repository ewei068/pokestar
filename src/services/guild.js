const { collectionNames } = require("../config/databaseConfig");
const { guildFields } = require("../config/guildConfig");
const { QueryBuilder, updateDocument } = require("../database/mongoHandler");
const { logger } = require("../log");
const { setDefaultFields } = require("../utils/utils");

/**
 * @param {string} guildId
 * @returns {Promise<{data?: WithId<Guild>, err?: string}>}
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
      if (res.modifiedCount === 0) {
        logger.error(`Failed to update guild ${guildData.guildId}.`);
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

module.exports = {
  getGuildData,
};
