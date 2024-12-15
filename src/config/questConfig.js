// smell -- this config depends on some services to work properly
// maybe refactor at some point but I don't think it's a big deal because this is an isolated functionality
const { emojis } = require("../enums/emojis");
const { checkNumPokemon } = require("../services/pokemon");
const { backpackCategories, backpackItems } = require("./backpackConfig");
const { SUPPORT_SERVER_INVITE } = require("./helpConfig");
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
 * }} TutorialStageData
 */

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
      "The first thing to do is catch Pokemon! **To catch new Pokemon, use the `/gacha` command**. The gacha costs Pokeballs, with rare Pokeballs catching rarer Pokemon. I would recommend using 10 Pokeballs on the standard banner.",
    requirementString: "Catch 1x Pokemon",
    proceedString: "Use `/gacha` and catch a Pokemon!",
    checkRequirements: async (trainer) =>
      await checkNumPokemon(trainer)
        .then((res) => (res.numPokemon ?? 0) > 0)
        .catch(() => false),
    rewards: {
      money: 5000,
    },
    image:
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/gacha.gif",
  },
  buyPokeballs: {
    name: "Buying Pokeballs",
    emoji: emojis.POKEBALL,
    description:
      "One of the best ways to get more Pokeballs is to buy them from the Pokemart every day. Use `/pokemart` to buy Pokeballs, or use `/buy itemid: 0 quantity: 5` to buy the maximum amount.",
    requirementString: "Buy 5x Pokeballs",
    proceedString:
      "Use `/pokemart` or `/buy itemid: 0 quantity: 5` to buy 5 Pokeballs!",
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
  },
  dailyRewards: {
    name: "Daily Rewards",
    emoji: "📅",
    description:
      "You can get more money and Pokeballs for free every day! **Use `/daily` to claim your daily rewards.**",
    requirementString: "Claim Daily Rewards",
    proceedString: "Use `/daily` to claim your daily rewards!",
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
    description: "You can view your items and money by using `/backpack`.",
    requirementString: "Complete the previous stage",
    proceedString:
      "Use `/backpack` to view your backpack, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.dailyRewards,
    rewards: {
      money: 1000,
    },
    // TODO: image:
  },
  catchSixPokemon: {
    name: "Catch More Pokemon",
    emoji: emojis.GREATBALL,
    description:
      "Catch more Pokemon to build your team! **Use `/gacha` to catch 6 Pokemon**.",
    requirementString: "Catch 6x Pokemon",
    proceedString: "Use `/gacha` to catch 6 Pokemon!",
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
      "Build your party by adding 6 Pokemon to your party! **Use `/party auto` to add your 6 strongest Pokemon to your party**. You can also use `/party add` and `/party remove` to make finer adjustments to your party.",
    requirementString: "Add 6x Pokemon to Party",
    proceedString:
      "Use `/party auto` or `/party add` to add a Pokemon to your party!",
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
      "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/partyadd.png",
  },
  learnBattleTurns: {
    name: "Learning to Battle: Taking Turns",
    emoji: "➡️",
    description:
      "Before you battle, you must learn how they work! Battles in Pokestar are unique; all 6 Pokemon fight at a time!\n\n**Taking turns is based off combat readiness.** Pokemon with higher speed gain combat readiness faster.\n\nYou may view the combat readiness of a team by clicking the **NPC** or **Player** tabs.",
    requirementString: "Complete the previous stage",
    proceedString:
      "Read the description to learn about battles, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.buildParty,
    rewards: {
      money: 1000,
    },
    // TODO image:
  },
  learnBattleMoves: {
    name: "Learning to Battle: Using Moves",
    emoji: "🔥",
    description:
      "When its your turn, you can use a move! **Use the dropdown menu to select a move.**\n\nWhen selecting a move, a description will appear. This includes important move information such as its type, power, effect, and cooldown.",
    requirementString: "Complete the previous stage",
    proceedString:
      "Read the description to learn about battles, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.learnBattleTurns,
    rewards: {
      money: 1000,
    },
    // TODO image:
  },
  learnBattleTargets: {
    name: "Learning to Battle: Selecting Targets",
    emoji: "🎯",
    description:
      "When using a move, you must select a target! **Click on the Pokemon you want to target from the dropdown menu.** Most moves may only target certain Pokemon, which is indicated in the **Target:** section of the move description." +
      "\n\n**Some moves may affect an area of Pokemon.** When a target is selected, that area is indicated by a wider border. **When satisfied, click the confirm button to use the move.** This can be disabled in your `/settings`.",
    requirementString: "Complete the previous stage",
    proceedString:
      "Read the description to learn about battles, and complete the previous stage.",
    checkRequirements: async (trainer) =>
      trainer.tutorialData.completedTutorialStages.learnBattleMoves,
    rewards: {
      money: 1000,
    },
    // TODO image:
  },
  winNpcBattle: {
    name: "Battle an NPC!",
    emoji: "⚔️",
    description:
      "Now that you know how to battle, **use `/pve` to battle an NPC!** I'd recommend starting with the Bug Catcher on Very Easy difficulty.",
    requirementString: "Win any NPC Battle",
    proceedString: "Use `/pve` to battle an NPC!",
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

module.exports = {
  newTutorialConfig,
  newTutorialStages,
};
