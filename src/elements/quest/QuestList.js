const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { buildQuestListEmbed } = require("../../embeds/questEmbeds");
const {
  questTypeEnum,
  dailyQuestConfig,
  achievementConfig,
} = require("../../config/questConfig");
const {
  getDailyQuests,
  getAchievements,
  getAndSetQuestData,
  computeQuestProgressRequirement,
  getCurrentQuestStageForDisplay,
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
 * @param {Record<QuestEnum, QuestConfig>} fullQuestConfig
 * @param {QuestTypeEnum} questType
 */
const formatQuestAndDataConfig = (
  trainer,
  questNames,
  fullQuestConfig,
  questType
) =>
  questNames.reduce((acc, questName) => {
    const questDataEntry = getAndSetQuestData(trainer, questName, questType);
    const { progress } = questDataEntry;
    const questConfigData = fullQuestConfig[questName];
    // @ts-ignore
    const stage = getCurrentQuestStageForDisplay(
      questConfigData,
      questDataEntry
    );
    return {
      ...acc,
      [questName]: {
        emoji: questConfigData.formatEmoji({ stage }),
        name: questConfigData.formatName({ stage }),
        progressRequirement: computeQuestProgressRequirement(
          questConfigData,
          questDataEntry
        ),
        rewards: questConfigData.computeRewards({ stage }),
        progress,
      },
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
    () =>
      formatQuestAndDataConfig(
        trainer,
        questIds,
        // @ts-ignore
        questType === questTypeEnum.DAILY
          ? dailyQuestConfig
          : achievementConfig,
        questType
      ),
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
