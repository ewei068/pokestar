const { ButtonStyle } = require("discord.js");
const { createElement } = require("../../deact/deact");
const { buildQuestStageEmbed } = require("../../embeds/questEmbeds");
const {
  formatQuestDisplayData,
  claimQuestRewardsForUserAndUpdate,
  canTrainerClaimQuestRewards,
} = require("../../services/quest");
const useTrainer = require("../../hooks/useTrainer");
const { useCallbackBinding } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const ReturnButton = require("../foundation/ReturnButton");
const { getInteractionInstance } = require("../../deact/interactions");
const { getFlattenedRewardsString } = require("../../utils/trainerUtils");

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

  const embed = buildQuestStageEmbed({
    questDisplayData,
  });

  const claimRewardsKey = useCallbackBinding(
    async (interaction) => {
      const interactionInstance = getInteractionInstance(interaction);
      const rewardRes = await claimQuestRewardsForUserAndUpdate(
        user,
        questName,
        questType
      );
      if (rewardRes.err || !rewardRes.data) {
        return { err: rewardRes.err };
      }

      setTrainer(rewardRes.data);
      await interactionInstance.reply({
        element: {
          content: getFlattenedRewardsString(rewardRes.rewards),
        },
      });
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
      [
        createElement(Button, {
          emoji: "🎁",
          label: "Claim Rewards",
          style: ButtonStyle.Success,
          callbackBindingKey: claimRewardsKey,
          disabled: !canTrainerClaimQuestRewards(trainer, questName, questType),
        }),
      ],
      [
        createElement(ReturnButton, {
          callbackBindingKey: backButtonKey,
        }),
      ],
    ],
  };
};
