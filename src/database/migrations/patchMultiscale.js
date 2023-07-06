const { updateDocuments } = require('../mongoHandler');
const { collectionNames } = require('../../config/databaseConfig');

// patch multiscale ID from 138 -> 136

const patchMultiscale = async () => {
    const filter = {
        abilityId: '138'
    };
    const update = {
        $set: { abilityId: '136' }
    };

    const res = await updateDocuments(collectionNames.USER_POKEMON, filter, update);
    return res;
}

patchMultiscale().then((res) => {
    console.log(res);
}).catch((error) => {
    console.log(error);
});  