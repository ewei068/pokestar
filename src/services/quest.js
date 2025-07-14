/* eslint-disable no-param-reassign */
const seedrandom = require("seedrandom");
const {
  newTutorialConfig,
  newTutorialStages,
  dailyQuestConfig,
  questRequirementTypeEnum,
  questProgressionTypeEnum,
  questTypeEnum,
  achievementConfig,
} = require("../config/questConfig");
const { drawIterable } = require("../utils/gachaUtils");
const { addRewards } = require("../utils/trainerUtils");
const { getFullUTCDate } = require("../utils/utils");
const { registerTrainerEventListener } = require("./game/gameEvent");
const {
  updateTrainer,
  getTrainer,
  refreshTrainer,
  emitTrainerEvent,
} = require("./trainer");
const { logger } = require("../log");
const { getAsyncContext } = require("./bot/asyncContext");
const { trainerEventEnum } = require("../enums/gameEnums");

/**
 * @param {WithId<Trainer>} trainer
 * @param {TutorialStageEnum} stage
 * @returns {Promise<boolean>}
 */
const hasTrainerMetTutorialStageRequirements = async (trainer, stage) =>
  await newTutorialConfig[stage]?.checkRequirements?.(trainer);

const hasTrainerMetCurrentTutorialStageRequirements = async (trainer) =>
  await hasTrainerMetTutorialStageRequirements(
    trainer,
    trainer?.tutorialData?.currentTutorialStage
  );

/**
 * @param {DiscordUser} user
 */
const hasUserMetCurrentTutorialStageRequirements = async (user) => {
  const { data: trainer, err } = await getTrainer(user);
  if (err) {
    return false;
  }

  return await hasTrainerMetCurrentTutorialStageRequirements(trainer);
};

/**
 * Only use if trainer is up-to-date
 * @param {WithId<Trainer>} trainer
 * @param {TutorialStageEnum} stage
 * @returns {Promise<{ data?: WithId<Trainer>, err?: string }>}
 */
const completeTutorialStageForTrainer = async (trainer, stage) => {
  // check if trainer already has stage complete
  if (trainer.tutorialData.completedTutorialStages[stage]) {
    return { err: "You have already completed this stage!" };
  }

  // check if met stage requirements
  const hasMetRequirements = await hasTrainerMetTutorialStageRequirements(
    trainer,
    stage
  );
  if (!hasMetRequirements) {
    return { err: "You have not met the requirements!" };
  }

  // give rewards
  const { rewards } = newTutorialConfig[stage];
  addRewards(trainer, rewards);

  // set stage as complete. if current stage is the same as the completed stage, find next incomplete stage
  trainer.tutorialData.completedTutorialStages[stage] = true;
  if (
    trainer.tutorialData.currentTutorialStage === stage ||
    trainer.tutorialData.currentTutorialStage === "completed"
  ) {
    let stageIndex = newTutorialStages.indexOf(stage);
    while (
      stageIndex < newTutorialStages.length - 1 && // -1 to prevent overflow
      trainer.tutorialData.completedTutorialStages[
        newTutorialStages[stageIndex]
      ]
    ) {
      stageIndex += 1;
    }
    trainer.tutorialData.currentTutorialStage =
      newTutorialStages[stageIndex] ?? "completed";
  }

  // update trainer
  const { err: updateErr } = await updateTrainer(trainer);
  if (updateErr) {
    return { err: "Failed to claim rewards!" };
  }

  return refreshTrainer(trainer);
};

/**
 * @param {DiscordUser} user
 * @param {TutorialStageEnum} stage
 */
const completeTutorialStageForUser = async (user, stage) => {
  const { data: trainer, err } = await getTrainer(user);
  if (err) {
    return { err };
  }

  return await completeTutorialStageForTrainer(trainer, stage);
};

/**
 * @param {Trainer} trainer
 * @param {QuestEnum} questId
 * @param {QuestTypeEnum} questType
 */
