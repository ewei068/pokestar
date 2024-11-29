const { updateDocuments } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');

// give everyone 1000 starter money if they have none

const giveStarterMoney = async () => {
    const res = await updateDocuments(
        collectionNames.USERS, 
        {
            money: 0
        }, 
        { 
            $set: { money: 1000 } 
        }
    );
    return res;
}

giveStarterMoney().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});
