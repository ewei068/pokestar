const { logger } = require("../log");
const { stageNames, stageConfig } = require("./stageConfig");

const { prefix } = stageConfig[process.env.STAGE];

/** @typedef {Keys<commandCategoryConfigRaw>} CommandCategoryEnum */

/**
 * @typedef {{
 *  name: string,
 *  description: string,
 *  folder: string,
 *  commands: CommandEnum[]
 * }} CommandCategoryData
 */

// TODO: re-order commands and categories
// TODO: add long descriptions
/**
 * @satisfies {Record<string, CommandCategoryData>}
 */
const commandCategoryConfigRaw = {
  trainer: {
    name: "Trainer",
    description: "Commands involving your trainer",
    folder: "trainer",
    commands: [
      "trainerinfo",
      "daily",
      "backpack",
      "settings",
      "levelrewards",
      "locations",
      "quest",
    ],
  },
  pokemon: {
    name: "Pokemon",
    description: "Commands to catch, train, and inspect Pokemon",
    folder: "pokemon",
    commands: [
      "gacha",
      "info",
      "list",
      "pokedex",
      "train",
      "evolve",
      "form",
      "equipment",
      "equipmentlist",
      "equipmentswap",
      "nature",
      "helditem",
      "release",
      "mythic",
      "mew",
      "celebi",
      "deoxys",
      "jirachi",
      "darkrai",
      // "togglespawn",
    ],
  },
  shop: {
    name: "Shop",
    description: "Browse the shop and buy items",
    folder: "shop",
    commands: ["pokemart", "buy", "craft"],
  },
  battle: {
    name: "Battle",
    description: "Battle commands",
    folder: "battle",
    commands: [
      "pvp",
      "pve",
      "dungeons",
      "battletower",
      "raid",
      "party",
      "partyinfo",
      "partyadd",
      "partyremove",
      "partyauto",
      "partylist",
      "partyload",
      "partymanage",
    ],
  },
  social: {
    name: "Social",
    description: "Social commands",
    folder: "social",
    commands: [
      "vote",
      "trade",
      "tradeadd",
      "tradeinfo",
      "traderemove",
      "traderequest",
      "leaderboard",
      "invite",
    ],
  },
  server: {
    name: "Server",
    description: "Server management commands",
    folder: "server",
    commands: ["spawn", "spawnmanage", "spawnaddchannel", "spawnremovechannel"],
  },
  help: {
    name: "Help",
    description: "Help commands",
    folder: "help",
    commands: ["help", "tutorial", "events", "changelog"],
  },
  heartbeat: {
    name: "Heartbeat",
    description: "Basic heartbeat commands; intended for testing",
    folder: "heartbeat",
    commands: ["ping", "echo", "give", "giveitem", "test"],
  },
};
/** @type {Record<CommandCategoryEnum, CommandCategoryData>} */
const commandCategoryConfig = Object.freeze(commandCategoryConfigRaw);

/** @typedef {Keys<commandConfigRaw>} CommandEnum */

/**
 * @typedef {{
 *  name: string,
 *  aliases: string[],
 *  description: string,
 *  longDescription?: string,
 *  execute?: string,
 *  args: Record<string, {
 *    type: string,
 *    description: string,
 *    optional: boolean,
 *    variable: boolean,
 *    enum?: any[],
 *  }>,
 *  stages: string[],
 *  exp?: number,
 *  money?: number,
 *  parent?: string,
 *  subcommands?: string[],
 *  isDeact?: boolean,
 * }} CommandConfigData
 */

/**
 * @satisfies {Record<string, CommandConfigData>}
 */
