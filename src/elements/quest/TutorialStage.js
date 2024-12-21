const { ButtonStyle } = require("discord.js");
const {
  useCallbackBinding,
  createElement,
  useAwaitedMemo,
} = require("../../deact/deact");
const ReturnButton = require("../foundation/ReturnButton");
const useSingleItemScroll = require("../../hooks/useSingleItemScroll");
const {
  newTutorialConfig,
  newTutorialStages,
} = require("../../config/questConfig");
const { buildTutorialStageEmbed } = require("../../embeds/questEmbeds");
const {
  completeTutorialStageForUser,
  hasTrainerMetTutorialStageRequirements,
} = require("../../services/quest");
const { getInteractionInstance } = require("../../deact/interactions");
const Button = require("../../deact/elements/Button");
const {
  getRewardsString,
  flattenRewards,
} = require("../../utils/trainerUtils");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {TutorialStageEnum} param1.currentStage
 * @param {(TutorialStageEnum) => any} param1.setTutorialStage
 * @param {DiscordUser} param1.user
 * @param {WithId<Trainer>} param1.trainer
 * @param {(trainer: WithId<Trainer>) => any} param1.setTrainer
 */
module.exports = async (
  ref,
  { currentStage, setTutorialStage, user, trainer, setTrainer }
) => {
  const tutorialStageData = newTutorialConfig[currentStage];

  const { scrollButtonsElement, page, goToNext } = useSingleItemScroll(
    {
      allItems: newTutorialStages,
      itemOverride: currentStage,
      setItemOverride: setTutorialStage,
      callbackOptions: { defer: true },
    },
    ref
  );
  const claimRewardsActionBinding = useCallbackBinding(
    async (interaction) => {
      const interactionInstance = getInteractionInstance(interaction);
      const { data: newTrainer, err } = await completeTutorialStageForUser(
        user,
        currentStage
      );
      if (err) {
        return { err };
      }
      if (newTrainer) {
        setTrainer?.(newTrainer);
      }
      goToNext();
      await interactionInstance.reply({
        element: {
          content: getRewardsString(flattenRewards(tutorialStageData.rewards)),
        },
      });
    },
    ref,
    { defer: true }
  );
  const proceedActionBinding = useCallbackBinding(
    async (interaction) => {
      const interactionInstance = getInteractionInstance(interaction);
      await interactionInstance.reply({
        element: {
          content: tutorialStageData.proceedString,
          ephemeral: true,
        },
      });
    },
    ref,
    { defer: false }
  );
  const returnActionBindng = useCallbackBinding(
    () => {
      setTutorialStage?.(null);
    },
    ref,
    { defer: false }
  );

  const completedButtonProps = {
    label: "Completed",
    emoji: "✅",
    callbackBindingKey: claimRewardsActionBinding,
    style: ButtonStyle.Success,
    disabled: true,
  };
  const claimRewardsButtonProps = {
    label: "Claim Rewards",
    emoji: "✅",
    callbackBindingKey: claimRewardsActionBinding,
    style: ButtonStyle.Success,
  };
  const proceedButtonProps = {
    label: "Proceed",
    emoji: "➡️",
    callbackBindingKey: proceedActionBinding,
    style: ButtonStyle.Primary,
  };

  const hasMetRequirements = await useAwaitedMemo(
    async () => {
      if (trainer.tutorialData.completedTutorialStages[currentStage]) {
        return true;
      }
      return await hasTrainerMetTutorialStageRequirements(
        trainer,
        currentStage
      );
    },
    [trainer, currentStage],
    ref
  );

  let buttonProps = proceedButtonProps;
  if (trainer.tutorialData.completedTutorialStages[currentStage]) {
    buttonProps = completedButtonProps;
  } else if (hasMetRequirements) {
    buttonProps = claimRewardsButtonProps;
  }

  return {
    elements: [
      {
        content: "",
        embeds: [
          buildTutorialStageEmbed({
            stage: currentStage,
            userTutorialData: trainer.tutorialData,
            page,
          }),
        ],
      },
    ],
    components: [
      scrollButtonsElement,
      createElement(Button, buttonProps),
      createElement(ReturnButton, {
        callbackBindingKey: returnActionBindng,
        style: ButtonStyle.Secondary,
      }),
    ],
  };
};
