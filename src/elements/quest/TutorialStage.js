const { useCallbackBinding, createElement } = require("../../deact/deact");
const ReturnButton = require("../foundation/ReturnButton");
const useSingleItemScroll = require("../../hooks/useSingleItemScroll");
const {
  newTutorialConfig,
  newTutorialStages,
} = require("../../config/questConfig");
const { buildTutorialStageEmbed } = require("../../embeds/questEmbeds");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {TutorialStageEnum} param1.currentStage
 * @param {(TutorialStageEnum) => any} param1.setTutorialStage
 * @param {UserTutorialData} param1.userTutorialData
 * @param {(UserTutorialData) => any} param1.setUserTutorialData
 */
module.exports = async (
  ref,
  { currentStage, setTutorialStage, userTutorialData, setUserTutorialData }
) => {
  const tutorialStageData = newTutorialConfig[currentStage];

  const { scrollButtonsElement, page } = useSingleItemScroll(
    {
      allItems: newTutorialStages,
      itemOverride: currentStage,
      setItemOverride: setTutorialStage,
      callbackOptions: { defer: false },
    },
    ref
  );
  const returnActionBindng = useCallbackBinding(
    () => {
      setTutorialStage?.(null);
    },
    ref,
    { defer: false }
  );

  return {
    elements: [
      {
        content: "",
        embeds: [
          buildTutorialStageEmbed({
            stage: currentStage,
            userTutorialData,
            page,
          }),
        ],
      },
    ],
    components: [
      scrollButtonsElement,
      createElement(ReturnButton, { callbackBindingKey: returnActionBindng }),
    ],
  };
};
