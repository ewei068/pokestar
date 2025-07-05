const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { buildQuestListEmbed } = require("../../embeds/questEmbeds");
const { questTypeEnum } = require("../../config/questConfig");
const {
  getDailyQuests,
  getAchievements,
  formatQuestDisplayData,
} = require("../../services/quest");
const useTrainer = require("../../hooks/useTrainer");
const {
  useMemo,
  useState,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

/**
 * @param {Trainer} trainer
 * @param {QuestEnum[]} questNames
 * @param {QuestTypeEnum} questType
 */
const formatQuestAndDataConfig = (trainer, questNames, questType) =>
  questNames.reduce((acc, questName) => {
    const questDisplayData = formatQuestDisplayData(
      trainer,
      questName,
      questType
    );
    return {
      ...acc,
      [questName]: questDisplayData,
    };
  }, {});

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {QuestTypeEnum=} param1.initialQuestType
 * @returns {Promise<any>}
 */
module.exports = async (
  ref,
  { user, initialQuestType = questTypeEnum.DAILY }
) => {
  const { trainer, err: trainerErr } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }
  const [questType, setQuestType] = useState(initialQuestType, ref);
  const questIds = useMemo(
    () =>
      questType === questTypeEnum.DAILY ? getDailyQuests() : getAchievements(),
    [questType],
    ref
  );
  const questConfigAndData = useMemo(
    () => formatQuestAndDataConfig(trainer, questIds, questType),
    [trainer, questIds, questType],
    ref
  );
  const {
    page,
    items: currentPageItems,
    scrollButtonsElement,
    selectMenuElement,
    setPage,
  } = usePaginationAndSelection(
    {
      allItems: questIds,
      pageSize: 10,
      selectionPlaceholder: "Select a quest",
      showId: false,
      itemConfig: questConfigAndData,
    },
    ref
  );

  const embed = buildQuestListEmbed({
    questIds: currentPageItems,
    questType,
    userQuestData: trainer.questData,
    page,
  });

  const changeQuestTypeKey = useCallbackBinding(
    (interaction, data) => {
      setQuestType(data.type);
      setPage(1);
    },
    ref,
    { defer: true }
  );

  return {
    elements: [
      {
        content: "",
        embeds: [embed],
      },
    ],
    components: [
      scrollButtonsElement,
      selectMenuElement,
      [
        createElement(Button, {
          label: "Daily Quests",
          data: { type: questTypeEnum.DAILY },
          disabled: questType === questTypeEnum.DAILY,
          callbackBindingKey: changeQuestTypeKey,
        }),
        createElement(Button, {
          label: "Achievements",
          data: { type: questTypeEnum.ACHIEVEMENT },
          disabled: questType === questTypeEnum.ACHIEVEMENT,
          callbackBindingKey: changeQuestTypeKey,
        }),
      ],
    ],
  };
};
