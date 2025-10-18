/**
 * @file
 * @author Elvis Wei
 *
 * vote.js is used to help the bot gain more visibility within the discord bot microcosm. Sets up the outline for easing the voting process for users.
 */
const { ButtonStyle } = require("discord.js");
const { buildButtonActionRow } = require("../../components/buttonActionRow");
const { buildUrlButton } = require("../../components/urlButton");
const { eventNames } = require("../../config/eventConfig");
const { voteConfig } = require("../../config/socialConfig");
const { buildVoteEmbed } = require("../../embeds/socialEmbeds");
const { getTrainer } = require("../../services/trainer");
const { getInteractionInstance } = require("../../deact/interactions");
const { createRoot, userTypeEnum } = require("../../deact/deact");
// @ts-ignore
const PaginatedRewardsPreview = require("../../elements/gacha/PaginatedRewardsPreview");
const {
  voteRewardsProbabilityDistribution,
  voteRewardsConfig,
} = require("../../config/gachaConfig");

/**
 * Syncs the voting to the discord user to give rewards on successful voting.
 * @param {any} interaction The interaction (message or slash command)
 * @param {*} user the user who decided to vote.
 */
const vote = async (interaction, user) => {
  const interactionInstance = getInteractionInstance(interaction);

  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }

  const voteEmbed = buildVoteEmbed(trainer.data);

  const voteButtons = buildUrlButton(voteConfig);
  const rewardsButton = buildButtonActionRow(
    [
      {
        label: "Open Reward Boxes!",
        disabled: false,
        data: {},
        style: ButtonStyle.Success,
        // celebration
        emoji: "🎁",
      },
    ],
    eventNames.VOTE_REWARDS
  );

  try {
    await interactionInstance.reply({
      element: {
        embeds: [voteEmbed],
        components: [voteButtons, rewardsButton],
      },
    });
  } catch (err) {
    return { err: err.message };
  }

  return createRoot(
    PaginatedRewardsPreview,
    {
      rewardDistribution: voteRewardsProbabilityDistribution,
      rewardsConfig: voteRewardsConfig,
    },
    interaction,
    {
      ephemeral: true,
      defer: false,
      userIdForFilter: userTypeEnum.ANY,
    }
  );
};

const voteMessageCommand = async (message) => vote(message, message.author);

const voteSlashCommand = async (interaction) =>
  vote(interaction, interaction.user);

module.exports = {
  message: voteMessageCommand,
  slash: voteSlashCommand,
};