const getAndSetQuestData = (trainer, questId, questType) => {
  let questDataEntry;
  if (questType === questTypeEnum.DAILY) {
    questDataEntry = trainer.questData.dailyQuests[questId];
    if (!questDataEntry) {
      trainer.questData.dailyQuests[questId] = {
        stage: 0,
        progress: 0,
      };
    }
    questDataEntry = trainer.questData.dailyQuests[questId];
  } else if (questType === questTypeEnum.ACHIEVEMENT) {
    questDataEntry = trainer.questData.achievements[questId];
    if (!questDataEntry) {
      trainer.questData.achievements[questId] = {
        stage: 0,
        progress: 0,
      };
    }
    questDataEntry = trainer.questData.achievements[questId];
  }

  return questDataEntry;
};

/**
 * @param {QuestEnum} questId
 * @param {QuestTypeEnum} questType
 * @returns {QuestConfig}
 */
const getQuestConfigData = (questId, questType) => {
  if (questType === questTypeEnum.DAILY) {
    return dailyQuestConfig[questId];
    // eslint-disable-next-line no-else-return
  } else if (questType === questTypeEnum.ACHIEVEMENT) {
    return achievementConfig[questId];
  }

  throw new Error("Invalid quest type");
};

/**
 * Gets the stage to compute display data for. Normally uses the stage the user is on, but if the
 * user has claimed all rewards, uses max stage instead.
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 */
const getCurrentQuestStageForDisplay = (questConfigData, questDataEntry) => {
  if (questConfigData.progressionType === questProgressionTypeEnum.FINITE) {
    return Math.min(questDataEntry.stage, questConfigData.maxStage);
  }

  return questDataEntry.stage;
};

/**
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 */
const computeQuestProgressRequirement = (questConfigData, questDataEntry) => {
  const progressRequirement =
    questConfigData.requirementType === questRequirementTypeEnum.BOOLEAN
      ? 1
      : questConfigData.computeProgressRequirement({
          stage: getCurrentQuestStageForDisplay(
            questConfigData,
            questDataEntry
          ),
        });

  return Math.max(1, progressRequirement);
};

/**
 * @typedef {"incomplete" | "complete" | "fullyComplete"} QuestCompletionStatus
 */

/**
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 * @returns {QuestCompletionStatus}
 */
const getQuestCompletionStatus = (questConfigData, questDataEntry) => {
  if (
    questConfigData.progressionType === questProgressionTypeEnum.FINITE &&
    questDataEntry.stage > questConfigData.maxStage
  ) {
    return "fullyComplete";
  }

  const progressRequirement = computeQuestProgressRequirement(
    questConfigData,
    questDataEntry
  );
  if (questDataEntry.progress >= progressRequirement) {
    return "complete";
  }
  return "incomplete";
};

/**
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 */
const computeQuestRewards = (questConfigData, questDataEntry) => {
  const stage = getCurrentQuestStageForDisplay(questConfigData, questDataEntry);
  return questConfigData.computeRewards({ stage });
};

/**
 * @param {QuestConfig} questConfigData
 * @returns {boolean}
 */
const doesQuestProgressReset = (questConfigData) =>
  questConfigData.requirementType === questRequirementTypeEnum.BOOLEAN ||
  ((questConfigData.requirementType === questRequirementTypeEnum.NUMERIC ||
    questConfigData.requirementType ===
      questRequirementTypeEnum.MILESTONE_NUMERIC) &&
    questConfigData.resetProgressOnComplete);

/**
 * @param {Trainer} trainer
 * @param {QuestEnum} questId
 * @param {QuestTypeEnum} questType
 */
