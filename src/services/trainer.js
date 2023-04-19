const { findDocuments, insertDocument, updateDocument, QueryBuilder } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { trainerFields, getTrainerLevelExp, MAX_TRAINER_LEVEL, levelConfig } = require("../config/trainerConfig");
const { logger } = require("../log");
const { getOrSetDefault } = require("../utils/utils");

/* 
"user": {
    "username": "Mason",
    "public_flags": 131141,
    "discriminator": "1337",
    "avatar": "a_d5efa99b3eeaa7dd43acca82f5692432"
} 
*/

/*
"trainer": {
    userId
    user
    level
    exp
    money
    lastDaily (date)
    backpack
}
*/

const initTrainer = async (user) => {
    const trainer = {
        "userId": user.id,
        "user": user,
        /* "level": 1,
        "exp": 0,
        "money": 0,
        // date at start of datetime
        "lastDaily": (new Date(0)).getTime(),
        "backpack": {} */
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

const getTrainer = async (user) => {
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

    // check to see if trainer.user is up to date
    if (trainer.user.username != user.username 
        || trainer.user.discriminator != user.discriminator 
        || trainer.user.avatar != user.avatar) {
        trainer.user = user;
        modified = true;
    }

    // check if all fields are present
    for (const field in trainerFields) {
        if (trainer[field] === undefined) {
            trainer[field] = trainerFields[field].default;
            modified = true;
        }
    }

    if (modified) {
        try {
            const res = await updateDocument(
                collectionNames.USERS,
                { userId: user.id },
                { $set: trainer }
            );
            if (res.modifiedCount === 0) {
                logger.error(`Failed to update trainer ${user.username}.`)
                return { data: null, err: "Error updating trainer." };
            }
            logger.info(`Updated trainer ${user.username}.`);
        } catch (error) {
            logger.error(error);
            return { data: null, err: "Error updating trainer." };
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

        const pokemonRes = await aggQuery.findOne();
        if (pokemonRes === null) {
            return { data: null, err: "Error finding trainer." };
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
    for (const level in levelConfig) {
        const rewards = levelConfig[level].rewards;
        if (!rewards) {
            continue;
        }
        // if level not adequete or level in trainers claimedLevelRewards, continue
        if (level > trainer.level || trainer.claimedLevelRewards.includes(level)) {
            continue;
        }
        
        if (rewards.money) {
            allRewards.money = (allRewards.money || 0) + rewards.money;
            trainer.money += rewards.money;
        }
        if (rewards.backpack) {
            const backpack = getOrSetDefault(allRewards, "backpack", {});
            for (const categoryId in rewards.backpack) {
                const trainerBackpackCategory = getOrSetDefault(trainer.backpack, categoryId, {});
                for (const itemId in rewards.backpack[categoryId]) {
                    backpack[itemId] = getOrSetDefault(backpack, itemId, 0) + rewards.backpack[categoryId][itemId];
                    trainerBackpackCategory[itemId] = getOrSetDefault(trainerBackpackCategory, itemId, 0) + rewards.backpack[categoryId][itemId];
                }
            }
        }

        trainer.claimedLevelRewards.push(level);
    }

    if (Object.keys(allRewards).length === 0) {
        return { data: null, err: "No rewards to claim!" };
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

    return { data: allRewards, err: null };
}


module.exports = {
    getTrainer,
    getTrainerInfo,
    addExpAndMoneyTrainer,
    addExpAndMoney: addExpAndMoney,
    getLevelRewards
}
