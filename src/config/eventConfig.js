/** @typedef {Enum<eventNames>} EventNameEnum */
const eventNames = Object.freeze({
  POKEMON_SCROLL: "pokemonScroll",
  POKEMON_RELEASE: "pokemonRelease",
  POKEMON_LIST_SELECT: "pokemonSelect",
  POKEMON_EVOLVE_SELECT: "pokemonEvolveSelect",
  POKEMON_EVOLVE_CONFIRM: "pokemonEvolveConfirm",
  POKEMON_RELEASE_PAGE: "pokemonReleasePage",
  POKEMON_INFO_BUTTON: "pokemonInfoButton",
  POKEMON_ACTION_BUTTON: "pokemonActionButton",
  POKEDEX_LIST_BUTTON: "pokedexListButton",
  POKEDEX_BUTTON: "pokedexButton",
  WILD_POKEMON_BUTTON: "wildPokemonButton",
  EQUIPMENT_SELECT: "equipmentSelect",
  EQUIPMENT_BUTTON: "equipmentButton",
  EQUIPMENT_UPGRADE: "equipmentUpgrade",
  EQUIPMENT_SCROLL: "equipmentScroll",
  EQUIPMENT_LIST_SELECT: "equipmentListSelect",
  EQUIPMENT_SWAP: "equipmentSwap",
  NATURE_SELECT: "natureSelect",
  NATURE_CONFIRM: "natureConfirm",
  SHOP_SELECT: "shopSelect",
  SHOP_BUY: "shopBuy",
  HELP_SELECT: "helpSelect",
  PVP_ACCEPT: "pvpAccept",
  PVE_SCROLL: "pveScroll",
  PVE_SELECT: "pveSelect",
  PVE_ACCEPT: "pveAccept",
  DUNGEON_SELECT: "dungeonSelect",
  DUNGEON_ACCEPT: "dungeonAccept",
  TOWER_SCROLL: "towerScroll",
  TOWER_ACCEPT: "towerAccept",
  RAID_SELECT: "raidSelect",
  RAID_RETURN: "raidReturn",
  RAID_START: "raidStart",
  RAID_ACCEPT: "raidAccept",
  BATTLE_INFO: "battleInfo",
  BATTLE_MOVE_SELECT: "battleMoveSelect",
  BATTLE_TARGET_SELECT: "battleTargetSelect",
  BATTLE_TARGET_CONFIRM: "battleTargetConfirm",
  BANNER_SCROLL: "bannerScroll",
  BANNER_BUTTON: "bannerButton",
  BANNER_GACHA: "bannerGacha",
  MEW_BUTTON: "mewButton",
  MEW_SELECT: "mewSelect",
  CELEBI_TIME_TRAVEL: "celebiTimeTravel",
  DEOXYS_FORM_SELECT: "deoxysFormSelect",
  TRADE_HELP: "tradeHelp",
  TRADE_REQUEST_ACCEPT: "tradeRequestAccept",
  TRADE_REQUEST_BUTTON: "tradeRequestButton",
  VOTE_REWARDS: "voteRewards",
  EVENT_BUTTON: "eventButton",
  TUTORIAL_BUTTON: "tutorialButton",
  TUTORIAL_UPSELL_BUTTON: "tutorialUpsellButton",
  QUEST_UPSELL_BUTTON: "questUpsellButton",
  BACK: "back",
  POKEMON_ID_SELECT: "pokemonIdSelect",
});

