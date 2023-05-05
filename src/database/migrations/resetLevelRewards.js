const { updateDocuments } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');

/**
 * Reset level rewards everytime they change.
 * Usages:
 * 2023-04-26: add money to level rewards
**/

const resetLevelRewards = async () => {
    const res = await updateDocuments(
        collectionNames.USERS, 
        {}, 
        { 
            $set: { claimedLevelRewards: [] } 
        }
    );
    return res;
}

resetLevelRewards().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});