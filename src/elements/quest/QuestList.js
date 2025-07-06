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
const QuestStage = require("./QuestStage");

/**
 * @param {Trainer} trainer
 * @param {QuestEnum[]} questNames
 * @param {QuestTypeEnum} questType
 */
const formatQuestAndDataConfig = (trainer, questNames, questType) =>
  questNames.reduce((acc, questId) => {
    const questDisplayData = formatQuestDisplayData(
      trainer,
      questId,
      questType
    );
    return {
      ...acc,
      [questId]: questDisplayData,
    };
  }, {});

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {QuestTypeEnum=} param1.initialQuestType
 * @param {QuestEnum=} param1.initialQuestId
 * @returns {Promise<any>}
 */
module.exports = async (
  ref,
  { user, initialQuestType = questTypeEnum.DAILY, initialQuestId }
) => {
  const {
    trainer,
    err: trainerErr,
    refreshTrainer,
  } = await useTrainer(user, ref);
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
    scrollButtonsElement,
    selectMenuElement,
    setPage,
    currentItem,
    setItem,
  } = usePaginationAndSelection(
    {
      allItems: questIds,
      pageSize: 8,
      selectionPlaceholder: "Select a quest",
      showId: false,
      itemConfig: questConfigAndData,
      initialItem: initialQuestId,
    },
    ref
  );

  // TODO: check for complete quests

  const embed = buildQuestListEmbed({
    // @ts-ignore
    questDisplayDataMap: questConfigAndData,
    questType,
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

  const backButtonKey = useCallbackBinding(
    async () => {
      setItem(null);
      await refreshTrainer();
    },
    ref,
    { defer: true }
  );

  if (currentItem) {
    return {
      elements: [
        createElement(QuestStage, {
          user,
          questId: currentItem,
          questType,
          backButtonKey,
        }),
      ],
    };
  }

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
          emoji: "📅",
          label: "Daily Quests",
          data: { type: questTypeEnum.DAILY },
          disabled: questType === questTypeEnum.DAILY,
          callbackBindingKey: changeQuestTypeKey,
        }),
        createElement(Button, {
          emoji: "🏆",
          label: "Achievements",
          data: { type: questTypeEnum.ACHIEVEMENT },
          disabled: questType === questTypeEnum.ACHIEVEMENT,
          callbackBindingKey: changeQuestTypeKey,
        }),
      ],
    ],
  };
};
