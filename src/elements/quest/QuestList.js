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
  const [selectedQuestName, setSelectedQuestName] = useState(null, ref);

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
  } = usePaginationAndSelection(
    {
      allItems: questIds,
      pageSize: 8,
      selectionPlaceholder: "Select a quest",
      showId: false,
      itemConfig: questConfigAndData,
    },
    ref
  );

  if (currentItem) {
    setSelectedQuestName(currentItem);
  }

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

  if (selectedQuestName) {
    return {
      elements: [
        createElement(QuestStage, {
          user,
          questName: selectedQuestName,
          questType,
          setQuestName: setSelectedQuestName,
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
