const { deleteDocuments } = require("../mongoHandler");
const { collectionNames } = require("../../config/databaseConfig");

const tutorialUserId = "638163104236175427";

// reset the tutorial player

const resetPlayer = async () => {
    const res = await deleteDocuments(
        collectionNames.USERS, 
        {
            userId: tutorialUserId
        }
    );
    return res;
}

const resetPokemon = async () => {
    const res = await deleteDocuments(
        collectionNames.USER_POKEMON, 
        {
            userId: tutorialUserId
        }
    );
    return res;
}

resetPlayer().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});

resetPokemon().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});