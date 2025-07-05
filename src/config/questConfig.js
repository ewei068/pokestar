// smell -- this config depends on some services to work properly
// maybe refactor at some point but I don't think it's a big deal because this is an isolated functionality
const { emojis } = require("../enums/emojis");
const { pokemonIdEnum } = require("../enums/pokemonEnums");
const {
  checkNumPokemon,
  listPokemonsFromTrainer: listPokemons,
} = require("../services/pokemon");
const { getMaxDreamCards } = require("../utils/trainerUtils");
const { backpackCategories, backpackItems } = require("./backpackConfig");
const { SUPPORT_SERVER_INVITE, gameEventConfig } = require("./helpConfig");
const { locations } = require("./locationConfig");
const { difficulties } = require("./npcConfig");
const { shopItems } = require("./shopConfig");

/** @typedef {Keys<newTutorialConfigRaw>} TutorialStageEnum */
/**
 * @typedef {{
 *  name: string,
 *  emoji?: string,
 *  description: string,
 *  requirementString: string,
 *  proceedString: string,
 *  checkRequirements: (trainer: WithId<Trainer>) => Promise<boolean>,
 *  rewards: Rewards,
 *  image?: string,
 *  tip?: string,
 * }} TutorialStageData
 */

// TODO: progress strngs?
/** @satisfies {Record<string, TutorialStageData>} */
const newTutorialConfigRaw = {
  welcome: {
    name: "Welcome to Pokestar!",
    emoji: emojis.STARMIE,
    description: `Welcome to Pokestar! Pokestar is a battle-focused Pokemon Discord bot! This tutorial will guide you through the basics of Pokestar. **For more information, please [join the support server](${SUPPORT_SERVER_INVITE}) or use \`/help\` for help with commands!**\n\nHere are some Pokeballs to get you started!`,
    requirementString: "None",
    proceedString: "If you got here somehow then please tell me lol",
    checkRequirements: async () => true,
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
        },
      },
    },
    image:
      "https://dbl-static.usercontent.prism.gg/02f7065e82d8c66e66299b74eda565b6.png",
  },
  useGacha: {
    name: "Catching Pokemon",
    emoji: emojis.POKEBALL,
    description:
      "The first thing to do is catch Pokemon! **To catch new Pokemon, use the `/gacha` command**. \n## `/gacha`",
    requirementString: "Catch 1x Pokemon",
    proceedString: "Use `/gacha` and catch a Pokemon! \n## `/gacha`",
    checkRequirements: async (trainer) =>
      await checkNumPokemon(trainer)
        .then((res) => (res.numPokemon ?? 0) > 0)
        .catch(() => false),
    rewards: {
      money: 5000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/gacha.gif",
    tip: "Rarer Pokeballs catch rarer Pokemon!",
  },
  dailyRewards: {
    name: "Daily Rewards",
    emoji: "📅",
    description:
      "You can get more money and Pokeballs for free every day! **Use `/daily` to claim your daily rewards.** \n## `/daily`",
    requirementString: "Claim Daily Rewards",
    proceedString: "Use `/daily` to claim your daily rewards! \n## `/daily`",
    checkRequirements: async (trainer) => trainer.claimedDaily,
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.ULTRABALL]: 3,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/daily.png",
  },
  backpack: {
    name: "Backpack Management",
    emoji: "🎒",
    description:
      "You can view your items and money by using `/backpack`. \n## `/backpack`",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/backpack` to view your backpack, and complete the previous stage. \n## `/backpack`",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.dailyRewards,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/backpack.png",
  },
  catchSixPokemon: {
    name: "Catch More Pokemon",
    emoji: emojis.GREATBALL,
    description:
      "Catch more Pokemon to build your team! **Use `/gacha` to catch 6 Pokemon**.\n## `/gacha`",
    requirementString: "Catch 6x Pokemon",
    proceedString: "Use `/gacha` to catch 6 Pokemon! \n## `/gacha`",
    checkRequirements: async (trainer) =>
      await checkNumPokemon(trainer)
        .then((res) => (res.numPokemon ?? 0) >= 6)
        .catch(() => false),
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.GREATBALL]: 5,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/gacha.gif",
  },
  buildParty: {
    name: "Building Your Party",
    emoji: emojis.PIKACHU,
    description:
      "Build your party by adding 6 Pokemon to your party! **Use `/party auto` to add your 6 strongest Pokemon to your party**. You can also use `/party manage` to make finer adjustments to your party. \n## `/party auto` `/party manage`",
    requirementString: "Add 6x Pokemon to Party",
    proceedString:
      "Use `/party auto` or `/party manage` to add a Pokemon to your party! \n## `/party auto` `/party manage`",
    checkRequirements: async (trainer) => {
      const partyPokemon = trainer.party.pokemonIds.filter((id) => id);
      return partyPokemon.length >= 6;
    },
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/tutorial/partymanage.gif",
  },
  learnBattleTurns: {
    name: "Learning to Battle: Taking Turns",
    emoji: "➡️",
    description:
      "Before you battle, you must learn how they work! Battles in Pokestar are unique; **all 6 Pokemon fight at a time!**\n\n**Taking turns is based off combat readiness.** Pokemon with higher speed gain combat readiness faster. The current active Pokemon is highlighted in asterisks.",
    requirementString: "Complete the previous stage",
    proceedString:
      "Read the description to learn about battles, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.buildParty,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/combat-readiness.png",
    tip: "View the combat readiness of a team by clicking the 🔴 NPC or 🔵 Player tabs",
  },
  learnBattleMoves: {
    name: "Learning to Battle: Using Moves",
    emoji: "🔥",
    description:
      "When its your turn, you can use a move! **Use the dropdown menu to select a move.**\n\nWhen selecting a move, a description will appear. This includes important move information such as its **type, power, effect, and cooldown.**",
    requirementString: "Complete the previous stage",
    proceedString:
      "Read the description to learn about battles, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.learnBattleTurns,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/battle-move-select.gif",
  },
  learnBattleTargets: {
    name: "Learning to Battle: Selecting Targets",
    emoji: "🎯",
    description:
      "When using a move, you must select a target! **Click on the Pokemon you want to target from the dropdown menu.** Most moves may only target certain Pokemon, which is indicated in the **Target:** section of the move description." +
      "\n\n**Some moves may affect an area of Pokemon.** When a target is selected, that area is indicated by a wider border. **When satisfied, click the ⚔️ Confirm button to use the move.**" +
      "\n\nFor more detailed battle mechanics, check out the [documentation on Github](https://github.com/ewei068/pokestar?tab=readme-ov-file#-battle-mechanics).",
    requirementString: "Complete the previous stage",
    proceedString:
      "Read the description to learn about battles, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.learnBattleMoves,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/battle-target-select.gif",
    tip: "You can disable target indicators in your /settings",
  },
  winNpcBattle: {
    name: "Battle an NPC!",
    emoji: "⚔️",
    description:
      "Now that you know how to battle, **use `/pve` to battle an NPC!** I'd recommend starting with the <:bugcatcher:1117871382399815812> Bug Catcher on Very Easy difficulty. \n## `/pve`",
    requirementString: "Win any NPC Battle",
    proceedString: "Use `/pve` to battle an NPC! \n## `/pve`",
    checkRequirements: async (trainer) =>
      Object.keys(trainer.defeatedNPCs).length > 0,
    rewards: {
      money: 5000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
          [backpackItems.MASTERBALL]: 1,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pve.gif",
    tip: "Some NPCs give daily victory rewards!",
  },
  buyPokeballs: {
    name: "Buying Pokeballs",
    emoji: emojis.POKEBALL,
    description: `One of the best ways to get more Pokeballs is to buy them from the Pokemart every day. Use \`/pokemart\` to buy ${emojis.POKEBALL} Pokeballs, or use \`/buy itemid: 0 quantity: 5\` to buy the maximum amount.\n## \`/pokemart\``,
    requirementString: `Buy 5x ${emojis.POKEBALL} Pokeballs`,
    proceedString:
      "Use `/pokemart` or `/buy itemid: 0 quantity: 5` to buy 5 Pokeballs! \n## `/pokemart`",
    checkRequirements: async (trainer) =>
      trainer.purchasedShopItemsToday[shopItems.RANDOM_POKEBALL] >= 5,
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.GREATBALL]: 5,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pokemart.gif",
    tip: "You can buy 5 Pokeballs every day!",
  },
  listPokemon: {
    name: "Viewing Pokemon: List",
    emoji: "📜",
    description:
      "You can view all your Pokemon using `/list`. **Use `/list` to view your Pokemon.** \n## `/list`",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/list` to view your Pokemon, and complete the previous stage. \n## `/list`",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.winNpcBattle,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/list.png",
    tip: "You can search, sort, and release Pokemon from the /list!",
  },
  viewPokemon: {
    name: "Viewing Pokemon: Info",
    emoji: "🔍",
    description:
      "You can view a specific Pokemon using `/info`, or clicking them from the `/list` dropdown menu. **Use `/info` to view a specific Pokemon.**\n## `/info <name>`",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/info` to view a specific Pokemon, and complete the previous stage. \n## `/info <name>`",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.listPokemon,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/info.png",
    tip: "For mobile users, you can long press + copy to copy a Pokemon's ID from here",
  },
  trainPokemon: {
    name: "Training Pokemon",
    emoji: "🏋️",
    description:
      "One way to give your Pokemon more EXP is by training! Copy a Pokemon's ID, then **Use `/train` to train a Pokemon to level 12.**\n## `/train <id>`",
    requirementString: "Have 1x Pokemon at level 12 or higher",
    proceedString:
      "Use `/train` to train a Pokemon to level 12. \n## `/train <id>`",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 1,
        page: 1,
        filter: {
          level: { $gte: 12 },
        },
      });
      return (pokemons?.length ?? 0) > 0;
    },
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/train.png",
    tip: "On desktop, you can use the Up Arrow key to use your last command.",
  },
  trainerInfo: {
    name: "Viewing Trainer Info",
    emoji: "📊",
    description:
      "You can view your trainer info using `/trainerinfo`. **Use `/trainerinfo` to view your trainer info.** \n## `/trainerinfo`",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/trainerinfo` to view your trainer info, and complete the previous stage. \n## `/trainerinfo`",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.trainPokemon,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/trainerinfo.png",
    tip: "You can also view the trainer info of other trainers",
  },
  trainerLevel: {
    name: "Trainer Level",
    emoji: "🎓",
    description:
      "In your trainer info, you may notice a trainer level. **Leveling your trainer makes your Pokemon gain more EXP.**\n\nMost commands and actions will provide your trainer EXP. **Reach trainer level 3.**",
    requirementString: "Reach Trainer Level 3",
    proceedString:
      "Use commands and actions to level up your trainer to level 3!",
    checkRequirements: async (trainer) => trainer.level >= 3,
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
        },
      },
    },
  },
  levelRewards: {
    name: "Level Rewards",
    emoji: "🎁",
    description:
      "Every time you level up, you gain level rewards! **Use `/levelrewards` to claim your level rewards.** \n## `/levelrewards`",
    requirementString: "Claim Level Rewards",
    proceedString:
      "Use `/levelrewards` to claim your level rewards! \n## `/levelrewards`",
    checkRequirements: async (trainer) =>
      trainer.claimedLevelRewards.length > 0,
    rewards: {
      money: 31000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/levelrewards.png",
  },
  locations: {
    name: "Purchasing Locations",
    emoji: "🌍",
    description:
      "You may purchase and upgrade locations from the `/pokemart` for permanent boosts! **Use `/pokemart` to purchase the 🏠 Home location and upgrade it to level 3.** The Home locations improves the EXP gained from `/train`!\n## `/pokemart`",
    requirementString: "Have a level 3 🏠 Home location",
    proceedString:
      "Use `/pokemart` to purchase the Home location and upgrade it to level 3! \n## `/pokemart`",
    checkRequirements: async (trainer) =>
      (trainer.locations?.[locations.HOME] ?? 0) >= 3,
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/home.png",
    tip: "You can use /locations to view your locations",
  },
  beginnerLeveling: {
    name: "Beginner Pokemon Leveling",
    emoji: "📈",
    description:
      "Now that you can `/train` your Pokemon faster, **train 6 Pokemon to level 15.**\n\nTip: On desktop, you can use the Up Arrow key to use your last command.",
    requirementString: "Train 6x Pokemon to level 15",
    proceedString:
      "Use `/train` to train 6 Pokemon to level 15! \n## `/train <id>`",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 6,
        page: 1,
        filter: {
          level: { $gte: 15 },
        },
      });
      return (pokemons?.length ?? 0) >= 6;
    },
    rewards: {
      money: 5000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/train.png",
  },
  winEasyDifficulty: {
    name: "Win Easy Difficulty",
    emoji: "🏆",
    description:
      "Now that you have trained your Pokemon, **use `/pve` to win a battle on Easy difficulty.**\n\nFrom now on, **Battling is the most efficient way to gain EXP.**",
    requirementString: "Win any battle on Easy difficulty",
    proceedString: "Use `/pve` to win a battle on Easy difficulty!",
    checkRequirements: async (trainer) => {
      for (const defeatedDifficulties of Object.values(trainer.defeatedNPCs)) {
        if (defeatedDifficulties.includes(difficulties.EASY)) {
          return true;
        }
      }
      return false;
    },
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.ULTRABALL]: 10,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pve.gif",
  },
  events: {
    name: "Events",
    emoji: "🎉",
    description:
      "Pokestar has events which provide **limited-time rewards, benefits, and custom Pokemon!** Use `/events` to view ongoing events. \n## `/events`",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/events` to view ongoing events, and complete the previous stage. \n## `/events`",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.winEasyDifficulty,
    rewards: {
      money: 1000,
    },
    image: gameEventConfig[0]?.image,
  },
  voting: {
    name: "(Optional) Voting",
    emoji: "🗳️",
    description:
      "Voting for Pokestar helps the bot grow! **Vote for Pokestar on top.gg [here](https://top.gg/bot/1093411444877439066/vote)**. Then, use `/vote` to claim your rewards.\n\n" +
      `Voting gives you many rewards, and voting consistently gives you a streak. With a max streak, **you can get up to 15x ${emojis.POKEBALL} Pokeballs every 12 hours!**`,
    requirementString: "Complete the previous stage",
    proceedString:
      "(Optional) Vote for Pokestar on top.gg, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.events,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/tutorial/vote.png",
  },
  userSettings: {
    name: "Settings",
    emoji: "⚙️",
    description:
      "You can view and change your settings using `/settings`. **Use `/settings` to view and change your settings.**\n\nIf you're getting the hang of battles, you can speed them up by disabling target indicators. You can also set your device type to mobile for mobile optimizations. \n## `/settings`",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/settings` to view and change your settings, and complete the previous stage. \n## `/settings`",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.events,
    rewards: {
      money: 1000,
    },
  },
  intermediateLeveling: {
    name: "Intermediate Pokemon Leveling",
    emoji: "📈",
    description:
      "Now that you can win battles, use `/pve` to **train 6 Pokemon to level 30.**",
    requirementString: "Train 6x Pokemon to level 30",
    proceedString: "Use `/pve` and `/train` to train 6 Pokemon to level 30!",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 6,
        page: 1,
        filter: {
          level: { $gte: 30 },
        },
      });
      return (pokemons?.length ?? 0) >= 6;
    },
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.GREATBALL]: 10,
        },
      },
    },
    tip: "Battling will give you more EXP than training",
  },
  evolvePokemon: {
    name: "Evolving Pokemon",
    emoji: "🧬",
    description:
      "Some Pokemon can evolve at the right level! Use `/pokedex` and click the growth tab to know when a Pokemon evolves, then **use `/evolve` to evolve a Pokemon.** \n## `/pokedex <name>` `/evolve <name>`",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/evolve` to evolve a Pokemon, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.intermediateLeveling,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/evolve.png",
  },
  winMediumDifficulty: {
    name: "Win Medium Difficulty",
    emoji: "🏆",
    description:
      "Now that you have evolved your Pokemon, **use `/pve` to win a battle on Medium difficulty.** \n## `/pve`",
    requirementString: "Win any battle on Medium difficulty",
    proceedString:
      "Use `/pve` to win a battle on Medium difficulty! \n## `/pve`",
    checkRequirements: async (trainer) => {
      for (const defeatedDifficulties of Object.values(trainer.defeatedNPCs)) {
        if (defeatedDifficulties.includes(difficulties.MEDIUM)) {
          return true;
        }
      }
      return false;
    },
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 50,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pve.gif",
  },
  catchMorePokemon: {
    name: "Catching More Pokemon",
    emoji: emojis.ULTRABALL,
    description:
      "You should keep using the `/gacha` to catch strong Pokemon. **Catch 50 Pokemon.** \n## `/gacha`",
    requirementString: "Catch 50x Pokemon",
    proceedString: "Use `/gacha` to catch 50 Pokemon! \n## `/gacha`",
    checkRequirements: async (trainer) =>
      await checkNumPokemon(trainer)
        .then((res) => (res.numPokemon ?? 0) >= 50)
        .catch(() => false),
    rewards: {
      money: 5000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 5,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/gacha.gif",
  },
  catchDarkrai: {
    name: "Catching Darkrai",
    emoji: "<:491:1351027502801354822>",
    description:
      "Darkrai is a Mythical Pokemon that can be caught after **completing 25 tutorial stages.** Use **`/mythic darkrai`** to catch Darkrai! \n## `/mythic darkrai`",
    requirementString: "Complete 25x tutorial stages and catch Darkrai",
    proceedString:
      "Use `/mythic darkrai` to catch Darkrai! \n## `/mythic darkrai`",
    checkRequirements: async (trainer) => trainer.hasDarkrai,
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.MASTERBALL]: 3,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/491.png",
  },
  autoBattle: {
    name: "Auto Battle",
    emoji: emojis.DREAM_CARD,
    description: `Darkrai allows you to **auto-battle** in most PvE content! Auto-battling consumes ${emojis.DREAM_CARD} Dream Cards, which recharges once every 5 minutes.\n\nUse \`/pve\` to start a battle, then **press the Auto button** to start an auto-battle.`,
    requirementString:
      "Complete one auto-battle (have fewer Dream Cards than maximum)",
    proceedString:
      "Use `/pve` to start a battle, then **press the Auto button** to start an auto-battle. **You must have Darkrai to auto-battle** (check previous tutorial stage).",
    checkRequirements: async (trainer) =>
      trainer.hasDarkrai && trainer.dreamCards < getMaxDreamCards(trainer),
    rewards: {
      money: 10000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/tutorial/auto-battle.png",
    tip: "You can increase your Dream Card limit by leveling up your trainer",
  },
  advancedLeveling: {
    name: "Advanced Pokemon Leveling",
    emoji: "📈",
    description:
      "Now that you have caught more Pokemon, **train 6 Pokemon to level 50.**\n\n**More difficult trainers provide more EXP!**",
    requirementString: "Train 6x Pokemon to level 50",
    proceedString: "Use `/pve` and `/train` to train 6 Pokemon to level 50!",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 6,
        page: 1,
        filter: {
          level: { $gte: 50 },
        },
      });
      return (pokemons?.length ?? 0) >= 6;
    },
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.GREATBALL]: 10,
        },
      },
    },
    tip: "Battling will give you more EXP than training. Use auto battle to save time!",
  },
  winHardDifficulty: {
    name: "Win Hard Difficulty",
    emoji: "🏆",
    description:
      "Now that you have trained your Pokemon, **use `/pve` to win a battle on Hard difficulty.**",
    requirementString: "Win any battle on Hard difficulty",
    proceedString: "Use `/pve` to win a battle on Hard difficulty!",
    checkRequirements: async (trainer) => {
      for (const defeatedDifficulties of Object.values(trainer.defeatedNPCs)) {
        if (defeatedDifficulties.includes(difficulties.HARD)) {
          return true;
        }
      }
      return false;
    },
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.ULTRABALL]: 10,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pve.gif",
  },
  battleTower: {
    name: "Battle Tower",
    emoji: "🏢",
    description:
      "The Battle Tower is a challenging mid-to-end-game location that provides many rewards. **Use `/battletower` to view and defeat at least one level of the Battle Tower.**\n\nThe Battle Tower's rewards **reset every other week!** Make sure to come back for tons of Pokeballs and items!",
    requirementString: "Defeat 1x Battle Tower Level",
    proceedString:
      "Use `/battletower` to view and defeat a Battle Tower level!",
    checkRequirements: async (trainer) => (trainer.lastTowerStage ?? 0) > 0,
    rewards: {
      money: 5000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 25,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/battletower.png",
  },
  eliteLeveling: {
    name: "Elite Pokemon Leveling",
    emoji: "📈",
    description:
      "Now that you have taken on the Battle Tower, **train 6 Pokemon to level 75.**",
    requirementString: "Train 6x Pokemon to level 75",
    proceedString: "Use `/pve` and `/train` to train 6 Pokemon to level 75!",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 6,
        page: 1,
        filter: {
          level: { $gte: 75 },
        },
      });
      return (pokemons?.length ?? 0) >= 6;
    },
    rewards: {
      money: 5000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.GREATBALL]: 10,
        },
      },
    },
  },
  winVeryHardDifficulty: {
    name: "Win Very Hard Difficulty",
    emoji: "🏆",
    description:
      "Now that you have trained your Pokemon to be very strong, **use `/pve` to win a battle on Very Hard difficulty.**",
    requirementString: "Win any battle on Very Hard difficulty",
    proceedString: "Use `/pve` to win a battle on Very Hard difficulty!",
    checkRequirements: async (trainer) => {
      for (const defeatedDifficulties of Object.values(trainer.defeatedNPCs)) {
        if (defeatedDifficulties.includes(difficulties.VERY_HARD)) {
          return true;
        }
      }
      return false;
    },
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.ULTRABALL]: 10,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pve.gif",
  },
  pvp: {
    name: "(Optional) PvP Battles",
    emoji: "⚔️",
    description:
      "You're getting pretty strong now; maybe it's time to take on another trainer! PvP battles are battles against other players; **you can use `/pvp` to battle another player.**",
    requirementString: "Complete the previous stage",
    proceedString:
      "(Optional) Use `/pvp` to battle another player, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.eliteLeveling,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pvp.png",
  },
  leaderboards: {
    name: "Leaderboards",
    emoji: "📊",
    description:
      "You're starting to become an elite trainer! **Use `/leaderboards` to view the leaderboards.** Are you on top?",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/leaderboards` to view the leaderboards, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.winVeryHardDifficulty,
    rewards: {
      money: 1000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/leaderboard.png",
  },
  maximumLeveling: {
    name: "Maximum Pokemon Leveling",
    emoji: "📈",
    description:
      "Now that you have won many battles, **train 6 Pokemon to level 100.** The maximum level for Pokemon from training is 100.\n\nRemember, **more difficult trainers provide more EXP!**",
    requirementString: "Train 6x Pokemon to level 100",
    proceedString: "Use `/pve` and `/train` to train 6 Pokemon to level 100!",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 6,
        page: 1,
        filter: {
          level: { $gte: 100 },
        },
      });
      return (pokemons?.length ?? 0) >= 6;
    },
    rewards: {
      money: 31000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.MASTERBALL]: 3,
        },
      },
    },
  },
  evTrainingLocation: {
    name: "EV Training: Locations",
    emoji: "🎓",
    description:
      "You can train your Pokemon's EVs at the EV Training locations. **Use `/pokemart` to purchase the Track location and upgrade it to level 3.** The Track location trains Speed EVs.",
    requirementString: "Have a level 3 Track location",
    proceedString:
      "Use `/pokemart` to purchase the Track location and upgrade it to level 3!",
    checkRequirements: async (trainer) =>
      (trainer.locations?.[locations.TRACK] ?? 0) >= 3,
    rewards: {
      money: 5000,
    },
  },
  evTraining: {
    name: "EV Training: Training",
    emoji: "🎓",
    description:
      "Now that you have the Track location, **use `/train pokemonid: {pokemon id} location: track` to train a Pokemon's Speed EVs.**\n\nPokemon can have a maximum of 510 total EVs, and 252 EVs in one stat. **Use `/info` to view a Pokemon's EVs.**",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/train pokemonid: {pokemon id} location: track` to train a Pokemon's Speed EVs to 252.",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 1,
        page: 1,
        filter: {
          "evs.5": { $gte: 252 },
        },
      });
      return (pokemons?.length ?? 0) > 0;
    },
    rewards: {
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.POKEBALL]: 10,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/ev-train.png",
  },
  dungeons: {
    name: "Dungeons: Beat New Island",
    emoji: "🏝️",
    description:
      "Dungeons are end-game content that provide materials to further train your Pokemon. Beating the New Island dungeon for the first time provides the **Mythical Mew. Use `/dungeons` to view and defeat New Island.**",
    requirementString: "Defeat New Island Dungeon",
    proceedString: "Use `/dungeons` to view and defeat New Island Dungeon!",
    checkRequirements: async (trainer) =>
      (trainer.defeatedNPCs.newIsland?.length ?? 0) > 0,
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.MASTERBALL]: 5,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/dungeon.gif",
  },
  catchMew: {
    name: "Catching Mythical Mew",
    emoji: emojis.MEW,
    description:
      "Now that you have defeated New Island, you can catch the Mythical Mew! **Use `/mythic mew` to catch the Mythical Mew.**\n\nMew is a powerful Pokemon who can learn many different moves!",
    requirementString: "Catch Mew",
    proceedString: "Use `/mythic mew` to catch the Mythical Mew!",
    checkRequirements: async (trainer) => {
      const { data: pokemons } = await listPokemons(trainer, {
        pageSize: 1,
        page: 1,
        filter: {
          speciesId: pokemonIdEnum.MEW,
        },
      });
      return (pokemons?.length ?? 0) > 0;
    },
    rewards: {
      money: 10000,
      backpack: {
        [backpackCategories.POKEBALLS]: {
          [backpackItems.MASTERBALL]: 5,
        },
      },
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/tutorial/mew.png",
  },
  // terminal stage to prevent overflow
  completed: {
    name: "Tutorial Complete!",
    emoji: emojis.MASTERBALL,
    description: `Congratulations! You have completed the tutorial! You are now ready to explore the world of Pokestar! **For more information, please [join the support server](${SUPPORT_SERVER_INVITE}) or use \`/help\` for help with commands!**`,
    requirementString: "Prove P = NP",
    proceedString: `This is the end of the tutorial! Please join the support server for the newest updates, guides, and events! ${SUPPORT_SERVER_INVITE}`,
    checkRequirements: async () => false,
    rewards: {
      money: 286,
    },
    image:
      "https://dbl-static.usercontent.prism.gg/02f7065e82d8c66e66299b74eda565b6.png",
  },
};