const formatQuestDisplayData = (trainer, questId, questType) => {
  const questDataEntry = getAndSetQuestData(trainer, questId, questType);
  const { progress } = questDataEntry;
  const questConfigData = getQuestConfigData(questId, questType);
  // @ts-ignore
  const stage = getCurrentQuestStageForDisplay(questConfigData, questDataEntry);
  const progressRequirement = computeQuestProgressRequirement(
    questConfigData,
    questDataEntry
  );
  const completionStatus = getQuestCompletionStatus(
    questConfigData,
    questDataEntry
  );
  const emoji = questConfigData.formatEmoji({ stage });
  const doesProgressReset = doesQuestProgressReset(questConfigData);
  return {
    emoji:
      // eslint-disable-next-line no-nested-ternary
      completionStatus === "fullyComplete"
        ? "✅"
        : completionStatus === "complete"
        ? "🎁"
        : emoji,
    name: questConfigData.formatName({ stage }),
    progressRequirement,
    rewards: computeQuestRewards(questConfigData, questDataEntry),
    description: questConfigData.formatDescription({
      stage,
      progressRequirement,
    }),
    requirementString: questConfigData.formatRequirementString({
      stage,
      progressRequirement,
    }),
    // if user has fully claimed rewards, show that progress has been completed
    progress:
      completionStatus === "fullyComplete" && doesProgressReset
        ? progressRequirement
        : progress,
    completionStatus,
  };
};

/**
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 */
const shouldEmitQuestEvent = (questConfigData, questDataEntry) => {
  const progressRequirement = computeQuestProgressRequirement(
    questConfigData,
    questDataEntry
  );

  const hasMetRequirement = questDataEntry.progress >= progressRequirement;
  const doesProgressReset = doesQuestProgressReset(questConfigData);
  const hasPassedMaxStage =
    questConfigData.progressionType === questProgressionTypeEnum.FINITE &&
    questDataEntry.stage > questConfigData.maxStage;

  if (doesProgressReset && (hasPassedMaxStage || hasMetRequirement)) {
    return false;
  }

  return true;
};

/**
 * @returns {DailyQuestEnum[]}
 */
const getDailyQuests = () => {
  const date = getFullUTCDate();
  const rng = seedrandom(date);
  const possibleQuests = Object.keys(dailyQuestConfig).filter(
    (questId) => questId !== "completeDailyQuest"
  );

  // @ts-ignore
  const drawnQuests = drawIterable(possibleQuests, 4, {
    replacement: false,
    rng,
  });
  // @ts-ignore
  return [...drawnQuests, "completeDailyQuest"];
};

const canTrainerClaimQuestRewards = (trainer, questId, questType) => {
  const questConfigData = getQuestConfigData(questId, questType);
  const questDataEntry = getAndSetQuestData(trainer, questId, questType);
  if (
    questType === questTypeEnum.DAILY &&
    !getDailyQuests().includes(questId)
  ) {
    return false;
  }
  const completionStatus = getQuestCompletionStatus(
    questConfigData,
    questDataEntry
  );
  return completionStatus === "complete";
};

/**
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 * @param {number} amount
 */
const progressQuestByAmount = (questConfigData, questDataEntry, amount) => {
  questDataEntry.progress += Math.max(0, amount);
  if (doesQuestProgressReset(questConfigData)) {
    questDataEntry.progress = Math.min(
      questDataEntry.progress,
      computeQuestProgressRequirement(questConfigData, questDataEntry)
    );
  }
};

/**
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 * @param {number} progress
 */
const setQuestProgress = (questConfigData, questDataEntry, progress) => {
  if (progress <= questDataEntry.progress) {
    return;
  }
  questDataEntry.progress = progress;
  if (doesQuestProgressReset(questConfigData)) {
    questDataEntry.progress = Math.min(
      questDataEntry.progress,
      computeQuestProgressRequirement(questConfigData, questDataEntry)
    );
  }
};

/**
 * @param {WithId<Trainer>} trainer
 * @param {QuestConfig} questConfigData
 * @param {QuestDataEntry} questDataEntry
 * @returns {Promise<boolean>} true if quest was progressed (not necessarily completed), false otherwise
 */
