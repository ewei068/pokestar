const eventNames = {
    POKEMON_SCROLL: "pokemonScroll",
    POKEMON_RELEASE: "pokemonRelease",
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
};

module.exports = {
    eventNames,
    eventConfig,
};