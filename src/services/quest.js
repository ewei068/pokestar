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
const { updateTrainer, getTrainer, refreshTrainer } = require("./trainer");

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
 * @param {QuestConfig} questConfigData
 * @param {DailyQuestData | AchievementData} questDataEntry
 */
const getCurrentQuestStageForDisplay = (questConfigData, questDataEntry) => {
  if (questConfigData.progressionType === questProgressionTypeEnum.FINITE) {
    return Math.min(questDataEntry.stage, questConfigData.maxStage);
  }

  return questDataEntry.stage;
};

/**
 * @param {QuestConfig} questConfigData
 * @param {DailyQuestData | AchievementData} questDataEntry
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
 * @param {QuestConfig} questConfigData
 * @param {DailyQuestData | AchievementData} questDataEntry
 */
const shouldEmitQuestEvent = (questConfigData, questDataEntry) => {
  const progressRequirement = computeQuestProgressRequirement(
    questConfigData,
    questDataEntry
  );

  const hasMetRequirement = questDataEntry.progress >= progressRequirement;
  const doesProgressReset =
    questConfigData.requirementType === questRequirementTypeEnum.NUMERIC &&
    questConfigData.resetProgressOnComplete;
  const hasPassedMaxStage =
    questConfigData.progressionType === questProgressionTypeEnum.FINITE &&
    questDataEntry.stage > questConfigData.maxStage;

  if (doesProgressReset && (hasPassedMaxStage || hasMetRequirement)) {
    return false;
  }

  return true;
};

/**
 * @param {QuestEnum} questName
 * @param {QuestTypeEnum} questType
 * @returns {QuestConfig}
 */
const getQuestConfigData = (questName, questType) => {
  if (questType === questTypeEnum.DAILY) {
    return dailyQuestConfig[questName];
    // eslint-disable-next-line no-else-return
  } else if (questType === questTypeEnum.ACHIEVEMENT) {
    return achievementConfig[questName];
  }

  throw new Error("Invalid quest type");
};

/**
 * @param {Trainer} trainer
 * @param {QuestEnum} questName
 * @param {QuestTypeEnum} questType
 */
const getAndSetQuestData = (trainer, questName, questType) => {
  let questDataEntry;
  if (questType === questTypeEnum.DAILY) {
    questDataEntry = trainer.questData.dailyQuests[questName];
    if (!questDataEntry) {
      trainer.questData.dailyQuests[questName] = {
        stage: 0,
        progress: 0,
      };
    }
    questDataEntry = trainer.questData.dailyQuests[questName];
  } else if (questType === questTypeEnum.ACHIEVEMENT) {
    questDataEntry = trainer.questData.achievements[questName];
    if (!questDataEntry) {
      trainer.questData.achievements[questName] = {
        stage: 0,
        progress: 0,
      };
    }
    questDataEntry = trainer.questData.achievements[questName];
  }

  return questDataEntry;
};

/**
 * @param {QuestEnum} questName
 * @param {QuestTypeEnum} questType
 */
const registerQuestListeners = (questName, questType) => {
  const questConfig = getQuestConfigData(questName, questType);
  for (const { eventName, listenerCallback } of questConfig.questListeners) {
    registerTrainerEventListener(eventName, async (args) => {
      const { trainer } = args;
      const questData = getAndSetQuestData(trainer, questName, questType);
      if (!shouldEmitQuestEvent(questConfig, questData)) {
        return;
      }

      // @ts-ignore
      const { progress } = await listenerCallback(args);
      if (progress) {
        questData.progress += progress;

        // TODO: if completed, upsell
      }
    });
  }
};

/**
 * @returns {DailyQuestEnum[]}
 */
const getDailyQuests = () => {
  const date = getFullUTCDate();
  const rng = seedrandom(date);
  // TODO: always add "complete daily quest" quest to list

  // @ts-ignore
  return drawIterable(Object.keys(dailyQuestConfig), 3, {
    replacement: false,
    rng,
  });
};

/**
 * @returns {AchievementEnum[]}
 */
// @ts-ignore
const getAchievements = () => Object.keys(achievementConfig);

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
};