const checkAndProgressQuest = async (
  trainer,
  questConfigData,
  questDataEntry
) => {
  const completionStatus = getQuestCompletionStatus(
    questConfigData,
    questDataEntry
  );
  if (completionStatus !== "incomplete") {
    return false;
  }
  if (questConfigData.requirementType === questRequirementTypeEnum.BOOLEAN) {
    const isComplete = await questConfigData.checkRequirements({
      stage: questDataEntry.stage,
      trainer,
    });
    if (isComplete) {
      progressQuestByAmount(questConfigData, questDataEntry, 1);
      return true;
    }
  } else if (
    questConfigData.requirementType ===
    questRequirementTypeEnum.MILESTONE_NUMERIC
  ) {
    const currentProgress = await questConfigData.computeCurrentProgress({
      stage: questDataEntry.stage,
      trainer,
    });
    if (currentProgress > questDataEntry.progress) {
      setQuestProgress(questConfigData, questDataEntry, currentProgress);
      return true;
    }
  }
  return false;
};

/**
 * @param {WithId<Trainer>} trainer
 * @param {QuestEnum[]} questIds
 * @param {QuestTypeEnum} questType
 */
const tryProgressAndUpdateBooleanQuests = async (
  trainer,
  questIds,
  questType
) => {
  const promises = questIds.map((questId) => {
    const questConfigData = getQuestConfigData(questId, questType);
    const questDataEntry = getAndSetQuestData(trainer, questId, questType);
    return checkAndProgressQuest(trainer, questConfigData, questDataEntry);
  });
  const results = await Promise.all(promises);
  const didProgress = results.some((result) => result);
  if (didProgress) {
    return {
      ...(await updateTrainer(trainer)),
      didProgress,
    };
  }
  return {
    data: trainer,
    didProgress,
  };
};

/**
 * @param {WithId<Trainer>} trainer
 * @param {QuestEnum} questId
 * @param {QuestTypeEnum} questType
 * @param {object} options
 * @param {FlattenedRewards=} options.accumulator
 */
const claimQuestRewardsForTrainer = async (
  trainer,
  questId,
  questType,
  { accumulator } = {}
) => {
  const canClaimRewards = canTrainerClaimQuestRewards(
    trainer,
    questId,
    questType
  );
  if (!canClaimRewards) {
    return { err: "You cannot claim rewards for this quest right now." };
  }

  const questConfigData = getQuestConfigData(questId, questType);
  const questDataEntry = getAndSetQuestData(trainer, questId, questType);
  const rewards = computeQuestRewards(questConfigData, questDataEntry);
  addRewards(trainer, rewards, accumulator);

  const doesProgressReset = doesQuestProgressReset(questConfigData);
  if (doesProgressReset) {
    questDataEntry.progress = 0;
  }
  questDataEntry.stage += 1;

  // if boolean requirement, check if next stage is complete so the user can immediately claim
  const completionStatus = getQuestCompletionStatus(
    questConfigData,
    questDataEntry
  );
  await checkAndProgressQuest(trainer, questConfigData, questDataEntry);

  return {
    data: trainer,
    completionStatus,
    rewards: accumulator,
    completedStage: questDataEntry.stage - 1,
  };
};

/**
 * @param {CompactUser} user
 * @param {QuestEnum} questId
 * @param {QuestTypeEnum} questType
 * @returns {Promise<{data?: WithId<Trainer>, err?: string, rewards?: FlattenedRewards}>}
 */
const claimQuestRewardsForUserAndUpdate = async (user, questId, questType) => {
  const { data: trainer, err: trainerErr } = await getTrainer(user);
  if (trainerErr) {
    return { err: trainerErr };
  }
  const rewardsAccumulator = {};
  const { err: claimErr, completedStage } = await claimQuestRewardsForTrainer(
    trainer,
    questId,
    questType,
    { accumulator: rewardsAccumulator }
  );
  if (claimErr) {
    return { err: claimErr };
  }

  const { data: updatedTrainer, err: updateErr } = await updateTrainer(trainer);
  if (updateErr) {
    return { err: updateErr };
  }

  const { data: eventRes } = await emitTrainerEvent(
    trainerEventEnum.COMPLETED_QUESTS,
    {
      quests: [{ questId, questType, stage: completedStage }],
      trainer: updatedTrainer,
    }
  );

  return {
    data: eventRes || updatedTrainer,
    rewards: rewardsAccumulator,
  };
};

