const { EmbedBuilder } = require("discord.js");
const { newTutorialConfig } = require("../config/questConfig");

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
    let stageEmoji = "";
    if (userTutorialData.completedTutorialStages[stage]) {
      stageEmoji = "✅ ";
    } else if (userTutorialData.currentTutorialStage === stage) {
      stageEmoji = "⏳ ";
    }
    description += `- ${stageEmoji}${stageData.name}\n`;
  });

  embed.setDescription(description);
  return embed;
};

module.exports = {
  buildTutorialListEmbed,
};
