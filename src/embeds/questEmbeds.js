const { EmbedBuilder } = require("discord.js");
const {
  newTutorialConfig,
  newTutorialStages,
  questTypeEnum,
} = require("../config/questConfig");
const {
  getFlattenedRewardsString,
  flattenRewards,
  getRewardsString,
  getCompactRewardsString,
} = require("../utils/trainerUtils");
const {
  buildBlockQuoteString,
  getNumericPBar,
  getNextTimeIntervalDate,
} = require("../utils/utils");
// eslint-disable-next-line no-unused-vars
const { formatQuestDisplayData } = require("../services/quest");
const { timeEnum } = require("../enums/miscEnums");

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
 * @param {QuestTypeEnum} param0.questType
 * @param {Record<QuestEnum, ReturnType<typeof formatQuestDisplayData>>} param0.questDisplayDataMap
 * @param {number=} param0.page
 * @returns {EmbedBuilder}
 */
const buildQuestListEmbed = ({ questType, questDisplayDataMap, page = 1 }) => {
  const embed = new EmbedBuilder();
  const questTypeDisplay =
    questType === questTypeEnum.DAILY ? "Daily Quests" : "Achievements";

  embed.setTitle(questTypeDisplay);
  embed.setColor(0xffffff);
  embed.setFooter({ text: `Page ${page}` });

  if (questType === questTypeEnum.DAILY) {
    embed.setDescription(
      `Daily quests reset in 🕒 <t:${Math.floor(
        getNextTimeIntervalDate(timeEnum.DAY).getTime() / 1000
      )}:R>`
    );
  }

  const questsToDisplay = [];
  Object.entries(questDisplayDataMap).forEach(([, questDisplayData]) => {
    const { emoji, name, progressRequirement, progress, completionStatus } =
      questDisplayData;
    const headerFormatting =
      // eslint-disable-next-line no-nested-ternary
      completionStatus === "fullyComplete"
        ? "_"
        : completionStatus === "complete"
        ? "**"
        : "";

    questsToDisplay.push({
      header: `${headerFormatting}${emoji} ${name} → ${getCompactRewardsString(
        questDisplayData.rewards
      )}${headerFormatting}`,
      description: `\`${getNumericPBar(
        progress,
        progressRequirement,
        25
      )}  ${progress}/${progressRequirement}\``,
    });
  });

  embed.addFields({
    name: "Quest Progress",
    value: questsToDisplay
      .reduce(
        (acc, quest) => [...acc, `${quest.header}\n${quest.description}`],
        []
      )
      .join("\n\n"),
  });
  return embed;
};

/**
 * @param {object} param0
 * @param {ReturnType<typeof formatQuestDisplayData>} param0.questDisplayData
 * @returns {EmbedBuilder}
 */
const buildQuestStageEmbed = ({ questDisplayData }) => {
  const embed = new EmbedBuilder();
  const {
    emoji,
    name,
    completionStatus,
    progress,
    progressRequirement,
    rewards,
    description,
    requirementString,
  } = questDisplayData;

  embed.setTitle(`${emoji} ${name}`);
  embed.setColor(0xffffff);
  embed.setDescription(buildBlockQuoteString(description));

  const fields = [
    {
      name: "📋 Requirements",
      value: buildBlockQuoteString(requirementString),
      inline: false,
    },
    {
      name: "📊 Progress",
      value: buildBlockQuoteString(
        `\`${getNumericPBar(
          progress,
          progressRequirement,
          25
        )}  ${progress}/${progressRequirement}\``
      ),
      inline: false,
    },
    {
      name: "🎁 Rewards",
      value: buildBlockQuoteString(getRewardsString(rewards, false)),
      inline: false,
    },
  ];

  embed.addFields(fields);

  if (completionStatus === "complete") {
    embed.setFooter({
      text: "🎁 Quest completed! Click 'Claim Rewards' to claim your rewards.",
    });
  } else if (completionStatus === "fullyComplete") {
    embed.setFooter({ text: "✅ Quest fully completed!" });
  } else {
    embed.setFooter({ text: "⏳ Quest in progress..." });
  }

  return embed;
};

module.exports = {
  buildTutorialListEmbed,
  buildTutorialStageEmbed,
  buildQuestListEmbed,
  buildQuestStageEmbed,
};
