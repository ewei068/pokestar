// im really not sure where to put these sorry

const { newTutorialStages } = require("../config/questConfig");
const { timeEnum, upsellEnum } = require("../enums/miscEnums");
const { generateTutorialStateId } = require("../utils/questUtils");
const { attemptToReply } = require("../utils/utils");
const {
  hasTrainerMetCurrentTutorialStageRequirements,
  hasTrainerMetTutorialStageRequirements,
} = require("./quest");
const { getState, deleteState } = require("./state");
const { getTrainer, updateTrainer } = require("./trainer");

const TUTORIAL_UPSELL_TIME_1 = timeEnum.DAY;
const TUTORIAL_UPSELL_TIME_2 = 3 * timeEnum.DAY;

/**
 * @param {object} param0
 * @param {DiscordUser} param0.user
 * @returns {Promise<{
 *  hasCompletedCurrentTutorialStage?: boolean,
 *  hasCompletedCurrentTutorialStateStage?: boolean,
 *  currentTutorialStateStage?: TutorialStageEnum,
 * }>}
 */
const getPreInteractionUpsellData = async ({ user }) => {
  const { data: trainer, err } = await getTrainer(user);
  if (err || !trainer) {
    return {};
  }

  const hasCompletedCurrentTutorialStage =
    await hasTrainerMetCurrentTutorialStageRequirements(trainer);

  const tutorialStateId = generateTutorialStateId(user.id);
  const tutorialState = getState(tutorialStateId);
  let currentTutorialStateStage;
  let hasCompletedCurrentTutorialStateStage = false;
  if (tutorialState) {
    const rootState = getState(tutorialState.rootStateId);
    if (!rootState) {
      deleteState(tutorialStateId); // delete state if root state is missing and proceed
    } else {
      currentTutorialStateStage = tutorialState.currentStage;
      hasCompletedCurrentTutorialStateStage =
        await hasTrainerMetTutorialStageRequirements(
          trainer,
          currentTutorialStateStage
        );
    }
  }

  return {
    hasCompletedCurrentTutorialStage, // has completed current stage trainer is "on"
    hasCompletedCurrentTutorialStateStage, // has completed current stage trainer has open in /tutorial
    currentTutorialStateStage,
  };
};

/**
 * Decides the upsells to send to the user, then sends them
 * @param {object} param0
 * @param {any} param0.interaction
 * @param {DiscordUser} param0.user
 * @param {Awaited<ReturnType<getPreInteractionUpsellData>>} param0.preInteractionUpsellData
 */
const sendUpsells = async ({
  interaction,
  user,
  preInteractionUpsellData = {},
}) => {
  const { hasCompletedCurrentTutorialStage } = preInteractionUpsellData;
  const { data: trainer, err } = await getTrainer(user);
  if (err || !trainer) {
    return;
  }
  const { upsellData } = trainer;
  const currentTime = Date.now();

  // tutorial completion upsell
  const { lastSeen = 0, timesSeen = 0 } =
    upsellData[upsellEnum.TUTORIAL_UPSELL] || {};
  const tutorialStateId = generateTutorialStateId(user.id);
  const tutorialState = getState(tutorialStateId);
  const shouldShowUpsellBasedOnTutorialStateStage =
    tutorialState?.currentStage &&
    tutorialState.currentStage ===
      preInteractionUpsellData.currentTutorialStateStage &&
    !preInteractionUpsellData.hasCompletedCurrentTutorialStateStage &&
    (await hasTrainerMetTutorialStageRequirements(
      trainer,
      tutorialState.currentStage
    ));
  if (
    shouldShowUpsellBasedOnTutorialStateStage ||
    (!hasCompletedCurrentTutorialStage &&
      (await hasTrainerMetCurrentTutorialStageRequirements(trainer)))
  ) {
    // attempt to update tutorial state
    if (tutorialState?.refreshTutorialState) {
      await tutorialState.refreshTutorialState();
    }

    const replyString = tutorialState?.messageRef
      ? "**Press the replied-to message to return to the tutorial,** or "
      : "";

    // skip if haven't yet seen first tutorial upsell
    if (timesSeen !== 0) {
      await attemptToReply(
        tutorialState?.messageRef || interaction,
        `You have completed a tutorial stage! ${replyString}Use \`/tutorial\` to claim your rewards.`
      );
      return;
    }
  }

  // tutorial upsell
  let shouldShowTutorialUpsell = false;
  let shouldComputeTutorialUpsell = false;
  if (timesSeen === 0) {
    shouldShowTutorialUpsell = true;
    shouldComputeTutorialUpsell = true;
  } else if (
    timesSeen === 1 &&
    currentTime - lastSeen >= TUTORIAL_UPSELL_TIME_1
  ) {
    shouldComputeTutorialUpsell = true;
  } else if (
    timesSeen < 4 &&
    currentTime - lastSeen >= TUTORIAL_UPSELL_TIME_2
  ) {
    shouldComputeTutorialUpsell = true;
  }
  let upsellToShow;
  if (shouldComputeTutorialUpsell) {
    if (timesSeen === 0) {
      upsellToShow = {
        content:
          "New to Pokestar? **Take the tutorial to learn the bot and get a ton of rewards!** Use `/tutorial` to begin.",
        ephemeral: true,
      };
    } else {
      // compute if upsell should be shown
      const promises = [];
      for (const tutorialStage of newTutorialStages) {
        if (trainer.tutorialData.completedTutorialStages[tutorialStage]) {
          continue;
        }

        promises.push(
          hasTrainerMetTutorialStageRequirements(trainer, tutorialStage)
        );
      }
      if ((await Promise.all(promises)).some((x) => x)) {
        upsellToShow = {
          content:
            "You have unclaimed tutorial rewards! Use `/tutorial` to claim them.",
          ephemeral: true,
        };
        shouldShowTutorialUpsell = true;
      }
    }

    if (shouldShowTutorialUpsell) {
      await attemptToReply(interaction, upsellToShow);
    }

    // update upsell data
    trainer.upsellData[upsellEnum.TUTORIAL_UPSELL] = {
      lastSeen: currentTime, // update last seen so we don't constantly recompute tutorial completions
      timesSeen: shouldShowTutorialUpsell ? timesSeen + 1 : timesSeen,
    };

    // update trainer
    await updateTrainer(trainer);
  }
};

module.exports = {
  getPreInteractionUpsellData,
  sendUpsells,
};