const commandConfigRaw = {
  ping: {
    name: "Ping",
    aliases: ["ping"],
    description: "Ping!",
    execute: "ping.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  echo: {
    name: "Echo",
    aliases: ["echo"],
    description: "echoes message",
    execute: "echo.js",
    args: {
      message: {
        type: "string",
        description: "message to echo",
        optional: true,
        variable: true,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA],
  },
  help: {
    name: "Help",
    aliases: ["help", "h"],
    description: "Help with command usage",
    longDescription:
      "Help with command usage. If no command is specified, shows an interactive embed to browse commands. If a command is specified, shows usage information for that command.",
    execute: "help.js",
    args: {
      command: {
        type: "string",
        description: "command to get help with",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  trainerinfo: {
    name: "Trainer Info",
    aliases: ["trainerinfo", "trainer", "ti", "profile", "user"],
    description: "Get information about your or another trainer trainer",
    longDescription:
      "Displays your trainer card with information such as number of Pokemon, Pokedollars, and level progress.",
    execute: "trainerInfo.js",
    args: {
      user: {
        type: "user",
        description:
          "@mention user to view their profile (if their profile is public)",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 0,
  },
  backpack: {
    name: "Backpack",
    aliases: ["backpack", "bp"],
    description: "Get info about your backpack items",
    execute: "backpack.js",
    args: {
      category: {
        type: "string",
        description: "category of items to view",
        optional: true,
        variable: false,
        enum: ["pokeballs", "materials", "consumables"],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
  },
  locations: {
    name: "Locations",
    aliases: ["locations"],
    description: "Get info about the locations you own",
    longDescription:
      "Displays a list of locations you own and the levels of each location.",
    execute: "locations.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
  },
  quest: {
    name: "Quest",
    aliases: ["quest", "quests", "q"],
    description: "View and manage your quests",
    longDescription:
      "View your active quests, completed quests, and claim quest rewards.",
    execute: "quest.js",
    args: {
      type: {
        type: "string",
        description: "type of quest to view",
        optional: true,
        variable: false,
        enum: ["daily", "achievement"],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
  },
  daily: {
    name: "Daily",
    aliases: ["daily", "dl"],
    description: "Get your daily rewards",
    longDescription:
      "Get your daily rewards, including Pokedollars and Pokeballs. You can get your daily rewards once every 24 hours, resetting at 00:00 UTC.",
    execute: "daily.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 50,
  },
  settings: {
    name: "User Settings",
    aliases: ["settings", "options", "config", "usersettings"],
    description: "Modify your user settings and options",
    longDescription:
      "Modify your user settings and options such as privacy and default device.",
    execute: "userSettings.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 0,
  },
  vote: {
    name: "Vote",
    aliases: ["vote", "v"],
    description: "Vote for the bot and claim rewards!",
    longDescription:
      "Vote for the bot and claim rewards, ₽200 and 2 Pokeballs per-vote! You can vote on every site once every 12 hours.",
    execute: "vote.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  levelrewards: {
    name: "Level Rewards",
    aliases: ["levelrewards"],
    description: "Claim your level rewards",
    longDescription:
      "Claim your level rewards, including Pokedollars and Pokeballs. You can claim your level rewards once every level, starting at level 2.",
    execute: "levelRewards.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 0,
  },
  gacha: {
    name: "Gacha",
    aliases: ["gacha", "g", "roll", "draw"],
    description: "Roll the gacha",
    longDescription:
      'Roll the gacha to get a random Pokemon. You can use different Pokeballs to increase your chances of getting a rare Pokemon. For more information, use this command and press the "Info" button. Get Pokeballs at the `/pokemart`, daily rewards, or level rewards.',
    execute: "gacha.js",
    args: {
      page: {
        type: "int",
        description: "page number",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  list: {
    name: "List",
    aliases: ["list", "listpokemon", "lp"],
    description: "List your Pokemon",
    execute: "list.js",
    longDescription: `List your Pokemon. For more complicated functionality, you can filter and sort the list.
        For example, you can filter for Pokemon named 'Pikachu' by using \`/list 1 name Pikachu\`
        If using message commands and you want to sort but not filter, pass 'none' as the \`filterby\` argument.
        For example, you can sort by combat power by using \`${prefix} list 1 none none combatPower\``,
    args: {
      page: {
        type: "int",
        description: "page number",
        optional: true,
        variable: false,
      },
      filterby: {
        type: "string",
        description: "category to filter on",
        optional: true,
        variable: false,
        enum: ["shiny", "name", "rarity", "locked", "originalOwner", "none"],
      },
      filtervalue: {
        type: "string",
        description: "value to filter for",
        optional: true,
        variable: false,
      },
      sortby: {
        type: "string",
        description: "category to sort by",
        optional: true,
        variable: false,
        enum: [
          "name",
          "ivTotal",
          "combatPower",
          "level",
          "dateAcquired",
          "pokedexOrder",
        ],
      },
      descending: {
        type: "bool",
        description: "sort descending",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 10,
    money: 25,
    isDeact: true,
  },
  info: {
    name: "Info",
    aliases: ["info", "i", "pokemoninfo", "pi"],
    description: "Get detailed info about a Pokemon",
    longDescription:
      "Display info about a Pokemon, including its stats, EVs/IVs, and level progress.",
    execute: "info.js",
    args: {
      name_or_id: {
        type: "string",
        description: "unique ID or name for pokemon",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 10,
    money: 25,
  },
  pokedex: {
    name: "Pokedex",
    aliases: ["pokedex", "dex", "d"],
    description: "Get info about a Pokemon species",
    longDescription:
      "Browse all information about a Pokedex species, including its general information, base stats, and moves. Specify a species to skip to that species.",
    execute: "pokedex.js",
    args: {
      species: {
        type: "string",
        description: "species name OR id number",
        optional: true,
        variable: true,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    isDeact: true,
  },
  release: {
    name: "Release",
    aliases: ["release"],
    description: "Release up to 10 Pokemon",
    longDescription:
      "Release up to 10 Pokemon. You will get Pokedollars for each Pokemon you release based on their rarity.",
    execute: "release.js",
    args: {
      pokemonids: {
        type: "string",
        description:
          "List of unique IDs for pokemon to release, separated by spaces",
        optional: false,
        variable: true,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 0,
  },
  train: {
    name: "Train",
    aliases: ["train", "t"],
    description: "Train a Pokemon",
    longDescription:
      "Train a Pokemon to increase its level or EVs. If a location is specified, you will get more EVs but less EXP. Level up your locations to increase their EV and EXP bonuses.",
    execute: "train.js",
    args: {
      pokemonid: {
        type: "string",
        description: "unique ID for Pokemon to train",
        optional: false,
        variable: false,
      },
      location: {
        type: "string",
        description: "location to train at; defaults to home",
        optional: true,
        variable: false,
        enum: [
          "home",
          "restaurant",
          "gym",
          "dojo",
          "temple",
          "school",
          "track",
          "berryBush",
          "berryFarm",
        ],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 15,
    money: 50,
  },
  evolve: {
    name: "Evolve",
    aliases: ["evolve"],
    description: "Evolve a Pokemon",
    longDescription:
      "Evolve a Pokemon. You must meet the requirements to evolve said Pokemon. Once done, a list of possible evolutions will be displayed. You can then choose which evolution you want.",
    execute: "evolve.js",
    args: {
      name_or_id: {
        type: "string",
        description: "unique ID or name for Pokemon to evolve",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 0,
  },
  form: {
    name: "Form",
    aliases: ["form"],
    description: "Change a Pokemon's form",
    longDescription:
      "Change a Pokemon's form. You must have enough money to change the form. Once done, a list of possible forms will be displayed. You can then choose which form you want.",
    execute: "form.js",
    args: {
      name_or_id: {
        type: "string",
        description: "unique ID or name for Pokemon to change form",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 0,
  },
  equipment: {
    name: "Equipment",
    aliases: ["equipment", "equip", "eq"],
    description: "Manage a Pokemon's equipment",
    longDescription:
      "Manage a Pokemon's equipment, upgrade it, and modify its stats.",
    execute: "equipment.js",
    args: {
      name_or_id: {
        type: "string",
        description: "unique ID for Pokemon to manage equipment for",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
  },
  equipmentlist: {
    name: "Equipment List",
    aliases: ["equipmentlist", "eql"],
    description: "List and sort your equipment",
    longDescription:
      "List and sort your equipment. Specifiy an equipment type to filter and a stat to sort by",
    execute: "equipmentList.js",
    args: {
      equipment_type: {
        type: "string",
        description: "equipment type to filter by",
        optional: true,
        variable: false,
        enum: [
          "powerWeight",
          "powerBracer",
          "powerBelt",
          "powerLens",
          "powerBand",
          "powerAnklet",
        ],
      },
      sort_stat: {
        type: "string",
        description: "stat to sort by",
        optional: true,
        variable: false,
        enum: [
          "baseHp",
          "baseAtk",
          "baseDef",
          "baseSpA",
          "baseSpD",
          "baseSpe",
          "percentHp",
          "percentAtk",
          "percentDef",
          "percentSpA",
          "percentSpD",
          "percentSpe",
          "flatHp",
          "flatAtk",
          "flatDef",
          "flatSpA",
          "flatSpD",
          "flatSpe",
        ],
      },
      include_level: {
        type: "bool",
        description: "include equipment level in sort",
        optional: true,
        variable: false,
      },
      locked: {
        type: "bool",
        description: "include/exclude locked Pokemon in sort",
        optional: true,
        variable: false,
      },
      page: {
        type: "int",
        description: "page number to display",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  equipmentswap: {
    name: "Equipment Swap",
    aliases: ["equipmentswap", "eqswap", "eqs"],
    description: "Swap a Pokemon's equipment",
    longDescription: "Swap a Pokemon's equipment with another.",
    execute: "equipmentSwap.js",
    args: {
      name_or_id: {
        type: "string",
        description: "unique ID for Pokemon to swap equipment for",
        optional: false,
        variable: false,
      },
      name_or_id2: {
        type: "string",
        description: "unique ID for Pokemon to swap equipment with",
        optional: false,
        variable: false,
      },
      equipment_type: {
        type: "string",
        description: "equipment to swap",
        optional: false,
        variable: false,
        enum: [
          "powerWeight",
          "powerBracer",
          "powerBelt",
          "powerLens",
          "powerBand",
          "powerAnklet",
        ],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
  },
  helditem: {
    name: "Held Item",
    aliases: ["helditem", "hi"],
    description: "Give, swap, or remove a Pokemon's held item",
    longDescription:
      "Give, swap, or remove a Pokemon's held item from your backpack.",
    execute: "heldItem.js",
    args: {
      name_or_id: {
        type: "string",
        description: "name or unique ID for Pokemon to manage held item for",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
  },
  nature: {
    name: "Nature",
    aliases: ["nature"],
    description: "Spend a mint to change a Pokemon's nature",
    longDescription:
      "Spend a mint to change a Pokemon's nature. Mints can be earned daily from `/pve palmer`.",
    execute: "nature.js",
    args: {
      name_or_id: {
        type: "string",
        description: "unique ID or name for Pokemon to change nature for",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
  },
  pokemart: {
    name: "Pokemart",
    aliases: ["pokemart", "pm", "shop"],
    description: "Get info about the items in stock at the Pokemart (shop)",
    execute: "pokemart.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
  },
  buy: {
    name: "Buy",
    aliases: ["buy", "b"],
    description: "Buy an item from the Pokemart",
    longDescription:
      "Buy an item from the Pokemart. You can buy up to 10 items at a time. Certain items may also have daily limits, reset at midnight UTC.",
    execute: "buy.js",
    args: {
      itemid: {
        type: "string",
        description: "item ID to buy",
        optional: false,
        variable: false,
      },
      quantity: {
        type: "int",
        description: "quantity to buy",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 15,
  },
  craft: {
    name: "Craft",
    aliases: ["craft", "c"],
    description: "Craft an item to add to your backpack",
    longDescription:
      "Craft an item to add to your backpack. You can craft items using money and materials you have in your backpack.",
    execute: "craft.js",
    args: {
      search: {
        type: "string",
        description: "search term to filter items",
        optional: true,
        variable: true,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  trade: {
    name: "Trade",
    aliases: ["trade"],
    description: "Entry point for trading",
    subcommands: ["tradeadd", "traderemove", "tradeinfo", "traderequest"],
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  tradeadd: {
    name: "Trade Add",
    aliases: ["tradeadd", "tra"],
    description: "Add a Pokemon or money to your trade offer",
    longDescription:
      "Add a Pokemon or money to your trade offer. You can only add Pokemon that are not currently in a trade, in parties, or locked.",
    execute: "tradeAdd.js",
    args: {
      option: {
        type: "string",
        description: "option (money, Pokemon name, or Pokemon ID) to add",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "trade",
  },
  traderemove: {
    name: "Trade Remove",
    aliases: ["traderemove", "trrm"],
    description: "Remove a Pokemon or money from your trade offer",
    longDescription: "Remove a Pokemon or money from your trade offer.",
    execute: "tradeRemove.js",
    args: {
      option: {
        type: "string",
        description: "option (money, Pokemon name, or Pokemon ID) to remove",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "trade",
  },
  tradeinfo: {
    name: "Trade Info",
    aliases: ["tradeinfo", "tri"],
    description: "Get info about your trade offer",
    execute: "tradeInfo.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "trade",
  },
  traderequest: {
    name: "Trade Request",
    aliases: ["traderequest", "trr"],
    description: "Request a trade with another user or anyone in the server",
    longDescription:
      "Request a trade using your trade offer. Leave the user field blank to allow anyone to accept the trade.",
    execute: "tradeRequest.js",
    args: {
      user: {
        type: "user",
        description: "@mention user to request a trade with",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "trade",
  },
  leaderboard: {
    name: "Leaderboard",
    aliases: ["leaderboard", "rankings"],
    description: "Get the leaderboard",
    execute: "leaderboard.js",
    args: {
      category: {
        type: "string",
        description: "category to get the leaderboard for",
        optional: false,
        variable: false,
        enum: ["level", "trainerExp", "pokedollars", "worth", "shiny", "power"],
      },
      scope: {
        type: "string",
        description: "scope to get the leaderboard for",
        optional: true,
        variable: false,
        enum: ["global", "server"],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  pvp: {
    name: "PvP",
    aliases: ["pvp", "battle"],
    description: "Battle another player",
    longDescription:
      "Initiates a battle in the channel. Another player may choose to accept the battle. If opponent is specified, only the opponent may accept the battle. If level is specified, all Pokemon will be scaled to that level.",
    execute: "pvp.js",
    args: {
      opponent: {
        type: "user",
        description: "@mention an opponent to battle",
        optional: true,
        variable: false,
      },
      level: {
        type: "int",
        description: "level to battle at",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  pve: {
    name: "PvE",
    aliases: ["pve", "battleai"],
    description: "Battle an AI",
    longDescription:
      "Browse a list of NPC trainers to battle! Specify an NPC and difficulty to directly battle them.",
    execute: "pve.js",
    args: {
      npcid: {
        type: "string",
        description: "NPC ID to battle",
        optional: true,
        variable: false,
        enum: [
          "bugCatcher",
          "youngster",
          "lass",
          "fisherman",
          "hiker",
          "aromaLady",
          "blackBelt",
          "dragonTamer",
          "aceTrainer",
          "blue",
          "red",
          "gold",
          "steven",
          "cynthia",
          "palmer",
          "professorWillow",
        ],
      },
      difficulty: {
        type: "string",
        description: "difficulty to battle at",
        optional: true,
        variable: false,
        enum: ["veryEasy", "easy", "medium", "hard", "veryHard"],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  dungeons: {
    name: "Dungeons",
    aliases: ["dungeons", "dungeon"],
    description: "Browse a list of dungeons",
    longDescription:
      "Browse a list of dungeons, defeat them to get equipment upgrade materials!",
    execute: "dungeons.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  battletower: {
    name: "Battle Tower",
    aliases: ["battletower", "bt"],
    description: "Battle the Battle Tower",
    longDescription: "Climb the Battle Tower every other week for rewards!",
    execute: "battleTower.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  raid: {
    name: "Raid",
    aliases: ["raid"],
    description: "Battle a raid boss",
    longDescription: "Battle a raid boss with other players to get rewards!",
    execute: "raid.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  party: {
    name: "Party",
    aliases: ["party"],
    description: "Entry point for party commands",
    // "execute": "party.js",
    subcommands: [
      "partyinfo",
      "partyadd",
      "partyremove",
      "partylist",
      "partyauto",
      "partyload",
      "partymanage",
    ],
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  partyinfo: {
    name: "Party Info",
    aliases: ["partyinfo", "party"],
    description: "Get info about your party",
    execute: "partyInfo.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "party",
  },
  partyadd: {
    name: "Party Add",
    aliases: ["partyadd", "pa"],
    description: "Add a Pokemon to your party, using position if specified",
    longDescription:
      "Add a Pokemon to your party, using position if specified. If the Pokemon is in the party already, swaps with another Pokemon. If the position is full, removes the Pokemon at that position first.",
    execute: "partyAdd.js",
    args: {
      name_or_id: {
        type: "string",
        description: "unique ID or name for Pokemon to add to party",
        optional: false,
        variable: false,
      },
      position: {
        type: "int",
        description: "position (1-12) to add Pokemon to",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "party",
  },
  partyremove: {
    name: "Party Remove",
    aliases: ["partyremove", "pr"],
    description:
      "Remove a Pokemon from your party by ID or position. Using 'ALL' removes all Pokemon.",
    longDescription: `Remove Pokemon(s) from your party depending on \`option\`:
        If \`option\` is a number, attempts to remove a Pokemon at that position.
        If \`option\` is a Pokemon ID, attempts to remove Pokemon with that ID.
        If \`option\` is ALL, removes all Pokemon from your party.`,
    execute: "partyRemove.js",
    args: {
      option: {
        type: "string",
        description:
          "option (<position> or <pokemonid> or ALL) to remove Pokemon by",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "party",
  },
  partyauto: {
    name: "Party Auto",
    aliases: ["partyauto", "pauto"],
    description: "Automatically fill your party with Pokemon",
    longDescription:
      "Automatically fill your party with Pokemon. NOTE: Removes all current party Pokemon from the party.",
    execute: "partyAuto.js",
    args: {
      option: {
        type: "string",
        description: "option to fill party based on",
        optional: true,
        variable: false,
        enum: ["combatPower", "ivTotal", "level"],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "party",
  },
  partylist: {
    name: "Parties",
    aliases: ["partylist"],
    description: "Browse a list of your parties",
    longDescription:
      "Browse a list of your parties. Parties are saved presets of Pokemon that can be loaded into your party.",
    execute: "partyList.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "party",
  },
  partyload: {
    name: "Party Load",
    aliases: ["partyload", "pl"],
    description: "Load a party from a preset",
    longDescription:
      "Load a party from a preset. This swaps the current active party with the party preset.",
    execute: "partyLoad.js",
    args: {
      preset: {
        type: "int",
        description: "preset number (1-9) to load",
        optional: false,
        variable: false,
        enum: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "party",
  },
  partymanage: {
    name: "Party Manage",
    aliases: ["partymanage", "pm"],
    description: "Manage your party - add, move/swap, or remove Pokemon",
    longDescription:
      "Manage your party in an interactive interface. Add Pokemon to your party, move/swap Pokemon positions, or remove Pokemon from your party.",
    execute: "partyManage.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "party",
  },
  mythic: {
    name: "Mythic",
    aliases: ["mythic"],
    description: "Entry point for Mythical Pokemon",
    subcommands: ["mew", "celebi", "deoxys", "jirachi", "darkrai"],
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  mew: {
    name: "Mew",
    aliases: ["mew"],
    description: "View and modify your Mew!",
    longDescription:
      "View and modify your Mew! Mew is a special Pokemon that can be customized to your liking.",
    execute: "mew.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "mythic",
  },
  celebi: {
    name: "Celebi",
    aliases: ["celebi"],
    description: "View you Celebi and activate its powers!",
    longDescription: "Use your Celebi's time powers for some powerful effects!",
    execute: "celebi.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "mythic",
  },
  deoxys: {
    name: "Deoxys",
    aliases: ["deoxys"],
    description: "View your Deoxys and change its form!",
    longDescription:
      "View your Deoxys and change its form! Deoxys is a special Pokemon that can change form!",
    execute: "deoxys.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "mythic",
  },
  jirachi: {
    name: "Jirachi",
    aliases: ["jirachi"],
    description: "View your Jirachi and make a wish!",
    longDescription:
      "View your Jirachi and make a wish! Jirachi is a special Pokemon that can grant wishes and increases your shiny Pokemon odds!",
    execute: "jirachi.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "mythic",
  },
  darkrai: {
    name: "Darkrai",
    aliases: ["darkrai"],
    description: "View your Darkrai and auto battle!",
    longDescription:
      "View your Darkrai! Darkrai is a special Pokemon that can control your sleeping Pokemon for you (auto battle)!",
    execute: "darkrai.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    exp: 5,
    money: 10,
    parent: "mythic",
  },
  tutorial: {
    name: "Tutorial",
    aliases: ["tutorial"],
    description: "Get a tutorial on how to play",
    execute: "tutorial.js",
    args: {
      page: {
        type: "int",
        description: "tutorial page number to view",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  events: {
    name: "Events",
    aliases: ["events"],
    description: "View all the events!",
    execute: "events.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  changelog: {
    name: "Changelog",
    aliases: ["changelog"],
    description: "View all the update changes!",
    execute: "changelog.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  invite: {
    name: "Invite",
    aliases: ["invite"],
    description: "Invite the bot to your server",
    execute: "invite.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  spawn: {
    name: "Spawn",
    aliases: ["spawn"],
    description: "Entry point for spawn management",
    subcommands: ["spawnmanage", "spawnaddchannel", "spawnremovechannel"],
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  },
  spawnmanage: {
    name: "Spawn Manage",
    aliases: ["spawnmanage", "sm"],
    description: "Manage Pokemon spawns in your server",
    longDescription:
      "Manage Pokemon spawns in your server. You can add or remove channels to spawn Pokemon in.",
    execute: "spawnManage.js",
    args: {},
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    parent: "spawn",
  },
  spawnaddchannel: {
    name: "Spawn Add Channel",
    aliases: ["spawnaddchannel", "sac"],
    description: "Add a channel to the spawn manager",
    longDescription: "Add a channel to the spawn manager.",
    execute: "spawnAddChannel.js",
    args: {
      channel: {
        type: "channel",
        description: "channel to add to spawn manager",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    parent: "spawn",
  },
  spawnremovechannel: {
    name: "Spawn Remove Channel",
    aliases: ["spawnremovechannel", "src"],
    description: "Remove a channel from the spawn manager",
    longDescription:
      "Remove a channel from the spawn manager. The channel must already be in the spawn manager.",
    execute: "spawnRemoveChannel.js",
    args: {
      channel: {
        type: "channel",
        description: "channel to remove from spawn manager",
        optional: false,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
    parent: "spawn",
  },
  give: {
    name: "Give",
    aliases: ["give"],
    description: "Give a Pokemon to self",
    longDescription: "Give a Pokemon to self.",
    execute: "give.js",
    args: {
      pokemonid: {
        type: "string",
        description: "unique ID for Pokemon to give to self",
        optional: false,
        variable: false,
      },
      level: {
        type: "int",
        description: "level to give Pokemon at",
        optional: true,
        variable: false,
      },
      equipmentlevel: {
        type: "int",
        description: "equipment level to give Pokemon at",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA],
    exp: 0,
    money: 0,
  },
  giveitem: {
    name: "Give Item",
    aliases: ["giveitem"],
    description: "Give a Item to self",
    longDescription: "Give a Item to self.",
    execute: "giveItem.js",
    args: {
      itemid: {
        type: "string",
        description: "ID for Item to give to self",
        optional: false,
        variable: false,
      },
      quantity: {
        type: "int",
        description: "quantity to give Item",
        optional: true,
        variable: false,
      },
    },
    stages: [stageNames.ALPHA],
    exp: 0,
    money: 0,
  },
  test: {
    name: "Test",
    aliases: ["test"],
    description: "Test command",
    execute: "test.js",
    args: {
      arg1: {
        type: "string",
        description: "arg1",
        optional: true,
        variable: true,
      },
    },
    stages: [stageNames.ALPHA],
  },
};

// if detect a capital letter in any command ID, warn
for (const commandId of Object.keys(commandConfigRaw)) {
  if (commandId !== commandId.toLowerCase()) {
    logger.warn(`Command ID ${commandId} contains a capital letter!`);
  }
}

/** @type {Record<CommandEnum, CommandConfigData>} */
const commandConfig = Object.freeze(commandConfigRaw);

module.exports = {
  commandCategoryConfig,
  commandConfig,
};
