const { ButtonStyle } = require("discord.js");
const { createElement } = require("../../deact/deact");
const Button = require("../../deact/components/Button");

module.exports = async (
  ref,
  {
    onPrevPressedKey,
    onNextPressedKey,
    onPresssedKey,
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
        bindingKey: onPrevPressedKey || onPresssedKey,
        disabled: isPrevDisabled,
        data: { action: "prev" },
      }),
      createElement(Button, {
        label: nextLabel,
        style: ButtonStyle.Secondary,
        bindingKey: onNextPressedKey || onPresssedKey,
        disabled: isNextDisabled,
        data: { action: "next" },
      }),
    ],
  ],
});
