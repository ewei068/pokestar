const { updateDocuments } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');

// make ALL pokemon battle eligible

const setAllBattleEligible = async () => {
    const update = {
        $set: { battleEligible: true }
    };

    const res = await updateDocuments(collectionNames.USER_POKEMON, {}, update);
    return res;
}

setAllBattleEligible().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});  