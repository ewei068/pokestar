const { ButtonStyle } = require("discord.js");
const { createElement } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

module.exports = async (
  ref,
  { callbackBindingKey, style = ButtonStyle.Primary }
) => ({
  components: [
    createElement(Button, {
      label: "Return",
      style,
      callbackBindingKey,
      data: {},
    }),
  ],
});
