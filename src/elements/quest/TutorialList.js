const { createElement } = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const {
  newTutorialStages,
  newTutorialConfig,
} = require("../../config/questConfig");
const { buildTutorialListEmbed } = require("../../embeds/questEmbeds");
const TutorialStage = require("./TutorialStage");
const useTrainer = require("../../hooks/useTrainer");

const PAGE_SIZE = 10;

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @param {number=} param1.initialStagePage
 * @returns {Promise<any>}
 */
module.exports = async (ref, { user, initialStagePage }) => {
  // TODO: got to current tutorial stage
  const { trainer, setTrainer, err } = await useTrainer(user, ref);
  if (err) {
    return { err };
  }

  const {
    page,
    items: stages,
    currentItem: currentStage,
    setItem: setTutorialStage,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: newTutorialStages,
      pageSize: PAGE_SIZE,
      initialItem: /** @type {TutorialStageEnum} */ (
        initialStagePage && newTutorialStages[initialStagePage - 1]
          ? newTutorialStages[initialStagePage - 1]
          : trainer.tutorialData.currentTutorialStage
      ),
      selectionPlaceholder: "Select a tutorial stage",
      itemConfig: newTutorialConfig,
      showId: false,
      selectionCallbackOptions: { defer: true },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  if (currentStage) {
    return {
      elements: [
        createElement(TutorialStage, {
          currentStage,
          setTutorialStage,
          user,
          trainer,
          setTrainer,
        }),
      ],
    };
  }
  return {
    elements: [
      {
        content: "",
        embeds: [
          buildTutorialListEmbed({
            tutorialStages: stages,
            userTutorialData: trainer.tutorialData,
            page,
          }),
        ],
      },
    ],
    components: [scrollButtonsElement, selectMenuElement],
  };
};
