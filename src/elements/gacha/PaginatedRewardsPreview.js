const usePagination = require("../../hooks/usePagination");
const { buildPossibleRewardsEmbed } = require("../../embeds/gachaEmbeds");

/**
 * Displays rewards for different rarities with pagination
 * @param {DeactElement} ref
 * @param {object} props
 * @param {PartialRecord<RarityEnum, number>} props.rewardDistribution - Probability distribution for rarities
 * @param {PartialRecord<RarityEnum, PartialRecord<RewardTypeEnum, number>>} props.rewardsConfig - Rewards config for each rarity
 * @returns {Promise<ComposedElements>}
 */
const PaginatedRewardsPreview = async (
  ref,
  { rewardDistribution, rewardsConfig }
) => {
  // Get rarity keys in order from the distribution
  const rarityKeys = Object.keys(rewardDistribution);

  // Use pagination hook to navigate between rarities
  const { items, scrollButtonsElement } = usePagination(
    {
      allItems: rarityKeys,
      pageSize: 1,
      initialPage: 1,
    },
    ref
  );

  const embed = buildPossibleRewardsEmbed(
    /** @type {RarityEnum} */ (items[0]),
    rewardDistribution,
    rewardsConfig
  );

  return {
    elements: [
      {
        embeds: [embed],
      },
    ],
    components: [scrollButtonsElement],
  };
};

module.exports = PaginatedRewardsPreview;
