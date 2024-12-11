const { EmbedBuilder } = require("discord.js");
const { getWhitespace, zip } = require("../utils/utils");

/**
 * @param {object} param0
 * @param {UserSettingsEnum[]} param0.settings
 * @param {UserSettingsEnum?=} param0.selectedSetting
 * @param {UserSettings} param0.userSettings
 * @param {PartialRecord<UserSettingsEnum, UserSettingsData>} param0.settingsConfig
 * @param {string?=} param0.header
 * @param {number?=} param0.page
 * @returns {EmbedBuilder}
 */
const buildSettingsListEmbed = ({
  settings,
  selectedSetting = undefined,
  userSettings,
  settingsConfig,
  header = "User Settings",
  page = 1,
}) => {
  const embed = new EmbedBuilder();
  embed.setTitle(header);
  embed.setColor(0xffffff);
  embed.setFooter({ text: `Page ${page}` });

  const { settingsNames, settingsDisplayValues } = settings.reduce(
    (acc, setting) => {
      const settingData = settingsConfig[setting];
      const settingName = `${selectedSetting === setting ? "> " : ""}${
        settingData.name
      }`;
      const settingValue = userSettings[setting];
      const settingDisplayValue =
        settingData.options.find((option) => option.value === settingValue)
          ?.display ?? "Unknown";

      acc.settingsNames.push(settingName);
      acc.settingsDisplayValues.push(settingDisplayValue);
      return acc;
    },
    { settingsNames: [], settingsDisplayValues: [] }
  );
  const settingsWhitespaces = getWhitespace(settingsNames, 20);

  let description = "";
  zip(settingsNames, settingsWhitespaces, settingsDisplayValues).forEach(
    ([settingName, whitespace, settingDisplayValue]) => {
      description += `\`${settingName}:${whitespace}${settingDisplayValue}\`\n`;
    }
  );
  embed.setDescription(description);

  return embed;
};

module.exports = { buildSettingsListEmbed };
