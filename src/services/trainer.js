/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * trainer.js Creates trainers and handles all logic relating to trainers and interactions involving them.
 */
const {
  findDocuments,
  insertDocument,
  updateDocument,
  QueryBuilder,
} = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const {
  trainerFields,
  getTrainerLevelExp,
  MAX_TRAINER_LEVEL,
  levelConfig,
} = require("../config/trainerConfig");
const { logger } = require("../log");
const { formatMoney, getFullUTCTimeInterval } = require("../utils/utils");
const {
  backpackItems,
  backpackCategories,
} = require("../config/backpackConfig");
const {
  getRewardsString,
  getPokeballsString,
  addRewards,
  getBackpackItemsString,
} = require("../utils/trainerUtils");
const { getVoteMultiplier } = require("../config/socialConfig");

/* 
"user": {
    "username": "Mason",
    "public_flags": 131141,
    "discriminator": "1337",
    "avatar": "a_d5efa99b3eeaa7dd43acca82f5692432"
} 
*/

/**
 *
 * @param {DiscordUser} user
 * @returns {Promise<WithId<Trainer>>}
 */
const initTrainer = async (user) => {
  const trainer = {
    userId: user.id,
    user,
  };

  for (const field in trainerFields) {
    if (trainerFields[field].default !== undefined) {
      trainer[field] = trainerFields[field].default;
    }
  }

  try {
    const res = await insertDocument(collectionNames.USERS, trainer);
    // TODO: fix
    if (res.insertedCount === 0) {
      logger.error(`Failed to insert trainer ${user.username}.`);
      return null;
    }

    logger.info(`Trainer ${user.username} created at ID ${res.insertedId}.`);
    // @ts-ignore
    return trainer;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

/**
 * @param {string} userId
 * @returns {Promise<{data?: WithId<Trainer>, err?: string}>}
 */
const getTrainerFromId = async (userId) => {
  try {
    // check if trainer exists
    const trainers = /** @type {Array<import("mongodb").WithId<Trainer>>} */ (
      await findDocuments(collectionNames.USERS, { userId })
    );
    if (trainers.length === 0) {
      return { data: null, err: "Error finding trainer." };
    }
    const [trainer] = trainers;
    return { data: trainer, err: null };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error finding trainer." };
  }
};

/**
 *
 * @param {any} root
 * @param {TrainerFieldConfig} fieldConfig
 * @param {Date} lastCorrectedTime
 * @param {Date} newCorrectedTime
 * @returns {boolean} if field was modified
 */
const setTrainerFields = (
  root,
  fieldConfig,
  lastCorrectedTime,
  newCorrectedTime
) => {
  let modified = false;
  // check if all fields are present
  for (const field in fieldConfig) {
    const fieldData = fieldConfig[field];
    if (root[field] === undefined) {
      // eslint-disable-next-line no-param-reassign
      root[field] = fieldData.default;
      modified = true;
    }

    // if the field has its own config, attempt to set it
    if (fieldData.type === "object" && fieldData.config) {
      modified =
        setTrainerFields(
          root[field] ?? {},
          fieldData.config,
          lastCorrectedTime,
          newCorrectedTime
        ) || modified;
    }
  }

  // attempt to reset time-interval fields
  for (const field in fieldConfig) {
    const { refreshInterval } = fieldConfig[field];
    if (!refreshInterval) {
      continue;
    }

    const currentTimeInterval = getFullUTCTimeInterval(
      refreshInterval,
      newCorrectedTime
    );
    const lastTimeInterval = getFullUTCTimeInterval(
      refreshInterval,
      lastCorrectedTime
    );
    if (currentTimeInterval > lastTimeInterval) {
      // eslint-disable-next-line no-param-reassign
      root[field] = fieldConfig[field].default;
      modified = true;
    }

    return modified;
  }
};

/**
 *
 * @param {DiscordUser} discordUser
 * @param {boolean?} refresh
 * @returns {Promise<{data?: WithId<Trainer>, err?: string}>}
 */
const getTrainer = async (discordUser, refresh = true) => {
  // only keep desired fields
  const tmpUser = {
    id: discordUser.id,
    username: discordUser.username,
    discriminator: discordUser.discriminator,
    avatar: discordUser.avatar,
  };
  const user = tmpUser;

  let trainers;
  try {
    // check if trainer exists
    trainers =
      /** @type {Array<import("mongodb").WithId<Trainer>>} */
      (await findDocuments(collectionNames.USERS, { userId: user.id }));
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error finding trainer." };
  }

  let trainer;
  if (trainers.length === 0) {
    try {
      trainer = /** @type {Trainer} */ (await initTrainer(user));
      if (trainer === null) {
        return { data: null, err: "Error creating trainer." };
      }
    } catch (error) {
      logger.error(error);
      return { data: null, err: "Error creating trainer." };
    }
  } else {
    [trainer] = trainers;
  }

  let modified = false;

  if (refresh) {
    // check to see if trainer.user is up to date
    if (
      trainer.user.username !== user.username ||
      trainer.user.discriminator !== user.discriminator ||
      trainer.user.avatar !== user.avatar
    ) {
      trainer.user = user;
      modified = true;
    }
  }

  // attempt to reset time-interval fields
  const lastCorrectedTime = new Date(trainer.lastCorrected);
  const newCorrectedTime = new Date();
  modified =
    setTrainerFields(
      trainer,
      trainerFields,
      lastCorrectedTime,
      newCorrectedTime
    ) || modified;

  if (modified) {
    trainer.lastCorrected = newCorrectedTime.getTime();
    try {
      const res = await updateDocument(
        collectionNames.USERS,
        { userId: user.id },
        { $set: trainer }
      );
      if (res.modifiedCount === 0) {
        logger.error(`Failed to update trainer ${trainer.user.username}.`);
        return { data: null, err: "Error updating trainer." };
      }
      logger.info(`Updated trainer ${trainer.user.username}.`);
    } catch (error) {
      logger.error(error);
      return { data: null, err: "Error updating trainer." };
    }

    // re-retrieve trainer to flush pointers
    // TODO: possibly better way to do this
    return await getTrainerFromId(user.id);
  }

  // @ts-ignore
  return { data: trainer, err: null };
};

/**
 *
 * @param {DiscordUser} user
 * @returns {Promise<{data?: Trainer & {pokemon: object, numPokemon: number}, err?: string}>}
 */
const getTrainerInfo = async (user) => {
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { data: null, err: trainer.err };
  }

  // get extra info
  try {
    const numPokemonQuery = new QueryBuilder(
      collectionNames.USER_POKEMON
    ).setFilter({ userId: trainer.data.userId });

    const numPokemonRes = await numPokemonQuery.countDocuments();

    const aggQuery = new QueryBuilder(
      collectionNames.POKEMON_AND_USERS
    ).setFilter({ userId: trainer.data.userId });

    let pokemonRes = await aggQuery.findOne();
    if (pokemonRes === null) {
      // set default values, TODO: fix this probably https://www.mongodb.com/community/forums/t/how-can-i-do-a-left-outer-join-in-mongodb/189735/2
      pokemonRes = {
        pokemon: {
          _id: trainer.data.userId,
          totalWorth: 0,
          totalShiny: 0,
          totalPower: 0,
        },
      };
    }

    const extraInfo = {
      ...pokemonRes.pokemon,
      numPokemon: numPokemonRes,
    };

    return {
      data: {
        ...trainer.data,
        ...extraInfo,
      },
      err: null,
    };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error finding trainer." };
  }
};

/**
 * @param {WithId<Trainer>} trainer
 * @param {number} exp
 * @param {number} money
 * @returns {Promise<{level?: number, money?: number, err?: string}>}
 */
const addExpAndMoneyTrainer = async (trainer, exp, money) => {
  // levelup/exp
  const newExp = trainer.exp + exp;
  let { level } = trainer;
  while (newExp >= getTrainerLevelExp(level + 1)) {
    if (level >= MAX_TRAINER_LEVEL) {
      break;
    }
    level += 1;
  }

  // money
  const newMoney = trainer.money + money;
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { userId: trainer.userId },
      {
        $set: { level },
        $inc: { exp, money },
      }
    );
    if (res.modifiedCount === 0) {
      logger.error(
        `Failed to add exp and money to trainer ${trainer.user.username}.`
      );
      return { level: 0, err: "Error updating trainer." };
    }
    return {
      level: level > trainer.level ? level : 0,
      money: newMoney,
      err: null,
    };
  } catch (error) {
    logger.error(error);
    return { level: 0, err: "Error updating trainer." };
  }
};