/** @type {Record<TutorialStageEnum, TutorialStageData>} */
const newTutorialConfig = Object.freeze(newTutorialConfigRaw);
const newTutorialStages = /** @type {TutorialStageEnum[]} */ (
  Object.keys(newTutorialConfig)
);

/**
 * @typedef {Enum<typeof questTypeEnum>} QuestTypeEnum
 */
const questTypeEnum = Object.freeze({
  DAILY: "daily",
  ACHIEVEMENT: "achievement",
  EVENT: "event",
});

/**
 * @typedef {Enum<typeof questRequirementTypeEnum>} QuestRequirementTypeEnum
 */
const questRequirementTypeEnum = Object.freeze({
  NUMERIC: "numeric",
  BOOLEAN: "boolean",
});

/**
 * @typedef {Enum<typeof questProgressionTypeEnum>} QuestProgressionTypeEnum
 */
const questProgressionTypeEnum = Object.freeze({
  INFINITE: "infinite",
  FINITE: "finite",
});

/**
 * @template {any} T
 * @template {any} U
 * @typedef {(args: {stage: number} & T) => U} GenericQuestFunction
 */

/**
 * @typedef {{ progress: number }} QuestEventListenerCallbackReturnValue
 */

/**
 * @template {TrainerEventEnum} T
 * @typedef {(args: TrainerEventArgs<T>) => Promise<QuestEventListenerCallbackReturnValue> | QuestEventListenerCallbackReturnValue} QuestEventListenerCallback
 */
