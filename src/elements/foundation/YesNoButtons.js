const { ButtonStyle } = require("discord.js");
const { createElement } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

/**
 *
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {string=} param1.onYesPressedKey
 * @param {string=} param1.onNoPressedKey
 * @param {string=} param1.onPresssedKey
 * @param {boolean=} param1.isYesDisabled
 * @param {boolean=} param1.isNoDisabled
 * @param {string=} param1.yesLabel
 * @param {string=} param1.noLabel
 */
const YesNoButtons = async (
  ref,
  {
    onYesPressedKey = undefined,
    onNoPressedKey = undefined,
    onPresssedKey = undefined,
    isYesDisabled = false,
    isNoDisabled = false,
    yesLabel = "Yes",
    noLabel = "No",
  }
) => ({
  components: [
    [
      createElement(Button, {
        emoji: "✅",
        label: yesLabel,
        style: ButtonStyle.Success,
        callbackBindingKey: onYesPressedKey || onPresssedKey,
        disabled: isYesDisabled,
        data: { action: "yes" },
      }),
      createElement(Button, {
        emoji: "✖️",
        label: noLabel,
        style: ButtonStyle.Danger,
        callbackBindingKey: onNoPressedKey || onPresssedKey,
        disabled: isNoDisabled,
        data: { action: "no" },
      }),
    ],
  ],
});

module.exports = YesNoButtons;
