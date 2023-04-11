const { logger } = require("../log");
const { findDocuments } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");

// TODO: move this?
const PAGE_SIZE = 10;

const listPokemon = async (trainer, page) => {
    // get pokemon with pagination
    try {
        const res = await findDocuments(collectionNames.USER_POKEMON, { userId: trainer.userId }, PAGE_SIZE, page - 1);
        if (res.length === 0) {
            return { data: null, err: "No Pokemon found." };
        } else if (res.length > PAGE_SIZE) {
            res.pop();
            return { data: res, lastPage: false, err: null };
        } else {
            return { data: res, lastPage: true, err: null };
        }
    } catch (error) {
        logger.error(error);
        return { data: null, err: "Error getting Pokemon." };
    }
}

module.exports = {
    listPokemon,
};