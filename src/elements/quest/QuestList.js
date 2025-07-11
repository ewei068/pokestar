const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { buildQuestListEmbed } = require("../../embeds/questEmbeds");
const { questTypeEnum } = require("../../config/questConfig");
const {
  getDailyQuests,
  getAchievements,
  formatQuestDisplayData,
  canTrainerClaimAllRewards,
  tryProgressAndUpdateBooleanQuests,
  claimAllQuestRewardsForUserAndUpdate,
} = require("../../services/quest");
const useTrainer = require("../../hooks/useTrainer");
const {
  useMemo,
  useState,
  useCallbackBinding,
  createElement,
  useAwaitedEffect,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const QuestStage = require("./QuestStage");
const { getInteractionInstance } = require("../../deact/interactions");
const { getFlattenedRewardsString } = require("../../utils/trainerUtils");
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
const QuestList = async (
  ref,
  { user, initialQuestType = questTypeEnum.DAILY, initialQuestId }
) => {
  const {
    trainer,
    err: trainerErr,
    refreshTrainer,
    setTrainer,
  } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }
  const [questType, setQuestType] = useState(initialQuestType, ref);

  const allQuestIds = useMemo(
    () =>
      questType === questTypeEnum.DAILY ? getDailyQuests() : getAchievements(),
    [questType],
    ref
  );
  const questConfigAndData = useMemo(
    () => formatQuestAndDataConfig(trainer, allQuestIds, questType),
    [trainer, allQuestIds, questType],
    ref
  );

  const {
    page,
    scrollButtonsElement,
    selectMenuElement,
    setPage,
    currentItem,
    setItem,
    items: questIds,
  } = usePaginationAndSelection(
    {
      allItems: allQuestIds,
      pageSize: 5,
      selectionPlaceholder: "Select a quest",
      showId: false,
      itemConfig: questConfigAndData,
      initialItem: initialQuestId,
    },
    ref
  );

  await useAwaitedEffect(
    async () => {
      const {
        didProgress,
        data: newTrainer,
        // @ts-ignore
        err,
      } = await tryProgressAndUpdateBooleanQuests(trainer, questIds, questType);
      if (didProgress && !err) {
        setTrainer(newTrainer);
      }
    },
    [trainer, questIds, questType],
    ref
  );

  const canClaimAllRewards = useMemo(
    () => canTrainerClaimAllRewards(trainer),
    [trainer],
    ref
  );

  const embed = buildQuestListEmbed({
    // @ts-ignore
    questDisplayDataMap: questConfigAndData,
    questIds,
    questType,
    page,
    canClaimAllRewards,
  });

  const changeQuestTypeKey = useCallbackBinding(
    (interaction, data) => {
      setQuestType(data.type);
      setPage(1);
    },
    ref,
    { defer: true }
  );

  const claimAllRewardsKey = useCallbackBinding(
    async (interaction) => {
      const interactionInstance = getInteractionInstance(interaction);
      const {
        err: claimErr,
        didProgress,
        data: newTrainer,
        rewards,
      } = await claimAllQuestRewardsForUserAndUpdate(user);
      if (claimErr) {
        return { err: claimErr };
      }
      if (didProgress && newTrainer) {
        setTrainer(newTrainer);
      }
      if (rewards) {
        await interactionInstance.reply({
          element: {
            content: getFlattenedRewardsString(rewards),
          },
        });
      }
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
      [
        scrollButtonsElement,
        createElement(Button, {
          emoji: "🎁",
          label: "Claim All Rewards",
          disabled: !canClaimAllRewards,
          callbackBindingKey: claimAllRewardsKey,
        }),
      ],
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

module.exports = QuestList;
