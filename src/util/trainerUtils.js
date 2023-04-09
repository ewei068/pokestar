const { findDocuments, insertDocument, updateDocument } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { trainerFields } = require("../config/trainerConfig");

/* 
"user": {
    "username": "Mason",
    "public_flags": 131141,
    "id": "53908232506183680",
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
        || trainer.user.public_flags != user.public_flags 
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
        const rv = await updateDocument(
            collectionNames.USERS,
            { "userId": user.id },
            { $set: trainer }
        );
        if (rv.modifiedCount === 0) {
            console.error(error);
            return { data: null, err: "Error updating trainer." };
        }
    }

    return { data: trainer, err: null };
}

module.exports = {
    getTrainer,
}
