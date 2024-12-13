/* eslint-disable no-param-reassign */
const {
  newTutorialConfig,
  newTutorialStages,
} = require("../config/questConfig");
const { addRewards } = require("../utils/trainerUtils");
const { updateTrainer } = require("./trainer");

/**
 * @param {WithId<Trainer>} trainer
 * @param {TutorialStageEnum} stage
 * @returns {Promise<boolean>}
 */
const hasMetTutorialStageRequirements = async (trainer, stage) =>
  await newTutorialConfig[stage]?.checkRequirements?.(trainer);

/**
 * @param {WithId<Trainer>} trainer
 * @param {TutorialStageEnum} stage
 * @returns {Promise<{ data?: Trainer, err?: string }>}
 */
const completeTutorialStage = async (trainer, stage) => {
  // check if trainer already has stage complete
  if (trainer.tutorialData.completedTutorialStages[stage]) {
    return { err: "You have already completed this stage!" };
  }

  // check if met stage requirements
  const hasMetRequirements = await hasMetTutorialStageRequirements(
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
    stage === "completed"
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
  return await updateTrainer(trainer);
};

module.exports = {
  completeTutorialStage,
};
