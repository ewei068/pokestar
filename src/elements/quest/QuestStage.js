const { createElement } = require("../../deact/deact");
const { buildQuestStageEmbed } = require("../../embeds/questEmbeds");
const {
  formatQuestDisplayData,
  getAndSetQuestData,
  getQuestConfigData,
  getCurrentQuestStageForDisplay,
} = require("../../services/quest");
const { addRewards } = require("../../utils/trainerUtils");
const { updateTrainer } = require("../../services/trainer");
const useTrainer = require("../../hooks/useTrainer");
const { useCallbackBinding } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const ReturnButton = require("../foundation/ReturnButton");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {QuestEnum} param1.questName
 * @param {QuestTypeEnum} param1.questType
 * @param {string} param1.backButtonKey
 * @returns {Promise<any>}
 */
module.exports = async (ref, { user, questName, questType, backButtonKey }) => {
  const { trainer, setTrainer, err: trainerErr } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }

  const questDisplayData = formatQuestDisplayData(
    trainer,
    questName,
    questType
  );
  const questConfigData = getQuestConfigData(questName, questType);
  const questDataEntry = getAndSetQuestData(trainer, questName, questType);

  const embed = buildQuestStageEmbed({
    questDisplayData,
    questConfigData,
    questDataEntry,
    questType,
  });

  const claimRewardsKey = useCallbackBinding(
    async () => {
      const { completionStatus } = questDisplayData;

      if (completionStatus !== "complete") {
        return {
          type: 4,
          data: {
            content: "❌ You haven't completed this quest yet!",
            flags: 64,
          },
        };
      }

      const currentStage = getCurrentQuestStageForDisplay(
        questConfigData,
        questDataEntry
      );
      const rewards = questConfigData.computeRewards({ stage: currentStage });

      addRewards(trainer, rewards);

      questDataEntry.stage += 1;
      questDataEntry.progress = 0;

      const { err: updateErr } = await updateTrainer(trainer);
      if (updateErr) {
        return {
          type: 4,
          data: {
            content: "❌ Failed to claim rewards. Please try again.",
            flags: 64,
          },
        };
      }

      await setTrainer(trainer);

      return {
        type: 4,
        data: {
          content: "✅ Quest rewards claimed successfully!",
          flags: 64,
        },
      };
    },
    ref,
    { defer: true }
  );

  const buttons = [
    createElement(ReturnButton, {
      callbackBindingKey: backButtonKey,
    }),
  ];

  if (questDisplayData.completionStatus === "complete") {
    buttons.push(
      createElement(Button, {
        emoji: "🎁",
        label: "Claim Rewards",
        style: 3,
        callbackBindingKey: claimRewardsKey,
      })
    );
  }

  return {
    elements: [
      {
        content: "",
        embeds: [embed],
      },
    ],
    components: [buttons],
  };
};
