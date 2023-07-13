/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * trainer.js Creates trainers and handles all logic relating to trainers and interactions involving them.
*/
const { findDocuments, insertDocument, updateDocument, QueryBuilder } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { trainerFields, getTrainerLevelExp, MAX_TRAINER_LEVEL, levelConfig } = require("../config/trainerConfig");
const { logger } = require("../log");
const { getOrSetDefault, getFullUTCDate, formatMoney } = require("../utils/utils");
const { backpackItems, backpackCategories } = require("../config/backpackConfig");
const { getRewardsString, getPokeballsString, addRewards, getBackpackItemsString } = require("../utils/trainerUtils");
const { stageNames } = require("../config/stageConfig");
const { getVoteMultiplier } = require("../config/socialConfig");

/* 
"user": {
    "username": "Mason",
    "public_flags": 131141,
    "discriminator": "1337",
    "avatar": "a_d5efa99b3eeaa7dd43acca82f5692432"
} 
*/

const initTrainer = async (user) => {
    const trainer = {
        "userId": user.id,
        "user": user,
    }

    for (const field in trainerFields) {
        if (trainerFields[field].default != undefined) {
            trainer[field] = trainerFields[field].default;
        }
    }

    try {
        const res = await insertDocument(collectionNames.USERS, trainer);
        if (res.insertedCount === 0) {
            logger.error(`Failed to insert trainer ${user.username}.`);
            return null;
        }

        logger.info(`Trainer ${user.username} created at ID ${res.insertedId}.`);
        return trainer;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getTrainer = async (user, refresh=true) => {
    // only keep desired fields
    let tmpUser = {
        "id": user.id,
        "username": user.username,
        "discriminator": user.discriminator,
        "avatar": user.avatar
    }
    user = tmpUser;

    let trainers;
    try {
        // check if trainer exists
        trainers = await findDocuments(collectionNames.USERS, { "userId": user.id });
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error finding trainer." };
    }

    let trainer;
    if (trainers.length === 0) {
        try {
            trainer = await initTrainer(user);
            if (trainer === null) {
                return { data: null, err: "Error creating trainer." };
            }
        } catch (error) {
            logger.error(error);
            return { data: null, err: "Error creating trainer." };
        }
    } else {
        trainer = trainers[0];
    }

    let modified = false;

    if (refresh) {
        // check to see if trainer.user is up to date
        if (trainer.user.username != user.username 
            || trainer.user.discriminator != user.discriminator 
            || trainer.user.avatar != user.avatar) {
            trainer.user = user;
            modified = true;
        }
    }

    // check if all fields are present
    for (const field in trainerFields) {
        if (trainer[field] === undefined) {
            trainer[field] = trainerFields[field].default;
            modified = true;
        }
    }

    // attempt to reset daily rewards
    today = getFullUTCDate();
    lastDaily = getFullUTCDate(new Date(trainer.lastDaily));
    if (today > lastDaily) {
        trainer.lastDaily = new Date().getTime();
        // reset daily rewards
        for (const field in trainerFields) {
            if (trainerFields[field].daily) {
                trainer[field] = trainerFields[field].default;
            }
        }
        modified = true;
    }

    if (modified) {
        try {
            const res = await updateDocument(
                collectionNames.USERS,
                { userId: user.id },
                { $set: trainer }
            );
            if (res.modifiedCount === 0) {
                logger.error(`Failed to update trainer ${trainer.user.username}.`)
                return { data: null, err: "Error updating trainer." };
            }
            logger.info(`Updated trainer ${trainer.user.username}.`);
        } catch (error) {
            logger.error(error);
            return { data: null, err: "Error updating trainer." };
        }

        // re-retrieve trainer to flush pointers
        // TODO: possibly better way to do this
        try {
            // check if trainer exists
            trainers = await findDocuments(collectionNames.USERS, { "userId": user.id });
            if (trainers.length === 0) {
                return { data: null, err: "Error finding trainer." };
            } else {
                trainer = trainers[0];
                return { data: trainer, err: null };
            }
        } catch (error) {
            logger.error(error);
            return { data: null, err: "Error finding trainer." };
        }
    }

    return { data: trainer, err: null };
}

const getTrainerInfo = async (user) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { data: null, err: trainer.err };
    }
    
    // get extra info
    try {
        const numPokemonQuery = new QueryBuilder(collectionNames.USER_POKEMON)
            .setFilter({ "userId": trainer.data.userId });
            

        const numPokemonRes = await numPokemonQuery.countDocuments();
        
        const aggQuery = new QueryBuilder(collectionNames.POKEMON_AND_USERS)
            .setFilter({ "userId": trainer.data.userId });

        let pokemonRes = await aggQuery.findOne();
        if (pokemonRes === null) {
            // set default values, TODO: fix this probably https://www.mongodb.com/community/forums/t/how-can-i-do-a-left-outer-join-in-mongodb/189735/2
            pokemonRes = { pokemon: {
                _id: trainer.data.userId,
                totalWorth: 0,
                totalShiny: 0,
                totalPower: 0,
            } }
        }

        const extraInfo = {
            ...pokemonRes.pokemon,
            numPokemon: numPokemonRes,
        }

        return {
            data: {
                ...trainer.data,
                ...extraInfo
            },
            err: null
        };
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error finding trainer." };
    }
}

