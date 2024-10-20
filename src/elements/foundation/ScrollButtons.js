const { ButtonStyle } = require("discord.js");
const { createElement } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

module.exports = async (
  ref,
  {
    onPrevPressedKey = undefined,
    onNextPressedKey = undefined,
    onPresssedKey = undefined,
    isPrevDisabled = false,
    isNextDisabled = false,
    prevLabel = "◄",
    nextLabel = "►",
  }
) => ({
  components: [
    [
      createElement(Button, {
        label: prevLabel,
        style: ButtonStyle.Secondary,
        callbackBindingKey: onPrevPressedKey || onPresssedKey,
        disabled: isPrevDisabled,
        data: { action: "prev" },
      }),
      createElement(Button, {
        label: nextLabel,
        style: ButtonStyle.Secondary,
        callbackBindingKey: onNextPressedKey || onPresssedKey,
        disabled: isNextDisabled,
        data: { action: "next" },
      }),
    ],
  ],
});