/**
 * @template T
 * @typedef {T extends TrainerEventEnum ? { eventName: T, listenerCallback: QuestEventListenerCallback<T> } : never} QuestEventListenerFunctionEntryGeneric
 */
/**
 * @typedef {QuestEventListenerFunctionEntryGeneric<TrainerEventEnum>} QuestEventListenerFunctionEntry
 */

/**
 * @typedef {{
 *  formatName: GenericQuestFunction<{}, string>,
 *  formatEmoji: GenericQuestFunction<{}, string>,
 *  formatDescription: GenericQuestFunction<{progressRequirement: number}, string>,
 *  formatRequirementString: GenericQuestFunction<{progressRequirement: number}, string>,
 *  computeRewards: GenericQuestFunction<{}, FlattenedRewards>,
 *  questListeners: QuestEventListenerFunctionEntry[],
 *  image?: string,
 * }} QuestConfigBase
 */

/**
 * @typedef {{
 *  requirementType: typeof questRequirementTypeEnum.NUMERIC,
 *  computeProgressRequirement: GenericQuestFunction<{}, number>,
 *  resetProgressOnComplete: boolean,
 * }} QuestConfigNumeric
 */
/**
 * @typedef {{
 *  requirementType: typeof questRequirementTypeEnum.BOOLEAN,
 *  checkRequirements: GenericQuestFunction<{trainer: WithId<Trainer>}, Promise<boolean>>,
 * }} QuestConfigBoolean
 */

