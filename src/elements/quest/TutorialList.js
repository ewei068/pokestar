const {
  useAwaitedMemo,
  useState,
  createElement,
} = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const {
  newTutorialStages,
  newTutorialConfig,
} = require("../../config/questConfig");
const { buildTutorialListEmbed } = require("../../embeds/questEmbeds");
const { getTrainer } = require("../../services/trainer");
const TutorialStage = require("./TutorialStage");

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
  const { data: trainer, err } = await useAwaitedMemo(
    async () => getTrainer(user),
    [],
    ref
  );
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
      selectionCallbackOptions: { defer: false },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  const [userTutorialData, setUserTutorialData] = useState(
    trainer.tutorialData,
    ref
  );

  if (currentStage) {
    return {
      elements: [
        createElement(TutorialStage, {
          currentStage,
          setTutorialStage,
          userTutorialData,
          setUserTutorialData,
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
            userTutorialData,
            page,
          }),
        ],
      },
    ],
    components: [scrollButtonsElement, selectMenuElement],
  };
};
