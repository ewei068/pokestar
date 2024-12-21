// im really not sure where to put these sorry

const { newTutorialStages } = require("../config/questConfig");
const { timeEnum, upsellEnum } = require("../enums/miscEnums");
const { attemptToReply } = require("../utils/utils");
const {
  hasTrainerMetCurrentTutorialStageRequirements,
  hasTrainerMetTutorialStageRequirements,
} = require("./quest");
const { getTrainer, updateTrainer } = require("./trainer");

const TUTORIAL_UPSELL_TIME_1 = timeEnum.DAY;
const TUTORIAL_UPSELL_TIME_2 = 3 * timeEnum.DAY;

/**
 * Decides the upsells to send to the user, then sends them
 * @param {object} param0
 * @param {any} param0.interaction
 * @param {DiscordUser} param0.user
 * @param {boolean=} param0.hasCompletedCurrentTutorialStage
 */
const sendUpsells = async ({
  interaction,
  user,
  hasCompletedCurrentTutorialStage = true,
}) => {
  const { data: trainer, err } = await getTrainer(user);
  if (err || !trainer) {
    return;
  }
  const { upsellData } = trainer;
  const currentTime = Date.now();

  // tutorial upsell
  const { lastSeen = 0, timesSeen = 0 } =
    upsellData[upsellEnum.TUTORIAL_UPSELL] || {};
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
    timesSeen < 3 &&
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
      timesSeen: shouldComputeTutorialUpsell ? timesSeen + 1 : timesSeen,
    };

    // update trainer
    await updateTrainer(trainer);
    return;
  }

  // tutorial completion upsell
  if (
    !hasCompletedCurrentTutorialStage &&
    (await hasTrainerMetCurrentTutorialStageRequirements(trainer))
  ) {
    await attemptToReply(
      interaction,
      `You have completed a tutorial stage! Use \`/tutorial\` to claim your rewards.`
    );
  }
};

module.exports = {
  sendUpsells,
};