/**
 * @typedef {{
 *  progressionType: typeof questProgressionTypeEnum.INFINITE,
 * }} QuestConfigInfinite
 */
/**
 * @typedef {{
 *  progressionType: typeof questProgressionTypeEnum.FINITE,
 *  maxStage: number,
 * }} QuestConfigFinite
 */
/**
 * @typedef {{
 *  progressionType: typeof questProgressionTypeEnum.FINITE,
 *  maxStage: 1,
 * }} QuestConfigSingle
 */

/**
 * @typedef {QuestConfigBase & QuestConfigNumeric & QuestConfigSingle} DailyQuestConfig
 * @typedef {QuestConfigBase & (QuestConfigNumeric | QuestConfigBoolean) & (QuestConfigInfinite | QuestConfigFinite)} AchievementConfig
 * @typedef {DailyQuestConfig | AchievementConfig} QuestConfig
 */

/**
 * @typedef {Keys<dailyQuestConfigRaw>} DailyQuestEnum
 */
/** @satisfies {Record<string, DailyQuestConfig>} */
const dailyQuestConfigRaw = {
  gachaPokemon: {
    formatName: () => "Gacha for Pokemon",
    formatEmoji: () => emojis.POKEBALL,
    formatDescription: () => "Gacha for Pokemon",
    formatRequirementString: () => "Gacha for Pokemon",
    computeRewards: () => ({
      money: 1000,
    }),
    questListeners: [],
    requirementType: questRequirementTypeEnum.NUMERIC,
    computeProgressRequirement: () => 1,
    resetProgressOnComplete: true,
    progressionType: questProgressionTypeEnum.FINITE,
    maxStage: 1,
  },
  // placeholders
  gachaPokemon2: {
    formatName: () => "Gacha for Pokemon",
    formatEmoji: () => emojis.POKEBALL,
    formatDescription: () => "Gacha for Pokemon",
    formatRequirementString: () => "Gacha for Pokemon",
    computeRewards: () => ({
      money: 1000,
    }),
    questListeners: [],
    requirementType: questRequirementTypeEnum.NUMERIC,
    computeProgressRequirement: () => 1,
    resetProgressOnComplete: true,
    progressionType: questProgressionTypeEnum.FINITE,
    maxStage: 1,
  },
  gachaPokemon3: {
    formatName: () => "Gacha for Pokemon",
    formatEmoji: () => emojis.POKEBALL,
    formatDescription: () => "Gacha for Pokemon",
    formatRequirementString: () => "Gacha for Pokemon",
    computeRewards: () => ({
      money: 1000,
    }),
    questListeners: [],
    requirementType: questRequirementTypeEnum.NUMERIC,
    computeProgressRequirement: () => 1,
    resetProgressOnComplete: true,
    progressionType: questProgressionTypeEnum.FINITE,
    maxStage: 1,
  },
  gachaPokemon4: {
    formatName: () => "Gacha for Pokemon",
    formatEmoji: () => emojis.POKEBALL,
    formatDescription: () => "Gacha for Pokemon",
    formatRequirementString: () => "Gacha for Pokemon",
    computeRewards: () => ({
      money: 1000,
    }),
    questListeners: [],
    requirementType: questRequirementTypeEnum.NUMERIC,
    computeProgressRequirement: () => 1,
    resetProgressOnComplete: true,
    progressionType: questProgressionTypeEnum.FINITE,
    maxStage: 1,
  },
  gachaPokemon5: {
    formatName: () => "Gacha for Pokemon",
    formatEmoji: () => emojis.POKEBALL,
    formatDescription: () => "Gacha for Pokemon",
    formatRequirementString: () => "Gacha for Pokemon",
    computeRewards: () => ({
      money: 1000,
    }),
    questListeners: [],
    requirementType: questRequirementTypeEnum.NUMERIC,
    computeProgressRequirement: () => 1,
    resetProgressOnComplete: true,
    progressionType: questProgressionTypeEnum.FINITE,
    maxStage: 1,
  },
};
/** @type {Record<DailyQuestEnum, DailyQuestConfig>} */
const dailyQuestConfig = Object.freeze(dailyQuestConfigRaw);