/**
 * @param {DiscordUser} user
 * @param {number} exp
 * @param {number} money
 */
const addExpAndMoney = async (user, exp, money) => {
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { level: 0, err: trainer.err };
  }

  return await addExpAndMoneyTrainer(trainer.data, exp, money);
};

/**
 * @param {DiscordUser} user
 * @returns {Promise<{data?: string, err?: string}>}
 */
const getLevelRewards = async (user) => {
  const { data: trainer, err } = await getTrainer(user);
  if (err) {
    return { data: null, err };
  }

  const allRewards = {};
  const currentClaimedLevels = [];
  for (const level in levelConfig) {
    const { rewards } = levelConfig[level];
    if (!rewards) {
      continue;
    }
    // if level not adequete or level in trainers claimedLevelRewards, continue
    if (level > trainer.level || trainer.claimedLevelRewards.includes(level)) {
      continue;
    }

    addRewards(trainer, rewards, allRewards);
    trainer.claimedLevelRewards.push(level);
    currentClaimedLevels.push(level);
  }

  if (Object.keys(allRewards).length === 0) {
    return {
      data: null,
      err: "No rewards to claim! Keep playing to level up!",
    };
  }

  // update trainer
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { userId: user.id },
      { $set: trainer }
    );
    if (res.modifiedCount === 0) {
      logger.error(
        `Failed to update trainer ${user.username} after claiming level rewards.`
      );
      return { data: null, err: "Error updating trainer." };
    }
    logger.info(
      `Updated trainer ${user.username} after claiming level rewards.`
    );
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error updating trainer." };
  }

  // build itemized rewards string
  let rewardsString = `You claimed rewards for levels: ${currentClaimedLevels.join(
    ", "
  )}. **Thank you for playing Pokestar!**\n\n`;
  rewardsString += getRewardsString(allRewards);
  rewardsString += "\n\n**You now own:**";
  if (allRewards.money) {
    rewardsString += `\n${formatMoney(trainer.money)}`;
  }
  rewardsString += getPokeballsString(trainer);
  rewardsString +=
    "\nSpend your Pokedollars at the `/pokemart` | Use `/gacha` to use your Pokeballs";

  return { data: rewardsString, err: null };
};

