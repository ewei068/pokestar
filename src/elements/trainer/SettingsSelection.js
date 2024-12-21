const { ButtonStyle } = require("discord.js");
const { createElement } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

/**
 * @param {DeactElement} ref
 * @param {object} param0
 * @param {UserSettingsEnum} param0.setting
 * @param {PartialRecord<UserSettingsEnum, UserSettingsData>} param0.settingsConfig
 * @param {UserSettings} param0.currentSettings
 * @param {string} param0.callbackBindingKey
 */
module.exports = async (
  ref,
  { setting, settingsConfig, currentSettings, callbackBindingKey }
) => {
  const settingData = settingsConfig[setting];
  const settingValue = currentSettings[setting];

  // build up to 3 rows of 5 buttons each
  const components = [];
  for (let i = 0; i < settingData.options.length; i += 5) {
    const row = [];
    for (let j = i; j < i + 5; j += 1) {
      if (j >= settingData.options.length) {
        break;
      }
      const option = settingData.options[j];
      const isSelected = settingValue === option.value;
      row.push(
        createElement(Button, {
          label: option.display,
          style: isSelected ? ButtonStyle.Primary : ButtonStyle.Secondary,
          disabled: isSelected,
          callbackBindingKey,
          data: { value: option.value },
        })
      );
    }
    components.push(row);
  }

  return {
    components,
  };
};
