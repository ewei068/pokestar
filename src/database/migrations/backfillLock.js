const { updateDocuments } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');

// give all pokemon that locked=undefined a locked=false

const backfillLock = async () => {
    const res = await updateDocuments(
        collectionNames.USER_POKEMON, 
        {
            locked: undefined
        }, 
        { 
            $set: { locked: false }
        }
    );
    return res;
}

backfillLock().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});
