const eventNames = {
    POKEMON_SCROLL: "pokemonScroll",
    POKEMON_RELEASE: "pokemonRelease",
    POKEMON_LIST_SELECT: "pokemonSelect",
};

const eventConfig = {
    [eventNames.POKEMON_SCROLL]: {
        "name": "Pokemon Scroll",
        "execute": "pokemonScroll.js",
    },
    [eventNames.POKEMON_RELEASE]: {
        "name": "Pokemon Release",
        "execute": "pokemonRelease.js",
    },
    [eventNames.POKEMON_LIST_SELECT]: {
        "name": "Pokemon List Select",
        "execute": "pokemonListSelect.js",
    },
};

module.exports = {
    eventNames,
    eventConfig,
};