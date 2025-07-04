/* eslint-disable no-param-reassign */
const {
  newTutorialConfig,
  newTutorialStages,
  questRequirementTypeEnum,
  dailyQuestConfig,
} = require("../config/questConfig");
const { addRewards } = require("../utils/trainerUtils");
const { registerGameEventListener } = require("./game/gameEvent");
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
 * @param {Trainer} trainer
 * @param {DailyQuestEnum} dailyQuestName
 */
const getAndSetDailyQuestData = (trainer, dailyQuestName) => {
  const questData = trainer.questData.dailyQuests[dailyQuestName];
  if (!questData) {
    trainer.questData.dailyQuests[dailyQuestName] = {
      completed: false,
      progress: 0,
    };
  }
  return trainer.questData.dailyQuests[dailyQuestName];
};

/**
 * @param {DailyQuestEnum} dailyQuestName
 */
const registerDailyQuestListeners = (dailyQuestName) => {
  const questConfig = dailyQuestConfig[dailyQuestName];
  for (const { eventName, listenerCallback } of questConfig.questListeners) {
    registerGameEventListener(eventName, async (args) => {
      const { user } = args;
      // TODO: getting trainer a gazillion times may be bad but IDK
      const { data: trainer, err } = await getTrainer(user);
      if (err) {
        return;
      }
      const questData = getAndSetDailyQuestData(trainer, dailyQuestName);
      if (
        questData.completed ||
        questData.progress >=
          questConfig.computeProgressRequirement({ stage: 1 })
      ) {
        return;
      }

      // @ts-ignore
      const { progress } = await listenerCallback(args);
      if (progress) {
        questData.progress += progress;

        // TODO: if completed, upsell

        await updateTrainer(trainer);
      }
    });
  }
};

module.exports = {
  hasTrainerMetTutorialStageRequirements,
  hasTrainerMetCurrentTutorialStageRequirements,
  hasUserMetCurrentTutorialStageRequirements,
  completeTutorialStageForTrainer,
  completeTutorialStageForUser,
};
