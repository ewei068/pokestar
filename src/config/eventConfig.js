const eventNames = {
    POKEMON_SCROLL: "pokemonScroll",
    POKEMON_RELEASE: "pokemonRelease",
    POKEMON_LIST_SELECT: "pokemonSelect",
    POKEMON_EVOLVE_SELECT: "pokemonEvolveSelect",
    POKEMON_EVOLVE_CONFIRM: "pokemonEvolveConfirm",
    POKEMON_RELEASE_PAGE: "pokemonReleasePage",
    POKEMON_INFO_BUTTON: "pokemonInfoButton",
    POKEDEX_BUTTON: "pokedexButton",
    EQUIPMENT_SELECT: "equipmentSelect",
    EQUIPMENT_BUTTON: "equipmentButton",
    EQUIPMENT_UPGRADE: "equipmentUpgrade",
    SHOP_SELECT: "shopSelect",
    SHOP_BUY: "shopBuy",
    HELP_SELECT: "helpSelect",
    PVP_ACCEPT: "pvpAccept",
    PVE_SCROLL: "pveScroll",
    PVE_SELECT: "pveSelect",
    PVE_ACCEPT: "pveAccept",
    DUNGEON_SELECT: "dungeonSelect",
    BATTLE_INFO: "battleInfo",
    BATTLE_MOVE_SELECT: "battleMoveSelect",
    BATTLE_TARGET_SELECT: "battleTargetSelect",
    BANNER_SCROLL: "bannerScroll",
    BANNER_BUTTON: "bannerButton",
    BANNER_GACHA: "bannerGacha",
    VOTE_REWARDS: "voteRewards",
    EVENT_BUTTON: "eventButton",
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
        "exp": 10,
        "money": 25,
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
    [eventNames.POKEMON_RELEASE_PAGE]: {
        "name": "Pokemon Release Page",
        "execute": "pokemonReleasePage.js",
    },
    [eventNames.POKEMON_INFO_BUTTON]: {
        "name": "Pokemon Info Button",
        "execute": "pokemonInfoButton.js",
    },
    [eventNames.POKEDEX_BUTTON]: {
        "name": "Pokedex Button",
        "execute": "pokedexButton.js",
    },
    [eventNames.EQUIPMENT_SELECT]: {
        "name": "Equipment Select",
        "execute": "equipmentSelect.js",
    },
    [eventNames.EQUIPMENT_BUTTON]: {
        "name": "Equipment Button",
        "execute": "equipmentButton.js",
    },
    [eventNames.EQUIPMENT_UPGRADE]: {
        "name": "Equipment Upgrade",
        "execute": "equipmentUpgrade.js",
        "exp": 15,
    },
    [eventNames.SHOP_SELECT]: {
        "name": "Shop Select",
        "execute": "shopSelect.js",
    },
    [eventNames.SHOP_BUY]: {
        "name": "Shop Buy",
        "execute": "shopBuy.js",
        "exp": 15,
    },
    [eventNames.HELP_SELECT]: {
        "name": "Help Select",
        "execute": "helpSelect.js",
    },
    [eventNames.BACK]: {
        "name": "Back",
        "execute": "back.js",
    },
    [eventNames.PVP_ACCEPT]: {
        "name": "PVP Accept",
        "execute": "pvpAccept.js",
        "exp": 10,
        "money": 25,
    },
    [eventNames.PVE_SCROLL]: {
        "name": "PVE Scroll",
        "execute": "pveScroll.js",
    },
    [eventNames.PVE_SELECT]: {
        "name": "PVE Select",
        "execute": "pveSelect.js",
    },
    [eventNames.PVE_ACCEPT]: {
        "name": "PVE Accept",
        "execute": "pveAccept.js",
        "exp": 10,
        "money": 25,
    },
    [eventNames.DUNGEON_SELECT]: {
        "name": "Dungeon Select",
        "execute": "dungeonSelect.js",
    },
    [eventNames.BATTLE_INFO]: {
        "name": "Battle Info",
        "execute": "battleInfo.js",
    },
    [eventNames.BATTLE_MOVE_SELECT]: {
        "name": "Battle Move Select",
        "execute": "battleMoveSelect.js",
    },
    [eventNames.BATTLE_TARGET_SELECT]: {
        "name": "Battle Target Select",
        "execute": "battleTargetSelect.js",
        "exp": 10,
        "money": 25,
    },
    [eventNames.BANNER_SCROLL]: {
        "name": "Gacha Scroll",
        "execute": "bannerScroll.js",
    },
    [eventNames.BANNER_BUTTON]: {
        "name": "Gacha Button",
        "execute": "bannerButton.js",
    },
    [eventNames.BANNER_GACHA]: {
        "name": "Gacha",
        "execute": "bannerGacha.js",
        "exp": 25,
        "money": 50,
    },
    [eventNames.VOTE_REWARDS]: {
        "name": "Vote Rewards",
        "execute": "voteRewards.js",
        "exp": 25,
    },
    [eventNames.EVENT_BUTTON]: {
        "name": "Event Button",
        "execute": "eventButton.js",
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