/**
 * @param {DiscordUser} user
 * @param {number} votes
 * @returns {Promise<{data?: null, err?: string}>}
 */
const addVote = async (user, votes = 1) => {
  const trainer = await getTrainer(user, false);
  if (trainer.err) {
    return { data: null, err: trainer.err };
  }

  // { lastVoted, streak, rewards }
  const { voting } = trainer.data;
  const now = Date.now();
  // if last voted 48 hours ago, reset streak
  if (voting.lastVoted && voting.lastVoted < now - 48 * 60 * 60 * 1000) {
    voting.streak = 0;
  }
  voting.streak += 1;
  voting.lastVoted = now;

  // add rewards based on streak
  voting.rewards += votes * getVoteMultiplier(voting.streak);

  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { userId: user.id },
      { $set: { voting } }
    );
    if (res.modifiedCount === 0) {
      logger.error(`Failed to add vote to trainer ${user.username}.`);
      return { data: null, err: "Error updating trainer." };
    }
    return { data: null, err: null };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error updating trainer." };
  }
};

/**
 * @param {DiscordUser} user
 * @returns {Promise<{data?: string, err?: string}>}
 */
const getVoteRewards = async (user) => {
  const trainerRes = await getTrainer(user);
  if (trainerRes.err) {
    return { data: null, err: trainerRes.err };
  }
  const trainer = trainerRes.data;

  const { rewards } = trainer.voting;
  if (rewards < 1) {
    return {
      data: null,
      err: "No rewards to claim! Use `/vote` to vote and try again!",
    };
  }

  // add vote rewards
  const receivedRewards = addRewards(trainer, {
    money: rewards * 100,
    backpack: {
      [backpackCategories.POKEBALLS]: {
        [backpackItems.POKEBALL]: rewards * 1,
      },
      [backpackCategories.MATERIALS]: {
        [backpackItems.KNOWLEDGE_SHARD]: rewards * 1,
        [backpackItems.EMOTION_SHARD]: rewards * 1,
        [backpackItems.WILLPOWER_SHARD]: rewards * 1,
      },
    },
  });

  // reset rewards
  trainer.voting.rewards = 0;

  // update trainer
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { userId: trainer.userId },
      {
        $set: {
          backpack: trainer.backpack,
          voting: trainer.voting,
          money: trainer.money,
        },
      }
    );
    if (res.modifiedCount === 0) {
      logger.error(`Failed to get vote rewards for ${trainer.user.username}.`);
      return { data: null, err: "Error claiming vote rewards." };
    }
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error claiming vote rewards." };
  }

  // build itemized rewards string
  let rewardsString = `You claimed **${rewards}** vote rewards! **Thank you for voting!** Remember to vote again in 12 hours!\n\n`;
  rewardsString += getRewardsString(receivedRewards);
  rewardsString += "\n\n**You now own:**";
  if (receivedRewards.money) {
    rewardsString += `\n${formatMoney(trainer.money)}`;
  }
  rewardsString += getBackpackItemsString(trainer);
  rewardsString +=
    "\nSpend your Pokedollars at the `/pokemart` | Use `/gacha` to use your Pokeballs";

  return { data: rewardsString, err: null };
};

/**
 * @param {WithId<Trainer>} trainer
 * @returns {Promise<{data?: null, err?: string}>}
 */
const updateTrainer = async (trainer) => {
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { userId: trainer.userId },
      { $set: trainer }
    );
    if (res.modifiedCount === 0) {
      logger.error(`Failed to update trainer ${trainer.user.username}.`);
      return { data: null, err: "Error updating trainer." };
    }
    return { data: null, err: null };
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error updating trainer." };
  }
};

module.exports = {
  getTrainer,
  getTrainerFromId,
  getTrainerInfo,
  addExpAndMoneyTrainer,
  addExpAndMoney,
  getLevelRewards,
  addVote,
  getVoteRewards,
  updateTrainer,
};
