const { useCallbackBinding, createElement } = require("../../deact/deact");
const ReturnButton = require("../foundation/ReturnButton");
const useSingleItemScroll = require("../../hooks/useSingleItemScroll");
const { buildHelpCommandEmbed } = require("../../embeds/helpEmbeds");

module.exports = async (ref, { command, categoryCommands, setCommand }) => {
  const { scrollButtonsElement } = useSingleItemScroll(
    {
      allItems: categoryCommands,
      itemOverride: command,
      setItemOverride: setCommand,
      callbackOptions: { defer: false },
    },
    ref
  );
  const returnActionBindng = useCallbackBinding(
    () => {
      setCommand?.(null);
    },
    ref,
    { defer: false }
  );

  return {
    elements: [
      {
        content: "",
        embeds: [buildHelpCommandEmbed(command)],
      },
    ],
    components: [
      scrollButtonsElement,
      createElement(ReturnButton, { callbackBindingKey: returnActionBindng }),
    ],
  };
};