const addExpAndMoneyTrainer = async (trainer, exp, money) => {
    // levelup/exp
    const newExp = trainer.exp + exp;
    let level = trainer.level;
    while (newExp >= getTrainerLevelExp(level + 1)) {
        if (level >= MAX_TRAINER_LEVEL) {
            break;
        }
        level++;
    }

    // money
    const newMoney = trainer.money + money;
    try {
        const res = await updateDocument(
            collectionNames.USERS,
            { userId: trainer.userId },
            {
                $set: { "level": level },
                $inc: { "exp": exp, "money": money }
            }
        );
        if (res.modifiedCount === 0) {
            logger.error(`Failed to add exp and money to trainer ${trainer.user.username}.`);
            return { level: 0, err: "Error updating trainer." };
        }
        return { level: level > trainer.level ? level : 0, money: newMoney, err: null };
    } catch (error) {
        logger.error(error);
        return { level: 0, err: "Error updating trainer." };
    }

}

const addExpAndMoney = async (user, exp, money) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { level: 0, err: trainer.err };
    }

    return await addExpAndMoneyTrainer(trainer.data, exp, money);
}

const getLevelRewards = async (user) => {
    const { data: trainer, err } = await getTrainer(user);
    if (err) {
        return { data: null, err: err };
    }
    
    const allRewards = {};
    const currentClaimedLevels = [];
    for (const level in levelConfig) {
        const rewards = levelConfig[level].rewards;
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
        return { data: null, err: "No rewards to claim! Keep playing to level up!" };
    }

    // update trainer
    try {
        const res = await updateDocument(
            collectionNames.USERS,
            { userId: user.id },
            { $set: trainer }
        );
        if (res.modifiedCount === 0) {
            logger.error(`Failed to update trainer ${user.username} after claiming level rewards.`);
            return { data: null, err: "Error updating trainer." };
        }
        logger.info(`Updated trainer ${user.username} after claiming level rewards.`);
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error updating trainer." };
    }

    // build itemized rewards string
    let rewardsString = `You claimed rewards for levels: ${currentClaimedLevels.join(', ')}. **Thank you for playing Pokestar!**\n\n`;
    rewardsString += getRewardsString(allRewards);
    rewardsString += "\n\n**You now own:**";
    if (allRewards.money) {
        rewardsString += `\n${formatMoney(trainer.money)}`;
    }
    rewardsString += getPokeballsString(trainer);
    rewardsString += "\nSpend your Pokedollars at the \`/pokemart\` | Use \`/gacha\` to use your Pokeballs";

    return { data: rewardsString, err: null };
}

const addVote = async (user, votes=1) => {
    const trainer = await getTrainer(user, refresh=false);
    if (trainer.err) {
        return { data: null, err: trainer.err };
    }

    // { lastVoted, streak, rewards }
    const voting = trainer.data.voting;
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
            { $set: { voting: voting } }
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
}

const getVoteRewards = async (user) => {
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { data: null, err: trainer.err };
    }
    trainer = trainer.data;

    const rewards = trainer.voting.rewards;
    if (rewards < 1) {
        return { data: null, err: "No rewards to claim! Use `/vote` to vote and try again!" };
    }

    // add vote rewards
    const receivedRewards = addRewards(trainer, {
        money: rewards * 100,
        backpack: {
            [backpackCategories.POKEBALLS]: {
                [backpackItems.POKEBALL]: rewards * 1
            }, 
            [backpackCategories.MATERIALS]: {
                [backpackItems.KNOWLEDGE_SHARD]: rewards * 1,
                [backpackItems.EMOTION_SHARD]: rewards * 1,
                [backpackItems.WILLPOWER_SHARD]: rewards * 1,
            }
        }
    });

    // reset rewards
    trainer.voting.rewards = 0;

    // update trainer
    try {
        res = await updateDocument(
            collectionNames.USERS, 
            { userId: trainer.userId }, 
            { 
                $set: { backpack: trainer.backpack, voting: trainer.voting, money: trainer.money },
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
    rewardsString += "\nSpend your Pokedollars at the \`/pokemart\` | Use \`/gacha\` to use your Pokeballs";

    return { data: rewardsString, err: null };
}

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
}

module.exports = {
    getTrainer,
    getTrainerInfo,
    addExpAndMoneyTrainer,
    addExpAndMoney: addExpAndMoney,
    getLevelRewards,
    addVote,
    getVoteRewards,
    updateTrainer
}
