const { createElement, useMemo } = require("../../deact/deact");
const StringSelectMenu = require("../../deact/elements/StringSelectMenu");

module.exports = async (
  ref,
  {
    ids,
    config,
    placeholder,
    showId = true,
    extraFields = [],
    defaultId = null,
    callbackBindingKey,
    data = {},
  }
) => {
  // TODO: this could probably be improved lol
  const options = useMemo(
    () =>
      ids.map((id) => {
        const entryData = config[id];
        const extra = extraFields.map((field) => entryData[field]).join(" | ");
        const option = {
          label: `${entryData.name}${extra ? ` | ${extra}` : ""}${
            showId ? ` #${id.toString()}` : ""
          }`,
          value: `${id}`,
          default: defaultId === id,
        };
        if (entryData.emoji) {
          option.emoji = entryData.emoji;
        }
        return option;
      }),
    [ids, config, showId, extraFields, defaultId],
    ref
  );

  return {
    components: [
      createElement(StringSelectMenu, {
        placeholder,
        options,
        callbackBindingKey,
        data,
      }),
    ],
  };
};
