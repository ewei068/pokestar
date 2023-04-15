const { updateDocuments } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');

/**
 * Reset level rewards everytime they change.
 * Usages:
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