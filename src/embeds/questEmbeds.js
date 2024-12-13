const { EmbedBuilder } = require("discord.js");
const {
  newTutorialConfig,
  newTutorialStages,
} = require("../config/questConfig");
const { getRewardsString, flattenRewards } = require("../utils/trainerUtils");

/**
 * @param {object} param0
 * @param {TutorialStageEnum[]} param0.tutorialStages
 * @param {UserTutorialData} param0.userTutorialData
 * @param {number=} param0.page
 * @returns {EmbedBuilder}
 */
const buildTutorialListEmbed = ({
  tutorialStages,
  userTutorialData,
  page = 1,
}) => {
  const embed = new EmbedBuilder();
  embed.setTitle("Tutorial Stages");
  embed.setColor(0xffffff);
  embed.setFooter({ text: `Page ${page}` });

  let description = "";
  tutorialStages.forEach((stage) => {
    const stageData = newTutorialConfig[stage];
    let stageProgressEmoji = "⬛";
    if (userTutorialData.completedTutorialStages[stage]) {
      stageProgressEmoji = "✅";
    } else if (userTutorialData.currentTutorialStage === stage) {
      stageProgressEmoji = "⏳";
    }

    description += `\`[${stageProgressEmoji}]\` • ${stageData.emoji} ${stageData.name}\n`;
  });

  embed.setDescription(description);
  return embed;
};

/**
 * @param {object} param0
 * @param {TutorialStageEnum} param0.stage
 * @param {UserTutorialData} param0.userTutorialData
 * @param {number=} param0.page
 * @returns {EmbedBuilder}
 */
const buildTutorialStageEmbed = ({ stage, userTutorialData, page = 1 }) => {
  const stageData = newTutorialConfig[stage];
  const embed = new EmbedBuilder();
  const completedText = userTutorialData.completedTutorialStages[stage]
    ? "[COMPLETE] "
    : "";
  embed.setTitle(`${completedText}${stageData.emoji} ${stageData.name}`);
  embed.setColor(0xffffff);
  embed.setDescription(stageData.description);
  embed.setFooter({ text: `Stage ${page} / ${newTutorialStages.length}` });

  embed.addFields([
    {
      name: "Requirements",
      value: stageData.requirementString,
      inline: false,
    },
    {
      name: "Rewards",
      value: getRewardsString(flattenRewards(stageData.rewards), false),
      inline: false,
    },
  ]);

  return embed;
};

module.exports = {
  buildTutorialListEmbed,
  buildTutorialStageEmbed,
};
