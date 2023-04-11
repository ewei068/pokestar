const eventNames = {
    POKEMON_SCROLL: "pokemonScroll",
};

const eventConfig = {
    [eventNames.POKEMON_SCROLL]: {
        "name": "Pokemon Scroll",
        "execute": "pokemonScroll.js",
    }
};

module.exports = {
    eventNames,
    eventConfig,
};