/**
 * @typedef {Keys<achievementConfigRaw>} AchievementEnum
 */
/** @satisfies {Record<string, AchievementConfig>} */
const achievementConfigRaw = {
  gachaPokemon: {
    formatName: () => "Gacha for Pokemon",
    formatEmoji: () => emojis.POKEBALL,
    formatDescription: () => "Gacha for Pokemon",
    formatRequirementString: () => "Gacha for Pokemon",
    computeRewards: ({ stage }) => ({
      money: 1000 * (stage + 1),
    }),
    questListeners: [],
    requirementType: questRequirementTypeEnum.NUMERIC,
    computeProgressRequirement: ({ stage }) => stage,
    resetProgressOnComplete: false,
    progressionType: questProgressionTypeEnum.INFINITE,
  },
};
/** @type {Record<AchievementEnum, AchievementConfig>} */
const achievementConfig = Object.freeze(achievementConfigRaw);

const achievementEnum = /** @type {AchievementEnum[]} */ (
  Object.freeze(Object.keys(achievementConfigRaw))
);

module.exports = {
  newTutorialConfig,
  newTutorialStages,
  questTypeEnum,
  questRequirementTypeEnum,
  questProgressionTypeEnum,
  dailyQuestConfig,
  achievementConfig,
  achievementEnum,
};
