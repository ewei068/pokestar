const DB_NAME = 'pokestar';

const collectionNames = {
    USERS: 'users',
    USER_POKEMON: 'userPokemon'
};

const collectionConfig = {
    [collectionNames.USERS]: {
        indexes: []
    },
    [collectionNames.USER_POKEMON]: {
        indexes: [
            {
                key: { userId: 1 },
                unique: false
            }
        ]
    }
}


module.exports = {
    DB_NAME,
    collectionNames,
    collectionConfig
};
