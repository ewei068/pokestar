// smell -- this config depends on some services to work properly
// maybe refactor at some point but I don't think it's a big deal because this is an isolated functionality
const { emojis } = require("../enums/emojis");
const { checkNumPokemon } = require("../services/pokemon");
const { backpackCategories, backpackItems } = require("./backpackConfig");
const { SUPPORT_SERVER_INVITE } = require("./helpConfig");

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