/**
 * @returns {AchievementEnum[]}
 */
// @ts-ignore
const getAchievements = () => Object.keys(achievementConfig);

/**
 * @param {WithId<Trainer>} trainer
 * @param {QuestEnum} questId
 * @param {QuestTypeEnum} questType
 * @param {object} options
 * @param {FlattenedRewards=} options.accumulator
 * @param {number=} options.maxAttempts
 */
const tryCompleteAllQuestStagesForTrainer = async (
  trainer,
  questId,
  questType,
  { accumulator = {}, maxAttempts = 25 } = {}
) => {
  const questConfigData = getQuestConfigData(questId, questType);
  const questDataEntry = getAndSetQuestData(trainer, questId, questType);
  await checkAndProgressQuest(trainer, questConfigData, questDataEntry);

  let didProgress = false;
  const questsCompleted = [];
  for (let i = 0; i < maxAttempts; i += 1) {
    const { err: claimErr, completedStage } = await claimQuestRewardsForTrainer(
      trainer,
      questId,
      questType,
      { accumulator }
    );
    if (claimErr) {
      break;
    }
    didProgress = true;
    questsCompleted.push({ questId, questType, stage: completedStage });
  }

  return {
    data: trainer,
    didProgress,
    rewards: accumulator,
    questsCompleted,
  };
};

/**
 * @param {CompactUser} user
 * @returns {Promise<{data?: WithId<Trainer>, err?: string, rewards?: FlattenedRewards, didProgress?: boolean}>}
 */
const claimAllQuestRewardsForUserAndUpdate = async (user) => {
  const { data: trainer, err: trainerErr } = await getTrainer(user);
  if (trainerErr) {
    return { err: trainerErr };
  }
  const accumulator = {};
  const promises = [];
  const dailyQuestIds = getDailyQuests();
  const achievementQuestIds = getAchievements();
  const allQuestsCompleted = [];
  for (const questId of dailyQuestIds) {
    promises.push(
      tryCompleteAllQuestStagesForTrainer(
        trainer,
        questId,
        questTypeEnum.DAILY,
        { accumulator }
      )
    );
  }
  for (const questId of achievementQuestIds) {
    promises.push(
      tryCompleteAllQuestStagesForTrainer(
        trainer,
        questId,
        questTypeEnum.ACHIEVEMENT,
        { accumulator }
      )
    );
  }
  const results = await Promise.all(promises);
  const didProgress = results.some((result) => result.didProgress);
  for (const result of results) {
    if (result.questsCompleted) {
      allQuestsCompleted.push(...result.questsCompleted);
    }
  }

  if (!didProgress) {
    return {
      data: trainer,
      didProgress,
      rewards: null,
    };
  }

  const { data: eventUpdatedTrainer, err: eventErr } = await emitTrainerEvent(
    trainerEventEnum.COMPLETED_QUESTS,
    {
      quests: allQuestsCompleted,
      trainer,
    }
  );
  if (eventErr) {
    return { err: eventErr };
  }

  const { questsCompleted: dailyQuestsCompleted } =
    await tryCompleteAllQuestStagesForTrainer(
      eventUpdatedTrainer,
      "completeDailyQuest",
      questTypeEnum.DAILY,
      { accumulator }
    );

  const { data: updatedTrainer, err: updateErr } = await updateTrainer(
    eventUpdatedTrainer
  );
  if (updateErr) {
    return { err: updateErr };
  }

  if (dailyQuestsCompleted) {
    const { data: dailyEventUpdatedTrainer } = await emitTrainerEvent(
      trainerEventEnum.COMPLETED_QUESTS,
      {
        quests: dailyQuestsCompleted,
        trainer: updatedTrainer,
      }
    );

    return {
      data: dailyEventUpdatedTrainer || updatedTrainer,
      didProgress,
      rewards: accumulator,
    };
  }

  return {
    data: updatedTrainer,
    didProgress,
    rewards: accumulator,
  };
};

