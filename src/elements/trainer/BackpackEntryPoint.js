const { backpackCategories } = require("../../config/backpackConfig");
const { createElement } = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const { getDoesTrainerHaveAutoBattle } = require("../../services/battle");
const { getMaxDreamCards } = require("../../utils/trainerUtils");
const BackpackList = require("./BackpackList");

const stringToBackpackCateogryEnum = {
  pokeballs: backpackCategories.POKEBALLS,
  materials: backpackCategories.MATERIALS,
  consumables: backpackCategories.CONSUMABLES,
};

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @param {string=} param1.backpackCategoryInput
 */
const BackpackEntryPoint = async (ref, { user, backpackCategoryInput }) => {
  const { trainer, err } = await useTrainer(user, ref);
  if (err) {
    return { err };
  }

  const /** @type {BackpackCategoryEnum=} */ backpackCategory =
      stringToBackpackCateogryEnum[backpackCategoryInput];
  const { backpack, money } = trainer;
  return {
    elements: [
      createElement(BackpackList, {
        backpackCategory,
        backpack,
        money,
        dreamCards: trainer.dreamCards,
        maxDreamCards: getMaxDreamCards(trainer),
        shouldShowDreamCards: !getDoesTrainerHaveAutoBattle(trainer).err,
      }),
    ],
  };
};

module.exports = BackpackEntryPoint;
