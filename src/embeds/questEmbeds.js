const { EmbedBuilder } = require("discord.js");
const {
  newTutorialConfig,
  newTutorialStages,
  questTypeEnum,
  dailyQuestConfig,
  achievementConfig,
} = require("../config/questConfig");
const {
  getFlattenedRewardsString,
  flattenRewards,
} = require("../utils/trainerUtils");
const { buildBlockQuoteString } = require("../utils/utils");

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

    if (userTutorialData.currentTutorialStage === stage) {
      description += "**";
    }
    description += `\`[${stageProgressEmoji}]\` • ${stageData.emoji} ${stageData.name}\n`;
    if (userTutorialData.currentTutorialStage === stage) {
      description += "**";
    }
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
  embed.setDescription(buildBlockQuoteString(stageData.description));
  let footerText = `Stage ${page} / ${newTutorialStages.length}`;
  if (stageData.tip) {
    footerText += ` | TIP: ${stageData.tip}`;
  }
  embed.setFooter({ text: footerText });

  embed.addFields([
    {
      name: "📋 Requirements",
      value: buildBlockQuoteString(stageData.requirementString),
      inline: false,
    },
    {
      name: "🎁 Rewards",
      value: buildBlockQuoteString(
        getFlattenedRewardsString(flattenRewards(stageData.rewards), false)
      ),
      inline: false,
    },
  ]);

  if (stageData.image) {
    embed.setImage(stageData.image);
  }

  return embed;
};

/**
 * @param {object} param0
 * @param {QuestEnum[]} param0.questIds
 * @param {QuestTypeEnum} param0.questType
 * @param {UserQuestData} param0.userQuestData
 * @param {number=} param0.page
 * @returns {EmbedBuilder}
 */
const buildQuestListEmbed = ({
  questIds,
  questType,
  userQuestData,
  page = 1,
}) => {
  const embed = new EmbedBuilder();
  const questConfig =
    questType === questTypeEnum.DAILY ? dailyQuestConfig : achievementConfig;
  const questTypeDisplay =
    questType === questTypeEnum.DAILY ? "Daily Quests" : "Achievements";

  embed.setTitle(questTypeDisplay);
  embed.setColor(0xffffff);
  embed.setFooter({ text: `Page ${page}` });

  let description = "";
  questIds.forEach((questId) => {
    const questConfigData = questConfig[questId];
    const questData =
      questType === questTypeEnum.DAILY
        ? userQuestData.dailyQuests[questId]
        : userQuestData.achievements[questId];

    const progress = questData?.progress || 0;
    const stage = questData?.stage || 0;

    const progressRequirement =
      questConfigData.requirementType === "numeric"
        ? questConfigData.computeProgressRequirement({ stage })
        : 1;

    const isCompleted = progress >= progressRequirement;
    const progressEmoji = isCompleted ? "✅" : "⏳";

    const questName = questConfigData.formatName({ stage });
    const questEmoji = questConfigData.formatEmoji({ stage });

    let progressText = "";
    if (questConfigData.requirementType === "numeric") {
      progressText = ` (${progress}/${progressRequirement})`;
    }

    description += `\`[${progressEmoji}]\` • ${questEmoji} ${questName}${progressText}\n`;
  });

  embed.setDescription(description);
  return embed;
};

module.exports = {
  buildTutorialListEmbed,
  buildTutorialStageEmbed,
  buildQuestListEmbed,
};
