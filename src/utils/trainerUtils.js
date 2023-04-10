const { findDocuments, insertDocument, updateDocument } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { trainerFields, getTrainerLevelExp, MAX_TRAINER_LEVEL } = require("../config/trainerConfig");

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

    const res = await insertDocument(collectionNames.USERS, trainer);
    console.log(`Trainer ${user.username} created at ID ${res.insertedId}.`);
    return trainer;
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
        console.error(error);
        return { data: null, err: "Error finding trainer." };
    }

    let trainer;
    if (trainers.length === 0) {
        try {
            trainer = await initTrainer(user);
        } catch (error) {
            console.error(error);
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
        // update trainer.user
        /* const rv = await updateDocument(
            collectionNames.USERS, 
            { "userId": user.id }, { $set: { "user": user } }
        );
        if (rv.modifiedCount === 0) {
            console.error(error);
            return { data: null, err: "Error updating trainer." };
        } */
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
        console.log(`Updating trainer ${user.username}...`)
        const res = await updateDocument(
            collectionNames.USERS,
            { "userId": user.id },
            { $set: trainer }
        );
        if (res.modifiedCount === 0) {
            // console.error(error);
            return { data: null, err: "Error updating trainer." };
        }
    }

    return { data: trainer, err: null };
}

const addExp = async (user, exp) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { level: 0, err: trainer.err };
    }

    const newExp = trainer.data.exp + exp;
    let level = trainer.data.level;
    while (newExp >= getTrainerLevelExp(level + 1)) {
        if (level >= MAX_TRAINER_LEVEL) {
            break;
        }
        level++;
    }

    if (level > trainer.data.level) {
        res = await updateDocument(
            collectionNames.USERS,
            { "userId": user.id },
            { $set: { "level": level, "exp": newExp } }
        );
        if (res.modifiedCount === 0) {
            // console.error(error);
            return { level: 0, err: "Error updating trainer." };
        }
        return { level: level, err: null };
    } else {
        res = await updateDocument(
            collectionNames.USERS,
            { "userId": user.id },
            { $set: { "exp": newExp } }
        );
        if (res.modifiedCount === 0) {
            // console.error(error);
            return { level: 0, err: "Error updating trainer." };
        }
        return { level: 0, err: null };
    }
}



module.exports = {
    getTrainer,
    addExp
}