const eventConfig = {
  [eventNames.POKEMON_SCROLL]: {
    name: "Pokemon Scroll",
    execute: "pokemonScroll.js",
    directory: "pokemon",
  },
  [eventNames.POKEMON_RELEASE]: {
    name: "Pokemon Release",
    execute: "pokemonRelease.js",
    directory: "pokemon",
  },
  [eventNames.POKEMON_LIST_SELECT]: {
    name: "Pokemon List Select",
    execute: "pokemonListSelect.js",
    directory: "pokemon",
    exp: 10,
    money: 25,
  },
  [eventNames.POKEMON_EVOLVE_SELECT]: {
    name: "Pokemon Evolve Select",
    execute: "pokemonEvolveSelect.js",
    directory: "pokemon",
  },
  [eventNames.POKEMON_EVOLVE_CONFIRM]: {
    name: "Pokemon Evolve Confirm",
    execute: "pokemonEvolveConfirm.js",
    directory: "pokemon",
    exp: 25,
    money: 200,
  },
  [eventNames.POKEMON_RELEASE_PAGE]: {
    name: "Pokemon Release Page",
    execute: "pokemonReleasePage.js",
    directory: "pokemon",
  },
  [eventNames.POKEMON_INFO_BUTTON]: {
    name: "Pokemon Info Button",
    execute: "pokemonInfoButton.js",
    directory: "pokemon",
  },
  [eventNames.POKEMON_ACTION_BUTTON]: {
    name: "Pokemon Action Button",
    execute: "pokemonActionButton.js",
    directory: "pokemon",
  },
  [eventNames.POKEDEX_LIST_BUTTON]: {
    name: "Pokedex List Button",
    execute: "pokedexListButton.js",
    directory: "pokemon",
  },
  [eventNames.POKEDEX_BUTTON]: {
    name: "Pokedex Button",
    execute: "pokedexButton.js",
    directory: "pokemon",
  },
  [eventNames.WILD_POKEMON_BUTTON]: {
    name: "Wild Pokemon Button",
    execute: "wildPokemonButton.js",
    directory: "pokemon",
  },
  [eventNames.EQUIPMENT_SELECT]: {
    name: "Equipment Select",
    execute: "equipmentSelect.js",
    directory: "equipment",
  },
  [eventNames.EQUIPMENT_BUTTON]: {
    name: "Equipment Button",
    execute: "equipmentButton.js",
    directory: "equipment",
  },
  [eventNames.EQUIPMENT_UPGRADE]: {
    name: "Equipment Upgrade",
    execute: "equipmentUpgrade.js",
    directory: "equipment",
    exp: 15,
  },
  [eventNames.EQUIPMENT_SCROLL]: {
    name: "Equipment Scroll",
    execute: "equipmentScroll.js",
    directory: "equipment",
  },
  [eventNames.EQUIPMENT_LIST_SELECT]: {
    name: "Equipment List Select",
    execute: "equipmentListSelect.js",
    directory: "equipment",
    exp: 10,
    money: 25,
  },
  [eventNames.EQUIPMENT_SWAP]: {
    name: "Equipment Swap",
    execute: "equipmentSwap.js",
    directory: "equipment",
    exp: 50,
  },
  [eventNames.NATURE_SELECT]: {
    name: "Nature Select",
    execute: "natureSelect.js",
  },
  [eventNames.NATURE_CONFIRM]: {
    name: "Nature Confirm",
    execute: "natureConfirm.js",
    exp: 10,
    money: 25,
  },
  [eventNames.SHOP_SELECT]: {
    name: "Shop Select",
    execute: "shopSelect.js",
  },
  [eventNames.SHOP_BUY]: {
    name: "Shop Buy",
    execute: "shopBuy.js",
    exp: 15,
  },
  [eventNames.HELP_SELECT]: {
    name: "Help Select",
    execute: "helpSelect.js",
    directory: "help",
  },
  [eventNames.BACK]: {
    name: "Back",
    execute: "back.js",
  },
  [eventNames.PVP_ACCEPT]: {
    name: "PVP Accept",
    execute: "pvpAccept.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.PVE_SCROLL]: {
    name: "PVE Scroll",
    execute: "pveScroll.js",
    directory: "battle",
  },
  [eventNames.PVE_SELECT]: {
    name: "PVE Select",
    execute: "pveSelect.js",
    directory: "battle",
  },
  [eventNames.PVE_ACCEPT]: {
    name: "PVE Accept",
    execute: "pveAccept.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.DUNGEON_SELECT]: {
    name: "Dungeon Select",
    execute: "dungeonSelect.js",
    directory: "battle",
  },
  [eventNames.DUNGEON_ACCEPT]: {
    name: "Dungeon Accept",
    execute: "dungeonAccept.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.TOWER_SCROLL]: {
    name: "Tower Scroll",
    execute: "towerScroll.js",
    directory: "battle",
  },
  [eventNames.TOWER_ACCEPT]: {
    name: "Tower Accept",
    execute: "towerAccept.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.RAID_SELECT]: {
    name: "Raid Select",
    execute: "raidSelect.js",
    directory: "battle",
  },
  [eventNames.RAID_RETURN]: {
    name: "Raid Return",
    execute: "raidReturn.js",
    directory: "battle",
  },
  [eventNames.RAID_START]: {
    name: "Raid Start",
    execute: "raidStart.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.RAID_ACCEPT]: {
    name: "Raid Accept",
    execute: "raidAccept.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.BATTLE_INFO]: {
    name: "Battle Info",
    execute: "battleInfo.js",
    directory: "battle",
  },
  [eventNames.BATTLE_MOVE_SELECT]: {
    name: "Battle Move Select",
    execute: "battleMoveSelect.js",
    directory: "battle",
  },
  [eventNames.BATTLE_TARGET_SELECT]: {
    name: "Battle Target Select",
    execute: "battleTargetSelect.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.BATTLE_TARGET_CONFIRM]: {
    name: "Battle Target Confirm",
    execute: "battleTargetConfirm.js",
    directory: "battle",
    exp: 10,
    money: 25,
  },
  [eventNames.BANNER_SCROLL]: {
    name: "Gacha Scroll",
    execute: "bannerScroll.js",
  },
  [eventNames.BANNER_BUTTON]: {
    name: "Gacha Button",
    execute: "bannerButton.js",
  },
  [eventNames.BANNER_GACHA]: {
    name: "Gacha",
    execute: "bannerGacha.js",
    exp: 25,
    money: 50,
  },
  [eventNames.MEW_BUTTON]: {
    name: "Mew Button",
    execute: "mewButton.js",
    directory: "mythic",
  },
  [eventNames.MEW_SELECT]: {
    name: "Mew Select",
    execute: "mewSelect.js",
    directory: "mythic",
    exp: 5,
    money: 10,
  },
  [eventNames.CELEBI_TIME_TRAVEL]: {
    name: "Celebi Time Travel",
    execute: "celebiTimeTravel.js",
    directory: "mythic",
    exp: 25,
    money: 50,
  },
  [eventNames.DEOXYS_FORM_SELECT]: {
    name: "Deoxys Form Select",
    execute: "deoxysFormSelect.js",
    directory: "mythic",
    exp: 5,
    money: 10,
  },
  [eventNames.TRADE_HELP]: {
    name: "Trade Help",
    execute: "tradeHelp.js",
    directory: "trade",
  },
  [eventNames.TRADE_REQUEST_ACCEPT]: {
    name: "Trade Request Accept",
    execute: "tradeRequestAccept.js",
    directory: "trade",
    exp: 5,
    money: 10,
  },
  [eventNames.TRADE_REQUEST_BUTTON]: {
    name: "Trade Request Button",
    execute: "tradeRequestButton.js",
    directory: "trade",
  },
  [eventNames.VOTE_REWARDS]: {
    name: "Vote Rewards",
    execute: "voteRewards.js",
    exp: 25,
  },
  [eventNames.EVENT_BUTTON]: {
    name: "Event Button",
    execute: "eventButton.js",
    directory: "help",
  },
  [eventNames.TUTORIAL_BUTTON]: {
    name: "Tutorial Button",
    execute: "tutorialButton.js",
    directory: "help",
  },
  [eventNames.TUTORIAL_UPSELL_BUTTON]: {
    name: "Tutorial Upsell Button",
    execute: "tutorialUpsellButton.js",
    directory: "help",
    exp: 10,
    money: 25,
  },
  [eventNames.QUEST_UPSELL_BUTTON]: {
    name: "Quest Upsell Button",
    execute: "questUpsellButton.js",
    directory: "trainer",
    exp: 10,
    money: 25,
  },
  [eventNames.POKEMON_ID_SELECT]: {
    name: "Pokemon ID Select",
  },
  test: {
    name: "Test",
    execute: "testEvent.js",
  },
};

module.exports = {
  eventNames,
  eventConfig,
};