/**
 * @param {Trainer} trainer
 * @returns {boolean}
 */
const canTrainerClaimAllRewards = (trainer) => {
  const dailyQuestIds = getDailyQuests();
  const canClaimDailyQuestRewards = dailyQuestIds.some((questId) =>
    canTrainerClaimQuestRewards(trainer, questId, questTypeEnum.DAILY)
  );
  if (canClaimDailyQuestRewards) {
    return true;
  }

  const achievementQuestIds = getAchievements();
  const canClaimAchievementQuestRewards = achievementQuestIds.some((questId) =>
    canTrainerClaimQuestRewards(trainer, questId, questTypeEnum.ACHIEVEMENT)
  );
  return canClaimAchievementQuestRewards;
};

/**
 * @param {QuestEnum} questId
 * @param {QuestTypeEnum} questType
 */
const registerQuestListeners = (questId, questType) => {
  const questConfigData = getQuestConfigData(questId, questType);
  for (const {
    eventName,
    listenerCallback,
  } of questConfigData.questListeners) {
    registerTrainerEventListener(eventName, async (args) => {
      const { trainer } = args;
      const questDataEntry = getAndSetQuestData(trainer, questId, questType);
      if (
        questType === questTypeEnum.DAILY &&
        // @ts-ignore
        !getDailyQuests().includes(questId)
      ) {
        return;
      }
      if (!shouldEmitQuestEvent(questConfigData, questDataEntry)) {
        return;
      }
      const oldQuestCompletionStatus = getQuestCompletionStatus(
        questConfigData,
        questDataEntry
      );
      const stage = getCurrentQuestStageForDisplay(
        questConfigData,
        questDataEntry
      );

      // @ts-ignore
      const { progress, progressOverride } = await listenerCallback({
        ...args,
        // @ts-ignore
        stage,
      });
      if (!progress && !progressOverride) {
        return;
      }

      if (progressOverride) {
        setQuestProgress(questConfigData, questDataEntry, progressOverride);
      } else {
        progressQuestByAmount(questConfigData, questDataEntry, progress);
      }

      const newQuestCompletionStatus = getQuestCompletionStatus(
        questConfigData,
        questDataEntry
      );
      const asyncContext = getAsyncContext();
      if (
        oldQuestCompletionStatus !== "complete" &&
        newQuestCompletionStatus === "complete" &&
        !asyncContext.completedQuest &&
        asyncContext?.user?.id === trainer?.userId &&
        questId !== "completeDailyQuest"
      ) {
        asyncContext.completedQuest = {
          questId,
          questType,
        };
      }
    });
  }
};

const registerAllQuestListeners = () => {
  for (const questId of Object.keys(dailyQuestConfig)) {
    // @ts-ignore
    registerQuestListeners(questId, questTypeEnum.DAILY);
  }
  for (const questId of Object.keys(achievementConfig)) {
    // @ts-ignore
    registerQuestListeners(questId, questTypeEnum.ACHIEVEMENT);
  }

  logger.info("Registered all quest listeners");
};

module.exports = {
  hasTrainerMetTutorialStageRequirements,
  hasTrainerMetCurrentTutorialStageRequirements,
  hasUserMetCurrentTutorialStageRequirements,
  completeTutorialStageForTrainer,
  completeTutorialStageForUser,
  getAndSetQuestData,
  getDailyQuests,
  getAchievements,
  getCurrentQuestStageForDisplay,
  computeQuestProgressRequirement,
  formatQuestDisplayData,
  registerAllQuestListeners,
  getQuestConfigData,
  canTrainerClaimQuestRewards,
  claimQuestRewardsForUserAndUpdate,
  canTrainerClaimAllRewards,
  tryProgressAndUpdateBooleanQuests,
  claimAllQuestRewardsForUserAndUpdate,
};
