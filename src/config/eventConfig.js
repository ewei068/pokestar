const eventNames = {
    POKEMON_SCROLL: "pokemonScroll",
    POKEMON_RELEASE: "pokemonRelease",
    POKEMON_LIST_SELECT: "pokemonSelect",
    POKEMON_EVOLVE_SELECT: "pokemonEvolveSelect",
    POKEMON_EVOLVE_CONFIRM: "pokemonEvolveConfirm",
    SHOP_SELECT: "shopSelect",
    HELP_SELECT: "helpSelect",
    BACK: "back",
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
    [eventNames.POKEMON_EVOLVE_SELECT]: {
        "name": "Pokemon Evolve Select",
        "execute": "pokemonEvolveSelect.js",
    },
    [eventNames.POKEMON_EVOLVE_CONFIRM]: {
        "name": "Pokemon Evolve Confirm",
        "execute": "pokemonEvolveConfirm.js",
        "exp": 25,
        "money": 200,
    },
    [eventNames.SHOP_SELECT]: {
        "name": "Shop Select",
        "execute": "shopSelect.js",
    },
    [eventNames.HELP_SELECT]: {
        "name": "Help Select",
        "execute": "helpSelect.js",
    },
    [eventNames.BACK]: {
        "name": "Back",
        "execute": "back.js",
    },
    "test": {
        "name": "Test",
        "execute": "testEvent.js",
    },
};

module.exports = {
    eventNames,
    eventConfig,
};